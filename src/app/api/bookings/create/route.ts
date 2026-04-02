// src/app/api/bookings/create/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkMaintenanceMode } from '@/lib/utils/checkMaintenance'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      visitorId, 
      farmId, 
      activityId, 
      activityName, 
      bookingDate, 
      participants, 
      totalAmount,
      specialRequests 
    } = body;

    // Validate required fields
    if (!visitorId || !farmId || !activityId || !bookingDate || !participants || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get settings from database
    const settingsResult = await pool.query(
      "SELECT key, value FROM platform_settings WHERE key IN ('commission_rate', 'min_booking_amount', 'max_guests_per_booking')"
    );
    
    const settings: Record<string, string> = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    const commissionRate = parseInt(settings.commission_rate) || 10;
    const minBookingAmount = parseInt(settings.min_booking_amount) || 300;
    const maxGuests = parseInt(settings.max_guests_per_booking) || 100;

    // Validate minimum booking amount
    if (totalAmount < minBookingAmount) {
      return NextResponse.json({
        error: `Minimum booking amount is KES ${minBookingAmount}. Your total is KES ${totalAmount}. Please add more items or increase quantity.`
      }, { status: 400 });
    }

    // Validate max guests
    if (participants > maxGuests) {
      return NextResponse.json({
        error: `Maximum ${maxGuests} guests allowed per booking. You selected ${participants}. Please reduce the number of guests or contact the farm for group bookings.`
      }, { status: 400 });
    }
    
    // Calculate fees
    const platformFee = (totalAmount * commissionRate) / 100;
    const farmerEarning = totalAmount - platformFee;

    // Save to database
    const result = await pool.query(
      `INSERT INTO bookings (
        visitor_id, 
        farm_id, 
        activity_id, 
        activity_name, 
        booking_date, 
        participants, 
        total_amount, 
        platform_fee, 
        farmer_earning, 
        special_requests,
        status,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        visitorId,
        farmId,
        activityId,
        activityName,
        bookingDate,
        participants,
        totalAmount,
        platformFee,
        farmerEarning,
        specialRequests || null,
        'pending',
        'pending'
      ]
    );

    return NextResponse.json({
      success: true,
      bookingId: result.rows[0].id,
      platformFee,
      farmerEarning,
      minBookingAmount,
      maxGuests
    });

  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    );
  }
}