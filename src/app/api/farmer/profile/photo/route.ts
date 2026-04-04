// src/app/api/farmer/profile/photo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

// GET - Fetch profile photo
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      'SELECT profile_photo_url FROM farmer_profiles WHERE user_id = $1',
      [user.id]
    );

    return NextResponse.json({ 
      photoUrl: result.rows[0]?.profile_photo_url || null 
    });
  } catch (error) {
    console.error('Error fetching profile photo:', error);
    return NextResponse.json({ photoUrl: null });
  }
}

// POST - Upload profile photo
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('profile_photo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 2MB' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadDir, { recursive: true });

    // Delete old photo if exists
    const oldPhotoResult = await pool.query(
      'SELECT profile_photo_url FROM farmer_profiles WHERE user_id = $1',
      [user.id]
    );
    
    if (oldPhotoResult.rows[0]?.profile_photo_url) {
      const oldPhotoPath = path.join(process.cwd(), 'public', oldPhotoResult.rows[0].profile_photo_url);
      try {
        await unlink(oldPhotoPath);
      } catch (err) {
        console.log('Old photo not found or already deleted');
      }
    }

    // Save new file
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${user.id}_${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const photoUrl = `/uploads/profiles/${filename}`;

    // Update database
    await pool.query(
      `UPDATE farmer_profiles SET profile_photo_url = $1 WHERE user_id = $2`,
      [photoUrl, user.id]
    );

    return NextResponse.json({ 
      success: true, 
      photoUrl 
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete profile photo
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current photo URL
    const result = await pool.query(
      'SELECT profile_photo_url FROM farmer_profiles WHERE user_id = $1',
      [user.id]
    );
    
    const photoUrl = result.rows[0]?.profile_photo_url;
    
    if (photoUrl) {
      // Delete file from filesystem
      const photoPath = path.join(process.cwd(), 'public', photoUrl);
      try {
        await unlink(photoPath);
      } catch (err) {
        console.log('Photo file not found');
      }
      
      // Update database to remove URL
      await pool.query(
        `UPDATE farmer_profiles SET profile_photo_url = NULL WHERE user_id = $1`,
        [user.id]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile photo deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}