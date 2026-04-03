// src/app/api/admin/verifications/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { notifyFarmerApproved, notifyFarmerRejected } from '@/lib/services/notificationService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const result = await pool.query(
      `SELECT 
         fp.id as profile_id,
         fp.farm_name,
         fp.farm_location,
         fp.farm_size,
         fp.farm_type,
         fp.verification_status,
         fp.submitted_at,
         fp.verified_at,
         fp.rejection_reason,
         fp.rejection_notes,
         fp.profile_photo_url,
         u.id as user_id,
         u.name as farmer_name,
         u.email,
         u.phone,
         COALESCE(
           (SELECT json_agg(
              json_build_object(
                'type', d.document_type, 
                'url', d.document_url
              )
            )
            FROM farmer_documents d 
            WHERE d.farmer_id = fp.id),
           '[]'::json
         ) as documents,
         COALESCE(
           (SELECT json_agg(
              json_build_object(
                'id', p.id,
                'photo_type', p.photo_type,
                'sort_order', p.sort_order
              )
            )
            FROM farmer_photos p 
            WHERE p.farmer_id = fp.id
            ORDER BY p.sort_order ASC),
           '[]'::json
         ) as photos
       FROM farmer_profiles fp
       JOIN users u ON fp.user_id = u.id
       WHERE fp.verification_status = $1
       ORDER BY fp.submitted_at ASC`,
      [status]
    );

    // Convert binary photos to base64 for response
    const cleanedRows = await Promise.all(result.rows.map(async (row) => {
      let photoBase64 = [];
      
      // Get actual photo data for each photo
      if (row.photos && row.photos.length > 0) {
        for (const photo of row.photos) {
          const photoData = await pool.query(
            `SELECT encode(photo_data, 'base64') as base64_data 
             FROM farmer_photos 
             WHERE id = $1`,
            [photo.id]
          );
          
          if (photoData.rows[0]?.base64_data) {
            photoBase64.push({
              data: `data:${photo.photo_type};base64,${photoData.rows[0].base64_data}`,
              sort_order: photo.sort_order
            });
          }
        }
      }
      
      return {
        ...row,
        photos: photoBase64,
        documents: Array.isArray(row.documents) ? row.documents : []
      };
    }));

    return NextResponse.json(cleanedRows);

  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { profileId, status, notes, adminId } = body;

    if (!profileId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      let updateQuery;
      let queryParams;

      if (status === 'rejected') {
        updateQuery = `
          UPDATE farmer_profiles 
          SET verification_status = $1, 
              is_verified = false,
              rejection_reason = $2,
              rejection_notes = $3,
              reviewed_by = $4,
              reviewed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING user_id, farm_name
        `;
        queryParams = [status, notes, notes, adminId, profileId];
      } else if (status === 'approved') {
        updateQuery = `
          UPDATE farmer_profiles 
          SET verification_status = $1, 
              is_verified = true,
              rejection_reason = NULL,
              rejection_notes = NULL,
              verified_by = $2,
              verified_at = CURRENT_TIMESTAMP,
              reviewed_by = $2,
              reviewed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING user_id, farm_name
        `;
        queryParams = [status, adminId, profileId];
      } else {
        updateQuery = `
          UPDATE farmer_profiles 
          SET verification_status = $1,
              is_verified = false,
              reviewed_by = $2,
              reviewed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING user_id, farm_name
        `;
        queryParams = [status, adminId, profileId];
      }
      
      const profileResult = await client.query(updateQuery, queryParams);
      
      if (profileResult.rows.length === 0) {
        throw new Error('Farmer profile not found');
      }
      
      const userId = profileResult.rows[0].user_id;
      const farmName = profileResult.rows[0].farm_name;

      if (status === 'approved') {
        await client.query(
          `UPDATE users 
           SET is_verified = true, 
               verified_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [userId]
        );
      } else if (status === 'rejected') {
        await client.query(
          `UPDATE users 
           SET is_verified = false
           WHERE id = $1`,
          [userId]
        );
      }
      
      const farmerDetails = await client.query(
        'SELECT name, email FROM users WHERE id = $1',
        [userId]
      );
      
      if (status === 'approved') {
        await notifyFarmerApproved(
          farmerDetails.rows[0].email,
          farmerDetails.rows[0].name,
          farmName
        );
      } else if (status === 'rejected') {
        await notifyFarmerRejected(
          farmerDetails.rows[0].email,
          farmerDetails.rows[0].name,
          farmName,
          notes
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Farm ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { error: 'Failed to update verification: ' + error.message },
      { status: 500 }
    );
  }
}