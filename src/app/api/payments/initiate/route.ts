// src/app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

// Use IntaSend SDK for reliable STK push
const IntaSend = require('intasend-node');

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, phoneNumber, paymentMethod } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }
    if (paymentMethod !== 'mpesa') {
      return NextResponse.json({ error: 'Only M-PESA is supported for now' }, { status: 400 });
    }

    // Fetch booking details
    const bookingResult = await pool.query(
      `SELECT b.*, fp.user_id as farmer_user_id, u.name as visitor_name, u.email as visitor_email
       FROM bookings b
       JOIN farmer_profiles fp ON b.farm_id = fp.id
       JOIN users u ON b.visitor_id = u.id
       WHERE b.id = $1 AND b.visitor_id = $2 AND b.payment_status = 'pending'`,
      [bookingId, user.id]
    );
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found or already paid' }, { status: 404 });
    }
    const booking = bookingResult.rows[0];
    const totalAmount = parseFloat(booking.total_amount);
    const platformFee = totalAmount * 0.10;
    const farmerAmount = totalAmount * 0.90;

    // Format phone number: remove '+' or leading zero, ensure 254XXXXXXXX
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('254')) cleanPhone = '254' + cleanPhone;
    if (cleanPhone.length !== 12) {
      return NextResponse.json({ error: 'Invalid phone number format. Use 254XXXXXXXXX' }, { status: 400 });
    }

    // Initialize IntaSend SDK (sandbox mode)
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLISHABLE_KEY,
      process.env.INTASEND_SECRET_KEY,
      true // true = sandbox
    );
    const collection = intasend.collection();

    // Trigger STK push directly (no redirect)
    const stkResponse = await collection.mpesaStkPush({
      first_name: booking.visitor_name?.split(' ')[0] || 'Guest',
      last_name: booking.visitor_name?.split(' ')[1] || '',
      email: booking.visitor_email,
      host: process.env.NEXT_PUBLIC_APP_URL,
      amount: totalAmount,
      phone_number: cleanPhone,
      api_ref: `booking-${bookingId}`,
    });

    // Extract invoice ID from SDK response
    const intasendId = stkResponse.invoice?.invoice_id || stkResponse.id;
    if (!intasendId) {
      console.error('No invoice_id in STK response:', stkResponse);
      throw new Error('Invoice ID missing from STK response');
    }

    // Update database
    await pool.query(
      `UPDATE bookings SET intasend_id = $1, payment_status = 'initiated' WHERE id = $2`,
      [intasendId, bookingId]
    );
    await pool.query(
      `INSERT INTO escrow_transactions 
       (booking_id, intasend_txn_ref, total_amount, platform_fee, farmer_amount, status, payment_method)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
      [bookingId, intasendId, totalAmount, platformFee, farmerAmount, 'M-PESA']
    );

    return NextResponse.json({
      success: true,
      paymentMethod: 'mpesa',
      invoiceId: intasendId,
      message: 'STK push sent to your phone. Enter PIN to complete payment.',
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}