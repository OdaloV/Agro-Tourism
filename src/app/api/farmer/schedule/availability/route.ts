// src/app/api/farmer/schedule/availability/route.ts
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

// POST - Block dates
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { start_date, end_date, reason } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO farmer_availability (farmer_id, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [farmerId, start_date, end_date, reason || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Dates blocked successfully',
      blocked_date: result.rows[0]
    });

  } catch (error) {
    console.error('Error blocking dates:', error);
    return NextResponse.json(
      { error: 'Failed to block dates' },
      { status: 500 }
    );
  }
}

// DELETE - Remove blocked dates
export async function DELETE(request: NextRequest) {
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
    const availabilityId = searchParams.get('id');

    if (!availabilityId) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    // Verify the blocked date belongs to this farmer
    const verify = await pool.query(
      'SELECT id FROM farmer_availability WHERE id = $1 AND farmer_id = $2',
      [availabilityId, farmerId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    await pool.query('DELETE FROM farmer_availability WHERE id = $1', [availabilityId]);

    return NextResponse.json({
      success: true,
      message: 'Blocked dates removed successfully'
    });

  } catch (error) {
    console.error('Error removing blocked dates:', error);
    return NextResponse.json(
      { error: 'Failed to remove blocked dates' },
      { status: 500 }
    );
  }
}