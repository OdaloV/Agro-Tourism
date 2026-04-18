import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import pool from '@/lib/db';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    // Redirect to settings page with error
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/farmer/settings?tab=calendar&error=auth_failed`
    );
  }
  
  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/farmer/settings?tab=calendar&error=missing_params`
    );
  }
  
  try {
    // Decode state to get user ID
    let userId: number;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = stateData.userId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/farmer/settings?tab=calendar&error=invalid_state`
      );
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // Get calendar ID (usually the user's email)
    const calendarId = userInfo.data.email;
    
    // Store tokens in database
    await pool.query(
      `UPDATE farmer_profiles 
       SET google_calendar_connected = true,
           google_calendar_id = $1,
           google_access_token = $2,
           google_refresh_token = $3,
           google_token_expires = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5`,
      [
        calendarId,
        tokens.access_token,
        tokens.refresh_token || null,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        userId
      ]
    );
    
    // Redirect to settings page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/farmer/settings?tab=calendar&success=connected`
    );
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/farmer/settings?tab=calendar&error=token_exchange_failed`
    );
  }
}