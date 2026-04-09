// src/app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { stkPush } from '@/lib/mpesa';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
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
    
    const { bookingId, phoneNumber, paymentMethod } = await request.json();
    
    if (!bookingId || !phoneNumber || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get booking details - FIXED: This should SELECT, not INSERT
    const bookingResult = await pool.query(`
      SELECT b.*, fp.farm_name, u.name as visitor_name, u.email as visitor_email
      FROM bookings b
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN users u ON b.visitor_id = u.id
      WHERE b.id = $1 AND b.visitor_id = $2 AND b.status = 'pending'
    `, [bookingId, user.id]);
    
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found or already paid' }, { status: 404 });
    }
    
    const booking = bookingResult.rows[0];
    const totalAmount = parseFloat(booking.total_amount);
    const platformFee = totalAmount * 0.10;
    const farmerEarning = totalAmount * 0.90;
    
    if (paymentMethod === 'mpesa') {
      // Create payment record
      const paymentResult = await pool.query(`
        INSERT INTO payments (
          booking_id, amount, platform_fee, farmer_earnings, 
          payment_method, status, created_at
        ) VALUES ($1, $2, $3, $4, 'mpesa', 'pending', NOW())
        RETURNING id
      `, [bookingId, totalAmount, platformFee, farmerEarning]);
      
      const paymentId = paymentResult.rows[0].id;
      
      // Format phone number for M-Pesa
      let formattedPhone = phoneNumber;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.substring(1)}`;
      }
      if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
      }
      
      // Initiate STK Push
      const accountReference = `HARVEST${bookingId}`;
      const stkResponse = await stkPush(formattedPhone, totalAmount, accountReference);
      
      if (stkResponse.ResponseCode === '0') {
        await pool.query(`
          UPDATE payments 
          SET transaction_id = $1, status = 'processing'
          WHERE id = $2
        `, [stkResponse.CheckoutRequestID, paymentId]);
        
        return NextResponse.json({
          success: true,
          paymentMethod: 'mpesa',
          checkoutRequestId: stkResponse.CheckoutRequestID,
          message: 'STK Push sent to your phone. Enter your PIN to complete payment.'
        });
      } else {
        return NextResponse.json({ error: stkResponse.ResponseDescription || 'Failed to initiate payment' }, { status: 500 });
      }
    }
    
    if (paymentMethod === 'cash') {
      // Cash on arrival - update payment status only, booking status becomes confirmed
      await pool.query(`
        UPDATE bookings 
        SET payment_status = 'pending_cash', 
            status = 'confirmed',
            paid_at = NOW(),
            payment_method = 'cash'
        WHERE id = $1
      `, [bookingId]);
      
      return NextResponse.json({
        success: true,
        paymentMethod: 'cash',
        message: 'Booking confirmed! Please pay cash at the farm.'
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