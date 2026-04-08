// src/app/api/test/booking-confirmation/route.ts
import { NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/services/notificationService';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  const result = await sendBookingConfirmation(
    1, // user ID
    'odalojanetvicky@gmail.com', // your email
    {
      visitorName: 'Test Visitor',
      farmName: 'Green Acres Farm',
      date: new Date().toISOString(),
      activityName: 'Farm Tour',
      participants: 2,
      amount: 3000
    }
  );
  
  return NextResponse.json({ success: true, result });
}