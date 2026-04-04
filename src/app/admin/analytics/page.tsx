// src/app/admin/analytics/page.tsx
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
  Users,
  DollarSign,
  Star,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  ChevronDown,
  Zap,
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle,
  XCircle,
  Building,
  Eye,
  CreditCard,
  UserPlus,
  Calendar as CalendarIcon,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    total_farmers: number;
    total_visitors: number;
    total_bookings: number;
    total_revenue: number;
    platform_earnings: number;
    pending_verifications: number;
    verified_farms: number;
    rejected_farms: number;
    average_rating: number;
    conversion_rate: number;
  };
  monthly_data: {
    month: string;
    farmers: number;
    bookings: number;
    revenue: number;
  }[];
  top_farms: {
    id: number;
    name: string;
    farmer_name: string;
    bookings: number;
    revenue: number;
    rating: number;
  }[];
  top_locations: {
    location: string;
    farm_count: number;
    booking_count: number;
    revenue: number;
  }[];
  recent_activity: {
    id: number;
    type: "farmer_registration" | "booking" | "verification" | "review";
    description: string;
    date: string;
    status?: string;
  }[];
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
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
      const response = await fetch(`/api/admin/analytics/export?range=${timeRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.csv`;
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
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No data available yet</h2>
            <p className="text-gray-400 mt-2">Start getting users and bookings to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      key: "total_farmers",
      label: "Total Farmers",
      value: analytics.summary.total_farmers,
      icon: Users,
      color: "emerald",
      change: "+15%",
      trend: "up",
    },
    {
      key: "total_visitors",
      label: "Total Visitors",
      value: analytics.summary.total_visitors,
      icon: UserPlus,
      color: "blue",
      change: "+22%",
      trend: "up",
    },
    {
      key: "total_bookings",
      label: "Total Bookings",
      value: analytics.summary.total_bookings,
      icon: CalendarIcon,
      color: "purple",
      change: "+28%",
      trend: "up",
    },
    {
      key: "total_revenue",
      label: "Total Revenue",
      value: `KES ${analytics.summary.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      change: "+32%",
      trend: "up",
    },
    {
      key: "platform_earnings",
      label: "Platform Earnings",
      value: `KES ${analytics.summary.platform_earnings.toLocaleString()}`,
      icon: CreditCard,
      color: "accent",
      change: "+32%",
      trend: "up",
    },
    {
      key: "pending_verifications",
      label: "Pending Verifications",
      value: analytics.summary.pending_verifications,
      icon: Clock,
      color: "amber",
      change: "-5%",
      trend: "down",
    },
    {
      key: "verified_farms",
      label: "Verified Farms",
      value: analytics.summary.verified_farms,
      icon: CheckCircle,
      color: "green",
      change: "+18%",
      trend: "up",
    },
    {
      key: "average_rating",
      label: "Average Rating",
      value: analytics.summary.average_rating.toFixed(1),
      icon: Star,
      color: "amber",
      change: "+0.2",
      trend: "up",
      suffix: " ★",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="text-xl font-heading font-bold text-card-foreground">
                  Platform Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor platform growth and performance
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl transition"
              >
                <Download className="h-5 w-5" />
                Export
              </button>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl transition"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-card-foreground">{metric.value}{metric.suffix || ""}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
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
          
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-6">Platform Growth</h3>
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">Showing growth over time</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              {analytics.monthly_data.map((item) => (
                <div key={item.month} className="text-center">
                  <div className="font-medium text-card-foreground">{item.month}</div>
                  <div>{item.bookings} bookings</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Farms */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Performing Farms</h3>
            <div className="space-y-4">
              {analytics.top_farms.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No farms yet</p>
              ) : (
                analytics.top_farms.map((farm, idx) => (
                  <div key={farm.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">{farm.name}</p>
                      <p className="text-xs text-muted-foreground">{farm.farmer_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-sm text-card-foreground">{farm.rating}</span>
                      </div>
                      <p className="text-xs text-accent">{farm.bookings} bookings</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Locations & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Top Locations */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Locations</h3>
            {analytics.top_locations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No location data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.top_locations.map((loc, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-card-foreground">{loc.location}</span>
                      <span className="text-muted-foreground">{loc.booking_count} bookings</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(loc.booking_count / analytics.top_locations[0].booking_count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analytics.recent_activity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              ) : (
                analytics.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === "farmer_registration" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      activity.type === "booking" ? "bg-blue-100 dark:bg-blue-900/30" :
                      activity.type === "verification" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-purple-100 dark:bg-purple-900/30"
                    }`}>
                      {activity.type === "farmer_registration" && <UserPlus className="h-4 w-4 text-emerald-600" />}
                      {activity.type === "booking" && <CalendarIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === "verification" && <CheckCircle className="h-4 w-4 text-amber-600" />}
                      {activity.type === "review" && <Star className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
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
              <h4 className="font-semibold text-card-foreground">Platform Insights</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {analytics.summary.total_bookings === 0 ? (
                  "Platform is new. Focus on acquiring more farmers to list their farms."
                ) : analytics.summary.conversion_rate < 5 ? (
                  "Conversion rate is below average. Consider improving the booking process."
                ) : analytics.summary.pending_verifications > 10 ? (
                  `There are ${analytics.summary.pending_verifications} pending verifications. Review them to activate more farms.`
                ) : (
                  "Platform is growing well! Keep up the momentum by engaging with top-performing farms."
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}