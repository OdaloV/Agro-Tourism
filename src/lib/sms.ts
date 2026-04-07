// src/lib/sms.ts
import africastalking from 'africastalking';

// @ts-ignore
const africasTalking = africastalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY!,
  username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox',
});

export async function sendSMS(to: string, message: string) {
  try {
    // Format phone number for Kenya
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      formattedNumber = `+254${to.replace(/^0/, '')}`;
    }
    
    console.log('Sending SMS to:', formattedNumber);
    
    // Working configuration - no 'from' parameter
    const result = await africasTalking.SMS.send({
      to: formattedNumber,
      message: message,
    });
    
    // Check if the message was sent successfully
    const recipient = result.SMSMessageData?.Recipients?.[0];
    if (recipient?.status === 'Success') {
      console.log(`✅ SMS sent successfully to ${recipient.number}`);
      console.log(`   Message ID: ${recipient.messageId}`);
      console.log(`   Cost: ${recipient.cost}`);
    } else {
      console.log(`❌ SMS failed: ${recipient?.status}`);
    }
    
    return { success: true, result };
  } catch (error: any) {
    console.error('SMS Error:', error?.message || error);
    return { 
      success: false, 
      error: {
        message: error?.message || 'Unknown error',
      }
    };
  }
}