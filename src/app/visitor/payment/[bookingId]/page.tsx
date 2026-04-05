// src/app/visitor/payment/[bookingId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Smartphone, Banknote, CheckCircle, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
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

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          paymentMethod,
          amount: booking.total_amount,
          currency: booking.currency
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (paymentMethod === "mpesa") {
          // Initiate STK Push
          alert("STK Push sent to your phone. Please check your M-Pesa and enter PIN.");
          // Poll for payment status
          setTimeout(() => {
            router.push("/visitor/dashboard/bookings");
          }, 5000);
        } else if (paymentMethod === "card") {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl;
        } else {
          // Cash on arrival
          alert("Booking confirmed! Please pay at the farm.");
          router.push("/visitor/dashboard/bookings");
        }
      } else {
        alert(data.error || "Payment failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                {booking.discount_percent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({booking.discount_percent}%)</span>
                    <span>- {booking.currency} {((booking.original_amount - booking.total_amount)).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Total Amount</span>
                  <span className="text-emerald-600 text-lg">
                    {booking.currency} {booking.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    checked={paymentMethod === "mpesa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600"
                  />
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">M-Pesa</p>
                    <p className="text-xs text-gray-500">Pay with M-Pesa STK Push</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600"
                  />
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                  </div>
                </label>

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
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Pay {booking.currency} {booking.total_amount.toLocaleString()}
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