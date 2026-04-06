// src/app/api/messages/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/redis';
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

// Set user online status
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { isOnline } = await request.json();
    
    if (isRedisAvailable() && redis) {
      const key = `online:${user.role}:${user.id}`;
      
      if (isOnline) {
        await redis.setex(key, 300, 'online'); // Online for 5 minutes
      } else {
        await redis.del(key);
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

// Check if user is online
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    let isOnline = false;
    
    if (isRedisAvailable() && redis) {
      const key = `online:${userRole}:${userId}`;
      const status = await redis.get(key);
      isOnline = status !== null;
    }
    
    return NextResponse.json({ isOnline });
    
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}