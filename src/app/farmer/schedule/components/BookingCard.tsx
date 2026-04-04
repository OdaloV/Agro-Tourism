// src/app/farmer/schedule/components/BookingCard.tsx
"use client";

interface BookingCardProps {
  booking: {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    guests_count: number;
    status: string;
    activity_name: string;
    visitor_name: string;
  };
  onClick: () => void;
}

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return "✓";
      case "pending": return "⏳";
      case "completed": return "✅";
      case "cancelled": return "✗";
      default: return "📅";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`text-xs p-1.5 rounded-md cursor-pointer transition-all hover:shadow-md ${getStatusColor(booking.status)} border`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium truncate">{booking.activity_name || "Farm Visit"}</span>
        <span>{getStatusIcon(booking.status)}</span>
      </div>
      <div className="flex items-center justify-between text-xs mt-0.5">
        <span>{booking.guests_count} guests</span>
        {booking.start_time && (
          <span>{booking.start_time.substring(0, 5)}</span>
        )}
      </div>
    </div>
  );
}