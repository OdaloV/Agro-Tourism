// src/app/farmer/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, DollarSign, Calendar, TrendingUp, Users, Coffee } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                className={`px-4 py-2 rounded-lg text-sm ${range === "7d" ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-200"}`}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setRange("30d")}
                className={`px-4 py-2 rounded-lg text-sm ${range === "30d" ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-200"}`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setRange("90d")}
                className={`px-4 py-2 rounded-lg text-sm ${range === "90d" ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-200"}`}
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
            color="emerald"
          />
          <StatCard
            title="Total Revenue"
            value={formatMoney(data.summary.total_revenue)}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Your Earnings"
            value={formatMoney(data.summary.farmer_earnings)}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Platform Fee (10%)"
            value={formatMoney(data.summary.platform_fee)}
            icon={Users}
            color="amber"
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
            <Coffee className="h-5 w-5" />
            Most Popular Activities
          </h2>
          {data.top_activities.length === 0 || data.top_activities.every(a => a.bookings === 0) ? (
            <p className="text-gray-500 text-center py-8">No bookings yet. Add activities to start getting visitors!</p>
          ) : (
            <div className="space-y-3">
              {data.top_activities.map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-800">{activity.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-emerald-600">{activity.bookings} bookings</span>
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
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            💡 <strong>How it works:</strong> You earn a certain percentage of each booking. HarvestHost keeps the rest to cover payment processing and platform costs.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">{value}</p>
      <p className="text-sm text-emerald-600 mt-0.5">{title}</p>
    </div>
  );
}