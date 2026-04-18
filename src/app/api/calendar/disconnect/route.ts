import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getUserFromToken(request: Request) {
  const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get existing tokens to revoke
    const tokenResult = await pool.query(
      'SELECT google_access_token, google_refresh_token FROM farmer_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (tokenResult.rows.length > 0 && tokenResult.rows[0].google_access_token) {
      try {
        // Revoke the access token
        oauth2Client.setCredentials({
          access_token: tokenResult.rows[0].google_access_token,
          refresh_token: tokenResult.rows[0].google_refresh_token,
        });
        
        await oauth2Client.revokeCredentials();
      } catch (revokeError) {
        console.error('Error revoking Google token:', revokeError);
        // Continue with disconnect even if revoke fails
      }
    }
    
    // Clear Google Calendar data from database
    await pool.query(
      `UPDATE farmer_profiles 
       SET google_calendar_connected = false,
           google_calendar_id = NULL,
           google_access_token = NULL,
           google_refresh_token = NULL,
           google_token_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
    
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}