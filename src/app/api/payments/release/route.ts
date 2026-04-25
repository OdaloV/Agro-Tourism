import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { sendPayout } from '@/lib/intasend';

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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Verify booking belongs to this farmer and is in 'held' state
    const bookingRes = await pool.query(
      `SELECT b.id, b.intasend_id, b.payment_status, b.total_amount, 
              b.farm_id, fp.user_id as farmer_user_id, b.visitor_id,
              et.id as escrow_id, et.farmer_amount
       FROM bookings b
       JOIN farmer_profiles fp ON b.farm_id = fp.id
       LEFT JOIN escrow_transactions et ON b.id = et.booking_id
       WHERE b.id = $1 AND fp.user_id = $2 AND b.payment_status = 'held'`,
      [bookingId, user.id]
    );
    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found or not ready for release' }, { status: 404 });
    }
    const booking = bookingRes.rows[0];
    const farmerAmount = parseFloat(booking.farmer_amount);

    // Get farmer's phone number from users table
    const farmerRes = await pool.query(
      `SELECT phone FROM users WHERE id = $1`,
      [booking.farmer_user_id]
    );
    const farmerPhone = farmerRes.rows[0]?.phone;
    if (!farmerPhone) {
      return NextResponse.json({ error: 'Farmer phone number not found' }, { status: 400 });
    }

    // Format phone number for IntaSend payout
    let formattedPhone = farmerPhone;
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

    // Send 90% to farmer
    await sendPayout(farmerAmount, formattedPhone);

    // Update records
    await pool.query(
      `UPDATE bookings SET payment_status = 'completed' WHERE id = $1`,
      [bookingId]
    );
    await pool.query(
      `UPDATE escrow_transactions SET status = 'released', released_at = NOW() WHERE id = $1`,
      [booking.escrow_id]
    );

    return NextResponse.json({ success: true, message: 'Payment released to farmer' });
  } catch (error: any) {
    console.error('Release payment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to release payment' }, { status: 500 });
  }
}
