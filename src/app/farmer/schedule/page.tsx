// src/app/farmer/schedule/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  RefreshCw,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3x3,
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
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
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
        setSummary(data.summary);
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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <p className="text-sm text-gray-500">Today's Bookings</p>
            <p className="text-2xl font-bold text-emerald-900">{summary.today_count}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-emerald-900">{summary.upcoming_count}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">{summary.pending_count}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-emerald-900">{summary.total_bookings}</p>
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading schedule...</p>
          </div>
        ) : (
          <>
            <CalendarHeader
              currentDate={currentDate}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              onToday={handleToday}
            />
            
            {viewMode === "list" ? (
              <UpcomingBookings
                bookings={bookings}
                onBookingClick={handleBookingClick}
              />
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