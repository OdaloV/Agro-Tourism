// src/app/api/test/visitor-verification/route.ts
import { NextResponse } from 'next/server';
import { sendVisitorVerificationEmail } from '@/lib/services/notificationService';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  const result = await sendVisitorVerificationEmail(
    'odalojanetvicky@gmail.com',
    'Test Visitor',
    '123456'
  );
  
  return NextResponse.json({ success: true, result });
}