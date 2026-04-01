"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  TrendingUp,
  MessageCircle,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Tractor,
  Users,
  DollarSign,
  Star,
  Plus,
  Edit,
  Eye,
  BarChart,
  Settings,
  ChevronRight,
} from "lucide-react";

// Mock data for demonstration
const mockFarmData = {
  farmName: "Green Valley Farm",
  verificationStatus: "pending" as "pending" | "approved" | "rejected",
  joinedDate: "March 20, 2026",
  stats: {
    totalBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalViews: 128,
  },
  activities: [
    {
      id: 1,
      name: "Farm Tour",
      status: "draft",
      price: 1500,
      duration: "2 hours",
    },
    {
      id: 2,
      name: "Strawberry Picking",
      status: "draft",
      price: 800,
      duration: "1.5 hours",
    },
  ],
  upcomingBookings: [],
  recentReviews: [],
};

export default function FarmerDashboard() {
  const [farmData, setFarmData] = useState(mockFarmData);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activities" | "bookings" | "analytics"
  >("overview");

  const isVerified = farmData.verificationStatus === "approved";
  const isPending = farmData.verificationStatus === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/50">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">
                {farmData.farmName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    <Clock className="h-3 w-3" />
                    Pending Verification
                  </span>
                )}
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <Link href="/farmer/settings">
              <button className="p-2 hover:bg-emerald-50 rounded-xl transition-colors">
                <Settings className="h-5 w-5 text-emerald-600" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Verification Banner (for pending farms) */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">
                  Complete Farm Verification
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  To start receiving bookings and appear on the visitor map,
                  complete the verification process. This includes identity
                  verification, land ownership proof, and operational permits.
                </p>
                <Link href="/farmer/verification">
                  <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <Shield className="h-4 w-4" />
                    Start Verification
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Calendar}
            label="Total Bookings"
            value={farmData.stats.totalBookings}
            suffix="bookings"
            color="emerald"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={farmData.stats.totalRevenue}
            prefix="KES "
            color="amber"
          />
          <StatCard
            icon={Star}
            label="Rating"
            value={farmData.stats.avgRating}
            suffix={farmData.stats.avgRating === 0 ? "No reviews" : "⭐"}
            color="yellow"
          />
          <StatCard
            icon={Eye}
            label="Profile Views"
            value={farmData.stats.totalViews}
            suffix="views"
            color="blue"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-emerald-200 mb-6">
          {[
            { id: "overview", label: "Overview", icon: Home },
            { id: "activities", label: "Activities", icon: Tractor },
            { id: "bookings", label: "Bookings", icon: Calendar },
            { id: "analytics", label: "Analytics", icon: BarChart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
                  isActive
                    ? "bg-white text-emerald-700 border-t border-l border-r border-emerald-200 -mb-px"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
                <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <QuickActionButton
                    icon={Plus}
                    label="Add Activity"
                    onClick={() => {}}
                  />
                  <QuickActionButton
                    icon={Calendar}
                    label="Manage Calendar"
                    onClick={() => {}}
                  />
                  <QuickActionButton
                    icon={MessageCircle}
                    label="View Messages"
                    onClick={() => {}}
                  />
                  <QuickActionButton
                    icon={TrendingUp}
                    label="View Analytics"
                    onClick={() => {}}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-heading font-semibold text-emerald-900">
                    Recent Activity
                  </h2>
                  <Link
                    href="/farmer/activities"
                    className="text-sm text-accent hover:underline"
                  >
                    View All
                  </Link>
                </div>
                {farmData.activities.length > 0 ? (
                  <div className="space-y-3">
                    {farmData.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl"
                      >
                        <div>
                          <h3 className="font-medium text-emerald-900">
                            {activity.name}
                          </h3>
                          <p className="text-sm text-emerald-600">
                            KES {activity.price} • {activity.duration}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                            Draft
                          </span>
                          <button className="p-1 hover:bg-emerald-100 rounded-lg">
                            <Edit className="h-4 w-4 text-emerald-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tractor className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-emerald-600">No activities yet</p>
                    <button className="mt-3 inline-flex items-center gap-2 text-sm text-accent hover:underline">
                      <Plus className="h-4 w-4" />
                      Create your first activity
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Activities Tab */}
          {activeTab === "activities" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-semibold text-emerald-900">
                  Manage Activities
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90">
                  <Plus className="h-4 w-4" />
                  Add New Activity
                </button>
              </div>

              {farmData.activities.length > 0 ? (
                <div className="space-y-3">
                  {farmData.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-900">
                          {activity.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-emerald-600">
                          <span>KES {activity.price} per person</span>
                          <span>•</span>
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-emerald-100 rounded-lg">
                          <Eye className="h-4 w-4 text-emerald-600" />
                        </button>
                        <button className="p-2 hover:bg-emerald-100 rounded-lg">
                          <Edit className="h-4 w-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Tractor className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                  <p className="text-emerald-600 mb-2">No activities yet</p>
                  <p className="text-sm text-emerald-500">
                    Start by adding your first farm activity
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-semibold text-emerald-900">
                  Upcoming Bookings
                </h2>
                <Link
                  href="/farmer/bookings"
                  className="text-sm text-accent hover:underline"
                >
                  View Calendar
                </Link>
              </div>

              {!isVerified ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                  <p className="text-emerald-600 mb-2">Verification Required</p>
                  <p className="text-sm text-emerald-500">
                    Your farm needs to be verified before you can receive
                    bookings
                  </p>
                </div>
              ) : farmData.upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {/* Bookings will appear here */}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                  <p className="text-emerald-600">No upcoming bookings</p>
                  <p className="text-sm text-emerald-500 mt-1">
                    Once verified, visitors will be able to book your activities
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4">
                Performance Overview
              </h2>

              {!isVerified ? (
                <div className="text-center py-12">
                  <BarChart className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                  <p className="text-emerald-600 mb-2">Analytics Unavailable</p>
                  <p className="text-sm text-emerald-500">
                    Complete verification to access detailed analytics
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-emerald-600">
                        Profile Completion
                      </p>
                      <p className="text-2xl font-bold text-emerald-900">45%</p>
                      <div className="mt-2 h-1.5 bg-emerald-200 rounded-full">
                        <div className="w-[45%] h-full bg-accent rounded-full" />
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-emerald-600">
                        Activity Completion
                      </p>
                      <p className="text-2xl font-bold text-emerald-900">
                        2/10
                      </p>
                      <p className="text-xs text-emerald-500 mt-1">
                        Add more activities
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation for Farmers */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 md:hidden">
        <div className="flex justify-around py-2">
          <BottomNavItem icon={Home} label="Home" active />
          <BottomNavItem icon={Calendar} label="Schedule" />
          <BottomNavItem icon={TrendingUp} label="Reports" />
          <BottomNavItem icon={MessageCircle} label="Inbox" />
        </div>
      </nav>
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  color,
}: any) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-2 rounded-xl ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">
        {prefix}
        {value}
        {suffix}
      </p>
      <p className="text-sm text-emerald-600 mt-1">{label}</p>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
    >
      <Icon className="h-6 w-6 text-emerald-600" />
      <span className="text-sm font-medium text-emerald-700">{label}</span>
    </button>
  );
}

function BottomNavItem({ icon: Icon, label, active = false }: any) {
  return (
    <button
      className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
        active ? "text-accent" : "text-emerald-400 hover:text-emerald-600"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
