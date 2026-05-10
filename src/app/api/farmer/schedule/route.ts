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
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');
    let query = `
      SELECT 
        b.id, b.booking_date, b.status, b.payment_status,
        b.total_amount, b.participants, b.special_requests,
        u.name as visitor_name, u.email as visitor_email,
        a.activity_name,
        (b.payment_status = 'completed') as is_paid
      FROM bookings b
      JOIN users u ON b.visitor_id = u.id
      LEFT JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.farm_id = $1
    `;
    const params: any[] = [farmerId];
    let paramIndex = 2;
    if (year > 0) {
      query += ` AND EXTRACT(YEAR FROM b.booking_date) = $${paramIndex++}`;
      params.push(year);
    }
    if (month > 0) {
      query += ` AND EXTRACT(MONTH FROM b.booking_date) = $${paramIndex++}`;
      params.push(month);
    }
    query += ` ORDER BY b.booking_date ASC`;
    const result = await pool.query(query, params);
    return NextResponse.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('Error fetching farmer schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}