// src/app/farmer/schedule/components/BookingDetailsModal.tsx
"use client";

import { useState } from "react";
import { X, Calendar, Clock, Users, User, Mail, Phone, DollarSign, CreditCard } from "lucide-react";

interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  guests_count: number;
  total_amount: number;
  status: string;
  payment_status?: string;
  activity_name: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
}

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onStatusUpdate: (bookingId: number, status: string) => void;
}

export default function BookingDetailsModal({
  booking,
  onClose,
  onStatusUpdate,
}: BookingDetailsModalProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    await onStatusUpdate(booking.id, status);
    setUpdating(false);
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Approved";
      case "pending": return "Pending Approval";
      case "completed": return "Visit Completed";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

 const getPaymentStatus = () => {
  // PAID - visitor paid online
  if (booking.payment_status === "paid") {
    return { color: "bg-green-100 text-green-700", text: "Paid ✅", icon: <CheckCircle className="h-4 w-4" /> };
  } 
  // PENDING CASH - will pay at farm
  else if (booking.payment_status === "pending_cash") {
    return { color: "bg-blue-100 text-blue-700", text: "Pay at Farm", icon: <CreditCard className="h-4 w-4" /> };
  }
  // PENDING - no payment made yet
  else {
    return { color: "bg-yellow-100 text-yellow-700", text: "Payment Due", icon: <Clock className="h-4 w-4" /> };
  }
};

  const paymentStatus = getPaymentStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emerald-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
          {/* Status Badges Row */}
          <div className="flex gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getBookingStatusColor(booking.status)}`}>
              {getBookingStatusText(booking.status)}
            </div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${paymentStatus.color}`}>
              {paymentStatus.icon}
              {paymentStatus.text}
            </div>
          </div>

          {/* Activity Name */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900">
              {booking.activity_name || "Farm Visit"}
            </h4>
          </div>

          {/* Booking Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
            </div>
            {booking.start_time && (
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-emerald-600" />
                <span>
                  {booking.start_time.substring(0, 5)} - {booking.end_time?.substring(0, 5) || "Flexible"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>{booking.guests_count} guests</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <span>KES {booking.total_amount?.toLocaleString() || 0}</span>
            </div>
          </div>

          {/* Visitor Info */}
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-3">Visitor Information</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-600">
                <User className="h-4 w-4 text-gray-400" />
                <span>{booking.visitor_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${booking.visitor_email}`} className="text-emerald-600 hover:underline">
                  {booking.visitor_email}
                </a>
              </div>
              {booking.visitor_phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${booking.visitor_phone}`} className="text-emerald-600 hover:underline">
                    {booking.visitor_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {booking.status !== "completed" && booking.status !== "cancelled" && (
            <div className="border-t border-gray-200 pt-4">
              <h5 className="font-medium text-gray-900 mb-3">Update Status</h5>
              <div className="flex flex-wrap gap-2">
                {booking.status === "pending" && (
                  <button
                    onClick={() => handleStatusUpdate("confirmed")}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    ✓ Approve Booking
                  </button>
                )}
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    ✓ Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  ✗ Cancel Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Missing imports
import { CheckCircle, Clock as ClockIcon } from "lucide-react";