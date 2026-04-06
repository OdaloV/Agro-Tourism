// src/app/api/messages/unread-count/route.ts
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.receiver_id = $1 
        AND m.is_read = false
        AND (c.visitor_id = $1 OR c.farmer_id = $1)
    `, [user.id]);
    
    return NextResponse.json({ count: parseInt(result.rows[0].count) });
    
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ count: 0 });
  }
}