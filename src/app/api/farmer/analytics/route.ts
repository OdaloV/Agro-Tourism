// src/app/api/farmer/analytics/route.ts
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
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total bookings and revenue (ONLY paid bookings)
    const bookingsResult = await pool.query(
      `SELECT 
         COUNT(*) as total_bookings,
         COALESCE(SUM(total_amount), 0) as total_revenue
       FROM bookings 
       WHERE farm_id = $1 
         AND booking_date > $2
         AND status IN ('confirmed', 'completed', 'paid')`,
      [farmerId, startDate]
    );
    
    const totalBookings = parseInt(bookingsResult.rows[0].total_bookings);
    const totalRevenue = parseFloat(bookingsResult.rows[0].total_revenue);
    const farmerEarnings = totalRevenue * 0.9; // 90% after platform fee

    // Get monthly bookings for chart
    const monthlyBookings = await pool.query(
      `SELECT 
         TO_CHAR(DATE_TRUNC('month', booking_date), 'Mon') as month,
         COUNT(*) as bookings,
         COALESCE(SUM(total_amount), 0) as revenue
       FROM bookings 
       WHERE farm_id = $1 
         AND booking_date > NOW() - INTERVAL '6 months'
         AND status IN ('confirmed', 'completed', 'paid')
       GROUP BY DATE_TRUNC('month', booking_date)
       ORDER BY DATE_TRUNC('month', booking_date) ASC`,
      [farmerId]
    );

    // Get top 5 activities
    const topActivities = await pool.query(
      `SELECT 
         a.activity_name as name,
         COUNT(b.id) as bookings
       FROM farmer_activities a
       LEFT JOIN bookings b ON a.id = b.activity_id AND b.status IN ('confirmed', 'completed', 'paid')
       WHERE a.farmer_id = $1
       GROUP BY a.id, a.activity_name
       ORDER BY bookings DESC
       LIMIT 5`,
      [farmerId]
    );

    return NextResponse.json({
      summary: {
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
        farmer_earnings: farmerEarnings,
        platform_fee: totalRevenue * 0.1
      },
      monthly_data: monthlyBookings.rows,
      top_activities: topActivities.rows
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      summary: {
        total_bookings: 0,
        total_revenue: 0,
        farmer_earnings: 0,
        platform_fee: 0
      },
      monthly_data: [],
      top_activities: []
    });
  }
}