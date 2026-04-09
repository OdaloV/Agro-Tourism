// src/app/farmer/schedule/components/BookingCard.tsx
"use client";

import { Calendar, Clock, Users, DollarSign } from "lucide-react";

interface BookingCardProps {
  booking: {
    id: number;
    booking_date: string;
    start_time?: string;
    end_time?: string;
    guests_count: number;
    total_amount: number;
    status: string;
    activity_name: string;
    visitor_name: string;
  };
  onClick: () => void;
}

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "pending": return "Pending";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  return (
    <div
      onClick={onClick}
      className="p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer text-xs"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-gray-900 truncate max-w-[80px]">
          {booking.visitor_name?.split(' ')[0]}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
          {getStatusText(booking.status)}
        </span>
      </div>
      <p className="text-gray-500 truncate text-xs mb-1">{booking.activity_name}</p>
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <Users className="h-3 w-3" />
        <span>{booking.guests_count}</span>
      </div>
    </div>
  );
}