// src/app/api/farmer/messages/route.ts
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

// GET - Fetch all conversations for farmer
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

    // Get all messages for this farmer's farm
    const result = await pool.query(
      `SELECT 
         m.*,
         u.name as visitor_name,
         u.email as visitor_email,
         u.phone as visitor_phone
       FROM messages m
       JOIN users u ON m.visitor_id = u.id
       WHERE m.farmer_id = $1
       ORDER BY m.created_at DESC`,
      [farmerId]
    );

    // Group messages by visitor
    const conversationsMap = new Map();
    
    for (const msg of result.rows) {
      if (!conversationsMap.has(msg.visitor_id)) {
        conversationsMap.set(msg.visitor_id, {
          visitor_id: msg.visitor_id,
          visitor_name: msg.visitor_name,
          visitor_email: msg.visitor_email,
          visitor_phone: msg.visitor_phone,
          messages: [],
          last_message: msg.message,
          last_message_date: msg.created_at,
          unread_count: msg.status === 'unread' ? 1 : 0
        });
      }
      
      const conv = conversationsMap.get(msg.visitor_id);
      conv.messages.push(msg);
      conv.unread_count += msg.status === 'unread' ? 1 : 0;
      
      // Update last message if newer
      if (new Date(msg.created_at) > new Date(conv.last_message_date)) {
        conv.last_message = msg.message;
        conv.last_message_date = msg.created_at;
      }
    }

    // Sort conversations by last_message_date desc
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());

    return NextResponse.json({ conversations });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a reply message
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
    const { visitor_id, message, subject } = body;

    if (!visitor_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert reply message
    await pool.query(
      `INSERT INTO messages (farmer_id, visitor_id, subject, message, status, direction)
       VALUES ($1, $2, $3, $4, 'read', 'outgoing')`,
      [farmerId, visitor_id, subject || 'Reply to your inquiry', message]
    );

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}