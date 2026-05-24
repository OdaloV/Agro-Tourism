"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Heart,
  Star,
  Eye,
  MapPin,
  Users,
  ChevronRight,
} from "lucide-react";
import { Skeleton, StatCardSkeleton, BookingCardSkeleton, FarmCardSkeleton } from "@/components/ui/Skeleton";

interface Booking {
  id: number;
  farmId: number;
  farmName: string;
  activity: string;
  date: string;
  participants: number;
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: number;
}

interface FavoriteFarm {
  id: number;
  farmName: string;
  location: string;
  rating: number;
}

interface RecentView {
  id: number;
  farm_id: number;
  farm_name: string;
  farm_location: string;
  viewed_at: string;
}

export default function VisitorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Data will be loaded dynamically
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteFarm[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewableBookings, setReviewableBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("userData");
        const userRole = localStorage.getItem("userRole");
        
        if (!userData || userData === "undefined" || userRole !== "visitor") {
          router.push("/auth/login/visitor");
          return;
        }
        
        let parsedUser;
        try {
          parsedUser = JSON.parse(userData);
        } catch (parseError) {
          console.error("Invalid JSON in localStorage:", parseError);
          router.push("/auth/login/visitor");
          return;
        }
        setUser(parsedUser);
        
        // Fetch profile photo from database API
        try {
          const photoResponse = await fetch('/api/user/visitorpfp');
          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            console.log("Fetched profile photo:", photoData.visitorpfp ? "Yes" : "No");
            if (photoData.visitorpfp) {
              setProfilePhoto(photoData.visitorpfp);
              localStorage.setItem("visitor_profile_photo", photoData.visitorpfp);
            } else {
              const localPhoto = localStorage.getItem("visitor_profile_photo");
              if (localPhoto) setProfilePhoto(localPhoto);
            }
          } else {
            const localPhoto = localStorage.getItem("visitor_profile_photo");
            if (localPhoto) setProfilePhoto(localPhoto);
          }
        } catch (err) {
          console.error('Profile photo fetch failed', err);
        }

        // Fetch dashboard data in parallel
        try {
          const [bookingsRes, favoritesRes, recentRes, reviewsRes] = await Promise.all([
            fetch('/api/bookings').then(r => r.ok ? r.json() : { bookings: [] }),
            fetch('/api/favorites').then(r => r.ok ? r.json() : { favorites: [] }),
            fetch('/api/recent-views').then(r => r.ok ? r.json() : { recentViews: [] }),
            fetch('/api/reviews').then(r => r.ok ? r.json() : { reviews: [], reviewableBookings: [] })
          ]);

          // Map bookings to interface (farm_name -> farmName, etc)
          const mappedBookings: Booking[] = (bookingsRes.bookings || []).map((b: any) => ({
            id: b.id,
            farmId: b.farm_id,
            farmName: b.farm_name,
            activity: b.activity_name,
            date: b.booking_date,
            participants: b.participants,
            status: b.status,
            totalPrice: b.total_amount
          }));

          // Map favorites
          const mappedFavorites: FavoriteFarm[] = (favoritesRes.favorites || []).map((f: any) => ({
            id: f.id,
            farmName: f.farm_name,
            location: f.location,
            rating: f.rating || 0
          }));

          // Map recent views
          const mappedRecentViews: RecentView[] = (recentRes.recentViews || []).map((rv: any) => ({
            id: rv.id,
            farm_id: rv.farm_id,
            farm_name: rv.farm_name,
            farm_location: rv.farm_location,
            viewed_at: rv.viewed_at
          }));

          setBookings(mappedBookings);
          setFavorites(mappedFavorites);
          setRecentViews(mappedRecentViews);
          setReviews(reviewsRes.reviews || []);
          setReviewableBookings(reviewsRes.reviewableBookings || []);
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const upcomingBookings = bookings.filter(b => 
    (b.status === "confirmed" || b.status === "pending") && new Date(b.date) >= new Date()
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Two Column Layout Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="p-5 border-b border-emerald-100">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="p-5 space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <BookingCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Profile Photo */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {/* Profile Photo Circle */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Failed to load profile photo");
                  setProfilePhoto(null);
                }}
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "V"}
              </span>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">
              Welcome back, {user?.name?.split(" ")[0] || "Visitor"}!
            </h1>
            <p className="text-emerald-600 mt-1">Discover and manage your farm experiences</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Calendar} 
          label="Upcoming" 
          value={upcomingBookings.length} 
          color="emerald"
        />
        <StatCard 
          icon={Heart} 
          label="Favorites" 
          value={favorites.length} 
          color="red"
        />
        <StatCard 
          icon={Eye} 
          label="Recent Views" 
          value={recentViews.length} 
          color="blue"
        />
        <StatCard 
          icon={Star} 
          label="Reviews" 
          value={reviews.length} 
          color="amber"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Upcoming Bookings Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
            <h2 className="text-lg font-semibold text-emerald-900">Upcoming Bookings</h2>
            <Link href="/visitor/dashboard/bookings" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="p-5">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No upcoming bookings</p>
                <Link href="/farms">
                  <button className="mt-4 px-4 py-2 bg-accent text-white rounded-xl text-sm">
                    Discover Farms
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                    <div>
                      <p className="font-medium text-emerald-900">{booking.farmName}</p>
                      <div className="flex items-center gap-3 text-sm text-emerald-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.participants}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === "confirmed" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
            <h2 className="text-lg font-semibold text-emerald-900">Recently Viewed</h2>
            <Link href="/visitor/dashboard/recent" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="p-5">
            {recentViews.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No recently viewed farms</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentViews.map((view) => (
                  <div key={view.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                    <div>
                      <p className="font-medium text-emerald-900">{view.farm_name}</p>
                      <p className="text-sm text-emerald-600">{view.farm_location}</p>
                      <p className="text-xs text-emerald-400 mt-1">
                        Viewed: {new Date(view.viewed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/farms/${view.farm_id}`}>
                      <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">
                        View Again
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Favorite Farms Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
            <h2 className="text-lg font-semibold text-emerald-900">Favorite Farms</h2>
            <Link href="/visitor/dashboard/favorites" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="p-5">
            {favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No favorite farms yet</p>
                <Link href="/farms">
                  <button className="mt-4 px-4 py-2 bg-accent text-white rounded-xl text-sm">
                    Discover Farms
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((farm) => (
                  <div key={farm.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                    <div>
                      <p className="font-medium text-emerald-900">{farm.farmName}</p>
                      <p className="text-sm text-emerald-600">{farm.location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm text-emerald-700">{farm.rating}</span>
                      </div>
                    </div>
                    <Link href={`/farms/${farm.id}`}>
                      <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">
                        Book Now
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Reviews Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
            <h2 className="text-lg font-semibold text-emerald-900">Pending Reviews</h2>
            <Link href="/visitor/dashboard/reviews" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="p-5">
            {reviewableBookings.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No pending reviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewableBookings.slice(0, 3).map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                    <div>
                      <p className="font-medium text-emerald-900">{booking.farm_name}</p>
                      <div className="flex items-center gap-3 text-sm text-emerald-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Review
                        </span>
                      </div>
                    </div>
                    <Link href="/visitor/dashboard/reviews">
                      <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">
                        Review Now
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: number; 
  color: string;
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">{value}</p>
      <p className="text-sm text-emerald-600 mt-0.5">{label}</p>
    </div>
  );
}