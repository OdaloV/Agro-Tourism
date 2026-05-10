import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const invoiceId = payload.invoice_id;
    const trackingId = payload.tracking_id;

    if (!invoiceId) {
      console.warn('Webhook missing invoice_id');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const bookingRes = await pool.query(
      `SELECT id, total_amount, payment_status, intasend_id FROM bookings WHERE intasend_id = $1`,
      [invoiceId]
    );
    if (bookingRes.rows.length === 0) {
      console.warn(`No booking found for intasend_id: ${invoiceId}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }
    const booking = bookingRes.rows[0];

    const successStates = ['success', 'complete']; 
    if (successStates.includes(payload.state?.toLowerCase())) {
      
     await pool.query(`
  INSERT INTO escrow_transactions (booking_id, total_amount, platform_fee, farmer_amount, status, intasend_txn_ref)
  VALUES ($1, $2, $3, $4, 'held', $5)
  ON CONFLICT (booking_id) DO UPDATE 
  SET status = 'held', intasend_txn_ref = EXCLUDED.intasend_txn_ref
`, [
  booking.id,
  booking.total_amount,                        // total_amount
  booking.total_amount * 0.1,                  // platform_fee (10%)
  booking.total_amount * 0.9,                  // farmer_amount (90%)
  invoiceId
]);

      // Update the booking
      await pool.query(
        `UPDATE bookings SET payment_status = 'held', status = 'confirmed' WHERE id = $1`,
        [booking.id]
      );
      console.log(`Payment for booking ${booking.id} is now HELD (escrow) and booking confirmed.`);
    } else if (payload.state?.toLowerCase() === 'failed') {
      await pool.query(
        `UPDATE bookings SET payment_status = 'failed' WHERE id = $1`,
        [booking.id]
      );
      console.log(`Payment for booking ${booking.id} failed.`);
    } else if (payload.state?.toLowerCase() === 'pending') {
      console.log(`Payment for booking ${booking.id} is still PENDING.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to avoid IntaSend retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}