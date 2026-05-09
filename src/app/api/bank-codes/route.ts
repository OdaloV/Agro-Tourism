import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch('https://sandbox.intasend.com/api/v1/send-money/bank-codes/ke/');
  const data = await response.json();
  return NextResponse.json(data);
}