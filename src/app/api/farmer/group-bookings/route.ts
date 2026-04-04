// src/app/api/farmer/group-bookings/route.ts
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

// GET - Fetch all group bookings for a farmer
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

    // Get all bookings with 10+ guests (group bookings)
    const result = await pool.query(`
      SELECT 
        b.id,
        b.farm_id,
        fp.farm_name,
        b.activity_id,
        a.activity_name,
        b.booking_date,
        b.participants as guests_count,
        b.group_name,
        b.coordinator_name,
        b.coordinator_email,
        b.coordinator_phone,
        b.total_amount,
        b.discount_percentage,
        b.original_amount,
        b.status,
        b.special_requests,
        b.created_at,
        b.requires_quote,
        b.quote_status,
        b.custom_quote_amount,
        b.custom_quote_message,
        b.quote_valid_until
      FROM bookings b
      LEFT JOIN farmer_profiles fp ON b.farm_id = fp.id
      LEFT JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.farm_id = $1 AND b.participants >= 10
      ORDER BY b.created_at DESC
    `, [farmerId]);

    // Calculate stats
    const stats = {
      totalGroupBookings: result.rows.length,
      pendingQuotes: result.rows.filter((b: any) => b.requires_quote && b.status === 'pending').length,
      totalGroupRevenue: result.rows.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0),
      averageGroupSize: result.rows.length > 0 
        ? Math.round(result.rows.reduce((sum: number, b: any) => sum + b.guests_count, 0) / result.rows.length) 
        : 0
    };

    return NextResponse.json({
      bookings: result.rows,
      stats
    });

  } catch (error) {
    console.error('Error fetching group bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group bookings' },
      { status: 500 }
    );
  }
}