// src/app/visitor/dashboard/recent/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  Trash2,
  Calendar,
} from "lucide-react";

interface RecentView {
  id: number;
  farmName: string;
  location: string;
  rating: number;
  viewedAt: string;
}

export default function VisitorRecent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchRecentViews = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/auth/login/visitor");
          return;
        }

        // Mock recent views data - replace with API call
        const mockRecentViews: RecentView[] = [
          {
            id: 1,
            farmName: "Green Valley Farm",
            location: "Kiambu, Kenya",
            rating: 4.7,
            viewedAt: "2024-04-01T14:30:00",
          },
          {
            id: 2,
            farmName: "Sunrise Dairy",
            location: "Nakuru, Kenya",
            rating: 4.6,
            viewedAt: "2024-03-30T10:15:00",
          },
          {
            id: 3,
            farmName: "Mountain B&B",
            location: "Nyeri, Kenya",
            rating: 4.9,
            viewedAt: "2024-03-28T16:45:00",
          },
          {
            id: 4,
            farmName: "Highland Orchard",
            location: "Nyeri, Kenya",
            rating: 4.8,
            viewedAt: "2024-03-25T11:20:00",
          },
          {
            id: 5,
            farmName: "Green Acres Farm",
            location: "Kiambu, Kenya",
            rating: 4.5,
            viewedAt: "2024-03-22T09:00:00",
          },
        ];

        setRecentViews(mockRecentViews);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent views:", error);
        setLoading(false);
      }
    };

    fetchRecentViews();
  }, [router, mounted]);

  const handleClearHistory = () => {
    if (confirm("Clear your entire viewing history?")) {
      setRecentViews([]);
      alert("History cleared");
    }
  };

  const handleRemoveItem = (id: number) => {
    setRecentViews(recentViews.filter(v => v.id !== id));
  };

  const timeAgo = (date: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60));
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Recently Viewed</h1>
              <p className="text-emerald-600 mt-1">Farms you've visited recently</p>
            </div>
            {recentViews.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-emerald-500" />
              <div>
                <p className="text-sm text-emerald-600">Total Views</p>
                <p className="text-2xl font-bold text-emerald-900">{recentViews.length}</p>
              </div>
            </div>
            <Link href="/farms">
              <button className="px-4 py-2 bg-accent text-white rounded-xl text-sm">
                Discover More Farms
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Views List */}
        {recentViews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <Eye className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No recently viewed farms</p>
            <p className="text-emerald-500 mb-6">Start exploring farms to see them here</p>
            <Link href="/farms">
              <button className="px-6 py-3 bg-accent text-white rounded-xl">
                Explore Farms
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentViews.map((view, index) => (
              <motion.div
                key={view.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-emerald-400">#{index + 1}</span>
                        <h3 className="font-semibold text-emerald-900">{view.farmName}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="text-xs text-emerald-600">{view.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-emerald-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {view.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(view.viewedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/farms/${view.id}`}>
                        <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90">
                          View Again
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(view.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}