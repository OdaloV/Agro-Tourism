// src/app/farmer/schedule/components/UpcomingBookings.tsx
"use client";

import { Calendar, Users, Clock } from "lucide-react";
import { Booking } from "../types";

interface UpcomingBookingsProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export default function UpcomingBookings({
  bookings,
  onBookingClick,
}: UpcomingBookingsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const upcomingBookings = bookings
    .filter(b => b.status !== "completed" && b.status !== "cancelled")
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
    .slice(0, 5);

  if (upcomingBookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Upcoming Bookings</h3>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming bookings</p>
          <p className="text-sm text-gray-400 mt-1">New bookings will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
      <h3 className="text-lg font-semibold text-emerald-900 mb-4">Upcoming Bookings</h3>
      <div className="space-y-3">
        {upcomingBookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() => onBookingClick(booking)}
            className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl cursor-pointer hover:bg-emerald-100 transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-emerald-900">
                  {booking.activity_name || "Farm Visit"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(booking.booking_date).toLocaleDateString()}
                </span>
                {booking.start_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.start_time.substring(0, 5)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {booking.guests_count} guests
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{booking.visitor_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}