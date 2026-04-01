import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Convert empty strings / nullish values to null for integer DB columns
const toIntOrNull = (val: any): number | null => {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, farmerData } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role`,
        [name, email, phone, hashedPassword, role, role === 'visitor']
      );

      const userId = userResult.rows[0].id;

      // If farmer, insert farmer profile
      if (role === 'farmer' && farmerData) {
        const profileResult = await client.query(
          `INSERT INTO farmer_profiles (
            user_id, farm_name, farm_location, farm_size, year_established,
            farm_description, farm_type, accommodation, max_guests,
            verification_status, submitted_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            userId,
            farmerData.farmName,
            farmerData.location,
            toIntOrNull(farmerData.farmSize),       // was: farmerData.farmSize
            toIntOrNull(farmerData.yearEst),         // was: farmerData.yearEst
            farmerData.farmDescription,
            farmerData.farmType,
            farmerData.accommodation,
            toIntOrNull(farmerData.maxGuests),       // was: farmerData.maxGuests (confirmed culprit — $9)
            'pending',
            new Date()
          ]
        );

        const farmerId = profileResult.rows[0].id;

        // Insert activities
        if (farmerData.allActivities && farmerData.allActivities.length > 0) {
          for (const activity of farmerData.allActivities) {
            const activityName = activity.split('(')[0]?.trim() || activity;
            const category = activity.includes('(') ? activity.split('(')[1]?.replace(')', '') : null;
            
            await client.query(
              `INSERT INTO farmer_activities (farmer_id, activity_name, category, is_custom)
               VALUES ($1, $2, $3, $4)`,
              [farmerId, activityName, category, category ? true : false]
            );
          }
        }

        // Insert facilities
        if (farmerData.facilities && farmerData.facilities.length > 0) {
          for (const facility of farmerData.facilities) {
            await client.query(
              `INSERT INTO farmer_facilities (farmer_id, facility_name)
               VALUES ($1, $2)`,
              [farmerId, facility]
            );
          }
        }
      }

      await client.query('COMMIT');

      // Create JWT token for auto-login after registration
      const token = await new SignJWT({
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      const user = userResult.rows[0];

      // Create response with cookies
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: false,
          verificationStatus: 'pending'
        },
        requiresVerification: role === 'farmer'
      });

      // Set cookies for authentication
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      response.cookies.set('user_role', user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
