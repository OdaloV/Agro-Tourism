"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, DollarSign, Calendar, TrendingUp, Users, Coffee } from "lucide-react";
import { Skeleton, StatCardSkeleton, ChartSkeleton, ActivitySkeleton } from "@/components/ui/Skeleton";

interface AnalyticsData {
  summary: {
    total_bookings: number;
    total_revenue: number;
    farmer_earnings: number;
    platform_fee: number;
  };
  monthly_data: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  top_activities: Array<{
    name: string;
    bookings: number;
  }>;
}

export default function FarmerAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }

      const response = await fetch(`/api/farmer/analytics?range=${range}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

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
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Monthly Breakdown Skeleton */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 mb-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ChartSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Top Activities Skeleton */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ActivitySkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Explanation Skeleton */}
          <div className="mt-6">
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
          <Link href="/farmer/dashboard" className="text-emerald-600 mt-2 inline-block">
            Back to Dashboard
          </Link>
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
              <h1 className="text-2xl font-bold text-emerald-900">Your Farm Analytics</h1>
              <p className="text-emerald-600 mt-1">Simple numbers to track your farm's performance</p>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setRange("7d")}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  range === "7d" 
                    ? "bg-emerald-600 text-white" 
                    : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setRange("30d")}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  range === "30d" 
                    ? "bg-emerald-600 text-white" 
                    : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setRange("90d")}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  range === "90d" 
                    ? "bg-emerald-600 text-white" 
                    : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                Last 90 days
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Bookings"
            value={data.summary.total_bookings}
            icon={Calendar}
            bgColor="bg-gray-100"
            iconColor="text-emerald-700"
            textColor="text-emerald-800"
          />
          <StatCard
            title="Total Revenue"
            value={formatMoney(data.summary.total_revenue)}
            icon={DollarSign}
            bgColor="bg-gray-100"
            iconColor="text-emerald-700"
            textColor="text-emerald-800"
          />
          <StatCard
            title="Your Earnings"
            value={formatMoney(data.summary.farmer_earnings)}
            icon={TrendingUp}
            bgColor="bg-gray-100"
            iconColor="text-emerald-700"
            textColor="text-emerald-800"
          />
          <StatCard
            title="Platform Fee"
            value={formatMoney(data.summary.platform_fee)}
            icon={Users}
            bgColor="bg-gray-100"
            iconColor="text-emerald-700"
            textColor="text-emerald-800"
          />
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-emerald-900 mb-4">Monthly Breakdown</h2>
          {data.monthly_data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-100">
                    <th className="text-left py-3 text-sm font-medium text-emerald-600">Month</th>
                    <th className="text-center py-3 text-sm font-medium text-emerald-600">Bookings</th>
                    <th className="text-right py-3 text-sm font-medium text-emerald-600">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly_data.map((item, idx) => (
                    <tr key={idx} className="border-b border-emerald-50">
                      <td className="py-3 text-sm text-emerald-800">{item.month}</td>
                      <td className="py-3 text-sm text-center text-emerald-700">{item.bookings}</td>
                      <td className="py-3 text-sm text-right text-emerald-700">{formatMoney(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Activities */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <h2 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
            <Coffee className="h-5 w-5 text-emerald-600" />
            Most Popular Activities
          </h2>
          {data.top_activities.length === 0 || data.top_activities.every(a => a.bookings === 0) ? (
            <p className="text-gray-500 text-center py-8">No bookings yet. Add activities to start getting visitors!</p>
          ) : (
            <div className="space-y-3">
              {data.top_activities.map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-800 font-medium">{activity.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-emerald-700 font-medium">{activity.bookings} bookings</span>
                    <div className="w-24 h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(100, (activity.bookings / (data.top_activities[0]?.bookings || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simple Explanation */}
        <div className="mt-6 p-4 bg-emerald-100 rounded-xl border border-emerald-200">
          <p className="text-sm text-emerald-800">
            💡 <strong>How it works:</strong> You earn a percentage of each booking. HarvestHost keeps a platform fee to cover payment processing and platform costs.
          </p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, bgColor, iconColor, textColor }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  bgColor: string;
  iconColor: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-3 rounded-xl ${bgColor}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${textColor} mt-3`}>{value}</p>
      <p className="text-sm text-emerald-600 mt-0.5">{title}</p>
    </div>
  );
}