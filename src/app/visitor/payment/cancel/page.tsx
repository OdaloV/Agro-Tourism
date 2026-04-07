// src/app/visitor/payment/cancel/page.tsx
"use client";

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was not completed. You can try again or choose a different payment method.
          </p>
          
          <div className="flex gap-3">
            <Link href="/visitor/dashboard/bookings">
              <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
                Try Again
              </button>
            </Link>
            <Link href="/farms">
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Back to Farms
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}