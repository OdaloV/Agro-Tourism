// src/app/visitor/dashboard/reviews/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  X,
} from "lucide-react";

interface Review {
  id: number;
  farmId: number;
  farmName: string;
  bookingDate: string;
  rating: number;
  comment: string;
  date: string;
  status: "pending" | "submitted";
  farmResponse?: string;
}

export default function VisitorReviews() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmIdParam = searchParams.get("farmId");
  
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchReviews = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/auth/login/visitor");
          return;
        }

        // Mock reviews data - replace with API call
        const mockReviews: Review[] = [
          {
            id: 1,
            farmId: 1,
            farmName: "Green Acres Farm",
            bookingDate: "2024-03-15",
            rating: 5,
            comment: "Amazing experience! The farm tour was educational and fun. The hosts were very welcoming.",
            date: "2024-03-20",
            status: "submitted",
            farmResponse: "Thank you for visiting! Hope to see you again soon! 🌱",
          },
          {
            id: 2,
            farmId: 2,
            farmName: "Sunrise Dairy",
            bookingDate: "2024-03-10",
            rating: 4,
            comment: "Great milking experience. The cheese tasting was delicious!",
            date: "2024-03-15",
            status: "submitted",
          },
          {
            id: 3,
            farmId: 3,
            farmName: "Highland Orchard",
            bookingDate: "2024-03-25",
            rating: 0,
            comment: "",
            date: "",
            status: "pending",
          },
        ];

        // If coming from bookings page with farmId, open modal
        if (farmIdParam) {
          const pendingReview = mockReviews.find(
            (r) => r.farmId === parseInt(farmIdParam) && r.status === "pending"
          );
          if (pendingReview) {
            setSelectedFarm(pendingReview);
            setShowReviewModal(true);
          }
        }

        setReviews(mockReviews);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router, mounted, farmIdParam]);

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (selectedFarm) {
      const newReview: Review = {
        ...selectedFarm,
        rating,
        comment,
        date: new Date().toISOString(),
        status: "submitted",
      };
      
      setReviews([newReview, ...reviews.filter(r => r.id !== selectedFarm.id)]);
      setShowReviewModal(false);
      setRating(0);
      setComment("");
      setSelectedFarm(null);
      alert("Thank you for your review!");
    }
  };

  const pendingReviews = reviews.filter(r => r.status === "pending");
  const submittedReviews = reviews.filter(r => r.status === "submitted");

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
          <h1 className="text-2xl font-heading font-bold text-emerald-900">My Reviews</h1>
          <p className="text-emerald-600 mt-1">Share your farm experiences</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Reviews Written</p>
                <p className="text-2xl font-bold text-emerald-900">{submittedReviews.length}</p>
              </div>
              <Star className="h-8 w-8 text-accent" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-emerald-900">{pendingReviews.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Pending Reviews Section */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4">Pending Reviews</h2>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-emerald-900">{review.farmName}</h3>
                      <p className="text-sm text-emerald-600 mt-1">
                        Visited on {new Date(review.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFarm(review);
                        setShowReviewModal(true);
                      }}
                      className="px-4 py-2 bg-accent text-white rounded-xl text-sm hover:bg-accent/90"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted Reviews Section */}
        {submittedReviews.length > 0 ? (
          <div>
            <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4">My Reviews</h2>
            <div className="space-y-4">
              {submittedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No reviews yet</p>
            <p className="text-emerald-500 mb-6">Share your farm experiences with the community</p>
            <Link href="/farms">
              <button className="px-6 py-3 bg-accent text-white rounded-xl">
                Discover Farms
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedFarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Review {selectedFarm.farmName}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-emerald-600 mb-4">
                Visited on {new Date(selectedFarm.bookingDate).toLocaleDateString()}
              </p>
              
              {/* Rating Stars */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-emerald-800 mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-accent text-accent"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-emerald-800 mb-2">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent text-emerald-900"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-emerald-100 p-5 hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-emerald-900">{review.farmName}</h3>
          <p className="text-xs text-emerald-400 mt-1">
            Reviewed on {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "fill-accent text-accent" : "text-gray-300"}`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-emerald-700 text-sm leading-relaxed">{review.comment}</p>
      
      {review.farmResponse && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border-l-4 border-accent">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-accent">Farm Response</span>
          </div>
          <p className="text-sm text-emerald-600">{review.farmResponse}</p>
        </div>
      )}
      
      <div className="mt-3 flex items-center gap-3">
        <button className="text-xs text-emerald-500 hover:text-accent flex items-center gap-1">
          <Flag className="h-3 w-3" />
          Report
        </button>
        <button className="text-xs text-emerald-500 hover:text-accent flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          Helpful
        </button>
      </div>
    </motion.div>
  );
}