// src/app/api/test/preferences-on/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  // Enable all notifications for user 1
  await pool.query(`
    INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications, booking_updates, reminders, marketing_emails)
    VALUES (1, true, true, true, true, true, true)
    ON CONFLICT (user_id) DO UPDATE SET
      email_notifications = true,
      sms_notifications = true,
      push_notifications = true,
      booking_updates = true,
      reminders = true,
      marketing_emails = true
  `);
  
  return NextResponse.json({ success: true, message: 'All notifications enabled for user 1' });
}