// src/app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));
    
    // The actual M-Pesa callback structure may vary
    // Let's handle different possible formats
    
    let stkCallback;
    
    // Check different possible structures
    if (callbackData.Body && callbackData.Body.stkCallback) {
      // Standard Safaricom format
      stkCallback = callbackData.Body.stkCallback;
    } else if (callbackData.stkCallback) {
      // Alternative format
      stkCallback = callbackData.stkCallback;
    } else {
      // This was our test callback
      console.log('Test callback received (ignoring)');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;
    
    console.log('ResultCode:', ResultCode);
    console.log('CheckoutRequestID:', CheckoutRequestID);
    
    if (!CheckoutRequestID) {
      console.log('No CheckoutRequestID, ignoring');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    
    // Find payment by checkout request ID
    const paymentResult = await pool.query(`
      SELECT id, booking_id FROM payments WHERE transaction_id = $1
    `, [CheckoutRequestID]);
    
    console.log('Payment found:', paymentResult.rows.length);
    
    if (paymentResult.rows.length === 0) {
      console.log('Payment not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    
    const payment = paymentResult.rows[0];
    
    if (ResultCode === 0) {
      // Payment successful
      let amount = null;
      let mpesaReceiptNumber = null;
      
      if (CallbackMetadata && CallbackMetadata.Item) {
        const metadata = CallbackMetadata.Item;
        amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
        mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      }
      
      console.log(`✅ Payment successful! Receipt: ${mpesaReceiptNumber}, Amount: ${amount}`);
      
      // Update payment status
      await pool.query(`
        UPDATE payments 
        SET status = 'completed', 
            payment_date = NOW(),
            transaction_id = COALESCE($1, transaction_id)
        WHERE id = $2
      `, [mpesaReceiptNumber, payment.id]);
      
      // Update booking status
      await pool.query(`
        UPDATE bookings 
        SET payment_status = 'paid', 
            status = 'confirmed', 
            paid_at = NOW(),
            payment_method = 'mpesa'
        WHERE id = $1
      `, [payment.booking_id]);
      
      console.log(`✅ Booking ${payment.booking_id} updated to confirmed`);
    } else {
      console.log(`❌ Payment failed: ${ResultDesc}`);
      await pool.query(`
        UPDATE payments SET status = 'failed' WHERE id = $1
      `, [payment.id]);
    }
    
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    
  } catch (error) {
    console.error('Callback error:', error);
    // Always return success to M-Pesa to prevent retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
}