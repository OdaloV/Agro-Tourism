import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { notifyFarmerApproved } from '@/lib/services/notificationService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const result = await pool.query(
      `SELECT 
         fp.id as profile_id,
         fp.farm_name,
         fp.farm_location,
         fp.verification_status,
         fp.submitted_at,
         u.id as user_id,
         u.name as farmer_name,
         u.email,
         u.phone,
         array_agg(json_build_object('type', d.document_type, 'url', d.document_url)) as documents
       FROM farmer_profiles fp
       JOIN users u ON fp.user_id = u.id
       LEFT JOIN farmer_documents d ON fp.id = d.farmer_id
       WHERE fp.verification_status = $1
       GROUP BY fp.id, u.id
       ORDER BY fp.submitted_at ASC`,
      [status]
    );

    return NextResponse.json(result.rows);

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

      // Update farmer profile
      const updateQuery = `
        UPDATE farmer_profiles 
        SET verification_status = $1, 
            verification_notes = $2,
            verified_by = $3,
            verified_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING user_id
      `;
      
      const profileResult = await client.query(updateQuery, [status, notes, adminId, profileId]);
      const userId = profileResult.rows[0].user_id;

      // Update user's is_verified status
      await client.query(
        'UPDATE users SET is_verified = $1, verified_by = $2, verified_at = CURRENT_TIMESTAMP WHERE id = $3',
        [status === 'approved', adminId, userId]
      );
      const farmerDetails = await client.query(
        'SELECT name, email FROM users WHERE id = $1',
        [userId]
      );
      
      const farmDetails = await client.query(
        'SELECT farm_name FROM farmer_profiles WHERE id = $1',
        [profileId]
      );
      
      if (status === 'approved') {
        await notifyFarmerApproved(
          farmerDetails.rows[0].email,
          farmerDetails.rows[0].name,
          farmDetails.rows[0].farm_name
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
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}