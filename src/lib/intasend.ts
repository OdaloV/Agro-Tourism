const INTASEND_API_BASE = process.env.INTASEND_ENVIRONMENT === 'production'
  ? 'https://api.intasend.com'
  : 'https://sandbox.intasend.com';

const PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY!;
const SECRET_KEY = process.env.INTASEND_SECRET_KEY!;

interface CreatePaymentParams {
  amount: number;
  currency?: string;
  payment_method?: 'M-PESA' | 'CARD' | 'MOBILE_MONEY';
  email?: string;
  name?: string;
  phone_number?: string;
  redirect_url?: string;
  webhook?: string;
  api_ref?: string;
  metadata?: Record<string, any>;
}

/**
 * STK Push / collection
 * Auth:     Bearer <SECRET_KEY>
 * Endpoint: /api/v1/payment/collection/
 * Docs:     https://developers.intasend.com
 */
export async function createPayment(params: CreatePaymentParams) {
  if (params.payment_method === 'M-PESA' && !params.phone_number) {
    throw new Error('Phone number required for M-PESA');
  }

  const payload: Record<string, any> = {
    public_key:    PUBLISHABLE_KEY,
    amount:        params.amount,
    currency:      params.currency || 'KES',
    method:        params.payment_method || 'M-PESA',
    phone_number:  params.phone_number,
    api_ref:       params.api_ref || `ref-${Date.now()}`,
    name:          params.name   || 'Customer',
    email:         params.email  || '',
  };

  if (params.redirect_url) payload.redirect_url = params.redirect_url;
  if (params.webhook)      payload.webhook       = params.webhook;
  if (params.metadata)     payload.metadata      = params.metadata;

  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payment/collection/`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error('IntaSend non-JSON response:', text.slice(0, 300));
    throw new Error(`IntaSend returned unexpected response (status ${response.status})`);
  }

  const data = await response.json();
  if (!response.ok) {
    const msg = data?.errors?.[0]?.detail || data?.detail || data?.message || 'Payment initiation failed';
    throw new Error(msg);
  }

  return data;
}

/**
 * Get payment status by IntaSend invoice/tracking ID
 */
export async function getPaymentStatus(intasendId: string) {
  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payment/collection/${intasendId}/`, {
    headers: { 'Authorization': `Bearer ${SECRET_KEY}` },
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`IntaSend status check returned non-JSON (status ${response.status})`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.detail || data?.message || 'Status check failed');
  }
  return data;
}

/**
 * Refund a payment
 */
export async function refundPayment(intasendId: string, amount?: number) {
  const response = await fetch(`${INTASEND_API_BASE}/api/v1/payment/collection/refund/`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify({
      public_key:     PUBLISHABLE_KEY,
      transaction_id: intasendId,
      amount:         amount || null,
    }),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`IntaSend refund returned non-JSON (status ${response.status})`);
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data?.errors?.[0]?.detail || data?.message || 'Refund failed');
  return data;
}

/**
 * Send a payout to a mobile number using B2C (Send Money) endpoint.
 * Uses the two‑step initiate/approve flow. For sandbox testing, ask IntaSend to enable auto‑approval.
 */
export async function sendPayout(amount: number, mobileNumber: string, currency: string = 'KES') {
  const url = `${INTASEND_API_BASE}/api/v1/send-money/initiate/`;
  
  // Sanitise mobile number – remove any hidden characters
  const cleanedNumber = mobileNumber.replace(/\s/g, '');
  console.log('[sendPayout] Original mobile number:', JSON.stringify(mobileNumber));
  console.log('[sendPayout] Cleaned mobile number:', cleanedNumber);
  console.log('[sendPayout] Number length:', cleanedNumber.length);
  console.log('[sendPayout] Number characters:', [...cleanedNumber].map(c => c.charCodeAt(0)).join(','));

  const payload = {
    currency,
    provider: 'MPESA-B2C',
    transactions: [
      {
        name: 'Farmer',
        account: cleanedNumber,
        amount,
        narrative: 'Booking payout - escrow release',
      },
    ],
  };

  const bodyString = JSON.stringify(payload);
  console.log('[sendPayout] URL:', url);
  console.log('[sendPayout] Payload string:', bodyString);
  console.log('[sendPayout] Secret key (first 10 chars):', SECRET_KEY?.substring(0, 10));
  console.log('[sendPayout] Environment:', process.env.INTASEND_ENVIRONMENT);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: bodyString,
  });

  const rawText = await response.text();
  console.log('[sendPayout] Response status:', response.status);
  console.log('[sendPayout] Raw response body:', rawText.slice(0, 500));

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: `;
    try {
      const errJson = JSON.parse(rawText);
      errorMsg += errJson?.errors?.[0]?.detail || errJson?.message || rawText;
    } catch {
      errorMsg += rawText;
    }
    throw new Error(errorMsg);
  }

  return JSON.parse(rawText);
}

/**
 * Verify webhook signature (stub – implement if you set a secret)
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string | null,
  expectedSecret: string
): boolean {
  if (!expectedSecret) return true;
  // TODO: implement HMAC verification using expectedSecret and the payload
  return true;
}
