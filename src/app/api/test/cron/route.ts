// src/app/api/test/cron/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  try {
    console.log('=== CRON TEST STARTED ===');
    
    // Test database connection first
    const dbTest = await pool.query('SELECT NOW() as now');
    console.log('Database connected:', dbTest.rows[0].now);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log('Looking for bookings on:', tomorrowStr);
    
    // Simple query without complex joins
    const bookings = await pool.query(`
      SELECT id, booking_date, visitor_id, status
      FROM bookings 
      WHERE booking_date = $1 
      LIMIT 5
    `, [tomorrowStr]);
    
    console.log(`Found ${bookings.rows.length} bookings`);
    
    return NextResponse.json({ 
      success: true, 
      bookingsFound: bookings.rows.length,
      tomorrowDate: tomorrowStr,
      bookings: bookings.rows
    });
    
  } catch (error: any) {
    console.error('Cron test error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}