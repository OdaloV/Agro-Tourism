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

// GET - Get user's reviews AND reviewable bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get existing reviews
    const reviewsResult = await pool.query(`
      SELECT 
        r.id,
        r.farm_id,
        r.rating,
        r.comment,
        r.created_at,
        fp.farm_name,
        b.booking_date,
        b.id as booking_id
      FROM reviews r
      JOIN farmer_profiles fp ON r.farm_id = fp.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.visitor_id = $1
      ORDER BY r.created_at DESC
    `, [user.id]);
    
    const reviews = reviewsResult.rows.map(row => ({
      id: row.id,
      farm_id: row.farm_id,
      farm_name: row.farm_name,
      booking_date: row.booking_date,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      status: 'submitted'
    }));
    
    // Get completed bookings that haven't been reviewed yet
    const reviewableResult = await pool.query(`
      SELECT 
        b.id as booking_id,
        b.booking_date,
        b.participants,
        b.total_amount,
        a.activity_name,
        fp.id as farm_id,
        fp.farm_name,
        b.status as booking_status
      FROM bookings b
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.visitor_id = $1 
        AND b.status IN ('confirmed', 'completed', 'paid')
        AND NOT EXISTS (
          SELECT 1 FROM reviews r 
          WHERE r.booking_id = b.id AND r.visitor_id = $1
        )
      ORDER BY b.booking_date DESC
    `, [user.id]);
    
    const reviewableBookings = reviewableResult.rows.map(row => ({
      booking_id: row.booking_id,
      farm_id: row.farm_id,
      farm_name: row.farm_name,
      activity_name: row.activity_name,
      booking_date: row.booking_date,
      participants: row.participants,
      total_amount: parseFloat(row.total_amount),
      status: row.booking_status
    }));
    
    return NextResponse.json({ 
      reviews,
      reviewableBookings 
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ 
      reviews: [],
      reviewableBookings: [] 
    });
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { farmId, bookingId, rating, comment } = await request.json();
    
    if (!farmId || !bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }
    
    // Verify booking belongs to user and is completed
    const bookingCheck = await pool.query(`
      SELECT id FROM bookings 
      WHERE id = $1 AND visitor_id = $2 
        AND status IN ('confirmed', 'completed', 'paid')
    `, [bookingId, user.id]);
    
    if (bookingCheck.rows.length === 0) {
      return NextResponse.json({ error: 'You can only review completed bookings' }, { status: 403 });
    }
    
    // Check if user has already reviewed this booking
    const existingReview = await pool.query(
      `SELECT id FROM reviews WHERE booking_id = $1 AND visitor_id = $2`,
      [bookingId, user.id]
    );
    
    if (existingReview.rows.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 400 });
    }
    
    // Create review
    const result = await pool.query(
      `INSERT INTO reviews (visitor_id, farm_id, booking_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [user.id, farmId, bookingId, rating, comment]
    );
    
    // Try to update farm's average rating - but handle if columns don't exist
    try {
      // First check if the columns exist
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'farmer_profiles' 
        AND column_name IN ('average_rating', 'total_reviews')
      `);
      
      const existingColumns = columnCheck.rows.map(r => r.column_name);
      
      if (existingColumns.includes('average_rating') && existingColumns.includes('total_reviews')) {
        // Update both columns if they exist
        await pool.query(`
          UPDATE farmer_profiles 
          SET average_rating = (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
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
      } else if (existingColumns.includes('average_rating')) {
        // Update only average_rating
        await pool.query(`
          UPDATE farmer_profiles 
          SET average_rating = (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
            FROM reviews 
            WHERE farm_id = $1
          )
          WHERE id = $1
        `, [farmId]);
      }
      // If neither column exists, skip the update
    } catch (updateError) {
      console.log('Could not update farm rating (columns may not exist):', updateError);
      // Don't fail the review creation if rating update fails
    }
    
    return NextResponse.json({
      success: true,
      reviewId: result.rows[0].id,
      message: 'Review submitted successfully! Thank you for your feedback.'
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
    
    const { reviewId, rating, comment } = await request.json();
    
    if (!reviewId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }
    
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }
    
    // Verify ownership
    const reviewCheck = await pool.query(
      `SELECT id, farm_id FROM reviews WHERE id = $1 AND visitor_id = $2`,
      [reviewId, user.id]
    );
    
    if (reviewCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }
    
    const farmId = reviewCheck.rows[0].farm_id;
    
    // Update review
    await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, updated_at = NOW()
       WHERE id = $3`,
      [rating, comment, reviewId]
    );
    
    // Try to update farm's average rating - handle if columns don't exist
    try {
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'farmer_profiles' 
        AND column_name = 'average_rating'
      `);
      
      if (columnCheck.rows.length > 0) {
        await pool.query(`
          UPDATE farmer_profiles 
          SET average_rating = (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
            FROM reviews 
            WHERE farm_id = $1
          )
          WHERE id = $1
        `, [farmId]);
      }
    } catch (updateError) {
      console.log('Could not update farm rating:', updateError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Review updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    
    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }
    
    // Verify ownership
    const reviewCheck = await pool.query(
      `SELECT id, farm_id FROM reviews WHERE id = $1 AND visitor_id = $2`,
      [reviewId, user.id]
    );
    
    if (reviewCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }
    
    const farmId = reviewCheck.rows[0].farm_id;
    
    // Delete review
    await pool.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);
    
    // Try to update farm's average rating - handle if columns don't exist
    try {
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'farmer_profiles' 
        AND column_name IN ('average_rating', 'total_reviews')
      `);
      
      const existingColumns = columnCheck.rows.map(r => r.column_name);
      
      if (existingColumns.includes('average_rating') && existingColumns.includes('total_reviews')) {
        await pool.query(`
          UPDATE farmer_profiles 
          SET average_rating = (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
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
      } else if (existingColumns.includes('average_rating')) {
        await pool.query(`
          UPDATE farmer_profiles 
          SET average_rating = (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
            FROM reviews 
            WHERE farm_id = $1
          )
          WHERE id = $1
        `, [farmId]);
      }
    } catch (updateError) {
      console.log('Could not update farm rating after delete:', updateError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}