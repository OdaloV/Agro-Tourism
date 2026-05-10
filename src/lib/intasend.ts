import IntaSend from 'intasend-node';

const PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY!;
const SECRET_KEY = process.env.INTASEND_SECRET_KEY!;
const ENVIRONMENT = process.env.INTASEND_ENVIRONMENT === 'production' ? false : true; // true = sandbox

// Initialize IntaSend client once
const intasend = new IntaSend(PUBLISHABLE_KEY, SECRET_KEY, ENVIRONMENT);

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
 * STK Push / collection (uses raw fetch – SDK doesn't expose this endpoint)
 */
export async function createPayment(params: CreatePaymentParams) {
  const baseUrl = ENVIRONMENT
    ? 'https://sandbox.intasend.com'
    : 'https://api.intasend.com';

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

  const response = await fetch(`${baseUrl}/api/v1/payment/collection/`, {
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
 * Get payment status (raw fetch – SDK doesn't have this method)
 */
export async function getPaymentStatus(intasendId: string) {
  const baseUrl = ENVIRONMENT
    ? 'https://sandbox.intasend.com'
    : 'https://api.intasend.com';

  const response = await fetch(`${baseUrl}/api/v1/payment/collection/${intasendId}/`, {
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

export async function refundPayment(intasendId: string, amount?: number) {
  const baseUrl = ENVIRONMENT
    ? 'https://sandbox.intasend.com'
    : 'https://api.intasend.com';

  const res = await fetch(`${baseUrl}/api/v1/chargebacks/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`, 
    },
    body: JSON.stringify({
      invoice: intasendId,
      amount: amount,
      reason: 'Customer refund',
      reason_details: 'Refund processed via platform',
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `HTTP ${res.status}: `;
    try { msg += JSON.parse(text)?.errors?.[0]?.detail || text; } catch { msg += text; }
    throw new Error(msg);
  }
  return JSON.parse(text);
}


export async function sendPayout(params: {
  amount: number;
  currency?: string;
  mobileNumber?: string;
  bankAccount?: string;
  bankCode?: string;
  accountName?: string;
  narrative?: string;
}) {
  const {
    amount,
    currency = 'KES',
    mobileNumber,
    bankAccount,
    bankCode,
    accountName,
    narrative = 'Booking payout - escrow release',
  } = params;

  if (!mobileNumber && (!bankAccount || !bankCode || !accountName)) {
    throw new Error('Either mobileNumber or (bankAccount + bankCode + accountName) must be provided');
  }

  const baseUrl = ENVIRONMENT
    ? 'https://sandbox.intasend.com'
    : 'https://api.intasend.com';
  const url = `${baseUrl}/api/v1/send-money/initiate/`;
  const provider = mobileNumber ? 'MPESA-B2C' : 'BANK';

  const transaction: any = {
    amount,
    narrative,
  };

  if (mobileNumber) {
    transaction.account = mobileNumber.replace(/\s/g, '');
    transaction.name = 'Farmer';
  } else {
    transaction.account = bankAccount;
    transaction.bank_code = bankCode;
    transaction.name = accountName;
  }

  const payload = {
    provider,
    currency,
    transactions: [transaction],
  };
  console.log('[sendPayout] Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
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

export function verifyWebhookSignature(
  payload: any,
  signature: string | null,
  expectedSecret: string
): boolean {
  if (!expectedSecret) return true;
  // TODO: implement HMAC verification
  return true;
}