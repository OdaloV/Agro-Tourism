// src/app/farmer/schedule/components/UpcomingBookings.tsx
"use client";

import { Calendar, Users, Clock, Trash2 } from "lucide-react";
import { Booking } from "../types";

interface UpcomingBookingsProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onDeleteBooking?: (bookingId: number) => void;
}

export default function UpcomingBookings({
  bookings,
  onBookingClick,
  onDeleteBooking,
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "pending": return "Pending";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  // Filter to show only upcoming (not completed or cancelled)
  const upcomingBookings = bookings
    .filter(b => b.status !== "completed" && b.status !== "cancelled")
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

  const handleDelete = async (e: React.MouseEvent, bookingId: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this booking?")) {
      if (onDeleteBooking) {
        await onDeleteBooking(bookingId);
      }
    }
  };

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
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
        <h3 className="text-lg font-semibold text-emerald-900">Upcoming Bookings</h3>
        <p className="text-sm text-emerald-500 mt-1">
          {upcomingBookings.length} booking{upcomingBookings.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>
      <div className="divide-y divide-emerald-100">
        {upcomingBookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() => onBookingClick(booking)}
            className="p-4 hover:bg-gray-50 transition cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-medium text-emerald-900">
                    {booking.activity_name || "Farm Visit"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </span>
                  {booking.start_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      {booking.start_time.substring(0, 5)} - {booking.end_time?.substring(0, 5) || "Flexible"}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-emerald-500" />
                    {booking.guests_count} guests
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Visitor:</span> {booking.visitor_name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleDelete(e, booking.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Delete booking"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}