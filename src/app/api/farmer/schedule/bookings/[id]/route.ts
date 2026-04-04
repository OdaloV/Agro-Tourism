// src/app/api/farmer/schedule/bookings/[id]/route.ts
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

// PUT - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const bookingId = parseInt(params.id);
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify booking belongs to this farmer
    const verify = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND farm_id = $2',
      [bookingId, farmerId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    await pool.query(
      `UPDATE bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, bookingId]
    );

    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// GET - Get single booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const bookingId = parseInt(params.id);

    const result = await pool.query(
      `SELECT 
         b.*,
         a.activity_name,
         u.name as visitor_name,
         u.email as visitor_email,
         u.phone as visitor_phone
       FROM bookings b
       LEFT JOIN farmer_activities a ON b.activity_id = a.id
       JOIN users u ON b.visitor_id = u.id
       WHERE b.id = $1 AND b.farm_id = $2`,
      [bookingId, farmerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}