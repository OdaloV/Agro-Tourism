"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  ChevronLeft,
  MessageCircle,
  ThumbsUp,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Reply,
  Mail,
  XCircle,
} from "lucide-react";

interface Review {
  id: number;
  farm_id: number;
  farm_name: string;
  visitor_id: number;
  visitor_name: string;
  rating: number;
  comment: string;
  created_at: string;
  booking_date: string;
  activity_name: string;
  participants: number;
  farm_response?: string;
  responded_at?: string;
}

export default function FarmerReviews() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recent_reviews: 0,
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responding, setResponding] = useState(false);
  const [filter, setFilter] = useState<"all" | "responded" | "unresponded">("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }

      const response = await fetch("/api/farmer/reviews");
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats || {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recent_reviews: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    setResponding(true);
    try {
      const response = await fetch("/api/farmer/reviews/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          response: responseText,
        }),
      });

      if (response.ok) {
        alert("Response posted successfully!");
        setShowResponseModal(false);
        setResponseText("");
        setSelectedReview(null);
        fetchReviews(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to post response");
      }
    } catch (error) {
      console.error("Error posting response:", error);
      alert("Failed to post response");
    } finally {
      setResponding(false);
    }
  };

  const getFilteredReviews = () => {
    if (filter === "responded") {
      return reviews.filter(r => r.farm_response);
    }
    if (filter === "unresponded") {
      return reviews.filter(r => !r.farm_response);
    }
    return reviews;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();
  const unrespondedCount = reviews.filter(r => !r.farm_response).length;

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
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Farm Reviews</h1>
              <p className="text-emerald-600 mt-1">See what visitors are saying about your farm</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-emerald-900">{stats.average_rating.toFixed(1)}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(stats.average_rating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Total Reviews</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.total_reviews}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Unresponded</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{unrespondedCount}</p>
              </div>
              <Reply className="h-8 w-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Recent Reviews</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.recent_reviews}</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.total_reviews > 0 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-emerald-700 w-12">{rating} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${(stats.rating_distribution[rating as keyof typeof stats.rating_distribution] / stats.total_reviews) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-emerald-600 w-12">
                    {stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-emerald-200 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              filter === "all"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-emerald-500 hover:text-emerald-700"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("unresponded")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              filter === "unresponded"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-emerald-500 hover:text-emerald-700"
            }`}
          >
            Need Response ({unrespondedCount})
          </button>
          <button
            onClick={() => setFilter("responded")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              filter === "responded"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-emerald-500 hover:text-emerald-700"
            }`}
          >
            Responded ({reviews.length - unrespondedCount})
          </button>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No reviews yet</p>
            <p className="text-emerald-500">When visitors review your farm, they will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-emerald-900">{review.visitor_name}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-emerald-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(review.booking_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {review.participants} guests
                        </span>
                        <span className="flex items-center gap-1">
                          🌾 {review.activity_name}
                        </span>
                      </div>
                    </div>
                    {!review.farm_response && (
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowResponseModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                      >
                        Respond
                      </button>
                    )}
                    {review.farm_response && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Responded
                      </span>
                    )}
                  </div>

                  <p className="text-emerald-700 text-sm leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  {review.farm_response && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">Your Response</span>
                        {review.responded_at && (
                          <span className="text-xs text-emerald-400">• {formatDate(review.responded_at)}</span>
                        )}
                      </div>
                      <p className="text-sm text-emerald-700">{review.farm_response}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-emerald-900">Respond to Review</h3>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText("");
                }}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-emerald-900">{selectedReview.visitor_name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= selectedReview.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-emerald-700">{selectedReview.comment}</p>
              </div>

              <label className="block text-sm font-medium text-emerald-800 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
                placeholder="Thank the visitor and address their feedback..."
              />
              <p className="text-xs text-emerald-500 mt-2">
                Responding to reviews shows visitors you value their feedback.
              </p>
            </div>
            <div className="p-4 border-t border-emerald-100 flex gap-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText("");
                }}
                className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRespond}
                disabled={responding || !responseText.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {responding ? "Posting..." : "Post Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}