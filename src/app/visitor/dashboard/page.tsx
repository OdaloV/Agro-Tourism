// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import {
//   Calendar,
//   Heart,
//   Clock,
//   Star,
//   MessageCircle,
//   CreditCard,
//   Settings,
//   LogOut,
//   ChevronRight,
//   MapPin,
//   Users,
//   AlertCircle,
//   CheckCircle,
//   Eye,
//   History,
// } from "lucide-react";

// // Types
// interface Booking {
//   id: number;
//   farmId: number;
//   farmName: string;
//   activity: string;
//   date: string;
//   participants: number;
//   status: "confirmed" | "pending" | "cancelled" | "waitlisted";
//   totalPrice: number;
//   specialRequests?: string;
// }

// interface FavoriteFarm {
//   id: number;
//   farmName: string;
//   location: string;
//   rating: number;
// }

// interface RecentView {
//   id: number;
//   farmName: string;
//   location: string;
//   viewedAt: string;
// }

// interface Review {
//   id: number;
//   farmId: number;
//   farmName: string;
//   status: "pending" | "submitted";
// }

// // Stat Card Component
// function StatCard({ icon: Icon, label, value, color, onClick }: { 
//   icon: any; 
//   label: string; 
//   value: number; 
//   color: string;
//   onClick?: () => void;
// }) {
//   const colors = {
//     emerald: "bg-emerald-100 text-emerald-600",
//     red: "bg-red-100 text-red-600",
//     amber: "bg-amber-100 text-amber-600",
//     blue: "bg-blue-100 text-blue-600",
//   };

//   return (
//     <div 
//       onClick={onClick}
//       className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition-all"
//     >
//       <div className={`inline-flex p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
//         <Icon className="h-5 w-5" />
//       </div>
//       <p className="text-2xl font-bold text-emerald-900 mt-3">{value}</p>
//       <p className="text-sm text-emerald-600 mt-0.5">{label}</p>
//     </div>
//   );
// }

// export default function VisitorDashboard() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "favorites" | "recent" | "messages" | "payments" | "reviews" | "settings">("overview");
  
//   // Mock data - will be replaced with API calls
//   const [bookings, setBookings] = useState<Booking[]>([
//     {
//       id: 1,
//       farmId: 1,
//       farmName: "Green Acres Farm",
//       activity: "Farm Tour",
//       date: "2024-04-15",
//       participants: 2,
//       status: "confirmed",
//       totalPrice: 3000,
//     },
//     {
//       id: 2,
//       farmId: 2,
//       farmName: "Sunrise Dairy",
//       activity: "Milking Experience",
//       date: "2024-04-20",
//       participants: 4,
//       status: "pending",
//       totalPrice: 6000,
//     },
//   ]);
  
//   const [favorites, setFavorites] = useState<FavoriteFarm[]>([
//     { id: 1, farmName: "Highland Orchard", location: "Nyeri, Kenya", rating: 4.8 },
//     { id: 2, farmName: "Sunrise Dairy", location: "Nakuru, Kenya", rating: 4.6 },
//   ]);
  
//   const [recentViews, setRecentViews] = useState<RecentView[]>([
//     { id: 1, farmName: "Green Valley Farm", location: "Kiambu, Kenya", viewedAt: "2024-04-01" },
//     { id: 2, farmName: "Sunrise Dairy", location: "Nakuru, Kenya", viewedAt: "2024-03-30" },
//   ]);
  
//   const [reviews, setReviews] = useState<Review[]>([
//     { id: 1, farmId: 2, farmName: "Sunrise Dairy", status: "pending" },
//   ]);

//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     const userRole = localStorage.getItem("userRole");
    
//     if (!userData || userRole !== "visitor") {
//       router.push("/auth/login/visitor");
//       return;
//     }
    
//     setUser(JSON.parse(userData));
//     setLoading(false);
//   }, [router]);

//   const handleLogout = async () => {
//     await fetch('/api/auth/logout', { method: 'POST' });
//     localStorage.clear();
//     router.push("/auth");
//   };

//   const upcomingBookings = bookings.filter(b => 
//     (b.status === "confirmed" || b.status === "pending") && new Date(b.date) >= new Date()
//   );
  
