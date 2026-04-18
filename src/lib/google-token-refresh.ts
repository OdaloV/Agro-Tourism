import { google } from 'googleapis';
import pool from '@/lib/db';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function refreshGoogleToken(userId: number): Promise<string | null> {
  try {
    // Get stored refresh token
    const result = await pool.query(
      'SELECT google_refresh_token FROM farmer_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].google_refresh_token) {
      return null;
    }
    
    const refreshToken = result.rows[0].google_refresh_token;
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    
    // Refresh the token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Ensure we have a valid access token
    const accessToken = credentials.access_token ?? null;
    
    if (!accessToken) {
      console.error('No access token returned from refresh');
      return null;
    }
    
    // Update stored tokens
    await pool.query(
      `UPDATE farmer_profiles 
       SET google_access_token = $1,
           google_token_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [accessToken, credentials.expiry_date ? new Date(credentials.expiry_date) : null, userId]
    );
    
    return accessToken;
    
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}