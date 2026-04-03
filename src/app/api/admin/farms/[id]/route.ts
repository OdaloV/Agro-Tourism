// src/app/api/admin/farms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool  from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = parseInt(params.id);
    
    const farmResult = await pool.query(`
      SELECT 
        fp.*,
        u.name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.id = $1
    `, [profileId]);
    
    if (farmResult.rows.length === 0) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    const farm = farmResult.rows[0];
    
    // Get documents
    const docsResult = await pool.query(
      `SELECT document_type as type, document_url as url, file_name as filename 
       FROM farmer_documents 
       WHERE profile_id = $1`,
      [profileId]
    );
    
    // Get photos
    const photosResult = await pool.query(
      `SELECT photo_url FROM farm_photos WHERE profile_id = $1`,
      [profileId]
    );
    
    // Get activities
    const activitiesResult = await pool.query(
      `SELECT activity_name FROM farm_activities WHERE profile_id = $1`,
      [profileId]
    );
    
    return NextResponse.json({
      ...farm,
      documents: docsResult.rows,
      photos: photosResult.rows.map(p => p.photo_url),
      activities: activitiesResult.rows.map(a => a.activity_name)
    });
  } catch (error) {
    console.error('Error fetching farm details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm details' },
      { status: 500 }
    );
  }
}