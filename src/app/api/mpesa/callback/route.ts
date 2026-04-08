// src/app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    console.log('M-Pesa callback received');
    
    const { Body } = callbackData;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;
    
    // Find payment by checkout request ID
    const paymentResult = await pool.query(`
      SELECT id, booking_id FROM payments WHERE transaction_id = $1
    `, [CheckoutRequestID]);
    
    if (paymentResult.rows.length === 0) {
      console.log('Payment not found for:', CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    
    const payment = paymentResult.rows[0];
    
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      
      await pool.query(`
        UPDATE payments 
        SET status = 'completed', 
            payment_date = NOW(),
            transaction_id = $1
        WHERE id = $2
      `, [mpesaReceiptNumber, payment.id]);
      
      await pool.query(`
        UPDATE bookings 
        SET payment_status = 'paid', 
            status = 'confirmed', 
            paid_at = NOW(),
            payment_method = 'mpesa',
            transaction_id = $1
        WHERE id = $2
      `, [mpesaReceiptNumber, payment.booking_id]);
      
      console.log(`✅ Payment completed for booking ${payment.booking_id}`);
    } else {
      await pool.query(`
        UPDATE payments SET status = 'failed' WHERE id = $1
      `, [payment.id]);
      
      console.log(`❌ Payment failed: ${ResultDesc}`);
    }
    
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
}