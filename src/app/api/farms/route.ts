import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const activity = searchParams.get('activity');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        fp.id,
        fp.farm_name,
        fp.farm_location,
        fp.farm_description,
        fp.accommodation,
        fp.max_guests,
        u.name as farmer_name,
        u.phone,
        u.email,
        COALESCE(array_agg(DISTINCT a.activity_name) FILTER (WHERE a.activity_name IS NOT NULL), '{}') as activities,
        COALESCE(array_agg(DISTINCT f.facility_name) FILTER (WHERE f.facility_name IS NOT NULL), '{}') as facilities,
        COALESCE(array_agg(DISTINCT m.media_url) FILTER (WHERE m.media_url IS NOT NULL), '{}') as photos
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN farmer_activities a ON fp.id = a.farmer_id
      LEFT JOIN farmer_facilities f ON fp.id = f.farmer_id
      LEFT JOIN farmer_media m ON fp.id = m.farmer_id AND m.media_type = 'photo'
      WHERE fp.verification_status = 'approved'
    `;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (location) {
      conditions.push(`fp.farm_location ILIKE $${paramIndex}`);
      values.push(`%${location}%`);
      paramIndex++;
    }

    if (activity) {
      conditions.push(`EXISTS (
        SELECT 1 FROM farmer_activities a2 
        WHERE a2.farmer_id = fp.id AND a2.activity_name ILIKE $${paramIndex}
      )`);
      values.push(`%${activity}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY fp.id, u.id LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM farmer_profiles WHERE verification_status = 'approved'`
    );

    return NextResponse.json({
      farms: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });

  } catch (error: any) {
    console.error('Error fetching farms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
}