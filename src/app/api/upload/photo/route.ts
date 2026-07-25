// src/app/api/upload/photo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser, requireAuth } from '@/lib/auth-middleware';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  const err = requireAuth(user);
  if (err) return err;

  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}_${timestamp}.${ext}`;
    const filePath = `farm-photos/${userId}/${filename}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('farm-photos') // Make sure this bucket exists!
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('farm-photos')
      .getPublicUrl(filePath);
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename 
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}