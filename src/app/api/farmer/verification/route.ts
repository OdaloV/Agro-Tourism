import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { sendVerificationEmail } from '@/lib/services/notificationService';

// GET - Check verification status
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

// POST - Submit verification documents
export async function POST(request: Request) {
  try {
    console.log("=== VERIFICATION API CALLED ===");
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    
    console.log("User ID:", userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Check if farmer is already verified
    const existingStatusResult = await pool.query(
      'SELECT verification_status FROM farmer_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (existingStatusResult.rows.length > 0) {
      const currentStatus = existingStatusResult.rows[0].verification_status;
      
      if (currentStatus === 'approved') {
        return NextResponse.json(
          { 
            error: 'Your farm is already verified. No further action needed.',
            status: 'already_verified'
          },
          { status: 400 }
        );
      }
      
      if (currentStatus === 'pending') {
        return NextResponse.json(
          { 
            error: 'Your verification is already in progress. Please wait for review.',
            status: 'already_pending'
          },
          { status: 400 }
        );
      }
    }
    
    // Get farmer profile id and user details
    const farmerResult = await pool.query(
      'SELECT fp.id, u.email, u.name FROM farmer_profiles fp JOIN users u ON fp.user_id = u.id WHERE fp.user_id = $1',
      [userId]
    );
    
    if (farmerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Farmer profile not found' },
        { status: 404 }
      );
    }
    
    const farmerId = farmerResult.rows[0].id;
    const userEmail = farmerResult.rows[0].email;
    const userName = farmerResult.rows[0].name;
    
    // Create uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    await mkdir(uploadDir, { recursive: true });
    
    const documents: { id: string; file: File; type?: string }[] = [];
    
    // Process uploaded files
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        documents.push({ id: key, file: value });
      } else if (typeof value === 'string' && key.endsWith('_type')) {
        const docId = key.replace('_type', '');
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          doc.type = value;
        }
      }
    }
    
    // Check for required documents
    const requiredDocs = ['national_id', 'selfie_photo', 'ownership_proof'];
    const uploadedDocIds = documents.map(d => d.id);
    const missingDocs = requiredDocs.filter(doc => !uploadedDocIds.includes(doc));
    
    if (missingDocs.length > 0) {
      return NextResponse.json(
        { error: `Missing required documents: ${missingDocs.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Save each document
    for (const doc of documents) {
      const fileExt = doc.file.name.split('.').pop() || 'pdf';
      const fileName = `${farmerId}_${doc.id}_${Date.now()}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const bytes = await doc.file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      const fileUrl = `/uploads/documents/${fileName}`;
      const documentTypeValue = doc.type || doc.id;
      
      await pool.query(
        `INSERT INTO farmer_documents (farmer_id, document_type, document_url, status, uploaded_at)
         VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
         ON CONFLICT (farmer_id, document_type) 
         DO UPDATE SET document_url = $3, status = 'pending', uploaded_at = CURRENT_TIMESTAMP`,
        [farmerId, documentTypeValue, fileUrl]
      );
    }
    
    // Get auto-approve setting
    const settingsResult = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'auto_approve'"
    );
    const autoApprove = settingsResult.rows[0]?.value === 'true';
    const newStatus = autoApprove ? 'approved' : 'pending';
    
    // Update farmer profile
    await pool.query(
      `UPDATE farmer_profiles 
       SET verification_status = $1, 
           verification_submitted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newStatus, userId]
    );
    
    let verificationCode = null;
    let sendVerificationEmailFlag = false;
    
    if (!autoApprove) {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
      
      await pool.query(
        `UPDATE users 
         SET verification_code = $1, 
             verification_code_expires = $2
         WHERE id = $3`,
        [verificationCode, codeExpires, userId]
      );
      
      await sendVerificationEmail(userEmail, userName, verificationCode);
      sendVerificationEmailFlag = true;
    }
    
    return NextResponse.json({
      success: true,
      message: autoApprove ? 'Your farm has been automatically approved!' : 'Documents submitted successfully. Our team will review your application.',
      verificationStatus: newStatus,
      sendVerificationEmail: sendVerificationEmailFlag
    });
    
  } catch (error: any) {
    console.error('Error submitting documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit documents' },
      { status: 500 }
    );
  }
}