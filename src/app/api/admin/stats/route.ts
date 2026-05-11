import { NextRequest, NextResponse } from 'next/server';
import { getUser, requireRole } from '@/lib/auth-middleware';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  const err = requireRole(user, 'admin');
  if (err) return err;

  try {
    const bookingsRes = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const totalBookings = parseInt(bookingsRes.rows[0]?.count || '0');

    const revenueRes = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM bookings WHERE payment_status = 'completed'`
    );
    const totalRevenue = parseFloat(revenueRes.rows[0]?.total || '0');

    const pendingRes = await pool.query(
      `SELECT COUNT(*) as count FROM escrow_transactions WHERE status = 'pending'`
    );
    const pendingPayouts = parseInt(pendingRes.rows[0]?.count || '0');

    const verificationsRes = await pool.query(
      `SELECT COUNT(*) as count 
       FROM farmer_profiles 
       WHERE verification_status = 'pending'`
    );
    const pendingVerifications = parseInt(verificationsRes.rows[0]?.count || '0');

    const farmsRes = await pool.query('SELECT COUNT(*) as count FROM farmer_profiles');
    const totalFarms = parseInt(farmsRes.rows[0]?.count || '0');

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      pendingPayouts,
      pendingVerifications,
      totalFarms,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
