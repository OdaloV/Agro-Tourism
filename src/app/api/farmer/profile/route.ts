import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT 
         u.id, u.name, u.email, u.phone,
         fp.*,
         COALESCE(array_agg(DISTINCT a.activity_name) FILTER (WHERE a.activity_name IS NOT NULL), '{}') as activities,
         COALESCE(array_agg(DISTINCT f.facility_name) FILTER (WHERE f.facility_name IS NOT NULL), '{}') as facilities,
         COALESCE(array_agg(DISTINCT m.media_url) FILTER (WHERE m.media_url IS NOT NULL), '{}') as photos,
         COALESCE(array_agg(DISTINCT d.document_type) FILTER (WHERE d.document_type IS NOT NULL), '{}') as documents
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN farmer_activities a ON fp.id = a.farmer_id
       LEFT JOIN farmer_facilities f ON fp.id = f.farmer_id
       LEFT JOIN farmer_media m ON fp.id = m.farmer_id AND m.media_type = 'photo'
       LEFT JOIN farmer_documents d ON fp.id = d.farmer_id
       WHERE u.id = $1
       GROUP BY u.id, fp.id`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error('Error fetching farmer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(userId);
    const query = `
      UPDATE farmer_profiles 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      profile: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error updating farmer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}