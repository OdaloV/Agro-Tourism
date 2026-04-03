// src/app/api/farmer/photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Define the JWT payload type
interface JWTPayload {
  id: number;
  email: string;
  role: string;
}

// Helper function to get user from JWT token in cookies
async function getUserFromToken(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Ensure the payload has the expected structure
    return {
      id: payload.id as number,
      email: payload.email as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// Helper function to get farmer ID from user session
async function getFarmerId(userId: number): Promise<number | null> {
  const result = await pool.query(
    `SELECT id FROM farmer_profiles WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.id || null;
}

// Helper function to convert buffer to base64 URL
function bufferToBase64Url(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// ============================================
// GET endpoint - Fetch all photos
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    // Get all photos for this farmer
    const photosResult = await pool.query(
      `SELECT 
         id, 
         photo_type, 
         sort_order,
         encode(photo_data, 'base64') as photo_base64,
         created_at
       FROM farmer_photos 
       WHERE farmer_id = $1 
       ORDER BY sort_order ASC, created_at ASC`,
      [farmerId]
    );

    // Also get video link from farmer profile
    const videoResult = await pool.query(
      `SELECT video_link FROM farmer_profiles WHERE id = $1`,
      [farmerId]
    );

    const photos = photosResult.rows.map((photo: any) => ({
      id: photo.id,
      url: `data:${photo.photo_type};base64,${photo.photo_base64}`,
      sort_order: photo.sort_order,
      uploaded_at: photo.created_at
    }));

    return NextResponse.json({ 
      success: true,
      photos: photos,
      videoLink: videoResult.rows[0]?.video_link || null
    });
    
  } catch (error) {
    console.error('Error fetching farmer photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// ============================================
// POST endpoint - Upload new photos
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Get current max sort_order
    const maxOrderResult = await pool.query(
      `SELECT COALESCE(MAX(sort_order), -1) as max_order FROM farmer_photos WHERE farmer_id = $1`,
      [farmerId]
    );
    let nextOrder = maxOrderResult.rows[0].max_order + 1;

    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        console.error(`File ${file.name} is not an image`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        console.error(`File ${file.name} exceeds 5MB limit`);
        continue;
      }
      
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const result = await pool.query(
        `INSERT INTO farmer_photos (farmer_id, photo_data, photo_type, sort_order, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, photo_type, sort_order, created_at`,
        [farmerId, buffer, file.type, nextOrder + i]
      );
      
      uploadedPhotos.push({
        id: result.rows[0].id,
        url: bufferToBase64Url(buffer, file.type),
        sort_order: result.rows[0].sort_order,
        uploaded_at: result.rows[0].created_at
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Uploaded ${uploadedPhotos.length} photo(s)`,
      photos: uploadedPhotos
    });
    
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE endpoint - Remove a photo
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');
    
    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }
    
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    // Verify photo belongs to this farmer
    const verifyResult = await pool.query(
      `SELECT id FROM farmer_photos WHERE id = $1 AND farmer_id = $2`,
      [photoId, farmerId]
    );
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete the photo
    await pool.query(
      `DELETE FROM farmer_photos WHERE id = $1`,
      [photoId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Photo deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}