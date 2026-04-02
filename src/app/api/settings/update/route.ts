// src/app/api/settings/update/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update each setting
      for (const [key, value] of Object.entries(body)) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) 
           DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, String(value)]
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}