import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
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

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get farmer profile
    const farmerResult = await pool.query(
      'SELECT id, farm_name FROM farmer_profiles WHERE user_id = $1',
      [user.id]
    );
    
    if (farmerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }
    
    const farmerId = farmerResult.rows[0].id;
    const farmName = farmerResult.rows[0].farm_name;
    
    // Get bookings
    const bookings = await pool.query(`
      SELECT 
        b.booking_reference,
        TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date,
        b.participants,
        b.total_amount,
        b.status,
        u.name as visitor_name,
        u.email as visitor_email,
        u.phone as visitor_phone,
        a.activity_name
      FROM bookings b
      JOIN users u ON b.visitor_id = u.id
      JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.farm_id = $1
      ORDER BY b.booking_date DESC
    `, [farmerId]);
    
    // Get earnings
    const earnings = await pool.query(`
      SELECT 
        b.booking_reference,
        TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date,
        b.total_amount,
        b.platform_fee,
        b.farmer_earning,
        b.payment_status
      FROM bookings b
      WHERE b.farm_id = $1 AND b.status IN ('confirmed', 'completed', 'paid')
      ORDER BY b.booking_date DESC
    `, [farmerId]);
    
    // Get activities
    const activities = await pool.query(`
      SELECT 
        activity_name,
        price,
        currency,
        duration_minutes,
        max_capacity
      FROM farmer_activities
      WHERE farmer_id = $1
      ORDER BY activity_name
    `, [farmerId]);
    
    // Calculate totals
    const totalRevenue = earnings.rows.reduce((sum, e) => sum + parseFloat(e.total_amount), 0);
    const totalEarnings = earnings.rows.reduce((sum, e) => sum + parseFloat(e.farmer_earning), 0);
    const totalPlatformFee = earnings.rows.reduce((sum, e) => sum + parseFloat(e.platform_fee), 0);
    
    // Build CSV content
    const csvLines = [];
    
    // Header info
    csvLines.push(`"Farm Name","${farmName.replace(/"/g, '""')}"`);
    csvLines.push(`"Export Date","${new Date().toLocaleString()}"`);
    csvLines.push(`"Total Bookings",${bookings.rows.length}`);
    csvLines.push(`"Total Revenue",${totalRevenue}`);
    csvLines.push(`"Total Platform Fee",${totalPlatformFee}`);
    csvLines.push(`"Total Earnings",${totalEarnings}`);
    csvLines.push(``);
    
    // Bookings section
    csvLines.push(`"BOOKINGS"`);
    csvLines.push(`"Reference","Date","Participants","Amount (KES)","Status","Visitor Name","Visitor Email","Visitor Phone","Activity"`);
    bookings.rows.forEach(booking => {
      csvLines.push(`"${booking.booking_reference}","${booking.booking_date}",${booking.participants},${booking.total_amount},"${booking.status}","${(booking.visitor_name || '').replace(/"/g, '""')}","${booking.visitor_email || ''}","${booking.visitor_phone || ''}","${(booking.activity_name || '').replace(/"/g, '""')}"`);
    });
    csvLines.push(``);
    
    // Earnings section
    csvLines.push(`"EARNINGS"`);
    csvLines.push(`"Reference","Date","Total Amount (KES)","Platform Fee (KES)","Your Earnings (KES)","Status"`);
    earnings.rows.forEach(earning => {
      csvLines.push(`"${earning.booking_reference}","${earning.booking_date}",${earning.total_amount},${earning.platform_fee},${earning.farmer_earning},"${earning.payment_status}"`);
    });
    csvLines.push(``);
    
    // Activities section
    csvLines.push(`"ACTIVITIES"`);
    csvLines.push(`"Name","Price (KES)","Currency","Duration (min)","Max Capacity"`);
    activities.rows.forEach(activity => {
      csvLines.push(`"${(activity.activity_name || '').replace(/"/g, '""')}",${activity.price},"${activity.currency}",${activity.duration_minutes || 0},${activity.max_capacity || 'N/A'}`);
    });
    
    const csvContent = csvLines.join('\n');
    const fileName = `${farmName.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Return as CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}