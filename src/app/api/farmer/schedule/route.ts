// src/app/api/farmer/schedule/route.ts
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

// GET - Fetch all bookings and blocked dates
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

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let bookingQuery = `
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.guests_count,
        b.total_amount,
        b.status,
        b.activity_id,
        a.activity_name as activity_name,
        u.name as visitor_name,
        u.email as visitor_email,
        u.phone as visitor_phone
      FROM bookings b
      LEFT JOIN farmer_activities a ON b.activity_id = a.id
      JOIN users u ON b.visitor_id = u.id
      WHERE b.farm_id = $1
    `;

    const queryParams: any[] = [farmerId];
    let paramIndex = 2;

    // Filter by date range
    if (startDate && endDate) {
      bookingQuery += ` AND b.booking_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      queryParams.push(startDate, endDate);
      paramIndex += 2;
    } else if (year && month) {
      const startOfMonth = `${year}-${month}-01`;
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      bookingQuery += ` AND b.booking_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      queryParams.push(startOfMonth, endOfMonth);
      paramIndex += 2;
    }

    bookingQuery += ` ORDER BY b.booking_date ASC, b.start_time ASC`;

    const bookingsResult = await pool.query(bookingQuery, queryParams);

    // Get blocked dates
    const availabilityQuery = `
      SELECT 
        id,
        start_date,
        end_date,
        reason
      FROM farmer_availability
      WHERE farmer_id = $1
      ORDER BY start_date ASC
    `;

    const availabilityResult = await pool.query(availabilityQuery, [farmerId]);

    // Calculate summary stats
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = bookingsResult.rows.filter(b => b.booking_date === today);
    const upcomingBookings = bookingsResult.rows.filter(b => b.booking_date > today && b.status === 'pending');
    const pendingCount = bookingsResult.rows.filter(b => b.status === 'pending').length;

    return NextResponse.json({
      success: true,
      bookings: bookingsResult.rows,
      blocked_dates: availabilityResult.rows,
      summary: {
        today_count: todayBookings.length,
        upcoming_count: upcomingBookings.length,
        pending_count: pendingCount,
        total_bookings: bookingsResult.rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}