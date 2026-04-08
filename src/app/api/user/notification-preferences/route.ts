// src/app/api/user/notification-preferences/route.ts
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

// GET - Fetch user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let result = await pool.query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [user.id]
    );
    
    if (result.rows.length === 0) {
      // Create default preferences
      result = await pool.query(
        `INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications, booking_updates, reminders, marketing_emails)
         VALUES ($1, true, false, true, true, true, false)
         RETURNING *`,
        [user.id]
      );
    }
    
    const prefs = result.rows[0];
    
    return NextResponse.json({
      email: prefs.email_notifications,
      sms: prefs.sms_notifications,
      push: prefs.push_notifications,
      bookingUpdates: prefs.booking_updates,
      reminders: prefs.reminders,
      marketing: prefs.marketing_emails,
    });
    
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { email, sms, push, bookingUpdates, reminders, marketing } = await request.json();
    
    await pool.query(
      `INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications, booking_updates, reminders, marketing_emails, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         email_notifications = $2,
         sms_notifications = $3,
         push_notifications = $4,
         booking_updates = $5,
         reminders = $6,
         marketing_emails = $7,
         updated_at = NOW()`,
      [user.id, email, sms, push, bookingUpdates, reminders, marketing]
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}