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
// src/lib/email.ts
// src/app/api/test-email/route.ts
// src/app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const result = await sendEmail(
    'odalojanetvicky@gmail.com',  // Your email address
    'HarvestHost Test Email',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
      <h1 style="color: #059669;">🎉 Email Working!</h1>
      <p>This is a test email from HarvestHost.</p>
      <p>Your email system is configured correctly!</p>
      <hr>
      <p style="color: #6b7280; font-size: 12px;">Sent from HarvestHost</p>
    </div>
    `
  );
  
  return NextResponse.json(result);
}