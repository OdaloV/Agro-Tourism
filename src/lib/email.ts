import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'odalojanetvicky@gmail.com',
      subject,
      html,
    });
    
    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }
    
    console.log(`Email sent to ${to}:`, data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Send booking reminder email with calendar link
export async function sendBookingReminderEmail({
  to,
  farmerEmail,
  bookingReference,
  farmName,
  activityName,
  bookingDate,
  reminderTime,
  calendarLink,
}: {
  to: string;
  farmerEmail: string;
  bookingReference: string;
  farmName: string;
  activityName: string;
  bookingDate: string;
  reminderTime: string;
  calendarLink?: string;
}) {
  const formattedDate = new Date(bookingDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const calendarHtml = calendarLink ? `
    <div style="margin: 20px 0; text-align: center;">
      <a href="${calendarLink}" 
         style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        📅 Add to Google Calendar
      </a>
    </div>
  ` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌾 Booking Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 16px;">Hello,</p>
        
        <p style="color: #374151; font-size: 16px;">
          This is a reminder that your booking at <strong>${farmName}</strong> is coming up in <strong>${reminderTime}</strong>!
        </p>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin: 0 0 10px 0;">📋 Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Reference:</strong> ${bookingReference}</p>
          <p style="margin: 5px 0;"><strong>Activity:</strong> ${activityName}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
        </div>
        
        ${calendarHtml}
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 10px 0;">📍 What to Bring</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Comfortable clothing and shoes</li>
            <li>Sunscreen and hat for outdoor activities</li>
            <li>Water bottle</li>
            <li>Camera to capture memories</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/visitor/dashboard/bookings" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View My Bookings
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Need to make changes? Contact the farmer directly at <a href="mailto:${farmerEmail}" style="color: #059669;">${farmerEmail}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, `🌾 Booking Reminder: ${activityName} at ${farmName} - ${reminderTime} away`, html);
}