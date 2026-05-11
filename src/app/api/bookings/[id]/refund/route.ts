import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { refundPayment } from '@/lib/intasend';
import csrf from 'csrf';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const csrfProtection = new csrf();
const CSRF_SECRET = process.env.CSRF_SECRET || '';

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(val => parseInt(val, 10)),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = paramsSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }
    const bookingId = parsed.data.id;

    if (!CSRF_SECRET) {
      return NextResponse.json({ error: 'CSRF secret is not configured' }, { status: 500 });
    }

    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !csrfProtection.verify(CSRF_SECRET, csrfToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as number;
    const userRole = payload.role as string;

    if (userRole !== 'visitor') {
      return NextResponse.json({ error: 'Only visitors can request refunds' }, { status: 403 });
    }

    const bookingRes = await pool.query(
      'SELECT intasend_id, payment_status, total_amount, visitor_id FROM bookings WHERE id = $1',
      [bookingId]
    );
    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingRes.rows[0];
    if (booking.visitor_id !== userId) {
      return NextResponse.json({ error: 'Not your booking' }, { status: 403 });
    }
    if (booking.payment_status !== 'held' && booking.payment_status !== 'completed') {
      return NextResponse.json({ error: 'Only paid bookings can be refunded' }, { status: 400 });
    }

    const refundResult = await refundPayment(booking.intasend_id, booking.total_amount);
    console.log('Refund result:', refundResult);

    const chargebackId = refundResult?.chargeback_id || refundResult?.id || null;

    await pool.query(
      `UPDATE bookings
       SET payment_status = 'refunded', status = 'cancelled', chargeback_id = $1
       WHERE id = $2`,
      [chargebackId, bookingId]
    );
    await pool.query(
      `UPDATE escrow_transactions
       SET status = 'refunded', refunded_at = NOW(), chargeback_id = $1
       WHERE booking_id = $2`,
      [chargebackId, bookingId]
    );

    return NextResponse.json({
      success: true,
      message: 'Refund processed',
      chargeback_id: chargebackId,
      status: refundResult?.status,
      amount: refundResult?.amount,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: error.message || 'Refund failed' }, { status: 500 });
  }
}