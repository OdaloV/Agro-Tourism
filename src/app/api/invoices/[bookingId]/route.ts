// src/app/api/invoices/[bookingId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    // ✅ MUST await params (Next.js 15 requirement)
    const { bookingId: bookingIdStr } = await params;
    const bookingId = parseInt(bookingIdStr);
    
    console.log("Booking ID:", bookingId);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }
    
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await pool.query(`
      SELECT 
        b.id,
        b.booking_reference,
        b.booking_date,
        b.activity_name,
        b.participants,
        b.total_amount,
        b.payment_method,
        b.paid_at,
        fp.farm_name,
        u.name as visitor_name,
        u.email as visitor_email
      FROM bookings b
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN users u ON b.visitor_id = u.id
      WHERE b.id = $1 AND b.visitor_id = $2
    `, [bookingId, user.id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const booking = result.rows[0];
    
    const invoiceHtml = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${booking.booking_reference}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #059669; margin: 0; }
        .invoice-details { margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .items-table th { background: #f5f5f5; }
        .total-row { font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 HarvestHost</h1>
          <h2>INVOICE</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> INV-${booking.booking_reference}</p>
          <p><strong>Date:</strong> ${new Date(booking.paid_at || booking.booking_date).toLocaleDateString()}</p>
          <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
        </div>
        
        <div>
          <h3>Bill To:</h3>
          <p>${booking.visitor_name}<br>${booking.visitor_email}</p>
        </div>
        
        <div>
          <h3>Farm:</h3>
          <p>${booking.farm_name}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr><th>Description</th><th>Quantity</th><th>Unit Price (KES)</th><th>Total (KES)</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${booking.activity_name}</td>
              <td>${booking.participants}</td>
              <td>${(booking.total_amount / booking.participants).toLocaleString()}</td>
              <td>${parseFloat(booking.total_amount).toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row"><td colspan="3" style="text-align: right;">Total:</td><td>KES ${parseFloat(booking.total_amount).toLocaleString()}</td></tr>
          </tfoot>
        </table>
        
        <div><p><strong>Payment Method:</strong> ${booking.payment_method || 'M-Pesa'}</p></div>
        
        <div class="footer">
          <p>Thank you for choosing HarvestHost!</p>
          <p>© ${new Date().getFullYear()} HarvestHost. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;
    
    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${booking.booking_reference}.html"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}