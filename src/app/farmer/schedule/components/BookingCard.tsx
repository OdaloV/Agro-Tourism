// src/app/farmer/schedule/components/BookingCard.tsx
"use client";

import { Users } from "lucide-react";

interface BookingCardProps {
  booking: {
    id: number;
    booking_date: string;
    start_time?: string;
    end_time?: string;
    guests_count: number;
    total_amount: number;
    status: string;
    payment_status?: string;
    activity_name: string;
    visitor_name: string;
  };
  onClick: () => void;
}

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  // Booking Status (farmer controls this)
  console.log("🔍 BookingCard received:", { 
    id: booking.id, 
    status: booking.status, 
    payment_status: booking.payment_status,
    fullBooking: booking 
  });
  const getBookingStatus = () => {
    switch (booking.status) {
      case "confirmed": return { color: "bg-green-100 text-green-700", text: "Approved" };
      case "pending": return { color: "bg-yellow-100 text-yellow-700", text: "Pending" };
      case "completed": return { color: "bg-blue-100 text-blue-700", text: "Done" };
      case "cancelled": return { color: "bg-red-100 text-red-700", text: "Cancelled" };
      default: return { color: "bg-gray-100 text-gray-700", text: booking.status };
    }
  };

  // Payment Status (system controls this)
  const getPaymentStatus = () => {
    // Visitor paid online - waiting for farmer approval
    if (booking.payment_status === "paid") {
      return { color: "bg-green-100 text-green-700", text: "Paid ✅" };
    } 
    // Visitor will pay at farm
    else if (booking.payment_status === "pending_cash") {
      return { color: "bg-blue-100 text-blue-700", text: "Pay at Farm" };
    }
    // No payment made yet
    else {
      return { color: "bg-yellow-100 text-yellow-700", text: "Payment Due" };
    }
  };

  const bookingStatus = getBookingStatus();
  const paymentStatus = getPaymentStatus();

  return (
    <div
      onClick={onClick}
      className="p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer text-xs"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-gray-900 truncate max-w-[80px]">
          {booking.visitor_name?.split(' ')[0]}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${bookingStatus.color}`}>
          {bookingStatus.text}
        </span>
      </div>
      <p className="text-gray-500 truncate text-xs mb-1">{booking.activity_name}</p>
      
      {/* Show both guest count AND payment status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Users className="h-3 w-3" />
          <span>{booking.guests_count}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${paymentStatus.color}`}>
          {paymentStatus.text}
        </span>
      </div>
    </div>
  );
}