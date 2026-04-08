// src/app/api/test/cron-simple/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test - no database calls
    return NextResponse.json({ 
      success: true, 
      message: 'Cron test endpoint is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}