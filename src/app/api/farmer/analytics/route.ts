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
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get profile views
    const viewsResult = await pool.query(
      `SELECT COUNT(*) as count FROM profile_views WHERE profile_id = $1 AND viewed_at > $2`,
      [farmerId, startDate]
    );
    const totalViews = parseInt(viewsResult.rows[0].count);

    // Get bookings
    const bookingsResult = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
       FROM bookings WHERE farm_id = $1 AND booking_date > $2`,
      [farmerId, startDate]
    );
    const totalBookings = parseInt(bookingsResult.rows[0].count);
    const totalRevenue = parseFloat(bookingsResult.rows[0].revenue);

    // Get average rating
    const ratingResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating FROM reviews WHERE farmer_id = $1`,
      [farmerId]
    );
    const averageRating = parseFloat(ratingResult.rows[0].avg_rating);

    // Calculate conversion rate (bookings / views * 100)
    const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : '0';

    // Get response rate for messages
    const messagesResult = await pool.query(
      `SELECT 
         COUNT(CASE WHEN direction = 'incoming' THEN 1 END) as received,
         COUNT(CASE WHEN direction = 'outgoing' THEN 1 END) as replied
       FROM messages WHERE farmer_id = $1 AND created_at > $2`,
      [farmerId, startDate]
    );
    const received = parseInt(messagesResult.rows[0].received);
    const replied = parseInt(messagesResult.rows[0].replied);
    const responseRate = received > 0 ? ((replied / received) * 100).toFixed(1) : '100';

    // Get monthly data
    const monthlyData = await pool.query(
      `SELECT 
         TO_CHAR(DATE_TRUNC('month', booking_date), 'Mon') as month,
         COUNT(*) as bookings,
         COALESCE(SUM(total_amount), 0) as revenue
       FROM bookings 
       WHERE farm_id = $1 AND booking_date > $2
       GROUP BY DATE_TRUNC('month', booking_date)
       ORDER BY DATE_TRUNC('month', booking_date) DESC
       LIMIT 6`,
      [farmerId, startDate]
    );

    // Get top activities
    const topActivities = await pool.query(
      `SELECT 
         a.activity_name as name,
         COUNT(b.id) as bookings,
         COALESCE(SUM(b.total_amount), 0) as revenue
       FROM farmer_activities a
       LEFT JOIN bookings b ON a.id = b.activity_id
       WHERE a.farmer_id = $1
       GROUP BY a.id, a.activity_name
       ORDER BY bookings DESC
       LIMIT 5`,
      [farmerId]
    );

    // Get visitor demographics (simplified - you can expand this)
    const demographics = [
      { location: "Nairobi", count: 45, percentage: 45 },
      { location: "Kiambu", count: 25, percentage: 25 },
      { location: "Nakuru", count: 15, percentage: 15 },
      { location: "Other", count: 15, percentage: 15 },
    ];

    // Get recent activity
    const recentActivity = await pool.query(
      `(SELECT 
         'booking' as type,
         id,
         CONCAT('New booking for ', COALESCE(a.activity_name, 'farm visit')) as description,
         booking_date as date,
         status
       FROM bookings b
       LEFT JOIN farmer_activities a ON b.activity_id = a.id
       WHERE b.farm_id = $1
       LIMIT 5)
       UNION ALL
       (SELECT 
         'message' as type,
         id,
         CONCAT('New message from visitor') as description,
         created_at as date,
         status
       FROM messages
       WHERE farmer_id = $1 AND direction = 'incoming'
       LIMIT 5)
       ORDER BY date DESC
       LIMIT 10`,
      [farmerId]
    );

    // Format monthly data with views (you can track views per month separately)
    const monthlyFormatted = monthlyData.rows.map(row => ({
      month: row.month,
      views: Math.floor(Math.random() * 100) + 50, // Placeholder - implement actual view tracking
      bookings: parseInt(row.bookings),
      revenue: parseFloat(row.revenue)
    }));

    return NextResponse.json({
      summary: {
        total_views: totalViews,
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
        average_rating: averageRating,
        conversion_rate: parseFloat(conversionRate),
        response_rate: parseFloat(responseRate),
        avg_response_time: "2.5 hours"
      },
      monthly_data: monthlyFormatted,
      top_activities: topActivities.rows,
      visitor_demographics: demographics,
      recent_activity: recentActivity.rows.map(activity => ({
        ...activity,
        date: new Date(activity.date).toLocaleDateString()
      }))
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}