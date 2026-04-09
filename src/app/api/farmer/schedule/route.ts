// src/app/api/farmer/schedule/bookings/route.ts
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

async function getFarmerId(userId: number) {
  const result = await pool.query(
    'SELECT id FROM farmer_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
}

// GET - Get all bookings for the farmer
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    // FIXED: Explicitly select all fields including payment_status
    const result = await pool.query(
      `SELECT 
         b.id,
         b.activity_id,
         b.visitor_id,
         b.farm_id,
         b.booking_date,
         b.participants,
         b.status,
         b.payment_status,  -- EXPLICITLY SELECT payment_status
         b.total_amount,
         b.special_requests,
         b.created_at,
         b.updated_at,
         a.activity_name,
         u.name as visitor_name,
         u.email as visitor_email,
         u.phone as visitor_phone
       FROM bookings b
       LEFT JOIN farmer_activities a ON b.activity_id = a.id
       JOIN users u ON b.visitor_id = u.id
       WHERE b.farm_id = $1
       ORDER BY b.booking_date ASC`,
      [farmerId]
    );

    const bookings = result.rows;

    // DEBUGGING: Log all bookings payment status
    console.log('📊 All farmer bookings:');
    bookings.forEach(booking => {
      console.log(`Booking #${booking.id}:`, {
        status: booking.status,
        payment_status: booking.payment_status,
        payment_type: typeof booking.payment_status,
        is_paid: booking.payment_status === 'paid',
        visitor: booking.visitor_name,
        date: booking.booking_date
      });
    });

    return NextResponse.json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    console.error('Error fetching farmer bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}