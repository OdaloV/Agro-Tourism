// src/app/api/messages/typing/route.ts
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
    return { id: payload.id as number };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { conversationId, isTyping } = await request.json();
    
    if (isRedisAvailable() && redis) {
      const key = `typing:${conversationId}`;
      
      if (isTyping) {
        await redis.setex(key, 3, user.id.toString());
      } else {
        await redis.del(key);
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating typing status:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    
    let isTyping = false;
    let typingUserId = null;
    
    if (isRedisAvailable() && redis) {
      const key = `typing:${conversationId}`;
      const userId = await redis.get(key);
      isTyping = userId !== null;
      typingUserId = userId;
    }
    
    return NextResponse.json({ 
      isTyping,
      userId: typingUserId 
    });
    
  } catch (error) {
    console.error('Error checking typing status:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}