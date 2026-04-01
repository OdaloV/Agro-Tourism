// src/app/visitor/dashboard/components/ReviewItem.tsx
import { Star } from "lucide-react";
import { useState } from "react";

interface Review {
  id: number;
  farmId: number;
  farmName: string;
  rating: number;
  comment: string;
  date: string;
  status: "pending" | "submitted";
}

interface ReviewItemProps {
  review: Review;
  onSubmit: (id: number, rating: number, comment: string) => void;
}

export function ReviewItem({ review, onSubmit }: ReviewItemProps) {
  const [rating, setRating] = useState(review.rating || 0);
  const [comment, setComment] = useState(review.comment || "");
  const [showForm, setShowForm] = useState(review.status === "pending");

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    onSubmit(review.id, rating, comment);
    setShowForm(false);
  };

  if (review.status === "submitted") {
    return (
      <div className="border border-emerald-100 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-emerald-900">{review.farmName}</h3>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? "fill-accent text-accent" : "text-gray-300"}`}
                />
              ))}
            </div>
            {review.comment && <p className="text-sm text-emerald-600 mt-2">{review.comment}</p>}
            <p className="text-xs text-emerald-400 mt-1">Reviewed on {new Date(review.date).toLocaleDateString()}</p>
          </div>
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Submitted</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-amber-100 bg-amber-50/30 rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-emerald-900">{review.farmName}</h3>
          <p className="text-sm text-amber-600">Share your experience</p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">Pending</span>
      </div>
      
      {showForm && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${star <= rating ? "fill-accent text-accent" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
              placeholder="Tell us about your experience..."
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-emerald-300 text-emerald-600 rounded-lg text-sm"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}