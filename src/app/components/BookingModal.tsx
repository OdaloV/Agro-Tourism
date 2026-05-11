"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, MessageCircle, Smartphone, CalendarCheck } from "lucide-react";
import PriceCalculator from "./PriceCalculator";
import { useCsrf } from "@/hooks/useCsrf";

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

interface GroupSettings {
  max_guests_per_booking: number;
  daily_capacity: number;
  discount_tiers: Array<{
    min_guests: number;
    discount_percent: number;
  }>;
  advance_notice_days: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  requirements: {
    require_deposit: boolean;
    require_waiver: boolean;
    require_coordinator: boolean;
  };
}

export default function BookingModal({ isOpen, onClose, activity, farmId, farmName, onBookingComplete }: BookingModalProps) {
  const csrfToken = useCsrf();

  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [participants, setParticipants] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requiresQuote, setRequiresQuote] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(true);

  const [groupSettings, setGroupSettings] = useState<GroupSettings | null>(null);
  const [showGroupWarning, setShowGroupWarning] = useState(false);
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState(0);

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");

  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserEmail(user.email || "");
          setUserPhone(user.phone || "");
          setPhoneNumber(user.phone || "");
          const nameParts = (user.name || "Guest User").split(" ");
          setUserFirstName(nameParts[0]);
          setUserLastName(nameParts.slice(1).join(" ") || "User");
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && farmId) {
      fetchGroupSettings();
    }
  }, [isOpen, farmId]);

  const fetchGroupSettings = async () => {
    try {
      const response = await fetch(`/api/farms/${farmId}/group-settings`);
      if (response.ok) {
        const data = await response.json();
        setGroupSettings(data);
      }
    } catch (error) {
      console.error('Error fetching group settings:', error);
    }
  };

  const getDiscountPercentFromTiers = (guestCount: number) => {
    if (!groupSettings?.discount_tiers) return 0;
    let highestDiscount = 0;
    for (const tier of groupSettings.discount_tiers) {
      if (guestCount >= tier.min_guests && tier.discount_percent > highestDiscount) {
        highestDiscount = tier.discount_percent;
      }
    }
    return highestDiscount;
  };

  const getAdvanceNoticeRequired = (guestCount: number) => {
    if (!groupSettings?.advance_notice_days) return 0;
    if (guestCount >= 50) return groupSettings.advance_notice_days.tier3;
    if (guestCount >= 21) return groupSettings.advance_notice_days.tier2;
    if (guestCount >= 11) return groupSettings.advance_notice_days.tier1;
    return 0;
  };

  useEffect(() => {
    const required = getAdvanceNoticeRequired(participants);
    setAdvanceNoticeDays(required);
    if (bookingDate && required > 0) {
      const selectedDate = new Date(bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDifference = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      setShowGroupWarning(daysDifference < required);
    } else {
      setShowGroupWarning(false);
    }
  }, [participants, bookingDate]);

  const handlePriceChange = (total: number, count: number, discount: number) => {
    setTotalAmount(total);
    setParticipants(count);
    setDiscountPercent(discount);
  };

  const dynamicDiscount = getDiscountPercentFromTiers(participants);

  const formatPhoneNumber = (raw: string): string => {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '254' + digits.slice(1);
    else if (digits.length === 9 && digits.startsWith('7')) digits = '254' + digits;
    if (digits.length !== 12 || !digits.startsWith('254')) return '';
    return digits;
  };

  const handleSubmit = async () => {
    if (!bookingDate) { alert("Please select a date"); return; }
    if (showGroupWarning) {
      alert(`Groups of this size require ${advanceNoticeDays} days advance notice. Please select a later date.`);
      return;
    }
    if (participants >= 50 && groupSettings?.requirements.require_waiver && !waiverAccepted) {
      alert("Please accept the waiver requirement to continue.");
      return;
    }

    let finalPhone = phoneNumber.trim() || userPhone;
    const formattedPhone = formatPhoneNumber(finalPhone);
    if (!formattedPhone) {
      alert("Please enter a valid phone number (e.g., 0712345678 or 254712345678)");
      return;
    }

    if (!csrfToken) {
      alert("Security token not ready. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          farmId,
          activityId: activity.id,
          bookingDate,
          timeSlot,
          participants,
          groupName: participants >= 11 ? groupName : undefined,
          specialRequests,
          contactPhone: userPhone,
          contactEmail: userEmail,
          discountPercent: dynamicDiscount,
          waiverAccepted: participants >= 50 ? waiverAccepted : undefined,
          addToCalendar,
          durationMinutes: activity.duration_minutes,
          activityName: activity.name,
          farmName,
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

      setBooking(bookingData.booking);

      // Step 2 — Initiate payment
      const paymentResponse = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          phoneNumber: formattedPhone,
          paymentMethod: 'mpesa'
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.success) {
        if (paymentData.redirectUrl) {
          window.location.href = paymentData.redirectUrl;
        } else {
          alert('STK Push sent to your phone. Enter your PIN to complete payment.');
          onBookingComplete(bookingData.booking);
          onClose();
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

          {showGroupWarning && (
            <div className="p-3 bg-amber-100 rounded-lg text-sm text-amber-800">
              ⚠️ Groups of this size require {advanceNoticeDays} days advance notice. Please select a later date.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678 or 254712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">We'll send an STK push to this number.</p>
          </div>

          <PriceCalculator
            pricePerPerson={activity.price}
            currency={activity.currency}
            onPriceChange={handlePriceChange}
            discountPercent={dynamicDiscount}
          />

          {dynamicDiscount > 0 && (
            <div className="p-2 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-700">🎉 {dynamicDiscount}% group discount applied!</p>
            </div>
          )}

          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
            <input
              type="checkbox"
              id="addToCalendar"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="addToCalendar" className="flex items-center gap-2 text-sm text-emerald-700 cursor-pointer">
              <CalendarCheck className="h-4 w-4" />
              Add to Google Calendar
            </label>
          </div>

          {participants >= 11 && participants <= 50 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group/Organization Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., ABC School, Company Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {participants >= 50 && groupSettings?.requirements.require_deposit && (
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">💰 A 50% deposit is required for groups of 50+ guests.</p>
            </div>
          )}

          {participants >= 50 && groupSettings?.requirements.require_waiver && (
            <div className="p-3 bg-emerald-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-emerald-700">I agree to sign a waiver for this group visit</span>
              </label>
            </div>
          )}

          {participants >= 50 && groupSettings?.requirements.require_coordinator && (
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                📋 As the person making this booking, you will be the group coordinator.
                The farmer will contact you using the information from your profile.
              </p>
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
            disabled={loading || (isLargeGroup && !requiresQuote) || showGroupWarning || (participants >= 50 && groupSettings?.requirements.require_waiver && !waiverAccepted)}
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
