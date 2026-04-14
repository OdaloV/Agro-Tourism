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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total users
    const usersResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'farmer' THEN 1 END) as total_farmers,
        COUNT(CASE WHEN role = 'visitor' THEN 1 END) as total_visitors,
        COUNT(CASE WHEN created_at > $1 THEN 1 END) as new_users
      FROM users
    `, [startDate.toISOString()]);

    // Get farms with all statuses
    const farmsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_farms,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_farms,
        COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_farms,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_farms,
        COUNT(CASE WHEN created_at > $1 THEN 1 END) as new_farms
      FROM farmer_profiles
    `, [startDate.toISOString()]);

    // Get bookings and revenue
    const bookingsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN booking_date > $1 THEN 1 END) as new_bookings,
        COALESCE(SUM(CASE WHEN booking_date > $1 THEN total_amount ELSE 0 END), 0) as new_revenue
      FROM bookings
      WHERE status IN ('confirmed', 'completed', 'paid')
    `, [startDate.toISOString()]);

    // Get platform commission rate
    const commissionRateResult = await pool.query(
      `SELECT value FROM platform_settings WHERE key = 'commission_rate'`
    );
    const commissionRate = parseFloat(commissionRateResult.rows[0]?.value) || 10;
    const platformEarnings = parseFloat(bookingsResult.rows[0].total_revenue) * (commissionRate / 100);
    const newPlatformEarnings = parseFloat(bookingsResult.rows[0].new_revenue) * (commissionRate / 100);

    // Get monthly data
    const monthlyResult = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', booking_date), 'Mon') as month,
        COUNT(*) as bookings,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE booking_date > NOW() - INTERVAL '6 months'
        AND status IN ('confirmed', 'completed', 'paid')
      GROUP BY DATE_TRUNC('month', booking_date)
      ORDER BY DATE_TRUNC('month', booking_date) ASC
    `);

    // Get top performing farms
    const topFarmsResult = await pool.query(`
      SELECT 
        fp.id,
        fp.farm_name,
        u.name as farmer_name,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue,
        COALESCE(AVG(r.rating), 0) as rating
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN bookings b ON b.farm_id = fp.id AND b.status IN ('confirmed', 'completed', 'paid')
      LEFT JOIN reviews r ON r.farm_id = fp.id
      GROUP BY fp.id, fp.farm_name, u.name
      ORDER BY bookings DESC
      LIMIT 10
    `);

    // Get pending farms for review
    const pendingFarms = await pool.query(`
      SELECT 
        fp.id,
        fp.farm_name,
        fp.submitted_at,
        u.name as owner_name,
        u.email as owner_email
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.verification_status = 'pending'
      ORDER BY fp.submitted_at ASC
      LIMIT 10
    `);

    return NextResponse.json({
      summary: {
        total_users: parseInt(usersResult.rows[0].total_users) || 0,
        total_farmers: parseInt(usersResult.rows[0].total_farmers) || 0,
        total_visitors: parseInt(usersResult.rows[0].total_visitors) || 0,
        new_users: parseInt(usersResult.rows[0].new_users) || 0,
        total_farms: parseInt(farmsResult.rows[0].total_farms) || 0,
        pending_farms: parseInt(farmsResult.rows[0].pending_farms) || 0,
        approved_farms: parseInt(farmsResult.rows[0].approved_farms) || 0,
        rejected_farms: parseInt(farmsResult.rows[0].rejected_farms) || 0,
        new_farms: parseInt(farmsResult.rows[0].new_farms) || 0,
        total_bookings: parseInt(bookingsResult.rows[0].total_bookings) || 0,
        total_revenue: parseFloat(bookingsResult.rows[0].total_revenue) || 0,
        new_bookings: parseInt(bookingsResult.rows[0].new_bookings) || 0,
        new_revenue: parseFloat(bookingsResult.rows[0].new_revenue) || 0,
        platform_earnings: platformEarnings,
        new_platform_earnings: newPlatformEarnings,
        commission_rate: commissionRate
      },
      monthly_data: monthlyResult.rows.map(row => ({
        month: row.month,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue)
      })),
      top_farms: topFarmsResult.rows.map(row => ({
        id: row.id,
        name: row.farm_name,
        farmer_name: row.farmer_name,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue),
        rating: parseFloat(row.rating) || 0
      })),
      pending_farms: pendingFarms.rows.map(row => ({
        id: row.id,
        farm_name: row.farm_name,
        owner_name: row.owner_name,
        owner_email: row.owner_email,
        submitted_at: row.submitted_at
      }))
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}