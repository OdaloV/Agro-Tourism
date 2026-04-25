//src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const event = payload.event; // e.g., "payment.success", "payment.failed", "refund.completed"
    const data = payload.data;

    if (!event || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Extract IntaSend transaction ID and metadata
    const intasendId = data.id;
    const metadata = data.metadata || {};
    const bookingId = metadata.booking_id;

    if (!bookingId) {
      console.warn('Webhook missing booking_id in metadata');
      return NextResponse.json({ received: true });
    }

    if (event === 'payment.success') {
      // Update booking payment_status to 'held' (money in platform account, we simulate escrow)
      await pool.query(
        `UPDATE bookings SET payment_status = 'held' WHERE id = $1 AND intasend_id = $2`,
        [bookingId, intasendId]
      );

      // Update escrow_transactions status to 'held'
      await pool.query(
        `UPDATE escrow_transactions SET status = 'held' WHERE booking_id = $1 AND intasend_txn_ref = $2`,
        [bookingId, intasendId]
      );

      console.log(`✅ Payment success for booking ${bookingId}, intasend_id ${intasendId}`);
    } 
    else if (event === 'payment.failed') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'failed' WHERE id = $1 AND intasend_id = $2`,
        [bookingId, intasendId]
      );
      console.log(`❌ Payment failed for booking ${bookingId}`);
    }
    else if (event === 'refund.completed') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'refunded', refunded_at = NOW() WHERE id = $1 AND intasend_id = $2`,
        [bookingId, intasendId]
      );
      await pool.query(
        `UPDATE escrow_transactions SET status = 'refunded', refunded_at = NOW() WHERE booking_id = $1 AND intasend_txn_ref = $2`,
        [bookingId, intasendId]
      );
      console.log(`🔄 Refund completed for booking ${bookingId}`);
    }
    else {
      console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
