"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Calendar } from 'lucide-react';
import AddToCalendar from '@/app/components/AddToCalendar';

interface BookingDetails {
  id: number;
  booking_reference: string;
  farm_name: string;
  activity_name: string;
  booking_date: string;
  participants: number;
  total_amount: number;
  status: string;
  google_event_id?: string;
}

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');
  const bookingId = searchParams.get('booking_id');
  
  useEffect(() => {
    if (orderTrackingId || bookingId) {
      verifyPayment();
    } else {
      setStatus('failed');
    }
  }, [orderTrackingId, bookingId]);
  
  const verifyPayment = async () => {
    try {
      let response;
      if (bookingId) {
        // For M-Pesa callback
        response = await fetch(`/api/bookings?bookingId=${bookingId}`);
        const data = await response.json();
        
        if (data.bookings && data.bookings[0]) {
          const bookingData = data.bookings[0];
          if (bookingData.status === 'confirmed') {
            setStatus('success');
            setBooking({
              id: bookingData.id,
              booking_reference: bookingData.booking_reference,
              farm_name: bookingData.farm_name,
              activity_name: bookingData.activity_name,
              booking_date: bookingData.booking_date,
              participants: bookingData.participants,
              total_amount: parseFloat(bookingData.total_amount),
              status: bookingData.status,
              google_event_id: bookingData.google_event_id,
            });
          } else {
            setStatus('failed');
          }
        } else {
          setStatus('failed');
        }
      } else {
        // For Pesapal callback
        response = await fetch(`/api/payments/pesapal/status?trackingId=${orderTrackingId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          setStatus('success');
          setBooking(data.booking);
        } else if (data.status === 'failed') {
          setStatus('failed');
        } else {
          setTimeout(verifyPayment, 3000);
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('failed');
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">Payment Successful! 🎉</h1>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. Check your email for details.
            </p>
            
            {booking && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-emerald-900 mb-2">Booking Details</h3>
                <p className="text-sm text-gray-600">Reference: {booking.booking_reference}</p>
                <p className="text-sm text-gray-600">Farm: {booking.farm_name}</p>
                <p className="text-sm text-gray-600">Activity: {booking.activity_name}</p>
                <p className="text-sm text-gray-600">Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Guests: {booking.participants}</p>
                <p className="text-sm text-gray-600 mt-2">Amount: KES {booking.total_amount.toLocaleString()}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => router.push('/visitor/dashboard/bookings')}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/farms')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Explore More Farms
              </button>
            </div>

            {/* Add to Calendar Button - Show if booking exists and no Google event yet */}
            {booking && !booking.google_event_id && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-emerald-600 mb-3">Add this booking to your calendar:</p>
                <AddToCalendar
                  bookingId={booking.id}
                  bookingDate={booking.booking_date}
                  farmName={booking.farm_name}
                  activityName={booking.activity_name}
                  variant="button"
                  className="mx-auto"
                />
              </div>
            )}

            {/* Calendar already added message */}
            {booking && booking.google_event_id && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-emerald-600 flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  This booking has been added to your Google Calendar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            Your payment could not be processed. Please try again.
          </p>
          
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}