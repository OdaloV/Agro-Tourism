import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { refundPayment } from '@/lib/intasend';

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

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Verify booking belongs to this visitor and is in 'held' state (paid but not yet completed)
    const bookingRes = await pool.query(
      `SELECT b.id, b.intasend_id, b.payment_status, b.start_date
       FROM bookings b
       WHERE b.id = $1 AND b.visitor_id = $2 AND b.payment_status = 'held' AND b.start_date > NOW()`,
      [bookingId, user.id]
    );
    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Booking cannot be refunded (not paid, already completed, or past start date)' }, { status: 400 });
    }
    const booking = bookingRes.rows[0];

    // Call IntaSend refund API
    await refundPayment(booking.intasend_id); // full refund

    // Update database (status will be set to refunded when webhook arrives, but we can update immediately)
    await pool.query(
      `UPDATE bookings SET payment_status = 'refunded', refunded_at = NOW() WHERE id = $1`,
      [bookingId]
    );
    await pool.query(
      `UPDATE escrow_transactions SET status = 'refunded', refunded_at = NOW() WHERE booking_id = $1`,
      [bookingId]
    );

    return NextResponse.json({ success: true, message: 'Refund initiated. Money will be returned to your payment method (minus fees).' });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process refund' }, { status: 500 });
  }
}
