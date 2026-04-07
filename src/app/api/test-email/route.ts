// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function GET() {
//   try {
//     console.log("=== TESTING EMAIL ===");
    
//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     console.log("Transporter created with user:", process.env.SMTP_USER);

//     // Send email
//     const info = await transporter.sendMail({
//       from: `"HarvestHost" <${process.env.SMTP_FROM}>`,
//       to: 'harvesthostadmin@gmail.com',
//       subject: 'Test Email from HarvestHost',
//       html: '<h1>Test Email</h1><p>This is a test email from HarvestHost.</p>',
//     });

//     console.log("Email sent successfully:", info.messageId);
    
//     return NextResponse.json({ 
//       success: true, 
//       messageId: info.messageId,
//       message: 'Test email sent to harvesthostadmin@gmail.com!' 
//     });
//   } catch (error: any) {
//     console.error('Email error details:', error);
//     return NextResponse.json(
//       { error: error.message, stack: error.stack }, 
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }
  
  const result = await sendEmail(
    'odalojanevicky@gmail.com',  // Replace with your email
    'Test Email from HarvestHost',
    '<h1>Hello!</h1><p>This is a test email from HarvestHost.</p>'
  );
  
  return NextResponse.json(result);
}