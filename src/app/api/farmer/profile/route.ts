import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkMaintenanceMode } from '@/lib/utils/checkMaintenance'; 

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
         u.id,
         u.name,
         u.email,
         u.phone,
         fp.farm_name as "farmName",
         fp.farm_location as "farmLocation",
         fp.farm_size as "farmSize",
         fp.year_established as "yearEstablished",
         fp.farm_description as "farmDescription",
         fp.farm_type as "farmType",
         fp.accommodation,
         fp.max_guests as "maxGuests",
         fp.verification_status as "verificationStatus",
         fp.submitted_at as "submittedAt",
         COALESCE(array_agg(DISTINCT a.activity_name) FILTER (WHERE a.activity_name IS NOT NULL), '{}') as activities,
         COALESCE(array_agg(DISTINCT f.facility_name) FILTER (WHERE f.facility_name IS NOT NULL), '{}') as facilities,
         COUNT(DISTINCT m.id) as "farmPhotos",
         fp.video_link as "videoLink",
         json_build_object(
           'businessLicense', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'businessLicense'),
           'nationalId', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'nationalId'),
           'insurance', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'insurance'),
           'certifications', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'certifications')
         ) as documents,
         json_build_object(
           'profileViews', 0,
           'bookings', 0,
           'rating', 0
         ) as stats
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN farmer_activities a ON fp.id = a.farmer_id
       LEFT JOIN farmer_facilities f ON fp.id = f.farmer_id
       LEFT JOIN farmer_media m ON fp.id = m.farmer_id AND m.media_type = 'photo'
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

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings: Record<string, string> = {
      farmName: 'farm_name',
      farmLocation: 'farm_location',
      farmSize: 'farm_size',
      yearEstablished: 'year_established',
      farmDescription: 'farm_description',
      farmType: 'farm_type',
      accommodation: 'accommodation',
      maxGuests: 'max_guests',
      videoLink: 'video_link',
    };

    for (const [key, value] of Object.entries(updateData)) {
      const dbField = fieldMappings[key];
      if (dbField && value !== undefined) {
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
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
