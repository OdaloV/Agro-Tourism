// src/app/api/payments/webhook/flutterwave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Optional: Verify webhook signature for security
    const signature = request.headers.get('verif-hash');
    if (process.env.FLUTTERWAVE_WEBHOOK_SECRET && 
        signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const { event, data } = body;
    
    if (event === 'charge.completed') {
      const { tx_ref, status, amount, currency, customer, payment_type } = data;
      
      // Extract booking_id from tx_ref (format: HARVEST_123_1234567890)
      const bookingId = parseInt(tx_ref.split('_')[1]);
      
      if (status === 'successful') {
        // Update payment status
        await pool.query(`
          UPDATE payments 
          SET status = 'completed', 
              payment_date = NOW(),
              transaction_id = $1,
              updated_at = NOW()
          WHERE booking_id = $2 AND status = 'pending'
        `, [tx_ref, bookingId]);
        
        // Update booking status
        await pool.query(`
          UPDATE bookings 
          SET payment_status = 'paid', 
              status = 'confirmed', 
              paid_at = NOW(),
              payment_method = $3,
              transaction_id = $1
          WHERE id = $2
        `, [tx_ref, bookingId, payment_type === 'card' ? 'card' : 'mpesa']);
        
        console.log(`✅ Payment completed for booking ${bookingId}`);
      } else if (status === 'failed') {
        await pool.query(`
          UPDATE payments 
          SET status = 'failed', 
              updated_at = NOW()
          WHERE booking_id = $1
        `, [bookingId]);
        
        console.log(`❌ Payment failed for booking ${bookingId}`);
      }
    }
    
    return NextResponse.json({ status: 'success' });
    
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}