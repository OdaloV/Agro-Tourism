// src/app/farmer/earnings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  Calendar,
  Download,
  ChevronLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  Users,
  Trash2,
} from "lucide-react";

interface Earning {
  id: number;
  bookingId: number;
  activityName: string;
  bookingDate: string;
  guests: number;
  totalAmount: number;
  platformFee: number;
  farmerEarning: number;
  paymentStatus: string;
  paidAt: string;
}

interface EarningSummary {
  totalEarnings: number;
  pendingEarnings: number;
  completedEarnings: number;
  totalBookings: number;
  totalGuests: number;
}

export default function FarmerEarnings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<EarningSummary>({
    totalEarnings: 0,
    pendingEarnings: 0,
    completedEarnings: 0,
    totalBookings: 0,
    totalGuests: 0,
  });
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }

      const response = await fetch("/api/farmer/earnings");
      const data = await response.json();

      if (response.ok) {
        setEarnings(data.earnings || []);
        setSummary(data.summary || {
          totalEarnings: 0,
          pendingEarnings: 0,
          completedEarnings: 0,
          totalBookings: 0,
          totalGuests: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEarning = async (earningId: number, bookingId: number) => {
    if (!confirm("Are you sure you want to delete this earning record? This action cannot be undone.")) {
      return;
    }

    setDeletingId(earningId);
    try {
      const response = await fetch(`/api/farmer/earnings/${earningId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setEarnings(earnings.filter(e => e.id !== earningId));
        alert("Earning record deleted successfully");
        // Refresh summary
        await fetchEarnings();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete earning record");
      }
    } catch (error) {
      console.error("Error deleting earning:", error);
      alert("Failed to delete earning record");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const filteredEarnings = earnings.filter(earning => {
    if (filter !== "all" && earning.paymentStatus !== filter) return false;
    if (dateRange.start && new Date(earning.bookingDate) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(earning.bookingDate) > new Date(dateRange.end)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Earnings</h1>
              <p className="text-emerald-600 mt-1">Track your farm income and payouts</p>
            </div>
            <button
              onClick={() => window.location.href = '/api/farmer/earnings/export'}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Earnings"
            value={formatCurrency(summary.totalEarnings)}
            icon={DollarSign}
            color="emerald"
          />
          <SummaryCard
            title="Pending Payout"
            value={formatCurrency(summary.pendingEarnings)}
            icon={Clock}
            color="amber"
          />
          <SummaryCard
            title="Completed Payout"
            value={formatCurrency(summary.completedEarnings)}
            icon={CheckCircle}
            color="green"
          />
          <SummaryCard
            title="Total Bookings"
            value={summary.totalBookings.toString()}
            icon={Calendar}
            color="blue"
            suffix="bookings"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Total Guests</p>
                <p className="text-2xl font-bold text-emerald-900">{summary.totalGuests}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Platform Fee (10%)</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(summary.totalEarnings / 9)} 
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Next Payout</p>
                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(summary.pendingEarnings)}</p>
              </div>
              <Wallet className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Avg per Booking</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {summary.totalBookings > 0 
                    ? formatCurrency(summary.totalEarnings / summary.totalBookings)
                    : 'KES 0'}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
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
                active={filter === "completed"}
                onClick={() => setFilter("completed")}
                label="Completed"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        {filteredEarnings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <DollarSign className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No earnings yet</p>
            <p className="text-emerald-500 mb-6">When visitors book and pay for your activities, earnings will appear here</p>
            <Link href="/farmer/activities">
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl">
                Manage Activities
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Activity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Guests</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-emerald-900">Total</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-emerald-900">Platform Fee</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-emerald-900">Your Earnings</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-emerald-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {filteredEarnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-emerald-50/30 transition">
                      <td className="px-6 py-4 text-sm text-emerald-700">
                        {new Date(earning.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-800 font-medium">
                        {earning.activityName}
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-600">
                        {earning.guests}
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-700 text-right">
                        {formatCurrency(earning.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-500 text-right">
                        -{formatCurrency(earning.platformFee)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-700 text-right">
                        {formatCurrency(earning.farmerEarning)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          earning.paymentStatus === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {earning.paymentStatus === 'completed' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {earning.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteEarning(earning.id, earning.bookingId)}
                          disabled={deletingId === earning.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete earning record"
                        >
                          {deletingId === earning.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon: Icon, color, suffix = "" }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  suffix?: string;
}) {
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
      <p className="text-sm text-emerald-600 mt-0.5">{title} {suffix}</p>
    </div>
  );
}

// Filter Button Component
function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm transition-all ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
      }`}
    >
      {label}
    </button>
  );
}