// src/app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import Flutterwave from 'flutterwave-node-v3';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const flutterwave = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!,
  process.env.FLUTTERWAVE_ENCRYPTION_KEY!
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookingId, paymentMethod, phoneNumber, email } = await request.json();
    
    if (!bookingId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get booking details
    const bookingResult = await pool.query(`
      SELECT 
        b.*, 
        fp.user_id as farmer_id, 
        fp.farm_name,
        u.name as visitor_name,
        u.email as visitor_email,
        u.phone as visitor_phone
      FROM bookings b
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN users u ON b.visitor_id = u.id
      WHERE b.id = $1 AND b.visitor_id = $2
    `, [bookingId, user.id]);
    
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const booking = bookingResult.rows[0];
    const totalAmount = parseFloat(booking.total_amount);
    const platformFee = totalAmount * 0.10;
    const farmerEarning = totalAmount * 0.90;
    
    // Create or update payment record
    const paymentResult = await pool.query(`
      INSERT INTO payments (
        booking_id, amount, platform_fee, farmer_earnings, 
        payment_method, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
      RETURNING id
    `, [bookingId, totalAmount, platformFee, farmerEarning, paymentMethod]);
    
    const paymentId = paymentResult.rows[0].id;
    const transactionRef = `HARVEST_${bookingId}_${Date.now()}`;
    
    // Handle different payment methods
    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) {
        return NextResponse.json({ error: 'Phone number required for M-Pesa' }, { status: 400 });
      }
      
      // Format phone number for Flutterwave (remove 0 at beginning, add 254)
      let formattedPhone = phoneNumber;
      if (phoneNumber.startsWith('0')) {
        formattedPhone = `254${phoneNumber.substring(1)}`;
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = `254${formattedPhone}`;
      }
      
      try {
        const mpesaResponse = await flutterwave.MobileMoney.mpesa({
          tx_ref: transactionRef,
          amount: totalAmount,
          currency: 'KES',
          email: booking.visitor_email,
          phone_number: formattedPhone,
          fullname: booking.visitor_name,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/visitor/payment/success?booking_id=${bookingId}`,
          meta: {
            booking_id: bookingId,
            payment_id: paymentId,
            farm_name: booking.farm_name
          }
        });
        
        if (mpesaResponse.status === 'success') {
          await pool.query(`
            UPDATE payments 
            SET transaction_id = $1, status = 'pending'
            WHERE id = $2
          `, [transactionRef, paymentId]);
          
          return NextResponse.json({
            success: true,
            paymentMethod: 'mpesa',
            checkoutUrl: mpesaResponse.data?.redirect_url,
            transactionRef: transactionRef,
            message: 'Complete payment on your phone'
          });
        } else {
          return NextResponse.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
        }
      } catch (error) {
        console.error('M-Pesa error:', error);
        return NextResponse.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
      }
    }
    
    if (paymentMethod === 'card') {
      try {
        // Create card payment payload
        const cardResponse = await flutterwave.PaymentGateway.initialize({
          tx_ref: transactionRef,
          amount: totalAmount,
          currency: 'KES',
          payment_options: 'card',
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/visitor/payment/success?booking_id=${bookingId}`,
          customer: {
            email: booking.visitor_email,
            phonenumber: booking.visitor_phone,
            name: booking.visitor_name,
          },
          customizations: {
            title: 'HarvestHost Booking Payment',
            description: `${booking.farm_name} - ${booking.activity_name}`,
            logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
          },
          meta: {
            booking_id: bookingId,
            payment_id: paymentId,
            farm_name: booking.farm_name,
          },
        });
        
        if (cardResponse.status === 'success') {
          await pool.query(`
            UPDATE payments 
            SET transaction_id = $1, status = 'pending'
            WHERE id = $2
          `, [transactionRef, paymentId]);
          
          return NextResponse.json({
            success: true,
            paymentMethod: 'card',
            checkoutUrl: cardResponse.data.link,
            transactionRef: transactionRef,
          });
        } else {
          return NextResponse.json({ error: 'Failed to initiate card payment' }, { status: 500 });
        }
      } catch (error) {
        console.error('Card payment error:', error);
        return NextResponse.json({ error: 'Failed to initiate card payment' }, { status: 500 });
      }
    }
    
    if (paymentMethod === 'cash') {
      // Cash on arrival
      await pool.query(`
        UPDATE bookings 
        SET payment_status = 'pending_cash', 
            status = 'confirmed',
            paid_at = NOW(),
            payment_method = 'cash'
        WHERE id = $1
      `, [bookingId]);
      
      await pool.query(`
        UPDATE payments 
        SET status = 'pending_cash', payment_date = NOW()
        WHERE id = $1
      `, [paymentId]);
      
      return NextResponse.json({
        success: true,
        paymentMethod: 'cash',
        message: 'Booking confirmed! Please pay cash at the farm.',
        bookingId: bookingId,
      });
    }
    
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}