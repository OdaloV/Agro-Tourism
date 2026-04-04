// src/app/farmer/group-bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Download,
  TrendingUp,
  Mail,
  Phone,
  User,
  Building,
} from "lucide-react";

interface GroupBooking {
  id: number;
  farmId: number;
  farmName: string;
  activityName: string;
  bookingDate: string;
  guestsCount: number;
  groupName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  totalAmount: number;
  discountPercentage: number;
  originalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "quote_requested";
  specialRequests: string;
  createdAt: string;
  requiresQuote: boolean;
  quoteStatus?: "pending" | "accepted" | "rejected" | "expired";
  customQuote?: {
    amount: number;
    message: string;
    validUntil: string;
  };
}

export default function FarmerGroupBookings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [customQuote, setCustomQuote] = useState({
    amount: 0,
    message: "",
    validUntil: ""
  });
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "quote_requested">("all");
  const [stats, setStats] = useState({
    totalGroupBookings: 0,
    pendingQuotes: 0,
    totalGroupRevenue: 0,
    averageGroupSize: 0
  });

  useEffect(() => {
    fetchGroupBookings();
  }, []);

  const fetchGroupBookings = async () => {
    try {
      const response = await fetch('/api/farmer/group-bookings');
      const data = await response.json();
      setGroupBookings(data.bookings || []);
      setStats(data.stats || {
        totalGroupBookings: 0,
        pendingQuotes: 0,
        totalGroupRevenue: 0,
        averageGroupSize: 0
      });
    } catch (error) {
      console.error("Error fetching group bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/farmer/group-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        await fetchGroupBookings();
        alert(`Booking ${status} successfully!`);
      } else {
        alert("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    }
  };

  const handleSendQuote = async (bookingId: number) => {
    if (!customQuote.amount || !customQuote.validUntil) {
      alert("Please provide both custom price and validity date");
      return;
    }

    try {
      const response = await fetch(`/api/farmer/group-bookings/${bookingId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customQuote)
      });
      
      if (response.ok) {
        await fetchGroupBookings();
        setShowQuoteModal(false);
        setCustomQuote({ amount: 0, message: "", validUntil: "" });
        alert("Quote sent to visitor!");
      } else {
        alert("Failed to send quote");
      }
    } catch (error) {
      console.error("Error sending quote:", error);
      alert("Failed to send quote");
    }
  };

  const filteredBookings = groupBookings.filter(booking => {
    if (filter === "all") return true;
    if (filter === "pending") return booking.status === "pending";
    if (filter === "confirmed") return booking.status === "confirmed";
    if (filter === "quote_requested") return booking.requiresQuote && booking.status === "pending";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold text-emerald-900">Group Bookings</h1>
              <p className="text-emerald-600 mt-1">Manage large group inquiries and bookings</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Group Bookings"
            value={stats.totalGroupBookings}
            color="emerald"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Quotes"
            value={stats.pendingQuotes}
            color="amber"
          />
          <StatCard
            icon={DollarSign}
            label="Group Revenue"
            value={`KES ${stats.totalGroupRevenue.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Group Size"
            value={`${stats.averageGroupSize} guests`}
            color="blue"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="All"
          />
          <FilterButton
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
            label="Pending"
          />
          <FilterButton
            active={filter === "confirmed"}
            onClick={() => setFilter("confirmed")}
            label="Confirmed"
          />
          <FilterButton
            active={filter === "quote_requested"}
            onClick={() => setFilter("quote_requested")}
            label="Quote Requests"
          />
        </div>

        {/* Group Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
              <Users className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-600 text-lg mb-2">No group bookings yet</p>
              <p className="text-emerald-500">Group bookings will appear here when visitors inquire</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <GroupBookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onUpdateStatus={handleUpdateStatus}
                onSendQuote={() => {
                  setSelectedBooking(booking);
                  setShowQuoteModal(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Group Booking Details Modal */}
      {selectedBooking && (
        <GroupBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedBooking && (
        <QuoteModal
          booking={selectedBooking}
          customQuote={customQuote}
          setCustomQuote={setCustomQuote}
          onSend={() => handleSendQuote(selectedBooking.id)}
          onClose={() => {
            setShowQuoteModal(false);
            setCustomQuote({ amount: 0, message: "", validUntil: "" });
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">{value}</p>
      <p className="text-sm text-emerald-600 mt-0.5">{label}</p>
    </div>
  );
}

// Filter Button
function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm transition ${
        active
          ? "bg-accent text-white"
          : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
      }`}
    >
      {label}
    </button>
  );
}

// Group Booking Card
function GroupBookingCard({ booking, onViewDetails, onUpdateStatus, onSendQuote }: {
  booking: GroupBooking;
  onViewDetails: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onSendQuote: () => void;
}) {
  const getStatusBadge = () => {
    if (booking.requiresQuote && booking.status === "pending") {
      return <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">Quote Requested</span>;
    }
    switch (booking.status) {
      case "confirmed": return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Confirmed</span>;
      case "pending": return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">Pending</span>;
      case "completed": return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">Completed</span>;
      case "cancelled": return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-semibold text-emerald-900">{booking.groupName || "Group Booking"}</h3>
              {getStatusBadge()}
              {booking.requiresQuote && booking.quoteStatus === "pending" && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">Awaiting Quote</span>
              )}
            </div>
            <p className="text-sm text-emerald-600">{booking.farmName} - {booking.activityName}</p>
            
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-emerald-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(booking.bookingDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {booking.guestsCount} guests
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {booking.coordinatorName}
              </span>
            </div>

            {booking.discountPercentage > 0 && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded-full">
                {booking.discountPercentage}% group discount applied
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-xl font-bold text-accent">KES {booking.totalAmount.toLocaleString()}</p>
            {booking.originalAmount > booking.totalAmount && (
              <p className="text-xs text-gray-400 line-through">KES {booking.originalAmount.toLocaleString()}</p>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={onViewDetails}
                className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                View Details
              </button>
              {booking.requiresQuote && booking.status === "pending" && (
                <button
                  onClick={onSendQuote}
                  className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Send Quote
                </button>
              )}
              {booking.status === "pending" && !booking.requiresQuote && (
                <button
                  onClick={() => onUpdateStatus(booking.id, "confirmed")}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Group Booking Modal
function GroupBookingModal({ booking, onClose, onUpdateStatus }: {
  booking: GroupBooking;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-emerald-900">Group Booking Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Booking ID</label>
              <p className="text-gray-900 font-medium">#{booking.id}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Booking Date</label>
              <p className="text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Farm / Activity</label>
              <p className="text-gray-900">{booking.farmName} - {booking.activityName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Number of Guests</label>
              <p className="text-gray-900 font-semibold">{booking.guestsCount} people</p>
            </div>
          </div>

          {/* Group Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-emerald-900 mb-3">Group Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Group/Organization Name</label>
                <p className="text-gray-900">{booking.groupName || "Not specified"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Coordinator Name</label>
                <p className="text-gray-900">{booking.coordinatorName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Coordinator Email</label>
                <a href={`mailto:${booking.coordinatorEmail}`} className="text-accent hover:underline">
                  {booking.coordinatorEmail}
                </a>
              </div>
              <div>
                <label className="text-xs text-gray-500">Coordinator Phone</label>
                <a href={`tel:${booking.coordinatorPhone}`} className="text-accent hover:underline">
                  {booking.coordinatorPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-emerald-900 mb-3">Pricing Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Price</span>
                <span className="text-gray-900">KES {booking.originalAmount.toLocaleString()}</span>
              </div>
              {booking.discountPercentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Group Discount ({booking.discountPercentage}%)</span>
                  <span>- KES {(booking.originalAmount * booking.discountPercentage / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-accent">KES {booking.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-emerald-900 mb-2">Special Requests</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-3">
            {booking.status === "pending" && !booking.requiresQuote && (
              <button
                onClick={() => onUpdateStatus(booking.id, "confirmed")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Booking
              </button>
            )}
            {booking.status === "pending" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "cancelled")}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Decline Booking
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quote Modal
function QuoteModal({ booking, customQuote, setCustomQuote, onSend, onClose }: {
  booking: GroupBooking;
  customQuote: any;
  setCustomQuote: (quote: any) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-emerald-900">Send Custom Quote</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Amount</label>
            <p className="text-gray-900">KES {booking.originalAmount.toLocaleString()}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Quote Amount</label>
            <input
              type="number"
              value={customQuote.amount}
              onChange={(e) => setCustomQuote({ ...customQuote, amount: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              placeholder="Enter custom price"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message to Visitor</label>
            <textarea
              value={customQuote.message}
              onChange={(e) => setCustomQuote({ ...customQuote, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              placeholder="Add a message explaining the custom quote..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote Valid Until</label>
            <input
              type="date"
              value={customQuote.validUntil}
              onChange={(e) => setCustomQuote({ ...customQuote, validUntil: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-gray-400 mt-1">The quote will expire after this date</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Send Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// Import X icon
import { X } from "lucide-react";