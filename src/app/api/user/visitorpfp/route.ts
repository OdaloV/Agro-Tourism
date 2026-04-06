// src/app/api/user/visitorpfp/route.ts
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

// POST - Upload/Update visitor profile photo
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { visitorpfp } = await request.json();
    
    if (!visitorpfp) {
      return NextResponse.json({ error: 'Profile photo is required' }, { status: 400 });
    }

    // Update visitorpfp in database
    await pool.query(
      `UPDATE users 
       SET visitorpfp = $1, updated_at = NOW()
       WHERE id = $2`,
      [visitorpfp, user.id]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Profile photo updated successfully',
      visitorpfp 
    });

  } catch (error) {
    console.error('Error updating profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to update profile photo' },
      { status: 500 }
    );
  }
}

// DELETE - Remove visitor profile photo
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove visitorpfp from database
    await pool.query(
      `UPDATE users 
       SET visitorpfp = NULL, updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Profile photo removed successfully' 
    });

  } catch (error) {
    console.error('Error removing profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile photo' },
      { status: 500 }
    );
  }
}

// GET - Fetch visitor profile photo
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT visitorpfp FROM users WHERE id = $1`,
      [user.id]
    );

    return NextResponse.json({ 
      visitorpfp: result.rows[0]?.visitorpfp || null 
    });

  } catch (error) {
    console.error('Error fetching profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile photo' },
      { status: 500 }
    );
  }
}