//   const pendingReviews = reviews.filter(r => r.status === "pending").length;

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
        
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-heading font-bold text-emerald-900">
//                 Welcome back, {user?.name?.split(" ")[0] || "Visitor"}!
//               </h1>
//               <p className="text-emerald-600 mt-1">Discover and manage your farm experiences</p>
//             </div>
            
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl transition-colors"
//             >
//               <LogOut className="h-5 w-5" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>

//         {/* Overview Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <StatCard 
//             icon={Calendar} 
//             label="Upcoming Bookings" 
//             value={upcomingBookings.length} 
//             color="emerald" 
//             onClick={() => setActiveTab("bookings")}
//           />
//           <StatCard 
//             icon={Heart} 
//             label="Favorite Farms" 
//             value={favorites.length} 
//             color="red" 
//             onClick={() => router.push("/visitor/dashboard/favorites")}
//           />
//           <StatCard 
//             icon={Star} 
//             label="Pending Reviews" 
//             value={pendingReviews} 
//             color="amber" 
//             onClick={() => setActiveTab("reviews")}
//           />
//           <StatCard 
//             icon={Eye} 
//             label="Recently Viewed" 
//             value={recentViews.length} 
//             color="blue" 
//             onClick={() => setActiveTab("recent")}
//           />
//         </div>

//         {/* Quick Action Links */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <QuickActionCard 
//             icon={Search} 
//             title="Discover Farms" 
//             description="Find new farm experiences"
//             href="/farms"
//             color="emerald"
//           />
//           <QuickActionCard 
//             icon={MessageCircle} 
//             title="Messages" 
//             description="Chat with farmers"
//             href="/visitor/dashboard/messages"
//             color="blue"
//           />
//           <QuickActionCard 
//             icon={CreditCard} 
//             title="Payments" 
//             description="View payment history"
//             href="/visitor/dashboard/payments"
//             color="purple"
//           />
//           <QuickActionCard 
//             icon={Settings} 
//             title="Settings" 
//             description="Update your profile"
//             href="/visitor/dashboard/settings"
//             color="gray"
//           />
//           <QuickActionCard 
//            icon={Calendar} 
//            title="My Bookings" 
//            description="Manage your farm experiences"
//            href="/visitor/dashboard/bookings"
//            color="blue"
//           />
//           <QuickActionCard 
//             icon={Heart} 
//             title="Favorites" 
//             description="Your saved farms"
//             href="/visitor/dashboard/favorites"
//             color="red"
//            />
          

//         </div>

//         <div className="grid lg:grid-cols-2 gap-6">
          
