import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() as time, current_database() as db');
    return NextResponse.json({
      success: true,
      connected: true,
      database: result.rows[0].db,
      time: result.rows[0].time
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
