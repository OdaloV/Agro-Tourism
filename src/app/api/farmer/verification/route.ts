import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { checkMaintenanceMode } from '@/lib/utils/checkMaintenance';
import { sendVerificationEmail } from '@/lib/services/notificationService';

export async function POST(request: Request) {
  try {
    console.log("=== VERIFICATION API CALLED ===");
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    
    console.log("User ID:", userId);
    
    if (!userId) {
      console.log("No user ID");
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Get farmer profile id and user details
    const farmerResult = await pool.query(
      'SELECT fp.id, u.email, u.name FROM farmer_profiles fp JOIN users u ON fp.user_id = u.id WHERE fp.user_id = $1',
      [userId]
    );
    
    console.log("Farmer result:", farmerResult.rows);
    
    if (farmerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Farmer profile not found' },
        { status: 404 }
      );
    }
    
    const farmerId = farmerResult.rows[0].id;
    const userEmail = farmerResult.rows[0].email;
    const userName = farmerResult.rows[0].name;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    await mkdir(uploadDir, { recursive: true });
    
    console.log("Upload directory:", uploadDir);
    
    const documents: { id: string; file: File; type?: string }[] = [];
    
    // Process uploaded files
    for (const [key, value] of formData.entries()) {
      console.log("Processing:", key, value instanceof File ? `File: ${value.name}` : value);
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
    
    console.log("Documents to save:", documents.length);
    
    // Save each document
    for (const doc of documents) {
      const fileExt = doc.file.name.split('.').pop() || 'pdf';
      const filePath = path.join(uploadDir, `${farmerId}_${doc.id}_${Date.now()}.${fileExt}`);
      const bytes = await doc.file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      const fileUrl = `/uploads/documents/${path.basename(filePath)}`;
      
      await pool.query(
        `INSERT INTO farmer_documents (farmer_id, document_type, document_url, status)
         VALUES ($1, $2, $3, 'pending')
         ON CONFLICT (farmer_id, document_type) 
         DO UPDATE SET document_url = $3, status = 'pending', uploaded_at = CURRENT_TIMESTAMP`,
        [farmerId, doc.id, fileUrl]
      );
    }
    
    console.log("Documents saved successfully");
  
    // Get auto-approve setting from database
    const settingsResult = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'auto_approve'"
    );
    const autoApprove = settingsResult.rows[0]?.value === 'true';
    
    // Determine new verification status
    const newStatus = autoApprove ? 'approved' : 'pending';
    
    // Update farmer profile verification status
    await pool.query(
      `UPDATE farmer_profiles 
       SET verification_status = $1, 
           verification_submitted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newStatus, userId]
    );
    
    console.log(`Verification status updated to: ${newStatus} (autoApprove: ${autoApprove})`);
    
    // ✅ Generate verification code and send email (only if not auto-approved)
    let verificationCode = null;
    let sendVerificationEmailFlag = false;
    
    if (!autoApprove) {
      // Generate 6-digit verification code
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Save verification code to user
      await pool.query(
        `UPDATE users 
         SET verification_code = $1, 
             verification_code_expires = $2
         WHERE id = $3`,
        [verificationCode, codeExpires, userId]
      );
      
      // Send verification email
      await sendVerificationEmail(userEmail, userName, verificationCode);
      sendVerificationEmailFlag = true;
      
      console.log(`Verification email sent to ${userEmail} with code: ${verificationCode}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Documents submitted successfully',
      verificationStatus: newStatus,
      sendVerificationEmail: sendVerificationEmailFlag,
      requiresEmailVerification: !autoApprove
    });
    
  } catch (error: any) {
    console.error('Error submitting documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit documents' },
      { status: 500 }
    );
  }
}