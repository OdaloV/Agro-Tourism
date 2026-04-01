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
      `SELECT fp.verification_status, fp.verification_notes, fp.submitted_at,
              array_agg(json_build_object('type', d.document_type, 'status', d.status, 'url', d.document_url)) as documents
       FROM farmer_profiles fp
       LEFT JOIN farmer_documents d ON fp.id = d.farmer_id
       WHERE fp.user_id = $1
       GROUP BY fp.id`,
      [userId]
    );

    return NextResponse.json(result.rows[0] || { verification_status: 'pending' });

  } catch (error: any) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, documents } = body;

    if (!userId || !documents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get farmer profile id
    const farmerResult = await pool.query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [userId]
    );

    if (farmerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Farmer profile not found' },
        { status: 404 }
      );
    }

    const farmerId = farmerResult.rows[0].id;

    // Insert or update documents
    for (const [docType, docUrl] of Object.entries(documents)) {
      if (docUrl) {
        await pool.query(
          `INSERT INTO farmer_documents (farmer_id, document_type, document_url, status)
           VALUES ($1, $2, $3, 'pending')
           ON CONFLICT (farmer_id, document_type) 
           DO UPDATE SET document_url = $3, status = 'pending', uploaded_at = CURRENT_TIMESTAMP`,
          [farmerId, docType, docUrl]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Documents submitted for verification'
    });

  } catch (error: any) {
    console.error('Error submitting documents:', error);
    return NextResponse.json(
      { error: 'Failed to submit documents' },
      { status: 500 }
    );
  }
}