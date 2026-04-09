// src/app/farmer/schedule/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  RefreshCw,
  ChevronRight,
  List,
  Grid3x3,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import BookingDetailsModal from "./components/BookingDetailsModal";
import AvailabilityModal from "./components/AvailabilityModal";
import UpcomingBookings from "./components/UpcomingBookings";

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

interface BlockedDate {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

interface SummaryStats {
  today_count: number;
  upcoming_count: number;
  pending_count: number;
  total_bookings: number;
}

export default function FarmerSchedule() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    today_count: 0,
    upcoming_count: 0,
    pending_count: 0,
    total_bookings: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeList, setActiveList] = useState<"today" | "upcoming" | "pending" | "total" | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);
  
  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const response = await fetch(`/api/farmer/schedule?year=${year}&month=${month}`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
        setBlockedDates(data.blocked_dates || []);
        
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate today's bookings
        const todayCount = (data.bookings || []).filter((b: Booking) => {
          const bookingDate = new Date(b.booking_date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        }).length;
        
        // Calculate upcoming bookings (future dates, excluding today)
        const upcomingCount = (data.bookings || []).filter((b: Booking) => {
          const bookingDate = new Date(b.booking_date);
          bookingDate.setHours(0, 0, 0, 0);
          return (b.status === "confirmed" || b.status === "pending") && bookingDate.getTime() > today.getTime();
        }).length;
        
        const pendingCount = (data.bookings || []).filter((b: Booking) => b.status === "pending").length;
        const totalCount = (data.bookings || []).length;
        
        setSummary({
          today_count: todayCount,
          upcoming_count: upcomingCount,
          pending_count: pendingCount,
          total_bookings: totalCount,
        });
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/farmer/schedule/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchSchedule();
        setSelectedBooking(null);
      } else {
        alert("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    }
  };

  const handleBlockDates = async (startDate: string, endDate: string, reason: string) => {
    try {
      const response = await fetch("/api/farmer/schedule/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: startDate, end_date: endDate, reason }),
      });
      
      if (response.ok) {
        await fetchSchedule();
        setShowAvailabilityModal(false);
        alert("Dates blocked successfully");
      } else {
        alert("Failed to block dates");
      }
    } catch (error) {
      console.error("Error blocking dates:", error);
      alert("Failed to block dates");
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/farmer/schedule/bookings/${bookingId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchSchedule();
        alert("Booking deleted successfully");
      } else {
        alert("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  // Filter logic for different views
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's bookings
  const todayBookingsList = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime();
  });

  // Upcoming bookings (future dates, excluding today)
  const upcomingBookingsList = bookings
    .filter(b => {
      const bookingDate = new Date(b.booking_date);
      bookingDate.setHours(0, 0, 0, 0);
      return (b.status === "confirmed" || b.status === "pending") && bookingDate.getTime() > today.getTime();
    })
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
  
  const pendingBookings = bookings.filter(b => b.status === "pending");

  const totalBookingsList = bookings
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

  const showList = (type: "today" | "upcoming" | "pending" | "total") => {
    setActiveList(type);
    setViewMode("list");
  };

  const getListTitle = () => {
    switch (activeList) {
      case "today": return "Today's Bookings";
      case "upcoming": return "Upcoming Bookings";
      case "pending": return "Pending Approvals";
      case "total": return "All Bookings";
      default: return "";
    }
  };

  const getListData = () => {
    switch (activeList) {
      case "today": return todayBookingsList;
      case "upcoming": return upcomingBookingsList;
      case "pending": return pendingBookings;
      case "total": return totalBookingsList;
      default: return [];
    }
  };

  // Helper function for status colors
  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return { color: "bg-green-100 text-green-700", text: "Approved" };
      case "pending": return { color: "bg-yellow-100 text-yellow-700", text: "Pending" };
      case "completed": return { color: "bg-blue-100 text-blue-700", text: "Done" };
      case "cancelled": return { color: "bg-red-100 text-red-700", text: "Cancelled" };
      default: return { color: "bg-gray-100 text-gray-700", text: status };
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
  if (paymentStatus === "paid") {
    return { color: "bg-green-100 text-green-700", text: "Paid ✅" };  
  } else if (paymentStatus === "pending_cash") {
    return { color: "bg-blue-100 text-blue-700", text: "Pay at Farm" };
  } else {
    return { color: "bg-yellow-100 text-yellow-700", text: "Payment Due" };
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-emerald-900">Schedule</h1>
              <p className="text-emerald-600 mt-1">Manage your bookings and availability</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition"
              >
                <Plus className="h-5 w-5" />
                Block Dates      
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats - Clickable Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Clickable Today's Bookings Card */}
          <div 
            onClick={() => showList("today")}
            className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Bookings</p>
                <p className="text-2xl font-bold text-emerald-900">{summary.today_count}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-400 group-hover:text-emerald-600 transition" />
            </div>
            {summary.today_count > 0 && (
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                Click to view
                <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>
          
          {/* Clickable Upcoming Card */}
          <div 
            onClick={() => showList("upcoming")}
            className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-emerald-900">{summary.upcoming_count}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-400 group-hover:text-emerald-600 transition" />
            </div>
            {summary.upcoming_count > 0 && (
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                Click to view
                <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>
          
          {/* Clickable Pending Approval Card */}
          <div 
            onClick={() => showList("pending")}
            className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-emerald-900">{summary.pending_count}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-emerald-400 group-hover:text-emerald-600 transition" />
            </div>
            {summary.pending_count > 0 && (
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                Click to review
                <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>
          
          {/* Clickable Total Bookings Card */}
          <div 
            onClick={() => showList("total")}
            className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-emerald-900">{summary.total_bookings}</p>
              </div>
              <List className="h-8 w-8 text-emerald-400 group-hover:text-emerald-600 transition" />
            </div>
            {summary.total_bookings > 0 && (
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                Click to view all
                <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>
        </div>

        {/* Dynamic List View - Shows when a card is clicked */}
        {activeList && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-emerald-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeList === "today" && <Calendar className="h-5 w-5 text-emerald-600" />}
                    {activeList === "upcoming" && <Calendar className="h-5 w-5 text-emerald-600" />}
                    {activeList === "pending" && <AlertCircle className="h-5 w-5 text-emerald-600" />}
                    {activeList === "total" && <List className="h-5 w-5 text-emerald-600" />}
                    <h2 className="font-semibold text-emerald-800">
                      {getListTitle()} ({getListData().length})
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveList(null);
                      setViewMode("month");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-4">
                {getListData().length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {activeList} bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getListData().map((booking) => {
                      const bookingStatus = getBookingStatusBadge(booking.status);
                      const paymentStatus = getPaymentStatusBadge(booking.payment_status);
                      return (
                        <div
                          key={booking.id}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition flex items-center justify-between flex-wrap gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{booking.visitor_name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${bookingStatus.color}`}>
                                {bookingStatus.text}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${paymentStatus.color}`}>
                                {paymentStatus.text}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{booking.activity_name}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {booking.guests_count} guests
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                KES {booking.total_amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookingClick(booking)}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2 bg-white rounded-lg border border-emerald-200 p-1">
            <button
              onClick={() => {
                setViewMode("month");
                setActiveList(null);
              }}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                viewMode === "month" && !activeList ? "bg-accent text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid3x3 className="h-4 w-4 inline mr-1" />
              Month
            </button>
            <button
              onClick={() => {
                setViewMode("list");
                setActiveList(null);
              }}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                viewMode === "list" && !activeList ? "bg-accent text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-4 w-4 inline mr-1" />
              List
            </button>
          </div>
        </div>

        {/* Calendar View - Only shows when in month view and no active list */}
        {viewMode === "month" && !activeList && (
          <>
            <CalendarHeader
              currentDate={currentDate}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              onToday={handleToday}
            />
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading schedule...</p>
              </div>
            ) : (
              <CalendarGrid
                currentDate={currentDate}
                bookings={bookings}
                blockedDates={blockedDates}
                onBookingClick={handleBookingClick}
              />
            )}
          </>
        )}

        {/* List View - Shows all bookings when in list mode */}
        {viewMode === "list" && !activeList && (
          <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-emerald-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-emerald-600" />
                <h2 className="font-semibold text-emerald-800">All Bookings ({bookings.length})</h2>
              </div>
            </div>
            <div className="p-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const bookingStatus = getBookingStatusBadge(booking.status);
                    const paymentStatus = getPaymentStatusBadge(booking.payment_status);
                    return (
                      <div
                        key={booking.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition flex items-center justify-between flex-wrap gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{booking.visitor_name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${bookingStatus.color}`}>
                              {bookingStatus.text}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${paymentStatus.color}`}>
                              {paymentStatus.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{booking.activity_name}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {booking.guests_count} guests
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              KES {booking.total_amount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBookingClick(booking)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <AvailabilityModal
          onClose={() => setShowAvailabilityModal(false)}
          onBlockDates={handleBlockDates}
        />
      )}
    </div>
  );
}