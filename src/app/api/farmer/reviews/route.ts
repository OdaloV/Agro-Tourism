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

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get farmer profile ID
    const farmerResult = await pool.query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [user.id]
    );
    
    if (farmerResult.rows.length === 0) {
      return NextResponse.json({ reviews: [], stats: {} });
    }
    
    const farmerId = farmerResult.rows[0].id;
    
    // Get reviews for this farmer's farm
    const reviewsResult = await pool.query(`
      SELECT 
        r.id,
        r.farm_id,
        r.rating,
        r.comment,
        r.created_at,
        r.farm_response,
        r.responded_at,
        b.booking_date,
        b.participants,
        a.activity_name,
        u.name as visitor_name,
        u.id as visitor_id
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN farmer_activities a ON b.activity_id = a.id
      JOIN users u ON r.visitor_id = u.id
      WHERE b.farm_id = $1
      ORDER BY r.created_at DESC
    `, [farmerId]);
    
    const reviews = reviewsResult.rows.map(row => ({
      id: row.id,
      farm_id: row.farm_id,
      visitor_id: row.visitor_id,
      visitor_name: row.visitor_name,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      booking_date: row.booking_date,
      activity_name: row.activity_name,
      participants: row.participants,
      farm_response: row.farm_response,
      responded_at: row.responded_at
    }));
    
    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
      }
    });
    
    const recentReviews = reviews.filter(r => {
      const reviewDate = new Date(r.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return reviewDate >= thirtyDaysAgo;
    }).length;
    
    return NextResponse.json({
      reviews,
      stats: {
        average_rating: averageRating,
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
        recent_reviews: recentReviews
      }
    });
    
  } catch (error) {
    console.error('Error fetching farmer reviews:', error);
    return NextResponse.json({ reviews: [], stats: {} });
  }
}