//           {/* Upcoming Bookings Preview */}
//           <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
//             <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-lg font-heading font-semibold text-emerald-900">Upcoming Bookings</h2>
//                   <p className="text-sm text-emerald-500">Your scheduled farm experiences</p>
//                 </div>
//                 <button 
//                   onClick={() => router.push("/visitor/dashboard/bookings")}
//                   className="text-accent text-sm hover:underline flex items-center gap-1"
//                 >
//                   View All <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6">
//               {upcomingBookings.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Calendar className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
//                   <p className="text-emerald-500">No upcoming bookings</p>
//                   <Link href="/farms">
//                     <button className="mt-4 px-4 py-2 bg-accent text-white rounded-xl text-sm">
//                       Discover Farms
//                     </button>
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {upcomingBookings.slice(0, 3).map((booking) => (
//                     <div key={booking.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
//                       <div>
//                         <p className="font-medium text-emerald-900">{booking.farmName}</p>
//                         <div className="flex items-center gap-3 text-sm text-emerald-600 mt-1">
//                           <span className="flex items-center gap-1">
//                             <Calendar className="h-3 w-3" />
//                             {new Date(booking.date).toLocaleDateString()}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Users className="h-3 w-3" />
//                             {booking.participants}
//                           </span>
//                         </div>
//                       </div>
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         booking.status === "confirmed" 
//                           ? "bg-green-100 text-green-600" 
//                           : "bg-amber-100 text-amber-600"
//                       }`}>
//                         {booking.status}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Recently Viewed Preview */}
//           <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
//             <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-lg font-heading font-semibold text-emerald-900">Recently Viewed</h2>
//                   <p className="text-sm text-emerald-500">Farms you've visited recently</p>
//                 </div>
//                 <button 
//                   onClick={() => setActiveTab("recent")}
//                   className="text-accent text-sm hover:underline flex items-center gap-1"
//                 >
//                   View All <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6">
//               {recentViews.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Eye className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
//                   <p className="text-emerald-500">No recently viewed farms</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {recentViews.map((view) => (
//                     <div key={view.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
//                       <div>
//                         <p className="font-medium text-emerald-900">{view.farmName}</p>
//                         <p className="text-sm text-emerald-600">{view.location}</p>
//                         <p className="text-xs text-emerald-400 mt-1">
//                           Viewed: {new Date(view.viewedAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <Link href={`/farms/${view.id}`}>
//                         <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">
//                           View Again
//                         </button>
//                       </Link>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Favorite Farms Preview */}
//           <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
//             <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-lg font-heading font-semibold text-emerald-900">Favorite Farms</h2>
//                   <p className="text-sm text-emerald-500">Your saved farms</p>
//                 </div>
//                 <button 
//                   onClick={() => setActiveTab("favorites")}
//                   className="text-accent text-sm hover:underline flex items-center gap-1"
//                 >
//                   View All <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6">
//               {favorites.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Heart className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
//                   <p className="text-emerald-500">No favorite farms yet</p>
//                   <Link href="/farms">
//                     <button className="mt-4 px-4 py-2 bg-accent text-white rounded-xl text-sm">
//                       Discover Farms
//                     </button>
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {favorites.map((farm) => (
//                     <div key={farm.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
//                       <div>
//                         <p className="font-medium text-emerald-900">{farm.farmName}</p>
//                         <p className="text-sm text-emerald-600">{farm.location}</p>
//                         <div className="flex items-center gap-1 mt-1">
//                           <Star className="h-4 w-4 fill-accent text-accent" />
//                           <span className="text-sm text-emerald-700">{farm.rating}</span>
//                         </div>
//                       </div>
//                       <Link href={`/farms/${farm.id}`}>
//                         <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">
//                           Book Now
//                         </button>
//                       </Link>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Pending Reviews Preview */}
//           <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
//             <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-lg font-heading font-semibold text-emerald-900">Pending Reviews</h2>
//                   <p className="text-sm text-emerald-500">Share your experience</p>
//                 </div>
//                 <button 
//                   onClick={() => setActiveTab("reviews")}
//                   className="text-accent text-sm hover:underline flex items-center gap-1"
//                 >
//                   View All <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6">
//               {pendingReviews === 0 ? (
//                 <div className="text-center py-8">
//                   <Star className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
//                   <p className="text-emerald-500">No pending reviews</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {reviews.filter(r => r.status === "pending").map((review) => (
//                     <div key={review.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
//                       <div>
//                         <p className="font-medium text-emerald-900">{review.farmName}</p>
//                         <p className="text-sm text-emerald-600">How was your experience?</p>
//                       </div>
//                       <button 
//                         onClick={() => {
//                           const rating = prompt("Rate your experience (1-5 stars):");
//                           if (rating) {
//                             alert(`Thank you for rating ${review.farmName} ${rating} stars!`);
//                           }
//                         }}
//                         className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm"
//                       >
//                         Write Review
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Quick Action Card Component
// function QuickActionCard({ icon: Icon, title, description, href, color }: { 
//   icon: any; 
//   title: string; 
//   description: string; 
//   href: string;
//   color: string;
// }) {
//   const colors = {
//     emerald: "bg-emerald-50 text-emerald-600",
//     blue: "bg-blue-50 text-blue-600",
//     purple: "bg-purple-50 text-purple-600",
//     gray: "bg-gray-50 text-gray-600",
//   };

//   return (
//     <Link href={href}>
//       <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-all cursor-pointer">
//         <div className={`inline-flex p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
//           <Icon className="h-5 w-5" />
//         </div>
//         <h3 className="font-semibold text-emerald-900 mt-3">{title}</h3>
//         <p className="text-sm text-emerald-500 mt-1">{description}</p>
//       </div>
//     </Link>
//   );
// }

// // Import Search icon
// import { Search } from "lucide-react";
// src/app/visitor/dashboard/page.tsx
// src/app/visitor/dashboard/page.tsx
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
  farmName: string;
  location: string;
  viewedAt: string;
}

export default function VisitorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Mock data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      farmId: 1,
      farmName: "Green Acres Farm",
      activity: "Farm Tour",
      date: "2024-04-15",
      participants: 2,
      status: "confirmed",
      totalPrice: 3000,
    },
    {
      id: 2,
      farmId: 2,
      farmName: "Sunrise Dairy",
      activity: "Milking Experience",
      date: "2024-04-20",
      participants: 4,
      status: "pending",
      totalPrice: 6000,
    },
  ]);
  
  const [favorites, setFavorites] = useState<FavoriteFarm[]>([
    { id: 1, farmName: "Highland Orchard", location: "Nyeri, Kenya", rating: 4.8 },
    { id: 2, farmName: "Sunrise Dairy", location: "Nakuru, Kenya", rating: 4.6 },
  ]);
  
  const [recentViews, setRecentViews] = useState<RecentView[]>([
    { id: 1, farmName: "Green Valley Farm", location: "Kiambu, Kenya", viewedAt: "2024-04-01" },
    { id: 2, farmName: "Sunrise Dairy", location: "Nakuru, Kenya", viewedAt: "2024-03-30" },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const userRole = localStorage.getItem("userRole");
    
    if (!userData || userRole !== "visitor") {
      router.push("/auth/login/visitor");
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const upcomingBookings = bookings.filter(b => 
    (b.status === "confirmed" || b.status === "pending") && new Date(b.date) >= new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-emerald-900">
            Welcome back, {user?.name?.split(" ")[0] || "Visitor"}!
          </h1>
          <p className="text-emerald-600 mt-1">Discover and book authentic farm experiences</p>
        </div>

        {/* Stats Overview */}
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
            value={3} 
            color="amber"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upcoming Bookings */}
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
                    {upcomingBookings.map((booking) => (
                      <BookingItem key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Farms */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                <h2 className="text-lg font-semibold text-emerald-900">Recommended for You</h2>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {favorites.map((farm) => (
                    <RecommendedFarmCard key={farm.id} farm={farm} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                <h2 className="text-lg font-semibold text-emerald-900">Recent Activity</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {recentViews.map((view) => (
                    <ActivityItem key={view.id} view={view} />
                  ))}
                </div>
                <Link href="/visitor/dashboard/recent">
                  <button className="w-full mt-4 text-center text-sm text-accent hover:underline">
                    View all activity →
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl p-5 border border-emerald-100">
              <h3 className="text-md font-semibold text-emerald-900 mb-3">💡 Quick Tip</h3>
              <p className="text-sm text-emerald-600">
                Farms with photos get 3x more bookings. Check out our featured farms with stunning views!
              </p>
              <Link href="/farms">
                <button className="mt-4 text-sm text-accent hover:underline flex items-center gap-1">
                  Explore featured farms <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
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

// Booking Item Component
function BookingItem({ booking }: { booking: Booking }) {
  const statusColors = {
    confirmed: "bg-green-100 text-green-600",
    pending: "bg-amber-100 text-amber-600",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
      <div>
        <p className="font-medium text-emerald-900">{booking.farmName}</p>
        <div className="flex items-center gap-3 text-sm text-emerald-600 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(booking.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {booking.participants} guests
          </span>
        </div>
      </div>
      <Link href={`/farms/${booking.farmId}`}>
        <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition">
          Details
        </button>
      </Link>
    </div>
  );
}

// Recommended Farm Card
function RecommendedFarmCard({ farm }: { farm: FavoriteFarm }) {
  return (
    <Link href={`/farms/${farm.id}`}>
      <div className="bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-emerald-900">{farm.farmName}</h4>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs text-emerald-700">{farm.rating}</span>
          </div>
        </div>
        <p className="text-sm text-emerald-600 mb-3 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {farm.location}
        </p>
        <button className="w-full py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition">
          Book Now
        </button>
      </div>
    </Link>
  );
}

// Activity Item Component
function ActivityItem({ view }: { view: RecentView }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-lg transition">
      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
        <Eye className="h-4 w-4 text-emerald-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-900">{view.farmName}</p>
        <p className="text-xs text-emerald-500">{view.location}</p>
      </div>
      <span className="text-xs text-emerald-400">{new Date(view.viewedAt).toLocaleDateString()}</span>
    </div>
  );
}