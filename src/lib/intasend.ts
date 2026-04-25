// src/lib/intasend.ts
const INTASEND_API_BASE = process.env.INTASEND_ENVIRONMENT === 'production'
  ? 'https://api.intasend.com'
  : 'https://sandbox.intasend.com';

const PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY!;
const SECRET_KEY = process.env.INTASEND_SECRET_KEY!;

// Basic auth header using secret key (IntaSend expects secret key + colon)
const authHeader = `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`;

interface CreatePaymentParams {
  amount: number;
  currency?: string;
  payment_method?: 'MPESA' | 'CARD' | 'MOBILE_MONEY';
  email?: string;
  phone_number?: string;
  redirect_url?: string;
  webhook?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a payment (Checkout Link or STK push)
 * Docs: https://developers.intasend.com/api-reference/#create-a-payment
 */
export async function createPayment(params: CreatePaymentParams) {
  const payload: any = {
    amount: params.amount,
    currency: params.currency || 'KES',
    payment_method: params.payment_method || 'MPESA',
    metadata: params.metadata || {},
  };

  // For M-PESA, include phone_number
  if (params.payment_method === 'MPESA') {
    if (!params.phone_number) throw new Error('Phone number required for M-PESA');
    payload.phone_number = params.phone_number;
  }

  // For card or hosted page, provide redirect_url
  if (params.redirect_url) payload.redirect_url = params.redirect_url;

  // Webhook URL (optional)
  if (params.webhook) payload.webhook = params.webhook;

  // Customer email (optional but recommended)
  if (params.email) payload.email = params.email;

  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payment/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Payment initiation failed');
  }
  return data;
}

/**
 * Get payment status by IntaSend transaction ID
 */
export async function getPaymentStatus(intasendId: string) {
  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payment/status/${intasendId}`, {
    headers: { 'Authorization': authHeader },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Status check failed');
  return data;
}

/**
 * Refund a payment (full or partial)
 * Docs: https://developers.intasend.com/api-reference/#refund-payment
 */
export async function refundPayment(intasendId: string, amount?: number) {
  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payment/refund/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      transaction_id: intasendId,
      amount: amount || null, // null = full refund
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Refund failed');
  return data;
}

/**
 * Send a payout to a mobile number or bank account
 * Docs: https://developers.intasend.com/api-reference/#make-a-payout
 */
export async function sendPayout(amount: number, mobileNumber: string, currency: string = 'KES') {
  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payouts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      amount,
      currency,
      payout_type: 'MPESA',
      mobile_number: mobileNumber,
      metadata: { purpose: 'escrow_release' },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Payout failed');
  return data;
}

/**
 * Verify webhook signature (optional)
 * You can store a secret in your dashboard and compare it.
 */
export function verifyWebhookSignature(payload: any, signature: string | null, expectedSecret: string): boolean {
  // Implementation depends on how IntaSend sends signature.
  // For now, return true if you don't set a secret.
  if (!expectedSecret) return true;
  // In real implementation, you'd compute HMAC or compare a header.
  // This is a placeholder.
  return true;
}