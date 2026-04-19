"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Star,
  BarChart3,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Calendar as CalendarIcon,
  CreditCard,
  Zap,
} from "lucide-react";
import {
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "@/components/ui/Skeleton";

interface AnalyticsData {
  summary: {
    total_users: number;
    total_farmers: number;
    total_visitors: number;
    new_users: number;
    total_farms: number;
    pending_farms: number;
    approved_farms: number;
    rejected_farms: number;
    new_farms: number;
    total_bookings: number;
    total_revenue: number;
    new_bookings: number;
    new_revenue: number;
    platform_earnings: number;
    new_platform_earnings: number;
    commission_rate: number;
  };
  monthly_data: {
    month: string;
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
  pending_farms: {
    id: number;
    farm_name: string;
    owner_name: string;
    owner_email: string;
    submitted_at: string;
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
      const rangeMap: Record<string, string> = {
        "7d": "7d",
        "30d": "30d",
        "90d": "90d",
        "1y": "365d",
      };
      const response = await fetch(`/api/admin/analytics?range=${rangeMap[timeRange]}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics) return;
    
    let csvRows = [];
    
    csvRows.push('# Platform Summary');
    csvRows.push(['Metric', 'Value'].join(','));
    csvRows.push(['Total Users', analytics.summary.total_users].join(','));
    csvRows.push(['Total Farmers', analytics.summary.total_farmers].join(','));
    csvRows.push(['Total Visitors', analytics.summary.total_visitors].join(','));
    csvRows.push(['New Users', analytics.summary.new_users].join(','));
    csvRows.push(['Total Bookings', analytics.summary.total_bookings].join(','));
    csvRows.push(['New Bookings', analytics.summary.new_bookings].join(','));
    csvRows.push(['Total Revenue (KES)', analytics.summary.total_revenue].join(','));
    csvRows.push(['New Revenue (KES)', analytics.summary.new_revenue].join(','));
    csvRows.push(['Platform Earnings (KES)', analytics.summary.platform_earnings].join(','));
    csvRows.push(['New Platform Earnings (KES)', analytics.summary.new_platform_earnings].join(','));
    csvRows.push(['Total Farms', analytics.summary.total_farms].join(','));
    csvRows.push(['Approved Farms', analytics.summary.approved_farms].join(','));
    csvRows.push(['Pending Farms', analytics.summary.pending_farms].join(','));
    csvRows.push(['Rejected Farms', analytics.summary.rejected_farms].join(','));
    csvRows.push(['New Farms', analytics.summary.new_farms].join(','));
    csvRows.push(['Commission Rate', `${analytics.summary.commission_rate}%`].join(','));
    
    csvRows.push('');
    csvRows.push('# Top Performing Farms');
    csvRows.push(['Rank', 'Farm Name', 'Farmer', 'Bookings', 'Revenue (KES)', 'Rating'].join(','));
    analytics.top_farms.forEach((farm, idx) => {
      csvRows.push([
        idx + 1,
        `"${farm.name}"`,
        `"${farm.farmer_name}"`,
        farm.bookings,
        farm.revenue,
        farm.rating.toFixed(1)
      ].join(','));
    });
    
    csvRows.push('');
    csvRows.push('# Monthly Performance');
    csvRows.push(['Month', 'Bookings', 'Revenue (KES)'].join(','));
    analytics.monthly_data.forEach(item => {
      csvRows.push([item.month, item.bookings, item.revenue].join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-emerald-100 sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <ArrowLeft className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="h-7 w-48 bg-muted rounded-lg animate-pulse"></div>
                  <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-1"></div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-32 bg-muted rounded-xl animate-pulse"></div>
                <div className="h-10 w-24 bg-muted rounded-xl animate-pulse"></div>
                <div className="h-10 w-24 bg-muted rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Farm Status Summary Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-emerald-100">
                <div className="h-6 w-6 bg-muted rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="h-8 w-16 bg-muted rounded-lg mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-24 bg-muted rounded-lg mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Top Farms Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 mb-8">
            <div className="h-6 w-48 bg-muted rounded-lg animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <div className="h-5 w-40 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-muted rounded animate-pulse mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Chart Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <div className="h-6 w-48 bg-muted rounded-lg animate-pulse mb-6"></div>
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-emerald-900">No data available yet</h2>
            <p className="text-emerald-600 mt-2">Start getting users and bookings to see analytics</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { key: "total_users", label: "Total Users", value: analytics.summary.total_users.toLocaleString(), icon: Users, bgColor: "bg-emerald-500", iconColor: "text-white", change: `+${analytics.summary.new_users} new` },
    { key: "total_farmers", label: "Total Farmers", value: analytics.summary.total_farmers.toLocaleString(), icon: UserPlus, bgColor: "bg-blue-500", iconColor: "text-white", change: `+${analytics.summary.new_farms} new` },
    { key: "total_bookings", label: "Total Bookings", value: analytics.summary.total_bookings.toLocaleString(), icon: CalendarIcon, bgColor: "bg-purple-500", iconColor: "text-white", change: `+${analytics.summary.new_bookings} new` },
    { key: "total_revenue", label: "Total Revenue", value: `KES ${analytics.summary.total_revenue.toLocaleString()}`, icon: DollarSign, bgColor: "bg-green-500", iconColor: "text-white", change: `KES ${analytics.summary.new_revenue.toLocaleString()} new` },
    { key: "platform_earnings", label: "Platform Earnings", value: `KES ${analytics.summary.platform_earnings.toLocaleString()}`, icon: CreditCard, bgColor: "bg-indigo-500", iconColor: "text-white", change: `${analytics.summary.commission_rate}% commission` },
    { key: "pending_farms", label: "Pending Farms", value: analytics.summary.pending_farms.toLocaleString(), icon: Clock, bgColor: "bg-amber-500", iconColor: "text-white", change: `${analytics.summary.approved_farms} approved` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 hover:bg-emerald-50 rounded-xl transition-colors">
                <ArrowLeft className="h-5 w-5 text-emerald-600" />
              </Link>
              <div>
                <h1 className="text-xl font-heading font-bold text-emerald-900">Platform Analytics</h1>
                <p className="text-sm text-emerald-600">Monitor platform growth and performance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value as any)} 
                className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button 
                onClick={handleExport} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition text-emerald-700"
              >
                <Download className="h-5 w-5" /> Export
              </button>
              <button 
                onClick={fetchAnalytics} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition text-emerald-700"
              >
                <RefreshCw className="h-5 w-5" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric) => (
            <StatCard
              key={metric.key}
              title={metric.label}
              value={metric.value}
              icon={metric.icon}
              bgColor={metric.bgColor}
              iconColor={metric.iconColor}
              change={metric.change}
            />
          ))}
        </div>

        {/* Farm Status Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-900">{analytics.summary.approved_farms}</p>
            <p className="text-sm text-emerald-600">Approved Farms</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 text-center">
            <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-900">{analytics.summary.pending_farms}</p>
            <p className="text-sm text-emerald-600">Pending Farms</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 text-center">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-900">{analytics.summary.rejected_farms}</p>
            <p className="text-sm text-emerald-600">Rejected Farms</p>
          </div>
        </div>

        {/* Top Farms - Scrollable */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">🏆 Top Performing Farms</h3>
          {analytics.top_farms.length === 0 ? (
            <p className="text-center text-emerald-600 py-8">No farms yet</p>
          ) : (
            <div className="max-h-80 overflow-y-auto pr-2 space-y-4">
              {analytics.top_farms.map((farm, idx) => (
                <div key={farm.id} className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <p className="font-medium text-emerald-900">{idx + 1}. {farm.name}</p>
                    <p className="text-xs text-emerald-600">{farm.farmer_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-sm text-emerald-700">{farm.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-emerald-600">{farm.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-6">📈 Monthly Performance</h3>
          {analytics.monthly_data.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-emerald-300 mx-auto mb-2" />
              <p className="text-emerald-600">No monthly data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.monthly_data.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-emerald-700">{item.month}</span>
                    <span className="text-emerald-600">{item.bookings} bookings • KES {item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 rounded-full h-2 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (item.bookings / Math.max(...analytics.monthly_data.map(m => m.bookings))) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="mt-6 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl p-6 border border-emerald-200"
        >
          <div className="flex items-start gap-4">
            <Zap className="h-8 w-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-900">Platform Insights</h4>
              <p className="text-sm text-emerald-700 mt-1">
                {analytics.summary.total_bookings === 0 
                  ? "Platform is new. Focus on acquiring more farmers to list their farms."
                  : analytics.summary.pending_farms > 5 
                    ? `There are ${analytics.summary.pending_farms} pending verifications. Review them to activate more farms.`
                    : `Platform is growing! ${analytics.summary.total_farmers} farmers, ${analytics.summary.total_visitors} visitors, and ${analytics.summary.total_bookings} bookings.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Stat Card Component with SOLID backgrounds and WHITE icons
function StatCard({ title, value, icon: Icon, bgColor, iconColor, change }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  bgColor: string;
  iconColor: string;
  change?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-emerald-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-emerald-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm text-emerald-600">{change}</span>
        </div>
      )}
    </motion.div>
  );
}