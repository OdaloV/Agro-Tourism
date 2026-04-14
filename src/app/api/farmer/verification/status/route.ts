import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log("Checking verification status for userId:", userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    const result = await pool.query(
      `SELECT verification_status, verification_submitted_at, verified_at, rejection_reason
       FROM farmer_profiles 
       WHERE user_id = $1`,
      [userId]
    );
    
    console.log("Query result:", result.rows);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        status: 'not_found',
        message: 'Farmer profile not found'
      });
    }
    
    const status = result.rows[0].verification_status;
    let message = '';
    
    switch (status) {
      case 'approved':
        message = 'Your farm has been verified and is live on the platform!';
        break;
      case 'pending':
        message = 'Your verification is in progress. Our team will review your documents within 2-3 business days.';
        break;
      case 'rejected':
        message = 'Your verification was not approved. Please check your email for details and resubmit.';
        break;
      default:
        message = 'Verification not started. Please submit your documents.';
    }
    
    return NextResponse.json({
      status: status || 'not_submitted',
      message,
      submittedAt: result.rows[0].verification_submitted_at,
      verifiedAt: result.rows[0].verified_at,
      rejectionReason: result.rows[0].rejection_reason
    });
    
  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}