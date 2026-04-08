// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await pool.query(`
      SELECT 
        r.id,
        r.farm_id,
        r.rating,
        r.title,
        r.comment,
        r.created_at,
        r.farm_response,
        fp.farm_name,
        b.booking_date
      FROM reviews r
      JOIN farmer_profiles fp ON r.farm_id = fp.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.visitor_id = $1
      ORDER BY r.created_at DESC
    `, [user.id]);
    
    // Transform to match frontend expectations
    const reviews = result.rows.map(row => ({
      id: row.id,
      farm_id: row.farm_id,
      farm_name: row.farm_name,
      booking_date: row.booking_date,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      created_at: row.created_at,
      farm_response: row.farm_response,
      status: 'submitted'
    }));
    
    return NextResponse.json({ reviews });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ reviews: [] });
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { farmId, rating, title, comment } = await request.json();
    
    if (!farmId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }
    
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }
    
    // Check if user has completed a booking at this farm
    const bookingCheck = await pool.query(`
      SELECT EXISTS(
        SELECT 1 FROM bookings 
        WHERE visitor_id = $1 AND farm_id = $2 
        AND status IN ('completed', 'confirmed')
      ) as has_booked
    `, [user.id, farmId]);
    
    if (!bookingCheck.rows[0].has_booked) {
      return NextResponse.json({ error: 'You can only review farms you have visited' }, { status: 403 });
    }
    
    // Check if user has already reviewed this farm
    const existingReview = await pool.query(
      `SELECT id FROM reviews WHERE visitor_id = $1 AND farm_id = $2`,
      [user.id, farmId]
    );
    
    if (existingReview.rows.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this farm' }, { status: 400 });
    }
    
    // Create review
    const result = await pool.query(
      `INSERT INTO reviews (visitor_id, farm_id, rating, title, comment, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id`,
      [user.id, farmId, rating, title || null, comment]
    );
    
    // Update farm's average rating
    await pool.query(`
      UPDATE farmer_profiles 
      SET average_rating = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM reviews 
        WHERE farm_id = $1
      ),
      total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE farm_id = $1
      )
      WHERE id = $1
    `, [farmId]);
    
    return NextResponse.json({
      success: true,
      reviewId: result.rows[0].id,
      message: 'Review submitted successfully'
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// PUT - Update review
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { reviewId, rating, title, comment } = await request.json();
    
    // Verify ownership
    const reviewCheck = await pool.query(
      `SELECT id FROM reviews WHERE id = $1 AND visitor_id = $2`,
      [reviewId, user.id]
    );
    
    if (reviewCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }
    
    await pool.query(
      `UPDATE reviews 
       SET rating = $1, title = $2, comment = $3, updated_at = NOW()
       WHERE id = $4`,
      [rating, title || null, comment, reviewId]
    );
    
    // Update farm's average rating
    const farmResult = await pool.query(
      `SELECT farm_id FROM reviews WHERE id = $1`,
      [reviewId]
    );
    
    if (farmResult.rows.length > 0) {
      await pool.query(`
        UPDATE farmer_profiles 
        SET average_rating = (
          SELECT AVG(rating)::DECIMAL(3,2) 
          FROM reviews 
          WHERE farm_id = $1
        )
        WHERE id = $1
      `, [farmResult.rows[0].farm_id]);
    }
    
    return NextResponse.json({ success: true, message: 'Review updated' });
    
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}