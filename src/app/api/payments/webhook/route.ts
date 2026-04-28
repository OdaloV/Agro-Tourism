import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    // Extract relevant data
    const invoiceId = payload.invoice_id;
    const state = payload.state; // e.g., "PENDING", "SUCCESS", "FAILED"
    const provider = payload.provider; // "M-PESA" or "CARD"

    if (!invoiceId) {
      console.warn('Webhook missing invoice_id');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Find booking by intasend_id
    const bookingRes = await pool.query(
      `SELECT id, payment_status, intasend_id FROM bookings WHERE intasend_id = $1`,
      [invoiceId]
    );
    if (bookingRes.rows.length === 0) {
      console.warn(`No booking found for intasend_id: ${invoiceId}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }
    const booking = bookingRes.rows[0];

    // Update based on state
    if (state === 'SUCCESS' || (provider === 'M-PESA' && state === 'SUCCESS')) {
      // Payment succeeded – mark as 'held' (escrow)
      await pool.query(
        `UPDATE bookings SET payment_status = 'held' WHERE id = $1`,
        [booking.id]
      );
      await pool.query(
        `UPDATE escrow_transactions SET status = 'held', updated_at = NOW() WHERE intasend_txn_ref = $1`,
        [invoiceId]
      );
      console.log(`Payment for booking ${booking.id} is now HELD (escrow).`);
    } else if (state === 'FAILED') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'failed' WHERE id = $1`,
        [booking.id]
      );
      await pool.query(
        `UPDATE escrow_transactions SET status = 'failed' WHERE intasend_txn_ref = $1`,
        [invoiceId]
      );
      console.log(`Payment for booking ${booking.id} failed.`);
    } else if (state === 'PENDING') {
      // Still pending – ignore
      console.log(`Payment for booking ${booking.id} is still PENDING.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to avoid IntaSend retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
