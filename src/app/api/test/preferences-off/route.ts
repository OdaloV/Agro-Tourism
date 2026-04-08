// src/app/api/test/preferences-off/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  // Disable all notifications for user 1
  await pool.query(`
    INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications, booking_updates, reminders, marketing_emails)
    VALUES (1, false, false, false, false, false, false)
    ON CONFLICT (user_id) DO UPDATE SET
      email_notifications = false,
      sms_notifications = false,
      push_notifications = false,
      booking_updates = false,
      reminders = false,
      marketing_emails = false
  `);
  
  return NextResponse.json({ success: true, message: 'All notifications disabled for user 1' });
}