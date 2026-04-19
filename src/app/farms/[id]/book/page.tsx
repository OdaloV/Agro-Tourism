"use client";

import { useState } from "react";
import { useSettings } from "@/lib/hooks/useSettings";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

export default function BookingPage() {
  const { minBookingAmount, maxGuestsPerBooking, loading } = useSettings();
  const [guests, setGuests] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState("");

  // Calculate total amount based on activity price * guests
  const activityPrice = 150; // Example price per person
  const calculatedTotal = activityPrice * guests;

  const handleGuestChange = (value: number) => {
    if (value <= maxGuestsPerBooking) {
      setGuests(value);
      setTotalAmount(value * activityPrice);
      setError("");
    } else {
      setError(`Maximum ${maxGuestsPerBooking} guests allowed per booking`);
    }
  };

  const handleSubmit = async () => {
    if (calculatedTotal < minBookingAmount) {
      setError(`Minimum booking amount is KES ${minBookingAmount}. Current total: KES ${calculatedTotal}`);
      return;
    }
    // Proceed with booking...
  };

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-6"></div>
        
        {/* Guest Selection Skeleton */}
        <div className="mb-4">
          <div className="h-5 w-32 bg-muted rounded-lg animate-pulse mb-2"></div>
          <div className="h-10 w-full bg-muted rounded-xl animate-pulse"></div>
          <div className="h-3 w-48 bg-muted rounded-lg animate-pulse mt-2"></div>
        </div>

        {/* Price Breakdown Skeleton */}
        <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="h-12 w-full bg-muted rounded-xl animate-pulse"></div>

        {/* Info Box Skeleton */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2"></div>
          <div className="space-y-1">
            <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-3 w-52 bg-muted rounded animate-pulse"></div>
            <div className="h-3 w-44 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book Your Experience</h1>
      
      {/* Guest Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Number of Guests</label>
        <input
          type="number"
          min="1"
          max={maxGuestsPerBooking}
          value={guests}
          onChange={(e) => handleGuestChange(parseInt(e.target.value))}
          className="w-full px-4 py-2 border rounded-xl"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum {maxGuestsPerBooking} guests per booking</p>
        {guests === maxGuestsPerBooking && (
          <p className="text-amber-600 text-xs mt-1">
            Maximum {maxGuestsPerBooking} guests reached
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        <p className="flex justify-between">
          <span>Price per person:</span>
          <span>KES {activityPrice}</span>
        </p>
        <p className="flex justify-between font-bold mt-2">
          <span>Total:</span>
          <span>KES {calculatedTotal}</span>
        </p>
        {calculatedTotal < minBookingAmount && (
          <p className="text-red-500 text-sm mt-2">
            Minimum booking: KES {minBookingAmount}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={calculatedTotal < minBookingAmount || guests > maxGuestsPerBooking}
        className={`w-full py-3 rounded-xl font-medium transition ${
          calculatedTotal >= minBookingAmount && guests <= maxGuestsPerBooking
            ? 'bg-accent hover:bg-accent/90 text-white'
            : 'bg-gray-300 cursor-not-allowed text-gray-500'
        }`}
      >
        Book Now
      </button>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 Booking Info:
        </p>
        <ul className="text-xs text-blue-600 mt-1 space-y-1">
          <li>• Minimum booking amount: KES {minBookingAmount}</li>
          <li>• Maximum guests per booking: {maxGuestsPerBooking}</li>
          <li>• Platform fee: 10% (included in price)</li>
        </ul>
      </div>
    </div>
  );
}