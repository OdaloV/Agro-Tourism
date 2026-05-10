import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.INTASEND_SECRET_KEY;
    if (!apiKey) {
      console.error('[BankCodes] Missing INTASEND_SECRET_KEY');
      return NextResponse.json([]);
    }

    const url = 'https://sandbox.intasend.com/api/v1/send-money/bank-codes/ke/';
    console.log('[BankCodes] Fetching from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        //'Authorization': `Bearer ${apiKey}`, 
        'Authorization': `Token ${apiKey}`, // ← add this
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[BankCodes] HTTP ${response.status}:`, text);
      return NextResponse.json([]);
    }

    const data = await response.json();
    const banks = data.map((bank: any) => ({
      code: bank.bank_code,
      name: bank.bank_name,
    }));
    console.log(`[BankCodes] Success: ${banks.length} banks loaded`);
    return NextResponse.json(banks);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[BankCodes] Timed out — IntaSend did not respond in 8s');
    } else {
      console.error('[BankCodes] Error:', error.message);
    }
    return NextResponse.json([]);
  }
}