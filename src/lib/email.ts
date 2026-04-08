// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',  // ✅ Test domain - no verification needed
      to: 'odalojanetvicky@gmail.com',  // Your email address
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