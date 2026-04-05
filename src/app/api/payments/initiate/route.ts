// src/app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

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

// POST - Initiate payment
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookingId, paymentMethod, amount, currency } = await request.json();
    
    if (!bookingId || !paymentMethod || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify booking belongs to user
    const bookingCheck = await pool.query(
      `SELECT id, status, total_amount FROM bookings WHERE id = $1 AND visitor_id = $2`,
      [bookingId, user.id]
    );
    
    if (bookingCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const booking = bookingCheck.rows[0];
    
    if (booking.status === 'confirmed') {
      return NextResponse.json({ error: 'Booking already confirmed' }, { status: 400 });
    }
    
    // Create payment record
    const paymentResult = await pool.query(
      `INSERT INTO payments (booking_id, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())
       RETURNING id, payment_reference`,
      [bookingId, amount, currency, paymentMethod]
    );
    
    const payment = paymentResult.rows[0];
    
    // Handle different payment methods
    if (paymentMethod === 'cash') {
      // Cash on arrival - confirm immediately
      await pool.query(
        `UPDATE bookings SET status = 'confirmed', payment_status = 'pending_cash', updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      );
      
      await pool.query(
        `UPDATE payments SET status = 'pending_cash', completed_at = NOW() WHERE id = $1`,
        [payment.id]
      );
      
      return NextResponse.json({
        success: true,
        paymentMethod: 'cash',
        message: 'Booking confirmed. Please pay at the farm.',
        bookingId: bookingId
      });
    }
    
    if (paymentMethod === 'mpesa') {
      // TODO: Integrate M-Pesa Daraja API
      // For now, simulate STK Push
      return NextResponse.json({
        success: true,
        paymentMethod: 'mpesa',
        message: 'STK Push sent to your phone. Please enter your PIN.',
        paymentReference: payment.payment_reference,
        checkoutRequestId: `MPS-${Date.now()}`
      });
    }
    
    if (paymentMethod === 'card') {
      // TODO: Integrate Stripe
      return NextResponse.json({
        success: true,
        paymentMethod: 'card',
        checkoutUrl: `/visitor/payment/stripe/${payment.id}`,
        paymentReference: payment.payment_reference
      });
    }
    
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}