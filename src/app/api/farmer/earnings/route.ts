// src/app/api/farmer/earnings/route.ts
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
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get farmer profile ID
    const farmerResult = await pool.query(
      `SELECT id FROM farmer_profiles WHERE user_id = $1`,
      [user.id]
    );
    
    if (farmerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }
    
    const farmerId = farmerResult.rows[0].id;
    
    // ✅ FIXED: Only get COMPLETED payments
    const earningsResult = await pool.query(`
      SELECT 
        p.id,
        p.booking_id,
        p.amount as total_amount,
        p.platform_fee,
        p.farmer_earnings,
        p.status as payment_status,
        p.payment_date as paid_at,
        b.activity_name,
        b.booking_date,
        b.participants as guests,
        b.status as booking_status
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.farm_id = $1 
        AND p.status = 'completed'  -- ✅ ONLY completed payments
        AND b.status IN ('confirmed', 'completed', 'paid')  -- ✅ ONLY confirmed bookings
      ORDER BY b.booking_date DESC
    `, [farmerId]);
    
    // Calculate summary (only completed payments)
    const earnings = earningsResult.rows.map(row => ({
      id: row.id,
      bookingId: row.booking_id,
      activityName: row.activity_name,
      bookingDate: row.booking_date,
      guests: row.guests,
      totalAmount: parseFloat(row.total_amount),
      platformFee: parseFloat(row.platform_fee),
      farmerEarning: parseFloat(row.farmer_earnings),
      paymentStatus: row.payment_status,
      paidAt: row.paid_at,
    }));
    
    const summary = {
      totalEarnings: earnings.reduce((sum, e) => sum + e.farmerEarning, 0),
      completedEarnings: earnings.reduce((sum, e) => sum + e.farmerEarning, 0),
      totalBookings: earnings.length,
      totalGuests: earnings.reduce((sum, e) => sum + e.guests, 0),
    };
    
    return NextResponse.json({ earnings, summary });
    
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}