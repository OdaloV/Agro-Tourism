import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const invoiceId = payload.invoice_id;
    const state = payload.state; 
    const provider = payload.provider;

    if (!invoiceId) {
      console.warn('Webhook missing invoice_id');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const bookingRes = await pool.query(
      `SELECT id, payment_status, intasend_id FROM bookings WHERE intasend_id = $1`,
      [invoiceId]
    );
    if (bookingRes.rows.length === 0) {
      console.warn(`No booking found for intasend_id: ${invoiceId}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }
    const booking = bookingRes.rows[0];

    const successStates = ['success', 'complete'];
    if (successStates.includes(state?.toLowerCase())) {
      // Payment succeeded – mark as 'held' and set booking status to 'confirmed'
      await pool.query(
        `UPDATE bookings SET payment_status = 'held', status = 'confirmed' WHERE id = $1`,
        [booking.id]
      );
      await pool.query(
        `UPDATE escrow_transactions SET status = 'held', updated_at = NOW() WHERE intasend_txn_ref = $1`,
        [invoiceId]
      );
      console.log(`Payment for booking ${booking.id} is now HELD (escrow) and booking confirmed.`);
    } else if (state?.toLowerCase() === 'failed') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'failed' WHERE id = $1`,
        [booking.id]
      );
      await pool.query(
        `UPDATE escrow_transactions SET status = 'failed' WHERE intasend_txn_ref = $1`,
        [invoiceId]
      );
      console.log(`Payment for booking ${booking.id} failed.`);
    } else if (state?.toLowerCase() === 'pending') {
      console.log(`Payment for booking ${booking.id} is still PENDING.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to avoid IntaSend retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}