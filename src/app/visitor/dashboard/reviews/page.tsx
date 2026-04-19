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
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { Skeleton, ReviewCardSkeleton, ReviewableBookingSkeleton } from "@/components/ui/Skeleton";

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

interface ReviewableBooking {
  booking_id: number;
  farm_id: number;
  farm_name: string;
  activity_name: string;
  booking_date: string;
  participants: number;
  total_amount: number;
  status: string;
}

export default function VisitorReviews() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableBookings, setReviewableBookings] = useState<ReviewableBooking[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ReviewableBooking | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

        const response = await fetch('/api/reviews');
        
        if (!response.ok) {
          console.error("API error:", response.status);
          setReviews([]);
          setReviewableBookings([]);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        const realReviews: Review[] = (data.reviews || []).map((r: any) => ({
          id: r.id,
          farmId: r.farm_id,
          farmName: r.farm_name,
          bookingDate: r.booking_date || new Date().toISOString(),
          rating: r.rating || 0,
          comment: r.comment || "",
          date: r.created_at || new Date().toISOString(),
          status: "submitted",
          farmResponse: r.farm_response
        }));
        
        const realReviewableBookings: ReviewableBooking[] = (data.reviewableBookings || []).map((b: any) => ({
          booking_id: b.booking_id,
          farm_id: b.farm_id,
          farm_name: b.farm_name,
          activity_name: b.activity_name,
          booking_date: b.booking_date,
          participants: b.participants,
          total_amount: b.total_amount,
          status: b.status
        }));
        
        setReviews(realReviews);
        setReviewableBookings(realReviewableBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
        setReviewableBookings([]);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router, mounted]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a review");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Review must be at least 10 characters");
      return;
    }

    if (!selectedBooking) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: selectedBooking.farm_id,
          bookingId: selectedBooking.booking_id,
          rating,
          comment: comment.trim(),
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchReviews();
        setShowReviewModal(false);
        setRating(0);
        setComment("");
        setTitle("");
        setSelectedBooking(null);
        alert("Thank you for your review!");
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = async () => {
    if (!editingReview) return;
    
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a review");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Review must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: editingReview.id,
          rating,
          comment: comment.trim(),
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchReviews();
        setShowEditModal(false);
        setEditingReview(null);
        setRating(0);
        setComment("");
        alert("Review updated successfully!");
      } else {
        alert(data.error || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchReviews();
        alert("Review deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      
      const realReviews: Review[] = (data.reviews || []).map((r: any) => ({
        id: r.id,
        farmId: r.farm_id,
        farmName: r.farm_name,
        bookingDate: r.booking_date || new Date().toISOString(),
        rating: r.rating || 0,
        comment: r.comment || "",
        date: r.created_at || new Date().toISOString(),
        status: "submitted",
        farmResponse: r.farm_response
      }));
      
      const realReviewableBookings: ReviewableBooking[] = (data.reviewableBookings || []).map((b: any) => ({
        booking_id: b.booking_id,
        farm_id: b.farm_id,
        farm_name: b.farm_name,
        activity_name: b.activity_name,
        booking_date: b.booking_date,
        participants: b.participants,
        total_amount: b.total_amount,
        status: b.status
      }));
      
      setReviews(realReviews);
      setReviewableBookings(realReviewableBookings);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowEditModal(true);
  };

  // Loading skeleton
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>

          {/* Reviewable Bookings Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-7 w-48 mb-4" />
            <Skeleton className="h-5 w-80 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <ReviewableBookingSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Reviews List Skeleton */}
          <div>
            <Skeleton className="h-7 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
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
                <p className="text-2xl font-bold text-emerald-900">{reviews.length}</p>
              </div>
              <Star className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Ready to Review</p>
                <p className="text-2xl font-bold text-emerald-900">{reviewableBookings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Pending Reviews Section */}
        {reviewableBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4">Ready to Review</h2>
            <p className="text-sm text-emerald-600 mb-4">Share your experience from these completed visits</p>
            <div className="space-y-4">
              {reviewableBookings.map((booking) => (
                <div key={booking.booking_id} className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-emerald-900">{booking.farm_name}</h3>
                      <p className="text-sm text-emerald-600 mt-1">
                        {booking.activity_name} • {new Date(booking.booking_date).toLocaleDateString()} • {booking.participants} guests
                      </p>
                      <p className="text-xs text-emerald-500 mt-1">
                        Amount: KES {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowReviewModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition"
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
        {reviews.length > 0 ? (
          <div>
            <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4">My Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  onEdit={() => openEditModal(review)}
                  onDelete={() => handleDeleteReview(review.id)}
                  isDeleting={deletingId === review.id}
                />
              ))}
            </div>
          </div>
        ) : reviewableBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No reviews yet</p>
            <p className="text-emerald-500 mb-6">Share your farm experiences with the community</p>
            <Link href="/farms">
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                Discover Farms
              </button>
            </Link>
          </div>
        ) : null}
      </div>

      {/* Write Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Review {selectedBooking.farm_name}
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
                {selectedBooking.activity_name} on {new Date(selectedBooking.booking_date).toLocaleDateString()}
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
                      type="button"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-emerald-500 text-emerald-500"
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
                  className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
                  placeholder="Tell us about your experience... (minimum 10 characters)"
                />
                <p className="text-xs text-emerald-400 mt-1">
                  {comment.length}/10 characters minimum
                </p>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Edit Review - {editingReview.farmName}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReview(null);
                  setRating(0);
                  setComment("");
                }}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-emerald-600 mb-4">
                Originally reviewed on {new Date(editingReview.date).toLocaleDateString()}
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
                      type="button"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-emerald-500 text-emerald-500"
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
                  className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
                  placeholder="Update your review... (minimum 10 characters)"
                />
                <p className="text-xs text-emerald-400 mt-1">
                  {comment.length}/10 characters minimum
                </p>
              </div>

              <button
                onClick={handleEditReview}
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Review Card Component with Edit/Delete buttons
function ReviewCard({ review, onEdit, onDelete, isDeleting }: { 
  review: Review; 
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? "fill-emerald-500 text-emerald-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          <button
            onClick={onEdit}
            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition"
            title="Edit review"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            title="Delete review"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      <p className="text-emerald-700 text-sm leading-relaxed">{review.comment}</p>
      
      {review.farmResponse && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Farm Response</span>
          </div>
          <p className="text-sm text-emerald-600">{review.farmResponse}</p>
        </div>
      )}
    </motion.div>
  );
}