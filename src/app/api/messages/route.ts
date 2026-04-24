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

    if (conversationId) {
      let messages: any[] = [];

      if (isRedisAvailable() && redis) {
        try {
          const messageKey = `conversation:${conversationId}:messages`;
          const cachedMessages = await redis.lrange(messageKey, 0, 49);
          if (cachedMessages && cachedMessages.length > 0) {
            messages = cachedMessages
              .filter(m => m && typeof m === 'string' && m.startsWith('{'))
              .map(m => { try { return JSON.parse(m); } catch { return null; } })
              .filter(Boolean)
              .reverse();
          }
        } catch (redisError) {
          console.error('Redis error:', redisError);
        }
      }

      if (messages.length === 0) {
        // ─── FIX: also select product fields from messages ───
        const dbMessages = await pool.query(`
          SELECT 
            m.id,
            m.sender_id,
            m.receiver_id,
            m.message,
            m.is_read,
            m.created_at,
            m.product_id,
            u_sender.name as sender_name,
            u_receiver.name as receiver_name,
            mp.product_name,
            mp.price as product_price,
            mp.photos as product_photos
          FROM messages m
          JOIN users u_sender ON m.sender_id = u_sender.id
          JOIN users u_receiver ON m.receiver_id = u_receiver.id
          LEFT JOIN marketplace_products mp ON m.product_id = mp.id
          WHERE m.conversation_id = $1
          ORDER BY m.created_at ASC
        `, [conversationId]);

        // Extract first photo from photos array if present
        messages = dbMessages.rows.map(row => ({
          ...row,
          product_photo: Array.isArray(row.product_photos) ? row.product_photos[0] : row.product_photos ?? null,
          product_photos: undefined, // don't send the full array
        }));
      }

      await pool.query(`
        UPDATE messages SET is_read = true 
        WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = false
      `, [conversationId, user.id]);

      return NextResponse.json({ messages });
    }

    // Get all conversations — also pull product info from the first message
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
          WHEN c.visitor_id = $1 THEN (SELECT name FROM users WHERE id = c.farmer_id)
          ELSE (SELECT name FROM users WHERE id = c.visitor_id)
        END as other_party_name,
        CASE 
          WHEN c.visitor_id = $1 THEN 'farmer' ELSE 'visitor'
        END as other_party_role,
        CASE 
          WHEN c.visitor_id = $1 THEN c.farmer_id ELSE c.visitor_id
        END as other_party_id,
        (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = $1 AND is_read = false) as unread_count,
        -- ─── FIX: pull product info from the opening message ───
        (SELECT mp.id FROM messages m JOIN marketplace_products mp ON m.product_id = mp.id WHERE m.conversation_id = c.id ORDER BY m.created_at ASC LIMIT 1) as product_id,
        (SELECT mp.product_name FROM messages m JOIN marketplace_products mp ON m.product_id = mp.id WHERE m.conversation_id = c.id ORDER BY m.created_at ASC LIMIT 1) as product_name,
        (SELECT mp.price FROM messages m JOIN marketplace_products mp ON m.product_id = mp.id WHERE m.conversation_id = c.id ORDER BY m.created_at ASC LIMIT 1) as product_price,
        (SELECT mp.photos[1] FROM messages m JOIN marketplace_products mp ON m.product_id = mp.id WHERE m.conversation_id = c.id ORDER BY m.created_at ASC LIMIT 1) as product_photo
      FROM conversations c
      JOIN farmer_profiles fp ON c.farm_id = fp.id
      WHERE c.visitor_id = $1 OR c.farmer_id = $2
      ORDER BY last_message_time DESC NULLS LAST
    `, [user.id, user.id]);

    return NextResponse.json({ conversations: result.rows });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Send a new message or create conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── FIX: destructure product_id from body ───
    const { farmId, message, subject, conversationId, product_id } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let convId = conversationId;
    let receiverId: number;

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

      // ─── FIX: if product_id given, scope conversation per product
      //         so each product gets its own thread ───
      const existingConvQuery = product_id
        ? `SELECT id FROM conversations WHERE farm_id = $1 AND visitor_id = $2 AND product_id = $3`
        : `SELECT id FROM conversations WHERE farm_id = $1 AND visitor_id = $2 AND product_id IS NULL`;

      const existingConvParams = product_id
        ? [farmId, user.id, product_id]
        : [farmId, user.id];

      const existingConv = await pool.query(existingConvQuery, existingConvParams);

      if (existingConv.rows.length > 0) {
        convId = existingConv.rows[0].id;
      } else {
        // ─── FIX: store product_id on the conversation row ───
        const convResult = await pool.query(`
          INSERT INTO conversations (farm_id, visitor_id, farmer_id, subject, product_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id
        `, [farmId, user.id, farmerId, subject || `Inquiry about ${farmName}`, product_id ?? null]);
        convId = convResult.rows[0].id;
      }
    }

    if (!convId) {
      return NextResponse.json({ error: 'Conversation ID or farm ID required' }, { status: 400 });
    }

    if (!receiverId!) {
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

    // ─── FIX: save product_id in the message row ───
    const messageResult = await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, message, product_id, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, false, NOW())
      RETURNING id, created_at
    `, [convId, user.id, receiverId, message, product_id ?? null]);

    await pool.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [convId]);

    if (isRedisAvailable() && redis) {
      try {
        const redisMessage = JSON.stringify({
          id: messageResult.rows[0].id,
          message,
          sender_id: user.id,
          receiver_id: receiverId,
          sender_name: user.name,
          product_id: product_id ?? null,
          created_at: messageResult.rows[0].created_at,
          is_read: false,
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
      message: 'Message sent successfully',
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}