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
  Wallet,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { Skeleton, StatCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

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
    completedEarnings: 0,
    totalBookings: 0,
    totalGuests: 0,
  });
  const [filter, setFilter] = useState<"all" | "completed">("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

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

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const filteredEarnings = earnings.filter(earning => {
    if (filter !== "all" && earning.paymentStatus !== filter) return false;
    if (dateRange.start && new Date(earning.bookingDate) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(earning.bookingDate) > new Date(dateRange.end)) return false;
    return true;
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Platform Fee Info Skeleton */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <div className="flex gap-2 ml-auto">
                <Skeleton className="h-10 w-36 rounded-lg" />
                <Skeleton className="h-10 w-36 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <TableSkeleton rows={5} columns={7} />
        </div>
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
              <p className="text-emerald-600 mt-1">Track your farm income from paid bookings</p>
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
            title="Completed Payouts"
            value={formatCurrency(summary.completedEarnings)}
            icon={CheckCircle}
            color="green"
          />
          <SummaryCard
            title="Paid Bookings"
            value={summary.totalBookings.toString()}
            icon={Calendar}
            color="blue"
            suffix="bookings"
          />
          <SummaryCard
            title="Total Guests"
            value={summary.totalGuests.toString()}
            icon={Users}
            color="purple"
            suffix="guests"
          />
        </div>

        {/* Platform Fee Info */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Platform Fee:</strong> HarvestHost charges a 10% platform fee on all successful bookings.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Total platform fees collected: {formatCurrency(summary.totalEarnings / 9)}
              </p>
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
                label="All Paid Bookings"
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
            <p className="text-emerald-600 text-lg mb-2">No paid bookings yet</p>
            <p className="text-emerald-500 mb-6">When visitors complete payments for your activities, earnings will appear here</p>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Payment Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Activity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Guests</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-emerald-900">Total Paid</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-emerald-900">Platform Fee (10%)</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-emerald-900">Your Earnings</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {filteredEarnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-emerald-50/30 transition">
                      <td className="px-6 py-4 text-sm text-emerald-700">
                        {earning.paidAt ? new Date(earning.paidAt).toLocaleDateString() : new Date(earning.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-800 font-medium">
                        {earning.activityName}
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-600">
                        {earning.guests}
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-700 text-right font-medium">
                        {formatCurrency(earning.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-600 text-right">
                        -{formatCurrency(earning.platformFee)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-700 text-right">
                        {formatCurrency(earning.farmerEarning)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 border-t border-emerald-200">
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right font-semibold text-emerald-900">
                      Total Earnings:
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      {formatCurrency(filteredEarnings.reduce((sum, e) => sum + e.farmerEarning, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
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
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
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