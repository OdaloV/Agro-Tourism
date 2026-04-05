// src/app/api/favorites/route.ts
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

// POST - Add to favorites
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
      `INSERT INTO favorites (visitor_id, farm_id) VALUES ($1, $2)
       ON CONFLICT (visitor_id, farm_id) DO NOTHING`,
      [user.id, farmId]
    );
    
    return NextResponse.json({ success: true, message: 'Added to favorites' });
    
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');
    
    if (!farmId) {
      return NextResponse.json({ error: 'Farm ID required' }, { status: 400 });
    }
    
    await pool.query(
      `DELETE FROM favorites WHERE visitor_id = $1 AND farm_id = $2`,
      [user.id, farmId]
    );
    
    return NextResponse.json({ success: true, message: 'Removed from favorites' });
    
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}