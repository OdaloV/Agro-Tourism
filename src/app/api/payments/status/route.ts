import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getPaymentStatus } from '@/lib/intasend';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get stored intasend_id and current payment_status
    const bookingRes = await pool.query(
      `SELECT intasend_id, payment_status FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const { intasend_id, payment_status } = bookingRes.rows[0];

    // If already final state, return immediately
    if (['held', 'failed', 'refunded', 'completed'].includes(payment_status)) {
      return NextResponse.json({ status: payment_status });
    }

    // If no intasend_id or still pending/initiated, poll IntaSend
    if (!intasend_id) {
      return NextResponse.json({ status: 'pending' });
    }

    const statusData = await getPaymentStatus(intasend_id);
    const intaStatus = statusData.status; // 'success', 'failed', 'pending'

    if (intaStatus === 'success') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'held' WHERE id = $1`,
        [bookingId]
      );
      await pool.query(
        `UPDATE escrow_transactions SET status = 'held' WHERE booking_id = $1`,
        [bookingId]
      );
      return NextResponse.json({ status: 'held' });
    } else if (intaStatus === 'failed') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'failed' WHERE id = $1`,
        [bookingId]
      );
      return NextResponse.json({ status: 'failed' });
    } else {
      return NextResponse.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
