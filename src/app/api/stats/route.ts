import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Total bookings
    const bookingsRes = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const totalBookings = parseInt(bookingsRes.rows[0]?.count || '0');

    // Total revenue (completed payments)
    const revenueRes = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM bookings WHERE payment_status = 'completed'`
    );
    const totalRevenue = parseFloat(revenueRes.rows[0]?.total || '0');

    // Pending escrow releases
    const pendingRes = await pool.query(
      `SELECT COUNT(*) as count FROM escrow_transactions WHERE status = 'pending'`
    );
    const pendingPayouts = parseInt(pendingRes.rows[0]?.count || '0');

    // Pending verifications (farmer profiles waiting approval)
    const verificationsRes = await pool.query(
      `SELECT COUNT(*) as count 
       FROM farmer_profiles 
       WHERE verification_status = 'pending'`
    );
    const pendingVerifications = parseInt(verificationsRes.rows[0]?.count || '0');

    // Total farms (use farmer_profiles table)
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