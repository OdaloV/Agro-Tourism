import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';

// Add this at the beginning of the POST function
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
    
    // Get farmer profile id
    const farmerResult = await pool.query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
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
      const filePath = path.join(uploadDir, `${farmerId}_${doc.id}_${Date.now()}.pdf`);
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
    
    return NextResponse.json({
      success: true,
      message: 'Documents submitted successfully'
    });
    
  } catch (error: any) {
    console.error('Error submitting documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit documents' },
      { status: 500 }
    );
  }
}
