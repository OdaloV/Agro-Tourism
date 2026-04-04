// src/app/farmer/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  Users,
  DollarSign,
  Star,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  ChevronDown,
  Zap,
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
//import ThemeToggle from "@/app/components/ThemeToggle";
interface AnalyticsData {
  summary: {
    total_views: number;
    total_bookings: number;
    total_revenue: number;
    average_rating: number;
    conversion_rate: number;
    response_rate: number;
    avg_response_time: string;
  };
  monthly_data: {
    month: string;
    views: number;
    bookings: number;
    revenue: number;
  }[];
  top_activities: {
    name: string;
    bookings: number;
    revenue: number;
  }[];
  visitor_demographics: {
    location: string;
    count: number;
    percentage: number;
  }[];
  recent_activity: {
    id: number;
    type: "booking" | "message" | "review" | "view";
    description: string;
    date: string;
    status?: string;
  }[];
}

export default function FarmerAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [selectedMetric, setSelectedMetric] = useState<"views" | "bookings" | "revenue">("views");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/farmer/analytics?range=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/farmer/analytics/export?range=${timeRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `farm-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting analytics:", error);
      alert("Failed to export analytics");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No data available yet</h2>
            <p className="text-gray-400 mt-2">Start getting bookings to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      key: "total_views",
      label: "Profile Views",
      value: analytics.summary.total_views,
      icon: Eye,
      color: "blue",
      change: "+12%",
      trend: "up",
    },
    {
      key: "total_bookings",
      label: "Total Bookings",
      value: analytics.summary.total_bookings,
      icon: Calendar,
      color: "green",
      change: "+8%",
      trend: "up",
    },
    {
      key: "total_revenue",
      label: "Total Revenue",
      value: `KES ${analytics.summary.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "emerald",
      change: "+15%",
      trend: "up",
    },
    {
      key: "average_rating",
      label: "Average Rating",
      value: analytics.summary.average_rating.toFixed(1),
      icon: Star,
      color: "amber",
      change: "+0.3",
      trend: "up",
      suffix: " ★",
    },
    {
      key: "conversion_rate",
      label: "Conversion Rate",
      value: `${analytics.summary.conversion_rate}%`,
      icon: TrendingUp,
      color: "purple",
      change: "+2%",
      trend: "up",
    },
    {
      key: "response_rate",
      label: "Response Rate",
      value: `${analytics.summary.response_rate}%`,
      icon: MessageCircle,
      color: "teal",
      change: "+5%",
      trend: "up",
    },
  ];

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
              <h1 className="text-3xl font-heading font-bold text-emerald-900">Farm Analytics</h1>
              <p className="text-emerald-600 mt-1">Track your farm's performance and growth</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-700 focus:outline-none focus:border-accent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-700 hover:bg-emerald-50 transition"
              >
                <Download className="h-5 w-5" />
                Export
              </button>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-700 hover:bg-emerald-50 transition"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          
          {metrics.map((metric) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-emerald-900">{metric.value}{metric.suffix || ""}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {metric.change} from previous period
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-emerald-900">Performance Overview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric("views")}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    selectedMetric === "views"
                      ? "bg-accent text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Views
                </button>
                <button
                  onClick={() => setSelectedMetric("bookings")}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    selectedMetric === "bookings"
                      ? "bg-accent text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setSelectedMetric("revenue")}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    selectedMetric === "revenue"
                      ? "bg-accent text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
            
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">Chart visualization would appear here</p>
                  <p className="text-xs text-gray-300 mt-1">Showing {selectedMetric} over time</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              {analytics.monthly_data.map((item) => (
                <div key={item.month} className="text-center">
                  <div className="font-medium text-emerald-600">{item.month}</div>
                  <div>
                    {selectedMetric === "views" && item.views}
                    {selectedMetric === "bookings" && item.bookings}
                    {selectedMetric === "revenue" && `KES ${item.revenue}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Top Activities</h3>
            <div className="space-y-4">
              {analytics.top_activities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No activities yet</p>
              ) : (
                analytics.top_activities.map((activity, idx) => (
  <div key={activity.name || idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-800">{activity.name}</p>
                      <p className="text-xs text-gray-500">{activity.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">KES {activity.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Visitor Demographics & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Visitor Demographics */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Visitor Demographics</h3>
            {analytics.visitor_demographics.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No visitor data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.visitor_demographics.map((demo, idx) => (
  <div key={demo.location || idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{demo.location}</span>
                      <span className="text-gray-500">{demo.percentage}% ({demo.count})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all duration-500"
                        style={{ width: `${demo.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          {/* Recent Activity Feed */}
<div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
  <h3 className="text-lg font-semibold text-emerald-900 mb-4">Recent Activity</h3>
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {analytics.recent_activity.length === 0 ? (
      <p className="text-center text-gray-500 py-8">No recent activity</p>
    ) : (
      analytics.recent_activity.map((activity, idx) => (
        <div key={activity.id || idx} className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            activity.type === "booking" ? "bg-green-100" :
            activity.type === "message" ? "bg-blue-100" :
            activity.type === "review" ? "bg-amber-100" : "bg-gray-100"
          }`}>
            {activity.type === "booking" && <Calendar className="h-4 w-4 text-green-600" />}
            {activity.type === "message" && <MessageCircle className="h-4 w-4 text-blue-600" />}
            {activity.type === "review" && <Star className="h-4 w-4 text-amber-600" />}
            {activity.type === "view" && <Eye className="h-4 w-4 text-gray-600" />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">{activity.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{activity.date}</span>
              {activity.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activity.status === "completed" ? "bg-green-100 text-green-600" :
                  activity.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
                }`}>
                  {activity.status}
                </span>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>
        </div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-accent/10 to-emerald-100/30 rounded-2xl p-6 border border-accent/20"
        >
          <div className="flex items-start gap-4">
            <Zap className="h-8 w-8 text-accent flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-800">Quick Insights</h4>
              <p className="text-sm text-emerald-600 mt-1">
                {analytics.summary.total_bookings === 0 ? (
                  "Start by adding more activities to attract visitors. Farms with 5+ activities get 3x more bookings."
                ) : analytics.summary.conversion_rate < 5 ? (
                  "Your conversion rate is below average. Consider adding more photos and detailed descriptions to your farm profile."
                ) : analytics.summary.response_rate < 80 ? (
                  "Quick responses lead to more bookings. Try to respond to messages within 2 hours."
                ) : (
                  "Great job! Your farm is performing well. Keep adding new activities to attract more visitors."
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}