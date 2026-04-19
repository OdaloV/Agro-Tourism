"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  ChevronLeft,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import AddToCalendar from "@/app/components/AddToCalendar";
import { Skeleton, BookingCardSkeleton } from "@/components/ui/Skeleton";

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
  googleEventId?: string;
}

export default function VisitorBookings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "waitlisted">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showSpecialRequestModal, setShowSpecialRequestModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [specialRequest, setSpecialRequest] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/auth/login/visitor");
          return;
        }

        const response = await fetch('/api/bookings');
        const data = await response.json();
        
        if (response.ok) {
          const realBookings: Booking[] = (data.bookings || []).map((b: any) => ({
            id: b.id,
            farmId: b.farm_id,
            farmName: b.farm_name,
            activity: b.activity_name,
            date: b.booking_date,
            participants: b.participants,
            status: b.status,
            totalPrice: parseFloat(b.total_amount),
            specialRequests: b.special_requests,
            waitlistPosition: b.waitlist_position,
            googleEventId: b.google_event_id,
          }));
          
          setBookings(realBookings);
        } else {
          console.error("Failed to fetch bookings:", data.error);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [router, mounted]);

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "pending") &&
      new Date(b.date) >= new Date()
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.date) < new Date() && b.status !== "cancelled"
  );

  const waitlistedBookings = bookings.filter((b) => b.status === "waitlisted");

  const handleCancel = async (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (response.ok) {
          setBookings(
            bookings.map((b) =>
              b.id === bookingId ? { ...b, status: "cancelled" } : b
            )
          );
          alert("Booking cancelled. Refund will be processed within 5-7 business days.");
        } else {
          alert("Failed to cancel booking");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  const handleDelete = async (bookingId: number, status: string) => {
    if (status === 'confirmed') {
      alert('Cannot delete a confirmed booking. Please cancel instead.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== bookingId));
        alert('Booking deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReschedule = (bookingId: number) => {
    alert("Reschedule request sent. Farmer will confirm availability.");
  };

  const handleAddSpecialRequest = () => {
    if (selectedBooking && specialRequest.trim()) {
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id
            ? { ...b, specialRequests: specialRequest }
            : b
        )
      );
      alert("Special request sent to farmer!");
      setShowSpecialRequestModal(false);
      setSpecialRequest("");
      setSelectedBooking(null);
    }
  };

  const handleRebook = (booking: Booking) => {
    router.push(`/farms/${booking.farmId}`);
  };

  const handleWriteReview = (booking: Booking) => {
    router.push(`/visitor/dashboard/reviews?farmId=${booking.farmId}&bookingId=${booking.id}`);
  };

  // Loading skeleton
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 border-b border-emerald-200 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-t-xl" />
            ))}
          </div>

          {/* Bookings List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-bold text-emerald-900">My Bookings</h1>
          <p className="text-emerald-600 mt-1">Manage your farm experiences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-emerald-200 mb-6">
          <TabButton
            active={activeTab === "upcoming"}
            onClick={() => setActiveTab("upcoming")}
            label="Upcoming"
            count={upcomingBookings.length}
          />
          <TabButton
            active={activeTab === "past"}
            onClick={() => setActiveTab("past")}
            label="Past"
            count={pastBookings.length}
          />
          <TabButton
            active={activeTab === "waitlisted"}
            onClick={() => setActiveTab("waitlisted")}
            label="Waitlisted"
            count={waitlistedBookings.length}
          />
        </div>

        {/* Upcoming Bookings Tab */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming bookings"
                description="Book a farm experience to see it here"
                buttonText="Discover Farms"
                buttonLink="/farms"
              />
            ) : (
              upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onReschedule={handleReschedule}
                  onSpecialRequest={(b) => {
                    setSelectedBooking(b);
                    setSpecialRequest(b.specialRequests || "");
                    setShowSpecialRequestModal(true);
                  }}
                  isDeleting={deletingId === booking.id}
                />
              ))
            )}
          </div>
        )}

        {/* Past Bookings Tab */}
        {activeTab === "past" && (
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No past bookings"
                description="Your booking history will appear here"
                buttonText="Discover Farms"
                buttonLink="/farms"
              />
            ) : (
              pastBookings.map((booking) => (
                <PastBookingCard
                  key={booking.id}
                  booking={booking}
                  onRebook={handleRebook}
                  onWriteReview={handleWriteReview}
                  onDelete={handleDelete}
                  isDeleting={deletingId === booking.id}
                />
              ))
            )}
          </div>
        )}

        {/* Waitlisted Bookings Tab */}
        {activeTab === "waitlisted" && (
          <div className="space-y-4">
            {waitlistedBookings.length === 0 ? (
              <EmptyState
                icon={RefreshCw}
                title="No waitlisted bookings"
                description="You'll see waitlisted experiences here"
                buttonText="Discover Farms"
                buttonLink="/farms"
              />
            ) : (
              waitlistedBookings.map((booking) => (
                <WaitlistCard 
                  key={booking.id} 
                  booking={booking}
                  onDelete={handleDelete}
                  isDeleting={deletingId === booking.id}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Special Request Modal */}
      {showSpecialRequestModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Special Request
              </h3>
              <button
                onClick={() => setShowSpecialRequestModal(false)}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-emerald-600 mb-3">
                For: {selectedBooking.farmName} - {selectedBooking.activity}
              </p>
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                rows={4}
                className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent text-emerald-900"
                placeholder="e.g., Dietary restrictions, accessibility needs, special occasions..."
              />
            </div>
            <div className="p-4 border-t border-emerald-100 flex gap-3">
              <button
                onClick={() => setShowSpecialRequestModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSpecialRequest}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, label, count }: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
        active
          ? "bg-white text-emerald-600 border-t border-l border-r border-emerald-200 -mb-px"
          : "text-emerald-600 hover:bg-emerald-50"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {count > 0 && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active
              ? "bg-emerald-100 text-emerald-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Booking Card Component (Upcoming Bookings)
function BookingCard({ booking, onCancel, onDelete, onReschedule, onSpecialRequest, isDeleting }: { 
  booking: Booking; 
  onCancel: (id: number) => void; 
  onDelete: (id: number, status: string) => void;
  onReschedule: (id: number) => void; 
  onSpecialRequest: (booking: Booking) => void;
  isDeleting: boolean;
}) {
  const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-600",
    pending: "bg-amber-100 text-amber-600",
    cancelled: "bg-red-100 text-red-600",
    waitlisted: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-emerald-900">
                {booking.farmName}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
                {booking.status}
              </span>
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
          </div>
          {booking.status !== "cancelled" && booking.status !== "waitlisted" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSpecialRequest(booking)}
                className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Special Request
              </button>
              <button
                onClick={() => onReschedule(booking.id)}
                className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Reschedule
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(booking.id, booking.status)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="Delete booking"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
              {/* Add to Calendar button for confirmed bookings */}
              {booking.status === "confirmed" && (
                <AddToCalendar
                  bookingId={booking.id}
                  bookingDate={booking.date}
                  farmName={booking.farmName}
                  activityName={booking.activity}
                  variant="icon"
                  className="px-3 py-1.5"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Past Booking Card Component
function PastBookingCard({ booking, onRebook, onWriteReview, onDelete, isDeleting }: { 
  booking: Booking; 
  onRebook: (booking: Booking) => void; 
  onWriteReview: (booking: Booking) => void;
  onDelete: (id: number, status: string) => void;
  isDeleting: boolean;
}) {
  if (booking.status === "cancelled") return null;
  
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-emerald-900">
                {booking.farmName}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {booking.status}
              </span>
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
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onWriteReview(booking)}
              className="px-3 py-1.5 text-sm border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              Write Review
            </button>
            <button
              onClick={() => onRebook(booking)}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Book Again
            </button>
            <button
              onClick={() => onDelete(booking.id, booking.status)}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm bg-gray-50 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              title="Delete past booking"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Waitlist Card Component
function WaitlistCard({ booking, onDelete, isDeleting }: { 
  booking: Booking;
  onDelete: (id: number, status: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/30 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-emerald-900">
                {booking.farmName}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                Waitlisted
              </span>
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
            </div>
            <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-pulse" />
              Position #{booking.waitlistPosition} on waitlist
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/farms/${booking.farmId}`}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                View Farm
              </button>
            </Link>
            <button
              onClick={() => onDelete(booking.id, booking.status)}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm bg-gray-50 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              title="Delete waitlisted booking"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description, buttonText, buttonLink }: { 
  icon: any; 
  title: string; 
  description: string; 
  buttonText: string; 
  buttonLink: string;
}) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
      <Icon className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
      <p className="text-emerald-500 mb-2">{title}</p>
      <p className="text-sm text-emerald-400">{description}</p>
      <Link href={buttonLink}>
        <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm">
          {buttonText}
        </button>
      </Link>
    </div>
  );
}