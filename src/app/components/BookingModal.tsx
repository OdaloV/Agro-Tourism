// src/app/components/BookingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Users, Clock, MessageCircle, Smartphone } from "lucide-react";
import PriceCalculator from "./PriceCalculator";


interface Activity {
  id: number;
  name: string;
  price: number;
  currency: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  farmId: number;
  farmName: string;
  onBookingComplete: (booking: any) => void;
}

export default function BookingModal({ isOpen, onClose, activity, farmId, farmName, onBookingComplete }: BookingModalProps) {
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [participants, setParticipants] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requiresQuote, setRequiresQuote] = useState(false);
  const [booking, setBooking] = useState<any>(null); // ADDED: booking state
  const [phoneNumber, setPhoneNumber] = useState(""); // ADDED: phone number for M-Pesa
  
  // User info state for payment
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserEmail(user.email || "");
          setUserPhone(user.phone || "");
          setPhoneNumber(user.phone || ""); // Set phone number from user data
          const nameParts = (user.name || "Guest User").split(" ");
          setUserFirstName(nameParts[0]);
          setUserLastName(nameParts.slice(1).join(" ") || "User");
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
  }, [isOpen]);

  const handlePriceChange = (total: number, count: number, discount: number) => {
    setTotalAmount(total);
    setParticipants(count);
    setDiscountPercent(discount);
  };

  const handleSubmit = async () => {
    if (!bookingDate) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create the booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          activityId: activity.id,
          bookingDate,
          timeSlot,
          participants,
          groupName: participants >= 11 ? groupName : undefined,
          specialRequests,
          contactPhone: userPhone,
          contactEmail: userEmail
        })
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        alert(bookingData.error || "Booking failed");
        setLoading(false);
        return;
      }

      if (bookingData.requiresQuote) {
        alert("Quote request sent! The farmer will respond within 24 hours.");
        onClose();
        setLoading(false);
        return;
      }

      // Store the booking data
      setBooking(bookingData.booking);
      
      // Step 2: Initiate payment with M-Pesa
      const paymentResponse = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          phoneNumber: phoneNumber || userPhone,
          paymentMethod: 'mpesa'
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.success) {
        if (paymentData.redirectUrl) {
          // For Pesapal (if still used) - redirect
          window.location.href = paymentData.redirectUrl;
        } else {
          // For M-Pesa Daraja - STK Push sent
          alert('STK Push sent to your phone. Enter your PIN to complete payment.');
          onBookingComplete(bookingData.booking);
          onClose();
          // Redirect to bookings page
          window.location.href = '/visitor/dashboard/bookings';
        }
      } else {
        alert(paymentData.error || "Payment initiation failed");
        setLoading(false);
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isLargeGroup = participants >= 51;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-emerald-900">Book {activity.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Date
            </label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* M-Pesa Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">You will receive an STK Push on this number</p>
          </div>

          <PriceCalculator
            pricePerPerson={activity.price}
            currency={activity.currency}
            onPriceChange={handlePriceChange}
          />

          {participants >= 11 && participants <= 50 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group/Organization Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., ABC School, Company Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Special Requests (Optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              placeholder="Dietary restrictions, accessibility needs, special arrangements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          {activity.duration_minutes > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Duration: {activity.duration_minutes} minutes
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || (isLargeGroup && !requiresQuote)}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : isLargeGroup ? "Request Quote" : "Proceed to Payment"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            {isLargeGroup 
              ? "Large groups require farmer approval. You'll receive a custom quote within 24 hours."
              : "You'll receive an STK Push on your phone to complete payment"}
          </p>
        </div>
      </div>
    </div>
  );
}