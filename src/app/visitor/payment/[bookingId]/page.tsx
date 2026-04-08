// src/app/visitor/payment/[bookingId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Smartphone, Banknote, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    // Load user phone number from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.phone) {
          setPhoneNumber(user.phone);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings?bookingId=${bookingId}`);
      const data = await response.json();
      if (data.bookings && data.bookings[0]) {
        setBooking(data.bookings[0]);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      alert("Please enter your M-Pesa phone number");
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          phoneNumber: phoneNumber,
          paymentMethod: 'mpesa'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('STK Push sent to your phone. Enter your PIN to complete payment.');
        // Redirect to bookings page after successful payment
        setTimeout(() => {
          router.push('/visitor/dashboard/bookings');
        }, 3000);
      } else {
        alert(data.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          paymentMethod: 'cash'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Booking confirmed! Please pay cash at the farm.");
        router.push("/visitor/dashboard/bookings");
      } else {
        alert("Failed to confirm booking");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "cash") {
      handleCashPayment();
    } else if (paymentMethod === "mpesa") {
      handleMpesaPayment();
    } else if (paymentMethod === "card") {
      alert("Card payments coming soon. Please use M-Pesa or Cash.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Booking not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h1 className="text-2xl font-bold text-emerald-900">Complete Payment</h1>
            <p className="text-emerald-600 mt-1">Booking: {booking.booking_reference}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Farm</span>
                  <span className="font-medium">{booking.farm_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activity</span>
                  <span className="font-medium">{booking.activity_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants</span>
                  <span className="font-medium">{booking.participants} guests</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Total Amount</span>
                  <span className="text-emerald-600 text-lg">
                    {booking.currency || 'KES'} {parseFloat(booking.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
              <div className="space-y-3">
                {/* M-Pesa */}
                <div className="border rounded-xl p-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={paymentMethod === "mpesa"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-emerald-600"
                    />
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">M-Pesa</p>
                      <p className="text-xs text-gray-500">Pay using M-Pesa STK Push</p>
                    </div>
                  </label>
                  
                  {/* Phone Number Input - shows only when M-Pesa is selected */}
                  {paymentMethod === "mpesa" && (
                    <div className="mt-3 ml-8 pl-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You will receive an STK Push on this number
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash on Arrival */}
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600"
                  />
                  <Banknote className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Cash on Arrival</p>
                    <p className="text-xs text-gray-500">Pay at the farm</p>
                  </div>
                </label>

                {/* Card - Coming Soon */}
                <label className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50 opacity-60 cursor-not-allowed">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    disabled
                    className="text-emerald-600"
                  />
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Pay {booking.currency || 'KES'} {parseFloat(booking.total_amount).toLocaleString()}
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By completing this payment, you agree to our Terms of Service and Cancellation Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}