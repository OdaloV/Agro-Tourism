import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    
    if (!farmerId) {
      return NextResponse.json({ count: 0 });
    }
    
    // Count unread messages for this farmer
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = $1 
         AND receiver_type = 'farmer'
         AND is_read = false`,
      [farmerId]
    );
    
    return NextResponse.json({ 
      count: parseInt(result.rows[0].count) || 0 
    });
    
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return NextResponse.json({ count: 0 });
  }
}