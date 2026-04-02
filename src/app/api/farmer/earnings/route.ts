// src/app/api/farmer/earnings/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');

    if (!farmerId) {
      return NextResponse.json(
        { error: 'Farmer ID required' },
        { status: 400 }
      );
    }

    // Get farmer's farm profile id
    const farmResult = await pool.query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [farmerId]
    );

    if (farmResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Farm profile not found' },
        { status: 404 }
      );
    }

    const farmProfileId = farmResult.rows[0].id;

    // Get recent earnings
    const recentResult = await pool.query(
      `SELECT 
        b.id,
        b.activity_name as "activityName",
        b.booking_date as "bookingDate",
        b.participants as guests,
        b.total_amount as amount,
        b.platform_fee as "platformFee",
        b.farmer_earning as "farmerEarning"
      FROM bookings b
      WHERE b.farm_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 5`,
      [farmProfileId]
    );

    // Get total earnings
    const totalResult = await pool.query(
      `SELECT 
        COALESCE(SUM(b.total_amount), 0) as total_amount,
        COALESCE(SUM(b.platform_fee), 0) as total_platform_fee,
        COALESCE(SUM(b.farmer_earning), 0) as total_farmer_earning,
        COUNT(b.id) as total_bookings
      FROM bookings b
      WHERE b.farm_id = $1 AND b.status != 'cancelled'`,
      [farmProfileId]
    );

    return NextResponse.json({
      recent: recentResult.rows,
      total: parseFloat(totalResult.rows[0].total_farmer_earning),
      platformFee: parseFloat(totalResult.rows[0].total_platform_fee),
      totalBookings: parseInt(totalResult.rows[0].total_bookings),
      totalAmount: parseFloat(totalResult.rows[0].total_amount)
    });

  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}