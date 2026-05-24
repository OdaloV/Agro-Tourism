"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  MapPin,
  ChevronLeft,
  Share2,
  X,
  DollarSign,
} from "lucide-react";
import { FarmCardSkeleton } from "@/components/ui/Skeleton";

interface FavoriteFarm {
  id: number;
  farm_name: string;
  location: string;
  rating: number | string;
  cover_photo?: string;
  // Additional fields you might want to fetch
  activities?: string[];
  pricePerPerson?: number;
}

export default function VisitorFavorites() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteFarm[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<FavoriteFarm | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/favorites", {
        credentials: "include", // Important for cookies
      });

      if (response.status === 401) {
        router.push("/auth/login/visitor");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    fetchFavorites();
  }, [mounted, fetchFavorites]);

  const handleRemoveFavorite = async (farmId: number) => {
    setRemovingId(farmId);
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ farmId }),
        credentials: "include",
      });

      if (response.ok) {
        setFavorites(favorites.filter((f) => f.id !== farmId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove from favorites");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites");
    } finally {
      setRemovingId(null);
    }
  };

  const handleShare = (farm: FavoriteFarm) => {
    setSelectedFarm(farm);
    setShowShareModal(true);
  };

  const handleShareSocial = (platform: string) => {
    if (!selectedFarm) return;

    const url = `${window.location.origin}/farms/${selectedFarm.id}`;
    const text = `Check out ${selectedFarm.farm_name} on HarvestHost!`;

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } else if (platform === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
        "_blank"
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    }

    setShowShareModal(false);
    setSelectedFarm(null);
  };

  // Format rating to 1 decimal place
  const formatRating = (rating: number | string | undefined) => {
    if (!rating) return "0";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    return isNaN(num) ? "0" : num.toFixed(1);
  };

  // Skeleton Loading State
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <div className="h-5 w-32 bg-muted rounded-lg animate-pulse mb-4"></div>
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2"></div>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-muted rounded-full animate-pulse"></div>
                <div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-8 bg-muted rounded animate-pulse mt-1"></div>
                </div>
              </div>
              <div className="h-10 w-40 bg-muted rounded-xl animate-pulse"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <FarmCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/visitor/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-bold text-emerald-900">
            Favorite Farms
          </h1>
          <p className="text-emerald-600 mt-1">
            Your saved farms for quick booking
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <div>
                <p className="text-sm text-emerald-600">Total Favorites</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {favorites.length}
                </p>
              </div>
            </div>
            <Link href="/farms">
              <button className="px-4 py-2 bg-accent text-white rounded-xl text-sm">
                Discover More Farms
              </button>
            </Link>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100">
            <Heart className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">
              No favorite farms yet
            </p>
            <p className="text-emerald-500 mb-6">
              Heart farms you love to save them here
            </p>
            <Link href="/farms">
              <button className="px-6 py-3 bg-accent text-white rounded-xl">
                Discover Farms
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {favorites.map((farm) => (
              <FavoriteCard
                key={farm.id}
                farm={farm}
                onRemove={handleRemoveFavorite}
                onShare={handleShare}
                isRemoving={removingId === farm.id}
                formatRating={formatRating}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedFarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Share {selectedFarm.farm_name}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-emerald-600 mb-4 text-center">
                Share this farm with friends and family
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShareSocial("copy")}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => handleShareSocial("whatsapp")}
                  className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => handleShareSocial("facebook")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => handleShareSocial("twitter")}
                  className="flex items-center justify-center gap-2 p-3 bg-sky-100 text-sky-700 rounded-xl hover:bg-sky-200 transition"
                >
                  🐦 Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Favorite Card Component
function FavoriteCard({
  farm,
  onRemove,
  onShare,
  isRemoving,
  formatRating,
}: {
  farm: FavoriteFarm;
  onRemove: (id: number) => void;
  onShare: (farm: FavoriteFarm) => void;
  isRemoving: boolean;
  formatRating: (rating: number | string | undefined) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition"
    >
      {/* Optional: Cover Photo */}
      {farm.cover_photo && (
        <div className="h-40 w-full relative">
          <img
            src={farm.cover_photo}
            alt={farm.farm_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                {farm.farm_name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm text-emerald-700">
                  {formatRating(farm.rating)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-600 mb-3">
              <MapPin className="h-4 w-4" />
              <span>{farm.location || "Location not specified"}</span>
            </div>

            {/* You can fetch activities separately if needed */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                Farm Visit
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                Agritourism
              </span>
            </div>

            {/* Price - You may need to fetch this from another endpoint */}
            <div className="flex items-center gap-1 text-sm text-emerald-800">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">Price on request</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onShare(farm)}
              className="p-2 hover:bg-emerald-50 rounded-lg transition"
              title="Share"
            >
              <Share2 className="h-5 w-5 text-emerald-500" />
            </button>
            <button
              onClick={() => onRemove(farm.id)}
              disabled={isRemoving}
              className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              title="Remove from favorites"
            >
              {isRemoving ? (
                <div className="h-5 w-5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <X className="h-5 w-5 text-red-400" />
              )}
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href={`/farms/${farm.id}`} className="flex-1">
            <button className="w-full py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition">
              Book Now
            </button>
          </Link>
          <Link href={`/farms/${farm.id}`} className="flex-1">
            <button className="w-full py-2 border border-emerald-300 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 transition">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}