// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
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
    return { id: payload.id as number, role: payload.role as string, name: payload.name as string };
  } catch {
    return null;
  }
}

// GET - Fetch conversations or messages
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    // Get messages for a specific conversation
    if (conversationId) {
      let messages = [];
      
      // Try to get messages from Redis first
      if (isRedisAvailable() && redis) {
        try {
          const messageKey = `conversation:${conversationId}:messages`;
          const cachedMessages = await redis.lrange(messageKey, 0, 49);
          if (cachedMessages && cachedMessages.length > 0) {
            // Filter out any non-JSON strings
            messages = cachedMessages
              .filter(m => m && typeof m === 'string' && m.startsWith('{'))
              .map(m => {
                try {
                  return JSON.parse(m);
                } catch (e) {
                  console.error('Failed to parse message:', m);
                  return null;
                }
              })
              .filter(m => m !== null)
              .reverse();
          }
        } catch (redisError) {
          console.error('Redis error:', redisError);
        }
      }
      
      // If no messages from Redis, get from PostgreSQL
      if (messages.length === 0) {
        const dbMessages = await pool.query(`
          SELECT 
            m.id,
            m.sender_id,
            m.receiver_id,
            m.message,
            m.is_read,
            m.created_at,
            u_sender.name as sender_name,
            u_receiver.name as receiver_name
          FROM messages m
          JOIN users u_sender ON m.sender_id = u_sender.id
          JOIN users u_receiver ON m.receiver_id = u_receiver.id
          WHERE m.conversation_id = $1
          ORDER BY m.created_at ASC
        `, [conversationId]);
        
        messages = dbMessages.rows;
      }
      
      // Mark messages as read
      await pool.query(`
        UPDATE messages 
        SET is_read = true 
        WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = false
      `, [conversationId, user.id]);
      
      return NextResponse.json({ messages });
    }
    
    // Get all conversations for user
    const result = await pool.query(`
      SELECT 
        c.id as conversation_id,
        c.farm_id,
        c.subject,
        c.created_at,
        c.updated_at,
        fp.farm_name,
        fp.profile_photo_url,
        CASE 
          WHEN c.visitor_id = $1 THEN 
            (SELECT name FROM users WHERE id = c.farmer_id)
          ELSE 
            (SELECT name FROM users WHERE id = c.visitor_id)
        END as other_party_name,
        CASE 
          WHEN c.visitor_id = $1 THEN 'farmer'
          ELSE 'visitor'
        END as other_party_role,
        CASE 
          WHEN c.visitor_id = $1 THEN c.farmer_id
          ELSE c.visitor_id
        END as other_party_id,
        (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = $1 AND is_read = false) as unread_count
      FROM conversations c
      JOIN farmer_profiles fp ON c.farm_id = fp.id
      WHERE c.visitor_id = $1 OR c.farmer_id = $2
      ORDER BY last_message_time DESC NULLS LAST
    `, [user.id, user.id]);
    
    return NextResponse.json({ conversations: result.rows });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message or create conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { farmId, message, subject, conversationId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    let convId = conversationId;
    let receiverId;
    
    // If no conversation ID, create a new conversation
    if (!convId && farmId) {
      const farmResult = await pool.query(`
        SELECT fp.user_id as farmer_id, fp.farm_name
        FROM farmer_profiles fp
        WHERE fp.id = $1
      `, [farmId]);
      
      if (farmResult.rows.length === 0) {
        return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
      }
      
      const farmerId = farmResult.rows[0].farmer_id;
      const farmName = farmResult.rows[0].farm_name;
      receiverId = farmerId;
      
      const existingConv = await pool.query(`
        SELECT id FROM conversations 
        WHERE farm_id = $1 AND visitor_id = $2
      `, [farmId, user.id]);
      
      if (existingConv.rows.length > 0) {
        convId = existingConv.rows[0].id;
      } else {
        const convResult = await pool.query(`
          INSERT INTO conversations (farm_id, visitor_id, farmer_id, subject, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id
        `, [farmId, user.id, farmerId, subject || `Inquiry about ${farmName}`]);
        convId = convResult.rows[0].id;
      }
    }
    
    if (!convId) {
      return NextResponse.json({ error: 'Conversation ID or farm ID required' }, { status: 400 });
    }
    
    if (!receiverId) {
      const convResult = await pool.query(`
        SELECT visitor_id, farmer_id FROM conversations WHERE id = $1
      `, [convId]);
      
      if (convResult.rows.length === 0) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      receiverId = convResult.rows[0].visitor_id === user.id 
        ? convResult.rows[0].farmer_id 
        : convResult.rows[0].visitor_id;
    }
    
    // Insert message into PostgreSQL
    const messageResult = await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, message, is_read, created_at)
      VALUES ($1, $2, $3, $4, false, NOW())
      RETURNING id, created_at
    `, [convId, user.id, receiverId, message]);
    
    // Update conversation updated_at
    await pool.query(`
      UPDATE conversations SET updated_at = NOW() WHERE id = $1
    `, [convId]);
    
    // Cache in Redis if available
    if (isRedisAvailable() && redis) {
      try {
        const redisMessage = JSON.stringify({
          id: messageResult.rows[0].id,
          message,
          sender_id: user.id,
          receiver_id: receiverId,
          sender_name: user.name,
          created_at: messageResult.rows[0].created_at,
          is_read: false
        });
        
        const messageKey = `conversation:${convId}:messages`;
        await redis.lpush(messageKey, redisMessage);
        await redis.ltrim(messageKey, 0, 49);
      } catch (redisError) {
        console.error('Redis caching error:', redisError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      conversationId: convId,
      message: 'Message sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}