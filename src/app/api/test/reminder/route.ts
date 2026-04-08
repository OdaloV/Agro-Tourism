// src/app/api/test/reminder/route.ts
import { NextResponse } from 'next/server';
import { sendReminderNotification } from '@/lib/services/notificationService';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  const result = await sendReminderNotification(
    1, // user ID
    'odalojanetvicky@gmail.com', // your email
    {
      visitorName: 'Test Visitor',
      farmName: 'Sunrise Dairy',
      date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      activityName: 'Milking Experience',
      participants: 4,
    }
  );
  
  return NextResponse.json({ success: true, result });
}