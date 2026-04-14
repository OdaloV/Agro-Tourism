"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tractor,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  Camera,
  Home,
  Activity,
  Building,
  Shield,
  ChevronRight,
  Eye,
  Edit,
  Ruler,
  LogOut,
  LogIn,
  DollarSign,
  MessageCircle,
  List,
  BarChart3,
  Settings, 
} from "lucide-react";
import Link from "next/link";
import MediaGallery from './components/MediaGallery';
import ThemeToggle from "@/app/components/ThemeToggle";

interface Photo {
  id: number;
  url: string;
  sort_order: number;
  uploaded_at: string;
}

interface FarmerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  farmLocation: string;
  farmSize: string;
  yearEstablished: string;
  farmDescription: string;
  farmType: string;
  activities: string[];
  facilities: string[];
  accommodation: boolean;
  maxGuests: string;
  farmPhotos: number;
  photos?: Photo[];
  videoLink: string;
  documents: {
    businessLicense: boolean;
    nationalId: boolean;
    insurance: boolean;
    certifications: boolean;
  };
  verificationStatus: string;
  submittedAt: string;
  stats: {
    profileViews: number;
    bookings: number;
    rating: number;
  };
}

interface EarningItem {
  id: number;
  activityName: string;
  farmName: string;
  bookingDate: string;
  guests: number;
  amount: number;
  platformFee: number;
  farmerEarning: number;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recentEarnings, setRecentEarnings] = useState<EarningItem[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPlatformFee, setTotalPlatformFee] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchFarmerData = async () => {
      try {
        const userData = localStorage.getItem("userData");
        
        if (!userData) {
          console.log("No user data found, redirecting to login");
          router.push("/auth/login/farmer");
          return;
        }

        const user = JSON.parse(userData);
        
        if (user.verificationStatus === 'pending') {
          setFarmer({
            id: user.id || 1,
            name: user.name || "Farmer",
            email: user.email || "",
            phone: user.phone || "",
            farmName: user.farmName || "",
            farmLocation: user.farmLocation || "",
            farmSize: user.farmSize || "",
            yearEstablished: user.yearEstablished || "",
            farmDescription: user.farmDescription || "",
            farmType: user.farmType || "",
            activities: user.activities || [],
            facilities: user.facilities || [],
            accommodation: user.accommodation || false,
            maxGuests: user.maxGuests || "",
            farmPhotos: user.farmPhotos || 0,
            videoLink: user.videoLink || "",
            documents: {
              businessLicense: false,
              nationalId: false,
              insurance: false,
              certifications: false,
            },
            verificationStatus: "pending",
            submittedAt: new Date().toISOString().split('T')[0],
            stats: {
              profileViews: 0,
              bookings: 0,
              rating: 0,
            },
          });
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/farmer/profile?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch farmer data");
        }
        
        const data = await response.json();
        
        try {
          const photosResponse = await fetch(`/api/farmer/photos`);
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            data.farmPhotos = photosData.photos?.length || 0;
            data.photos = photosData.photos || [];
          } else {
            data.farmPhotos = 0;
          }
        } catch (photoError) {
          console.error("Error fetching photos:", photoError);
          data.farmPhotos = 0;
        }
        
        try {
          const photoResponse = await fetch(`/api/farmer/profile/photo`);
          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            setProfilePhoto(photoData.photoUrl);
          }
        } catch (photoError) {
          console.error("Error fetching profile photo:", photoError);
        }
        
        try {
          const messagesResponse = await fetch(`/api/farmer/messages/unread-count`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            setUnreadMessages(messagesData.count || 0);
          }
        } catch (msgError) {
          console.error("Error fetching messages:", msgError);
        }
        
        setFarmer(data);
        
        const earningsResponse = await fetch(`/api/farmer/earnings?farmerId=${data.id}`);
        if (earningsResponse.ok) {
          const earningsData = await earningsResponse.json();
          setRecentEarnings(earningsData.recent || []);
          setTotalEarnings(earningsData.total || 0);
          setTotalPlatformFee(earningsData.platformFee || 0);
        }
      } catch (error) {
        console.error("Error fetching farmer data:", error);
        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          setFarmer({
            id: user.id || 1,
            name: user.name || "Farmer",
            email: user.email || "",
            phone: "",
            farmName: "",
            farmLocation: "",
            farmSize: "",
            yearEstablished: "",
            farmDescription: "",
            farmType: "",
            activities: [],
            facilities: [],
            accommodation: false,
            maxGuests: "",
            farmPhotos: 0,
            videoLink: "",
            documents: {
              businessLicense: false,
              nationalId: false,
              insurance: false,
              certifications: false,
            },
            verificationStatus: user.verificationStatus || "pending",
            submittedAt: new Date().toISOString().split('T')[0],
            stats: {
              profileViews: 0,
              bookings: 0,
              rating: 0,
            },
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFarmerData();
  }, [router, mounted]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    router.push("/auth");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-emerald-900">No data found</h2>
          <p className="text-emerald-600 mt-2">Please complete your profile</p>
          <Link href="/auth/register/farmer">
            <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl">
              Complete Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = farmer.verificationStatus === "pending";
  const isApproved = farmer.verificationStatus === "approved";
  const isRejected = farmer.verificationStatus === "rejected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-lg font-bold overflow-hidden flex-shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{farmer.name?.charAt(0).toUpperCase() || "F"}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-emerald-900">
                  Welcome back, {farmer.name?.split(" ")[0] || "Farmer"}!
                </h1>
                <p className="text-emerald-600 mt-1 text-sm md:text-base">Manage your farm and track bookings</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-end gap-3">
              <ThemeToggle />
              {isPending ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("userData");
                    router.push("/auth/login/farmer");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-sm">Login to Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Logout</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Verification Status Badges - Fixed contrast */}
          <div className="mt-4">
            {isPending && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-100 rounded-xl border border-amber-300">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-amber-700" />
                  <div>
                    <p className="text-amber-800 font-semibold">Awaiting Verification</p>
                    <p className="text-xs text-amber-700">Documents submitted on {farmer.submittedAt}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-amber-700 mb-1">Verification email sent to:</p>
                  <p className="text-sm text-amber-800 font-mono font-medium">{farmer.email}</p>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/resend-verification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: farmer.email })
                        });
                        if (response.ok) {
                          alert("Verification email resent! Check your inbox.");
                        } else {
                          alert("Failed to resend. Please try again.");
                        }
                      } catch (error) {
                        console.error("Error resending verification:", error);
                        alert("Failed to resend verification email.");
                      }
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium underline mt-1"
                  >
                    Resend verification email
                  </button>
                </div>
              </div>
            )}
            
            {isApproved && (
              <div className="flex items-center gap-3 px-4 py-3 bg-green-600 rounded-xl border border-green-700 shadow-sm">
                <CheckCircle className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white font-semibold">Verified Farm</p>
                  <p className="text-xs text-green-100">Your farm is live and visible to visitors!</p>
                </div>
              </div>
            )}
            
            {isRejected && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-600 rounded-xl border border-red-700 shadow-sm">
                <AlertCircle className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white font-semibold">Verification Needed</p>
                  <p className="text-xs text-red-100">Please check your documents and resubmit</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {isApproved && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Eye}
              label="Profile Views"
              value={farmer.stats.profileViews}
              suffix=" views"
              bgColor="bg-emerald-500"
              iconColor="text-white"
            />
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              value={farmer.stats.bookings}
              suffix=" bookings"
              bgColor="bg-blue-500"
              iconColor="text-white"
            />
            <StatCard
              icon={Star}
              label="Rating"
              value={farmer.stats.rating === 0 ? "No reviews" : farmer.stats.rating.toFixed(1)}
              suffix={farmer.stats.rating > 0 ? " ★" : ""}
              bgColor="bg-amber-500"
              iconColor="text-white"
            />
            <StatCard
              icon={DollarSign}
              label="Total Earnings"
              value={`KES ${totalEarnings.toLocaleString()}`}
              bgColor="bg-green-500"
              iconColor="text-white"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Farm Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Farm Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden"
            >
              <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-emerald-900">
                      {farmer.farmName || "Your Farm"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-emerald-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{farmer.farmLocation || "Location not set"}</span>
                    </div>
                  </div>
                  <Link href="/farmer/profile/edit">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  {farmer.farmSize && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">{farmer.farmSize} acres</span>
                    </div>
                  )}
                  {farmer.yearEstablished && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">Est. {farmer.yearEstablished}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">{farmer.accommodation ? "Has Accommodation" : "No Accommodation"}</span>
                  </div>
                </div>
                
                {farmer.farmDescription && (
                  <div>
                    <h3 className="font-semibold text-emerald-800 mb-2">About the Farm</h3>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      {showFullDescription 
                        ? farmer.farmDescription 
                        : `${farmer.farmDescription.substring(0, 150)}${farmer.farmDescription.length > 150 ? "..." : ""}`}
                      {farmer.farmDescription.length > 150 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium underline ml-1 text-sm"
                        >
                          {showFullDescription ? "Show less" : "Read more"}
                        </button>
                      )}
                    </p>
                  </div>
                )}
                
                {farmer.facilities && farmer.facilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4 text-emerald-600" />
                      Facilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {farmer.facilities.map((facility, index) => (
                        <span key={index} className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-full">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Media Gallery */}
            {isApproved ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <MediaGallery />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
              >
                <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-emerald-600" />
                  Media Gallery
                </h2>
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-emerald-600">Media gallery will be available after verification</p>
                  <p className="text-sm text-emerald-400 mt-1">Upload photos once your farm is approved</p>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Verification Status Card - Fixed contrast with solid colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isPending && (
                <div className="rounded-2xl p-6 border border-amber-600 bg-amber-500 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-amber-600">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white">Verification in Progress</h3>
                      <p className="text-sm text-amber-100">Our team is reviewing your documents</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-100">Review time</span>
                      <span className="text-white font-semibold">2-3 business days</span>
                    </div>
                    <div className="w-full bg-amber-400 rounded-full h-2">
                      <div className="bg-amber-700 h-2 rounded-full w-1/3" />
                    </div>
                    <Link href="/farmer/verification">
                      <button className="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors">
                        Continue Verification
                      </button>
                    </Link>
                  </div>
                </div>
              )}
              
              {isApproved && (
                <div className="rounded-2xl p-6 border border-green-700 bg-green-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-green-700">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white">Farm Verified!</h3>
                      <p className="text-sm text-green-100">Your farm is now visible to visitors</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="bg-green-700 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-200" />
                        <p className="text-green-100 font-medium">Your farm is now live and visible to visitors!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isRejected && (
                <div className="rounded-2xl p-6 border border-red-700 bg-red-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-red-700">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white">Action Required</h3>
                      <p className="text-sm text-red-100">Please check the issues below</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/farmer/verification">
                      <button className="mt-3 w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-medium transition-colors">
                        Re-submit Documents
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Earnings Section */}
            {isApproved && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-emerald-900">Recent Earnings</h3>
                  <Link href="/farmer/earnings">
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentEarnings.length === 0 ? (
                    <div className="text-center py-6">
                      <DollarSign className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                      <p className="text-sm text-emerald-500">No earnings yet</p>
                    </div>
                  ) : (
                    recentEarnings.map((earning) => (
                      <div key={earning.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                        <div>
                          <p className="font-medium text-emerald-900">{earning.activityName}</p>
                          <p className="text-xs text-emerald-600">
                            {new Date(earning.bookingDate).toLocaleDateString()} • {earning.guests} guests
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 line-through">KES {earning.amount.toLocaleString()}</p>
                          <p className="text-xs text-red-600">-KES {earning.platformFee.toLocaleString()} (10%)</p>
                          <p className="font-bold text-green-700">KES {earning.farmerEarning.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-emerald-100">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Total Earnings</span>
                    <span className="text-2xl font-bold text-emerald-900">KES {totalEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Quick Actions */}
           {/* Quick Actions */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
>
  <h3 className="font-heading font-semibold text-emerald-900 mb-4">Quick Actions</h3>
  <div className="space-y-2">
    <Link href="/farmer/activities">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium">📋 View All Activities</span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/activities/new">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium">➕ Add New Activity</span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/messages">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium flex items-center gap-2">
          💬 Messages
          {unreadMessages > 0 && (
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadMessages}
            </span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/reviews">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium flex items-center gap-2">
          <Star className="h-5 w-5" />
          Reviews & Ratings
        </span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/profile/edit">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium">✏️ Edit Farm Profile</span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/analytics">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics & Insights
        </span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/schedule">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule & Bookings
        </span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
    <Link href="/farmer/settings">
      <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
        <span className="text-emerald-700 font-medium flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </span>
        <ChevronRight className="h-4 w-4 text-emerald-500" />
      </button>
    </Link>
  </div>
</motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, suffix, bgColor, iconColor }: { 
  icon: any;
  label: string;
  value: string | number;
  suffix?: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-2 rounded-xl ${bgColor}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">
        {value}{suffix}
      </p>
      <p className="text-sm text-emerald-600 mt-0.5">{label}</p>
    </div>
  );
}