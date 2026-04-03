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

// GET - Fetch all activities for a farmer
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

    const result = await pool.query(
      `SELECT id, activity_name as name, category, price, is_free, currency, is_custom
       FROM farmer_activities 
       WHERE farmer_id = $1 
       ORDER BY is_custom DESC, id ASC`,
      [farmerId]
    );

    return NextResponse.json({ activities: result.rows });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Add a new activity
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
    const { name, category, price, is_free, currency } = body;

    if (!name) {
      return NextResponse.json({ error: 'Activity name is required' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO farmer_activities (farmer_id, activity_name, category, price, is_free, currency, is_custom)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, activity_name as name, category, price, is_free, currency`,
      [farmerId, name, category || null, is_free ? 0 : price, is_free, currency || 'KES']
    );

    return NextResponse.json({ success: true, activity: result.rows[0] });
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json(
      { error: 'Failed to add activity' },
      { status: 500 }
    );
  }
}

// PUT - Update an activity
export async function PUT(request: NextRequest) {
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
    const activityId = searchParams.get('id');
    
    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, price, is_free, currency } = body;

    // Verify activity belongs to this farmer
    const verify = await pool.query(
      'SELECT id FROM farmer_activities WHERE id = $1 AND farmer_id = $2',
      [activityId, farmerId]
    );
    
    if (verify.rows.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    await pool.query(
      `UPDATE farmer_activities 
       SET activity_name = $1, category = $2, price = $3, is_free = $4, currency = $5
       WHERE id = $6`,
      [name, category || null, is_free ? 0 : price, is_free, currency || 'KES', activityId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an activity
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
    const activityId = searchParams.get('id');
    
    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    // Verify activity belongs to this farmer
    const verify = await pool.query(
      'SELECT id FROM farmer_activities WHERE id = $1 AND farmer_id = $2',
      [activityId, farmerId]
    );
    
    if (verify.rows.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM farmer_activities WHERE id = $1', [activityId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}