// src/app/farms/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Heart,
  MapPin,
  Star,
  ChevronDown,
  X,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

interface Farm {
  id: number;
  farm_name: string;
  farm_location: string;
  farm_description: string;
  farm_type: string;
  average_rating: number;
  review_count: number;
  min_price: number;
  max_price: number;
  cover_photo: string;
  profile_photo_url: string;
  city: string;
  county: string;
  is_favorite: boolean;
}

export default function DiscoverFarms() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    farmType: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sortBy: "newest"
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  const farmTypes = [
    "vegetables", "dairy", "livestock", "mixed", "orchard", "vineyard", "poultry", "fishery"
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "rating", label: "Highest Rated" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" }
  ];

  useEffect(() => {
    fetchFarms();
  }, [filters, searchQuery]);

  const fetchFarms = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPagination(prev => ({ ...prev, offset: 0 }));
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        search: searchQuery,
        ...(filters.farmType && { farmType: filters.farmType }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minRating && { minRating: filters.minRating }),
        sortBy: filters.sortBy,
        limit: pagination.limit.toString(),
        offset: reset ? "0" : pagination.offset.toString()
      });

      const response = await fetch(`/api/farms?${params}`);
      const data = await response.json();
      
      if (reset) {
        setFarms(data.farms);
        setPagination({
          ...data.pagination,
          offset: data.pagination.limit
        });
      } else {
        setFarms(prev => [...prev, ...data.farms]);
        setPagination({
          ...data.pagination,
          offset: pagination.offset + data.farms.length
        });
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchFarms(false);
    }
  };

  const toggleFavorite = async (farmId: number, isCurrentlyFavorite: boolean) => {
    try {
      const url = '/api/favorites';
      const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
      const body = JSON.stringify({ farmId });
      
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      
      if (response.ok) {
        setFarms(prev => prev.map(farm => 
          farm.id === farmId ? { ...farm, is_favorite: !isCurrentlyFavorite } : farm
        ));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const clearFilters = () => {
    setFilters({
      farmType: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      sortBy: "newest"
    });
    setSearchQuery("");
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "newest") || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-emerald-900">
            Discover Farms
          </h1>
          <p className="text-emerald-600 mt-1">
            Find authentic farm experiences across Kenya
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by farm name, location, or activity..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-accent text-gray-900"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 transition ${
                showFilters || hasActiveFilters
                  ? "bg-accent text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 bg-white text-accent text-xs rounded-full">
                  {Object.values(filters).filter(v => v && v !== "newest").length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">Filter Farms</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-accent hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Farm Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
                    <select
                      value={filters.farmType}
                      onChange={(e) => setFilters({ ...filters, farmType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    >
                      <option value="">All Types</option>
                      {farmTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      placeholder="e.g., Kiambu, Nakuru"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (KES)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        placeholder="Min"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        placeholder="Max"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Found {pagination.total} farm{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Farms Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : farms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No farms found</p>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent text-white rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm, index) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  index={index}
                  onToggleFavorite={() => toggleFavorite(farm.id, farm.is_favorite)}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-emerald-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Load More Farms'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Farm Card Component
function FarmCard({ farm, index, onToggleFavorite }: { farm: Farm; index: number; onToggleFavorite: () => void }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  const priceDisplay = () => {
    if (farm.min_price === 0 && farm.max_price === 0) return "Free";
    if (farm.min_price === farm.max_price) return `KES ${farm.min_price.toLocaleString()}`;
    return `KES ${farm.min_price.toLocaleString()} - ${farm.max_price.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition cursor-pointer group"
      onClick={() => router.push(`/farms/${farm.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {farm.cover_photo || farm.profile_photo_url ? (
          <img
            src={imageError ? '/farm-placeholder.jpg' : (farm.cover_photo || farm.profile_photo_url)}
            alt={farm.farm_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">🌾</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition shadow-md"
        >
          <Heart
            className={`h-5 w-5 ${farm.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
          />
        </button>
        
        {/* Rating Badge */}
        {farm.average_rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-medium">{farm.average_rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({farm.review_count})</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-emerald-900 text-lg line-clamp-1">
            {farm.farm_name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-emerald-600 mb-2">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{farm.city || farm.county || farm.farm_location}</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {farm.farm_description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="font-semibold text-accent">{priceDisplay()}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/farms/${farm.id}`);
            }}
            className="px-4 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}