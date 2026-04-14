import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: Request) {
  const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, response } = await request.json();
    
    if (!reviewId || !response || response.trim().length < 5) {
      return NextResponse.json(
        { error: 'Response must be at least 5 characters' },
        { status: 400 }
      );
    }
    
    // Verify this review belongs to the farmer's farm
    const verifyResult = await pool.query(`
      SELECT r.id 
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      WHERE r.id = $1 AND fp.user_id = $2
    `, [reviewId, user.id]);
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Update the review with farmer's response
    await pool.query(
      `UPDATE reviews 
       SET farm_response = $1, 
           responded_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [response.trim(), reviewId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Response posted successfully'
    });
    
  } catch (error) {
    console.error('Error posting response:', error);
    return NextResponse.json(
      { error: 'Failed to post response' },
      { status: 500 }
    );
  }
}