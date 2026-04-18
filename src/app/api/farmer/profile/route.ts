import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkMaintenanceMode } from '@/lib/utils/checkMaintenance';

async function getPlatformCommissionRate(): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT value FROM platform_settings WHERE key = 'commission_rate'`
    );
    return parseFloat(result.rows[0]?.value) || 10;
  } catch (error) {
    console.error('Error fetching commission rate:', error);
    return 10;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT 
         u.id,
         u.name,
         u.email,
         u.phone,
         fp.id as farmer_profile_id,
         fp.farm_name as "farmName",
         fp.farm_location as "farmLocation",
         fp.farm_size as "farmSize",
         fp.year_established as "yearEstablished",
         fp.farm_description as "farmDescription",
         fp.farm_type as "farmType",
         fp.accommodation,
         fp.max_guests as "maxGuests",
         fp.verification_status as "verificationStatus",
         fp.submitted_at as "submittedAt",
         fp.profile_views,
         fp.google_calendar_connected,
         fp.google_calendar_id,
         fp.google_access_token,
         fp.google_refresh_token,
         fp.google_token_expires,
         COALESCE(array_agg(DISTINCT a.activity_name) FILTER (WHERE a.activity_name IS NOT NULL), '{}') as activities,
         COALESCE(array_agg(DISTINCT f.facility_name) FILTER (WHERE f.facility_name IS NOT NULL), '{}') as facilities,
         COUNT(DISTINCT m.id) as "farmPhotos",
         fp.video_link as "videoLink",
         json_build_object(
           'businessLicense', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'businessLicense'),
           'nationalId', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'nationalId'),
           'insurance', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'insurance'),
           'certifications', EXISTS(SELECT 1 FROM farmer_documents d WHERE d.farmer_id = fp.id AND d.document_type = 'certifications')
         ) as documents
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN farmer_activities a ON fp.id = a.farmer_id
       LEFT JOIN farmer_facilities f ON fp.id = f.farmer_id
       LEFT JOIN farmer_media m ON fp.id = m.farmer_id AND m.media_type = 'photo'
       WHERE u.id = $1
       GROUP BY u.id, fp.id, fp.profile_views, fp.google_calendar_connected, fp.google_calendar_id, fp.google_access_token, fp.google_refresh_token, fp.google_token_expires`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    const farmer = result.rows[0];
    const farmerId = farmer.farmer_profile_id;

    if (!farmerId) {
      return NextResponse.json({
        id: farmer.id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        farmName: farmer.farmName,
        farmLocation: farmer.farmLocation,
        farmSize: farmer.farmSize,
        yearEstablished: farmer.yearEstablished,
        farmDescription: farmer.farmDescription,
        farmType: farmer.farmType,
        activities: farmer.activities || [],
        facilities: farmer.facilities || [],
        accommodation: farmer.accommodation || false,
        maxGuests: farmer.maxGuests,
        farmPhotos: parseInt(farmer.farmPhotos) || 0,
        videoLink: farmer.videoLink,
        documents: farmer.documents,
        verificationStatus: farmer.verificationStatus || 'pending',
        submittedAt: farmer.submittedAt || new Date().toISOString(),
        googleCalendar: {
          connected: farmer.google_calendar_connected || false,
          calendarId: farmer.google_calendar_id || null,
        },
        stats: {
          profileViews: farmer.profile_views || 0,
          bookings: 0,
          rating: 0,
          reviews: 0,
          totalEarnings: 0,
          totalRevenue: 0,
          platformFee: 0,
          commissionRate: 10
        },
        recentEarnings: []
      });
    }

    const commissionRate = await getPlatformCommissionRate();
    const farmerPercentage = 100 - commissionRate;

    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        COALESCE(SUM(b.total_amount), 0) as total_revenue_all,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed', 'paid') THEN b.total_amount ELSE 0 END), 0) as paid_revenue
      FROM farmer_profiles fp
      LEFT JOIN bookings b ON b.farm_id = fp.id
      LEFT JOIN reviews r ON r.farm_id = fp.id
      WHERE fp.id = $1
      GROUP BY fp.id
    `, [farmerId]);

    const stats = statsResult.rows[0] || { 
      total_bookings: 0, 
      avg_rating: 0, 
      total_reviews: 0, 
      total_revenue_all: 0,
      paid_revenue: 0
    };

    const totalEarningsResult = await pool.query(`
      SELECT COALESCE(SUM(b.total_amount * $1 / 100), 0) as total_earnings
      FROM bookings b
      WHERE b.farm_id = $2 AND b.status IN ('confirmed', 'completed', 'paid')
    `, [farmerPercentage, farmerId]);

    const totalEarningsSum = parseFloat(totalEarningsResult.rows[0].total_earnings) || 0;
    const paidRevenue = parseFloat(stats.paid_revenue) || 0;
    const platformFee = (paidRevenue * commissionRate) / 100;
    const totalRevenue = parseFloat(stats.total_revenue_all) || 0;

    const earningsResult = await pool.query(`
      SELECT 
        b.id,
        a.activity_name,
        b.booking_date,
        b.participants as guests,
        b.total_amount as amount,
        (b.total_amount * $1 / 100) as platform_fee,
        (b.total_amount * $2 / 100) as farmer_earning
      FROM bookings b
      JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.farm_id = $3 AND b.status IN ('confirmed', 'completed', 'paid')
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [commissionRate, farmerPercentage, farmerId]);

    return NextResponse.json({
      id: farmer.id,
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      farmName: farmer.farmName,
      farmLocation: farmer.farmLocation,
      farmSize: farmer.farmSize,
      yearEstablished: farmer.yearEstablished,
      farmDescription: farmer.farmDescription,
      farmType: farmer.farmType,
      activities: farmer.activities || [],
      facilities: farmer.facilities || [],
      accommodation: farmer.accommodation || false,
      maxGuests: farmer.maxGuests,
      farmPhotos: parseInt(farmer.farmPhotos) || 0,
      videoLink: farmer.videoLink,
      documents: farmer.documents || {
        businessLicense: false,
        nationalId: false,
        insurance: false,
        certifications: false,
      },
      verificationStatus: farmer.verificationStatus || 'pending',
      submittedAt: farmer.submittedAt || new Date().toISOString(),
      googleCalendar: {
        connected: farmer.google_calendar_connected || false,
        calendarId: farmer.google_calendar_id || null,
        accessToken: farmer.google_access_token || null,
        refreshToken: farmer.google_refresh_token || null,
        tokenExpires: farmer.google_token_expires || null,
      },
      stats: {
        profileViews: farmer.profile_views || 0,
        bookings: parseInt(stats.total_bookings) || 0,
        rating: parseFloat(stats.avg_rating) || 0,
        reviews: parseInt(stats.total_reviews) || 0,
        totalEarnings: totalEarningsSum,
        totalRevenue: totalRevenue,
        platformFee: platformFee,
        commissionRate: commissionRate
      },
      recentEarnings: earningsResult.rows.map(row => ({
        id: row.id,
        activityName: row.activity_name,
        bookingDate: row.booking_date,
        guests: row.guests,
        amount: parseFloat(row.amount),
        platformFee: parseFloat(row.platform_fee),
        farmerEarning: parseFloat(row.farmer_earning)
      }))
    });

  } catch (error: any) {
    console.error('Error fetching farmer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings: Record<string, string> = {
      farmName: 'farm_name',
      farmLocation: 'farm_location',
      farmSize: 'farm_size',
      yearEstablished: 'year_established',
      farmDescription: 'farm_description',
      farmType: 'farm_type',
      accommodation: 'accommodation',
      maxGuests: 'max_guests',
      videoLink: 'video_link',
      // Google Calendar fields
      googleCalendarConnected: 'google_calendar_connected',
      googleCalendarId: 'google_calendar_id',
      googleAccessToken: 'google_access_token',
      googleRefreshToken: 'google_refresh_token',
      googleTokenExpires: 'google_token_expires',
    };

    for (const [key, value] of Object.entries(updateData)) {
      const dbField = fieldMappings[key];
      if (dbField && value !== undefined) {
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(userId);
    const query = `
      UPDATE farmer_profiles 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      profile: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error updating farmer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}