// src/app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Bookings API called");
    
    // Use your actual table structure
    const query = `
      SELECT 
        b.id,
        b.booking_date,
        b.participants as guests_count,
        b.total_amount,
        b.status,
        b.platform_fee as commission,
        b.farmer_earning,
        b.activity_name,
        b.payment_status,
        b.booking_date,
        COALESCE(fp.farm_name, 'Unknown Farm') as farm_name,
        COALESCE(u.name, 'Unknown Visitor') as visitor_name,
        COALESCE(u.email, 'unknown@example.com') as visitor_email
      FROM bookings b
      LEFT JOIN farmer_profiles fp ON b.farm_id = fp.id
      LEFT JOIN users u ON b.visitor_id = u.id
      ORDER BY b.booking_date DESC
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} bookings`);
    
    // Calculate totals using your actual column names
    const total_revenue = result.rows.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    const platform_earnings = result.rows.reduce((sum, row) => sum + Number(row.commission || 0), 0);
    const total_farmer_earnings = result.rows.reduce((sum, row) => sum + Number(row.farmer_earning || 0), 0);
    
    return NextResponse.json({
      bookings: result.rows.map(row => ({
        id: row.id,
        farm_name: row.farm_name,
        visitor_name: row.visitor_name,
        visitor_email: row.visitor_email,
        booking_date: row.booking_date,
        guests_count: row.guests_count,
        total_amount: row.total_amount,
        commission: row.commission,
        farmer_earnings: row.farmer_earning,
        status: row.status,
        activity_name: row.activity_name,
        payment_status: row.payment_status
      })),
      summary: {
        total_bookings: result.rows.length,
        total_revenue: total_revenue,
        platform_earnings: platform_earnings,
        total_farmer_earnings: total_farmer_earnings
      }
    });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    // Return empty data instead of error to prevent UI crash
    return NextResponse.json({
      bookings: [],
      summary: {
        total_bookings: 0,
        total_revenue: 0,
        platform_earnings: 0,
        total_farmer_earnings: 0
      }
    });
  }
}