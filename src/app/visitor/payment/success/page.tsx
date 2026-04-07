// src/app/visitor/payment/success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  
  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);
  
  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings?bookingId=${bookingId}`);
      const data = await response.json();
      if (response.ok && data.bookings?.length > 0) {
        setBooking(data.bookings[0]);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          
          {booking && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-emerald-900 mb-2">Booking Details</h3>
              <p className="text-sm text-gray-600">Booking Reference: {booking.booking_reference}</p>
              <p className="text-sm text-gray-600">Farm: {booking.farm_name}</p>
              <p className="text-sm text-gray-600">Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Guests: {booking.participants}</p>
              <p className="text-sm text-gray-600 mt-2">Amount Paid: KES {parseFloat(booking.total_amount).toLocaleString()}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Link href="/visitor/dashboard/bookings">
              <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
                View My Bookings
              </button>
            </Link>
            <Link href="/farms">
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Explore More Farms
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}