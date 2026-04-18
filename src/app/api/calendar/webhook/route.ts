import { NextResponse } from 'next/server';
import { syncFarmerAvailability } from '@/lib/google-calendar';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const channelId = request.headers.get('X-Goog-Channel-ID');
    const resourceId = request.headers.get('X-Goog-Resource-ID');
    const resourceState = request.headers.get('X-Goog-Resource-State');
    
    console.log('Calendar webhook received:', { channelId, resourceId, resourceState });
    
    if (resourceState === 'sync') {
      return NextResponse.json({ success: true });
    }
    
    if (resourceState === 'exists' || resourceState === 'update') {
      if (resourceId) {
        const farmerResult = await pool.query(
          'SELECT user_id FROM farmer_profiles WHERE google_calendar_id = $1',
          [resourceId]
        );
        
        if (farmerResult.rows.length > 0) {
          syncFarmerAvailability(farmerResult.rows[0].user_id, resourceId).catch(console.error);
        }
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const challenge = request.headers.get('X-Goog-Challenge');
  
  if (challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  
  return NextResponse.json({ error: 'Invalid webhook verification' }, { status: 400 });
}