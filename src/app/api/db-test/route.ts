import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  console.log('🔵 DB Test API called');
  
  try {
    // Test 1: Simple query
    console.log('Testing simple query...');
    const result1 = await pool.query('SELECT 1 as test');
    console.log('Simple query result:', result1.rows[0]);
    
    // Test 2: Query settings table
    console.log('Testing settings query...');
    const result2 = await pool.query('SELECT COUNT(*) FROM platform_settings');
    console.log('Settings count:', result2.rows[0].count);
    
    // Test 3: Get first setting
    const result3 = await pool.query('SELECT key, value FROM platform_settings LIMIT 1');
    console.log('First setting:', result3.rows[0]);
    
    return NextResponse.json({
      success: true,
      simpleQuery: result1.rows[0],
      settingsCount: result2.rows[0].count,
      firstSetting: result3.rows[0]
    });
    
  } catch (error: any) {
    console.error('DB Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}