// src/app/api/farms/route.ts
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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const farmType = searchParams.get('farmType') || '';
    const location = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get current user for favorite status
    const user = await getUserFromToken(request);
    const userId = user?.id || null;
    
    // Build query with proper parameter handling
    let query = `
      SELECT 
    fp.id,
    fp.farm_name,
    fp.farm_location,
    fp.farm_description,
    fp.farm_type,
    fp.accommodation,
    fp.average_rating,
    fp.profile_photo_url,
    fp.city,
    fp.county,
    fp.latitude,
    fp.longitude,
    fp.verification_status,
    fp.profile_views,
    COALESCE(
      (SELECT MIN(price) FROM farmer_activities WHERE farmer_id = fp.id AND (is_free = false OR price > 0)),
      0
    ) as min_price,
    COALESCE(
      (SELECT MAX(price) FROM farmer_activities WHERE farmer_id = fp.id AND (is_free = false OR price > 0)),
      0
    ) as max_price,
    (SELECT COUNT(*) FROM reviews WHERE farm_id = fp.id) as review_count,
    COALESCE(
  (
    SELECT 'data:' || photo_type || ';base64,' || encode(photo_data, 'base64')
    FROM farmer_photos 
    WHERE farmer_id = fp.id 
    ORDER BY sort_order ASC 
    LIMIT 1
  ),
  fp.profile_photo_url
) as cover_photo,
    false as is_favorite
  FROM farmer_profiles fp
  WHERE fp.verification_status = 'approved'
`;
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    // Search filter
    if (search) {
      query += ` AND (fp.farm_name ILIKE $${paramIndex} OR fp.farm_description ILIKE $${paramIndex} OR fp.farm_location ILIKE $${paramIndex} OR fp.city ILIKE $${paramIndex} OR fp.county ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Farm type filter
    if (farmType) {
      query += ` AND fp.farm_type = $${paramIndex}`;
      queryParams.push(farmType);
      paramIndex++;
    }
    
    // Location filter
    if (location) {
      query += ` AND (fp.city ILIKE $${paramIndex} OR fp.county ILIKE $${paramIndex} OR fp.farm_location ILIKE $${paramIndex})`;
      queryParams.push(`%${location}%`);
      paramIndex++;
    }
    
    // Price range filter
    if (minPrice) {
      query += ` AND EXISTS (SELECT 1 FROM farmer_activities WHERE farmer_id = fp.id AND price >= $${paramIndex})`;
      queryParams.push(parseInt(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      query += ` AND EXISTS (SELECT 1 FROM farmer_activities WHERE farmer_id = fp.id AND price <= $${paramIndex})`;
      queryParams.push(parseInt(maxPrice));
      paramIndex++;
    }
    
    // Rating filter
    if (minRating) {
      query += ` AND fp.average_rating >= $${paramIndex}`;
      queryParams.push(parseFloat(minRating));
      paramIndex++;
    }
    
    // Sorting
    switch (sortBy) {
      case 'rating':
        query += ` ORDER BY fp.average_rating DESC NULLS LAST`;
        break;
      case 'price_low':
        query += ` ORDER BY min_price ASC NULLS LAST`;
        break;
      case 'price_high':
        query += ` ORDER BY max_price DESC NULLS LAST`;
        break;
      case 'popular':
        query += ` ORDER BY review_count DESC`;
        break;
      case 'oldest':
        query += ` ORDER BY fp.id ASC`;
        break;
      default: // newest
        query += ` ORDER BY fp.id DESC`;
    }
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // If user is logged in, fetch favorite status separately
    let farmsWithFavorites = result.rows;
    if (userId) {
      const farmIds = result.rows.map((farm: any) => farm.id);
      if (farmIds.length > 0) {
        const favoritesResult = await pool.query(
          `SELECT farm_id FROM favorites WHERE visitor_id = $1 AND farm_id = ANY($2::int[])`,
          [userId, farmIds]
        );
        const favoriteIds = new Set(favoritesResult.rows.map((row: any) => row.farm_id));
        farmsWithFavorites = result.rows.map((farm: any) => ({
          ...farm,
          is_favorite: favoriteIds.has(farm.id)
        }));
      }
    }
    
    // Get total count for pagination (simplified count query)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM farmer_profiles fp
      WHERE fp.verification_status = 'approved'
    `;
    const countParams: any[] = [];
    let countIndex = 1;
    
    if (search) {
      countQuery += ` AND (fp.farm_name ILIKE $${countIndex} OR fp.farm_description ILIKE $${countIndex} OR fp.farm_location ILIKE $${countIndex} OR fp.city ILIKE $${countIndex} OR fp.county ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
      countIndex++;
    }
    if (farmType) {
      countQuery += ` AND fp.farm_type = $${countIndex}`;
      countParams.push(farmType);
      countIndex++;
    }
    if (location) {
      countQuery += ` AND (fp.city ILIKE $${countIndex} OR fp.county ILIKE $${countIndex} OR fp.farm_location ILIKE $${countIndex})`;
      countParams.push(`%${location}%`);
      countIndex++;
    }
    if (minRating) {
      countQuery += ` AND fp.average_rating >= $${countIndex}`;
      countParams.push(parseFloat(minRating));
      countIndex++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    return NextResponse.json({
      farms: farmsWithFavorites,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
}