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
  const getBookingStatus = (status: string) => {
    switch (status) {
      case "confirmed": return { color: "bg-emerald-700 text-white", text: "Approved" };
      case "pending": return { color: "bg-amber-600 text-white", text: "Pending" };
      case "completed": return { color: "bg-blue-700 text-white", text: "Done" };
      case "cancelled": return { color: "bg-red-700 text-white", text: "Cancelled" };
      default: return { color: "bg-gray-600 text-white", text: status };
    }
  };

  const getPaymentStatus = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case "held": return { color: "bg-emerald-700 text-white", text: "Paid" };
      case "released": return { color: "bg-teal-700 text-white", text: "Released" };
      case "refunded": return { color: "bg-red-700 text-white", text: "Refunded" };
      case "paid": return { color: "bg-green-700 text-white", text: "Paid" };
      case "pending_cash": return { color: "bg-blue-700 text-white", text: "Pay at Farm" };
      default: return { color: "bg-orange-600 text-white", text: "Due" };
    }
  };

  const bookingStatus = getBookingStatus(booking.status);
  const paymentStatus = getPaymentStatus(booking.payment_status);

  return (
    <div
      onClick={onClick}
      className="p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer text-xs"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-gray-900 truncate max-w-[80px]">
          {booking.visitor_name?.split(' ')[0]}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${bookingStatus.color}`}>
          {bookingStatus.text}
        </span>
      </div>
      <p className="text-gray-500 truncate text-xs mb-1">{booking.activity_name}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Users className="h-3 w-3" />
          <span>{booking.guests_count}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${paymentStatus.color}`}>
          {paymentStatus.text}
        </span>
      </div>
    </div>
  );
}
