import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: Request) {
  const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT 
        notification_email_new_bookings,
        notification_email_new_messages,
        notification_email_new_reviews,
        notification_email_promotions,
        notification_sms_alerts,
        notification_reminder_upcoming_booking,
        notification_marketing_emails
       FROM farmer_profiles 
       WHERE user_id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        email_new_bookings: true,
        email_new_messages: true,
        email_new_reviews: true,
        email_promotions: false,
        sms_alerts: false,
        reminder_upcoming_booking: true,
        marketing_emails: false,
      });
    }

    const settings = result.rows[0];
    return NextResponse.json({
      email_new_bookings: settings.notification_email_new_bookings ?? true,
      email_new_messages: settings.notification_email_new_messages ?? true,
      email_new_reviews: settings.notification_email_new_reviews ?? true,
      email_promotions: settings.notification_email_promotions ?? false,
      sms_alerts: settings.notification_sms_alerts ?? false,
      reminder_upcoming_booking: settings.notification_reminder_upcoming_booking ?? true,
      marketing_emails: settings.notification_marketing_emails ?? false,
    });
    
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({
      email_new_bookings: true,
      email_new_messages: true,
      email_new_reviews: true,
      email_promotions: false,
      sms_alerts: false,
      reminder_upcoming_booking: true,
      marketing_emails: false,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    await pool.query(
      `UPDATE farmer_profiles 
       SET 
         notification_email_new_bookings = $1,
         notification_email_new_messages = $2,
         notification_email_new_reviews = $3,
         notification_email_promotions = $4,
         notification_sms_alerts = $5,
         notification_reminder_upcoming_booking = $6,
         notification_marketing_emails = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8`,
      [
        body.email_new_bookings,
        body.email_new_messages,
        body.email_new_reviews,
        body.email_promotions,
        body.sms_alerts,
        body.reminder_upcoming_booking,
        body.marketing_emails,
        user.id
      ]
    );

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}