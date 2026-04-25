import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { createPayment } from '@/lib/intasend';

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
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Fetch booking details
    const bookingResult = await pool.query(
      `SELECT b.*, fp.user_id as farmer_user_id, u.name as visitor_name, u.email as visitor_email
       FROM bookings b
       JOIN farmer_profiles fp ON b.farm_id = fp.id
       JOIN users u ON b.visitor_id = u.id
       WHERE b.id = $1 AND b.visitor_id = $2 AND b.payment_status = 'pending'`,
      [bookingId, user.id]
    );
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found or already paid' }, { status: 404 });
    }
    const booking = bookingResult.rows[0];
    const totalAmount = parseFloat(booking.total_amount);
    const platformFee = totalAmount * 0.10;
    const farmerAmount = totalAmount * 0.90;

    // Determine payment method
    let method: 'MPESA' | 'CARD' = 'MPESA';
    if (paymentMethod === 'card') method = 'CARD';
    else if (paymentMethod !== 'mpesa') {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Prepare IntaSend payment
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/visitor/payment/callback?bookingId=${bookingId}`;

    const payment = await createPayment({
      amount: totalAmount,
      currency: 'KES',
      payment_method: method,
      phone_number: method === 'MPESA' ? phoneNumber : undefined,
      email: booking.visitor_email,
      redirect_url: method === 'CARD' ? redirectUrl : undefined,
      webhook: webhookUrl,
      metadata: { booking_id: bookingId },
    });

    // Store IntaSend transaction ID in booking
    await pool.query(
      `UPDATE bookings SET intasend_id = $1, payment_status = 'initiated' WHERE id = $2`,
      [payment.id, bookingId]
    );

    // Create escrow transaction record
    await pool.query(
      `INSERT INTO escrow_transactions 
       (booking_id, intasend_txn_ref, total_amount, platform_fee, farmer_amount, status, payment_method)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
      [bookingId, payment.id, totalAmount, platformFee, farmerAmount, method]
    );

    // Return response based on payment method
    if (method === 'MPESA') {
      // IntaSend returns an object containing M-Pesa STK push details
      const mpesaResponse = payment.mpesa_stk_push;
      if (!mpesaResponse || mpesaResponse.ResponseCode !== '0') {
        throw new Error(mpesaResponse?.ResponseDescription || 'STK push failed');
      }
      return NextResponse.json({
        success: true,
        paymentMethod: 'mpesa',
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        message: 'STK push sent to your phone. Enter your PIN to complete payment.',
      });
    } else {
      // Card payment – redirect to IntaSend hosted page
      return NextResponse.json({
        success: true,
        paymentMethod: 'card',
        redirectUrl: payment.redirect_url,
      });
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
