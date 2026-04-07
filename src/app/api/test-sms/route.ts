// src/app/api/test-sms/route.ts
import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  // ✅ Correct format: +254 followed by the number without the leading 0
  // 0708172017 becomes +254708172017
  const result = await sendSMS('+254708172017', 'Test message from HarvestHost!');
  
  return NextResponse.json(result);
}