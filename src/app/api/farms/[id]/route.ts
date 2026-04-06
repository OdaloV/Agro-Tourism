// src/app/api/farms/[id]/route.ts
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // ✅ FIX: Await params to get the id (Next.js 15 requirement)
    const resolvedParams = await params;
    const farmId = parseInt(resolvedParams.id);
    
    console.log("=== FARM DETAILS API CALLED ===");
    console.log("Fetching farm details for ID:", farmId);
    
    if (isNaN(farmId)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }
    
    const user = await getUserFromToken(request);
    const userId = user?.id || null;
    console.log("User ID from token:", userId);
    console.log("User role:", user?.role);
    
    // Get farm details
    const farmResult = await pool.query(`
      SELECT 
        fp.id,
        fp.user_id,
        fp.farm_name,
        fp.farm_location,
        fp.farm_description,
        fp.farm_size,
        fp.year_established,
        fp.farm_type,
        fp.accommodation,
        fp.max_guests,
        fp.video_link,
        fp.average_rating,
        fp.profile_photo_url,
        fp.city,
        fp.county,
        fp.latitude,
        fp.longitude,
        fp.location_address,
        fp.profile_views,
        u.name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone,
        (SELECT COUNT(*) FROM reviews WHERE farm_id = fp.id) as review_count
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.id = $1 AND fp.verification_status = 'approved'
    `, [farmId]);
    
    if (farmResult.rows.length === 0) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    const farm = farmResult.rows[0];
    
    // Get favorite status separately
    let isFavorite = false;
    if (userId) {
      const favResult = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM favorites WHERE visitor_id = $1 AND farm_id = $2) as is_fav`,
        [userId, farmId]
      );
      isFavorite = favResult.rows[0]?.is_fav || false;
    }
    
    // Get farm photos
    const photosResult = await pool.query(`
      SELECT id, photo_url, sort_order, created_at
      FROM farm_photos 
      WHERE farmer_id = $1 
      ORDER BY sort_order ASC NULLS LAST, created_at ASC
    `, [farmId]);
    
    // Get activities
    const activitiesResult = await pool.query(`
      SELECT 
        id, 
        activity_name as name, 
        category, 
        price, 
        is_free, 
        currency,
        description,
        duration_minutes,
        max_capacity
      FROM farmer_activities 
      WHERE farmer_id = $1 
      ORDER BY price ASC, id ASC
    `, [farmId]);
    
    // Get facilities
    const facilitiesResult = await pool.query(`
      SELECT facility_name FROM farmer_facilities WHERE farmer_id = $1
    `, [farmId]);
    
    // Get reviews with user info
    const reviewsResult = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.created_at,
        r.farm_response,
        r.responded_at,
        u.name as visitor_name,
        u.id as visitor_id
      FROM reviews r
      JOIN users u ON r.visitor_id = u.id
      WHERE r.farm_id = $1
      ORDER BY r.created_at DESC
    `, [farmId]);
    
    // Check if user has booked this farm (for review eligibility)
    let hasBooked = false;
    if (userId) {
      const bookingCheck = await pool.query(`
        SELECT EXISTS(
          SELECT 1 FROM bookings 
          WHERE visitor_id = $1 AND farm_id = $2 AND status IN ('completed', 'confirmed')
        ) as has_booked
      `, [userId, farmId]);
      hasBooked = bookingCheck.rows[0].has_booked;
    }
    
    // Get availability (blocked dates)
    const blockedDatesResult = await pool.query(`
      SELECT start_date, end_date, reason
      FROM farmer_availability
      WHERE farmer_id = $1 AND end_date >= CURRENT_DATE
      ORDER BY start_date ASC
    `, [farmId]);
    
    // ============================================
    // LOG RECENT VIEW - WITH FULL DEBUGGING
    // ============================================
    console.log("\n=== RECENT VIEW LOGGING ===");
    console.log("User ID:", userId);
    console.log("Farm ID:", farmId);
    
    if (userId) {
      try {
        // Check if user exists in database
        const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [userId]);
        console.log("User exists in DB:", userCheck.rows.length > 0);
        
        // Check if farm exists
        const farmCheck = await pool.query(`SELECT id FROM farmer_profiles WHERE id = $1`, [farmId]);
        console.log("Farm exists in DB:", farmCheck.rows.length > 0);
        
        // Attempt to insert/update recent view
        const recentViewResult = await pool.query(`
          INSERT INTO recent_views (visitor_id, farm_id, viewed_at) 
          VALUES ($1, $2, NOW())
          ON CONFLICT (visitor_id, farm_id) 
          DO UPDATE SET viewed_at = NOW()
          RETURNING *
        `, [userId, farmId]);
        
        console.log("✅ Recent view saved successfully!");
        console.log("Recent view record:", recentViewResult.rows[0]);
        
        // Increment profile views
        const updateResult = await pool.query(`
          UPDATE farmer_profiles 
          SET profile_views = COALESCE(profile_views, 0) + 1 
          WHERE id = $1
          RETURNING profile_views
        `, [farmId]);
        
        console.log("✅ Profile views incremented!");
        console.log("New profile view count:", updateResult.rows[0]?.profile_views);
        
      } catch (error: any) {
        console.error("❌ ERROR in recent view logging:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error detail:", error.detail);
        console.error("Full error:", error);
      }
    } else {
      console.log("⚠️ No user logged in - skipping recent view logging");
    }
    console.log("=== END RECENT VIEW LOGGING ===\n");
    
    // Calculate rating distribution
    const ratingDistResult = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE farm_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [farmId]);
    
    const ratingDistribution: { [key: number]: number } = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    ratingDistResult.rows.forEach(row => {
      const rating = row.rating;
      const count = parseInt(row.count);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating] = count;
      }
    });
    
    return NextResponse.json({
      farm,
      photos: photosResult.rows.map(p => ({ ...p, url: p.photo_url })),
      activities: activitiesResult.rows,
      facilities: facilitiesResult.rows.map((f: { facility_name: string }) => f.facility_name),
      reviews: reviewsResult.rows,
      reviewStats: {
        total: farm.review_count,
        average: parseFloat(farm.average_rating) || 0,
        distribution: ratingDistribution
      },
      blockedDates: blockedDatesResult.rows,
      hasBooked,
      isFavorite
    });
    
  } catch (error) {
    console.error('Error fetching farm details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm details' },
      { status: 500 }
    );
  }
}