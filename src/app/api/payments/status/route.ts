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

    const bookingRes = await pool.query(
      `SELECT id, payment_status, intasend_id FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = bookingRes.rows[0];

    // If already final, return immediately
    if (['held', 'completed', 'refunded', 'failed'].includes(booking.payment_status)) {
      return NextResponse.json({ status: booking.payment_status });
    }

    if (booking.intasend_id) {
      try {
        const statusData = await getPaymentStatus(booking.intasend_id);
        const state = statusData.state; // 'PENDING', 'SUCCESS', 'FAILED'
        if (state === 'SUCCESS') {
          await pool.query(`UPDATE bookings SET payment_status = 'held' WHERE id = $1`, [bookingId]);
          await pool.query(`UPDATE escrow_transactions SET status = 'held' WHERE intasend_txn_ref = $1`, [booking.intasend_id]);
          return NextResponse.json({ status: 'held' });
        } else if (state === 'FAILED') {
          await pool.query(`UPDATE bookings SET payment_status = 'failed' WHERE id = $1`, [bookingId]);
          return NextResponse.json({ status: 'failed' });
        } else {
          return NextResponse.json({ status: 'pending' });
        }
      } catch (err) {
        console.error('Status check error:', err);
        return NextResponse.json({ status: booking.payment_status });
      }
    }

    return NextResponse.json({ status: booking.payment_status });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
