// src/app/api/recent-views/route.ts
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

// POST - Log farm view
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { farmId } = await request.json();
    
    if (!farmId) {
      return NextResponse.json({ error: 'Farm ID required' }, { status: 400 });
    }
    
    await pool.query(
      `INSERT INTO recent_views (visitor_id, farm_id, viewed_at) VALUES ($1, $2, NOW())`,
      [user.id, farmId]
    );
    
    // Increment farm view count
    await pool.query(
      `UPDATE farmer_profiles SET profile_views = COALESCE(profile_views, 0) + 1 WHERE id = $1`,
      [farmId]
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error logging recent view:', error);
    return NextResponse.json(
      { error: 'Failed to log view' },
      { status: 500 }
    );
  }
}

// GET - Get user's recent views
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await pool.query(
      `SELECT 
         rv.id,
         rv.viewed_at,
         fp.id as farm_id,
         fp.farm_name,
         fp.farm_location,
         fp.city,
         fp.county,
         fp.average_rating,
         COALESCE(
           (SELECT photo_url FROM farm_photos WHERE farmer_id = fp.id LIMIT 1),
           fp.profile_photo_url
         ) as cover_photo
       FROM recent_views rv
       JOIN farmer_profiles fp ON rv.farm_id = fp.id
       WHERE rv.visitor_id = $1
       ORDER BY rv.viewed_at DESC
       LIMIT 50`,
      [user.id]
    );
    
    return NextResponse.json({ recentViews: result.rows });
    
  } catch (error) {
    console.error('Error fetching recent views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent views' },
      { status: 500 }
    );
  }
}

// DELETE - Clear recent views
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const viewId = searchParams.get('id');
    
    if (viewId) {
      await pool.query(
        `DELETE FROM recent_views WHERE id = $1 AND visitor_id = $2`,
        [viewId, user.id]
      );
    } else {
      await pool.query(
        `DELETE FROM recent_views WHERE visitor_id = $1`,
        [user.id]
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error clearing recent views:', error);
    return NextResponse.json(
      { error: 'Failed to clear recent views' },
      { status: 500 }
    );
  }
}