// src/app/visitor/dashboard/components/BookingCard.tsx
import { Calendar, Users, DollarSign, RefreshCw, X } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: number;
  farmId: number;
  farmName: string;
  activity: string;
  date: string;
  participants: number;
  status: "confirmed" | "pending" | "cancelled" | "waitlisted";
  totalPrice: number;
  specialRequests?: string;
  waitlistPosition?: number;
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
  onReschedule?: (id: number) => void;
  onAddSpecialRequest?: (id: number) => void;
}

export function BookingCard({ booking, onCancel, onReschedule, onAddSpecialRequest }: BookingCardProps) {
  const statusColors = {
    confirmed: "bg-green-100 text-green-600",
    pending: "bg-amber-100 text-amber-600",
    cancelled: "bg-red-100 text-red-600",
    waitlisted: "bg-blue-100 text-blue-600",
  };

  const isWaitlisted = booking.status === "waitlisted";

  return (
    <div className="border border-emerald-100 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-emerald-900">{booking.farmName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
              {booking.status}
            </span>
            {isWaitlisted && booking.waitlistPosition && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Waitlist #{booking.waitlistPosition}
              </span>
            )}
          </div>
          <p className="text-sm text-emerald-600">{booking.activity}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-emerald-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(booking.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {booking.participants} guests
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              KES {booking.totalPrice.toLocaleString()}
            </span>
          </div>
          {booking.specialRequests && (
            <p className="mt-2 text-xs text-emerald-500 bg-emerald-50 p-2 rounded-lg">
              <span className="font-medium">Special Request:</span> {booking.specialRequests}
            </p>
          )}
          {isWaitlisted && (
            <p className="mt-2 text-xs text-blue-500 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-pulse" />
              You'll be notified when a spot becomes available
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isWaitlisted && booking.status !== "cancelled" && (
            <>
              <button
                onClick={() => onAddSpecialRequest?.(booking.id)}
                className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Special Request
              </button>
              <button
                onClick={() => onReschedule?.(booking.id)}
                className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Reschedule
              </button>
              <button
                onClick={() => onCancel?.(booking.id)}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                Cancel
              </button>
            </>
          )}
          {isWaitlisted && (
            <Link href={`/farms/${booking.farmId}`}>
              <button className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg">
                View Farm
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}