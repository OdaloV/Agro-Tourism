import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`
    );
    const adminExists = parseInt(result.rows[0].count, 10) > 0;
    return NextResponse.json({ adminExists });
  } catch (error) {
    console.error('Setup status check failed:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
