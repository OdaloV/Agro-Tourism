// src/app/farmer/schedule/components/CalendarGrid.tsx
"use client";

import { useState } from "react";
import  BookingCard  from "./BookingCard";
import { Booking, BlockedDate } from "../types";

interface CalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onBookingClick: (booking: Booking) => void;
}

export default function CalendarGrid({
  currentDate,
  bookings,
  blockedDates,
  onBookingClick,
}: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    // Add previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    // Add next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push(nextDate);
    }
    
    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.booking_date === dateStr);
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(blocked => 
      dateStr >= blocked.start_date && dateStr <= blocked.end_date
    );
  };

  const getBlockedReason = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const blocked = blockedDates.find(b => 
      dateStr >= b.start_date && dateStr <= b.end_date
    );
    return blocked?.reason;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-emerald-50 border-b border-emerald-100">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-emerald-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-min">
        {days.map((date, index) => {
          const dateBookings = getBookingsForDate(date);
          const blocked = isDateBlocked(date);
          const blockedReason = getBlockedReason(date);
          const isCurrent = isCurrentMonth(date);
          const today = isToday(date);
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-emerald-100 transition ${
                !isCurrent ? "bg-gray-50" : "hover:bg-emerald-50/30"
              } ${today ? "bg-emerald-50" : ""}`}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium ${
                    !isCurrent
                      ? "text-gray-400"
                      : today
                      ? "text-accent font-bold"
                      : "text-gray-700"
                  }`}
                >
                  {date.getDate()}
                </span>
                {blocked && (
                  <span className="text-xs text-red-500" title={blockedReason}>
                    🚫
                  </span>
                )}
              </div>

              {/* Bookings */}
              <div className="space-y-1">
                {dateBookings.slice(0, 3).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onClick={() => onBookingClick(booking)}
                  />
                ))}
                {dateBookings.length > 3 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{dateBookings.length - 3} more
                  </div>
                )}
                {blocked && dateBookings.length === 0 && (
                  <div className="text-xs text-red-400 text-center mt-2">
                    Unavailable
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}