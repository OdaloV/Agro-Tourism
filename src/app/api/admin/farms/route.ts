// src/app/api/admin/farms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    
    let query = `
      SELECT 
        fp.id as profile_id,
        fp.farm_name,
        fp.farm_location,
        fp.farm_size,
        fp.farm_type,
        fp.verification_status,
        fp.is_verified,
        fp.submitted_at,
        fp.verified_at,
        fp.rejection_reason,
        fp.accommodation,
        fp.max_guests,
        fp.video_link,
        fp.year_established,
        fp.farm_description,
        fp.profile_photo_url,
        u.id as user_id,
        u.name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
    `;
    
    if (!all) {
      query += ` WHERE fp.verification_status = 'pending'`;
    }
    
    query += ` ORDER BY fp.submitted_at DESC`;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} farms`);
    
    // Get documents for each farm
    const farms = await Promise.all(result.rows.map(async (farm) => {
      const docsResult = await pool.query(
        `SELECT document_type as type, document_url as url
         FROM farmer_documents 
         WHERE farmer_id = $1`,
        [farm.profile_id]
      );
      
      // Get photos count (without loading binary data for performance)
      const photosResult = await pool.query(
        `SELECT COUNT(*) as photo_count FROM farmer_photos WHERE farmer_id = $1`,
        [farm.profile_id]
      );
      
      return {
        ...farm,
        documents: docsResult.rows,
        photo_count: parseInt(photosResult.rows[0].photo_count),
        photos: [] // Don't send binary data in list view for performance
      };
    }));
    
    return NextResponse.json(farms);
    
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
}