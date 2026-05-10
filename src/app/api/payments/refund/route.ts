import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { refundPayment } from '@/lib/intasend';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    const { rows } = await pool.query(
      `SELECT intasend_id, payment_status, total_amount, visitor_id FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    const booking = rows[0];
    if (booking.visitor_id !== user.id) return NextResponse.json({ error: 'Not your booking' }, { status: 403 });
    if (booking.payment_status !== 'held' && booking.payment_status !== 'completed') {
      return NextResponse.json({ error: 'Only paid bookings can be refunded' }, { status: 400 });
    }

    await refundPayment(booking.intasend_id, booking.total_amount);
    await pool.query(`UPDATE bookings SET payment_status = 'refunded', status = 'cancelled' WHERE id = $1`, [bookingId]);
    await pool.query(`UPDATE escrow_transactions SET status = 'refunded', refunded_at = NOW() WHERE booking_id = $1`, [bookingId]);

    return NextResponse.json({ success: true, message: 'Refund processed' });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: error.message || 'Refund failed' }, { status: 500 });
  }
}