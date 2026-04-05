// src/app/api/payments/webhook/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This is where M-Pesa will send payment confirmation
    const { Body } = body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;
    
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const transactionId = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      
      // Find payment by checkout request ID
      const paymentResult = await pool.query(
        `SELECT id, booking_id FROM payments WHERE payment_reference = $1`,
        [CheckoutRequestID]
      );
      
      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        
        // Update payment status
        await pool.query(
          `UPDATE payments 
           SET status = 'completed', 
               transaction_id = $1, 
               completed_at = NOW(),
               metadata = $2
           WHERE id = $3`,
          [transactionId, JSON.stringify({ phoneNumber, amount }), payment.id]
        );
        
        // Update booking status
        await pool.query(
          `UPDATE bookings 
           SET status = 'confirmed', 
               payment_status = 'paid',
               updated_at = NOW()
           WHERE id = $1`,
          [payment.booking_id]
        );
        
        // Notify farmer
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, data, created_at)
           SELECT fp.user_id, 'payment_received', 'Payment Received', 
                  'Payment of KES ' || $1 || ' received for booking',
                  json_build_object('bookingId', $2, 'amount', $1),
                  NOW()
           FROM bookings b
           JOIN farmer_profiles fp ON b.farm_id = fp.id
           WHERE b.id = $2`,
          [amount, payment.booking_id]
        );
      }
    }
    
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
}