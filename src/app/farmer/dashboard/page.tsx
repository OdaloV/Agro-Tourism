// src/app/farmer/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";

// Mock farmer data - in production, fetch from API
const mockFarmerData = {
  id: 1,
  name: "John Mwangi",
  email: "john@greenacres.com",
  phone: "+254 712 345 678",
  farmName: "Green Acres Farm",
  farmLocation: "Kiambu, Kenya",
  farmSize: "5 acres",
  yearEstablished: "2010",
  farmDescription: "A beautiful farm offering organic vegetables and dairy products.",
  farmType: "mixed",
  activities: ["Farm Tours", "Harvesting", "Animal Feeding"],
  facilities: ["Parking", "Restrooms", "Wifi"],
  accommodation: true,
  maxGuests: "20",
  farmPhotos: 3,
  videoLink: "",
  documents: {
    businessLicense: true,
    nationalId: true,
    insurance: true,
    certifications: false,
  },
  verificationStatus: "pending", // pending, approved, rejected
  submittedAt: "2024-03-20",
  stats: {
    profileViews: 0,
    bookings: 0,
    rating: 0,
  },
};

export default function FarmerDashboard() {
  const [farmer, setFarmer] = useState(mockFarmerData);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const isPending = farmer.verificationStatus === "pending";
  const isApproved = farmer.verificationStatus === "approved";
  const isRejected = farmer.verificationStatus === "rejected";

  // In production, fetch data from API
  useEffect(() => {
    // Fetch farmer data from API
    // const fetchFarmerData = async () => {
    //   const response = await fetch('/api/farmer/profile');
    //   const data = await response.json();
    //   setFarmer(data);
    // };
    // fetchFarmerData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header with Verification Banner */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-emerald-900">
                Welcome back, {farmer.name.split(" ")[0]}!
              </h1>
              <p className="text-emerald-600 mt-1">Manage your farm and track bookings</p>
            </div>
            
            {/* Verification Status Badge */}
            {isPending && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-xl border border-amber-200">
                <Clock className="h-5 w-5 text-amber-600 animate-pulse" />
                <div>
                  <p className="text-amber-800 font-medium">Awaiting Verification</p>
                  <p className="text-xs text-amber-600">Submitted on {farmer.submittedAt}</p>
                </div>
              </div>
            )}
            
            {isApproved && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Verified Farm</p>
                  <p className="text-xs text-green-600">Your farm is live!</p>
                </div>
              </div>
            )}
            
            {isRejected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-xl border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Verification Needed</p>
                  <p className="text-xs text-red-600">Please check your documents</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Eye}
            label="Profile Views"
            value={farmer.stats.profileViews}
            suffix="views"
            color="emerald"
          />
          <StatCard
            icon={Calendar}
            label="Total Bookings"
            value={farmer.stats.bookings}
            suffix="bookings"
            color="accent"
          />
          <StatCard
            icon={Star}
            label="Rating"
            value={farmer.stats.rating}
            suffix={farmer.stats.rating === 0 ? "No reviews" : "⭐"}
            color="amber"
          />
          <StatCard
            icon={Users}
            label="Visitors"
            value={0}
            suffix="this month"
            color="blue"
          />
        </div>

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
                      {farmer.farmName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-emerald-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{farmer.farmLocation}</span>
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
                {/* Farm Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700">{farmer.farmSize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700">Est. {farmer.yearEstablished}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700">{farmer.accommodation ? "Has Accommodation" : "No Accommodation"}</span>
                  </div>
                </div>
                
                {/* Farm Description */}
                <div>
                  <h3 className="font-medium text-emerald-800 mb-2">About the Farm</h3>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    {showFullDescription 
                      ? farmer.farmDescription 
                      : `${farmer.farmDescription.substring(0, 150)}...`}
                    {farmer.farmDescription.length > 150 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-accent hover:underline ml-1 text-sm"
                      >
                        {showFullDescription ? "Show less" : "Read more"}
                      </button>
                    )}
                  </p>
                </div>
                
                {/* Activities */}
                <div>
                  <h3 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.activities.map((activity) => (
                      <span key={activity} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Facilities */}
                <div>
                  <h3 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.facilities.map((facility) => (
                      <span key={facility} className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Media Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
            >
              <h2 className="text-lg font-heading font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-accent" />
                Media Gallery
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(farmer.farmPhotos)].map((_, i) => (
                  <div key={i} className="aspect-square bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Camera className="h-6 w-6 text-emerald-400" />
                  </div>
                ))}
                {farmer.farmPhotos === 0 && (
                  <div className="col-span-4 text-center py-8 text-emerald-400">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No photos uploaded yet</p>
                  </div>
                )}
              </div>
              {farmer.videoLink && (
                <div className="mt-3">
                  <a href={farmer.videoLink} target="_blank" rel="noopener noreferrer" className="text-accent text-sm hover:underline">
                    View Farm Video →
                  </a>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right Column - Status & Documents */}
          <div className="space-y-6">
            
            {/* Verification Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl p-6 border ${
                isPending 
                  ? "bg-amber-50 border-amber-200" 
                  : isApproved 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${
                  isPending ? "bg-amber-100" : isApproved ? "bg-green-100" : "bg-red-100"
                }`}>
                  {isPending ? (
                    <Clock className="h-6 w-6 text-amber-600" />
                  ) : isApproved ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-emerald-900">
                    {isPending ? "Verification in Progress" : isApproved ? "Farm Verified!" : "Action Required"}
                  </h3>
                  <p className="text-sm text-emerald-600">
                    {isPending 
                      ? "Our team is reviewing your documents" 
                      : isApproved 
                        ? "Your farm is now visible to visitors" 
                        : "Please check the issues below"}
                  </p>
                </div>
              </div>
              
              {isPending && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">Review time</span>
                    <span className="text-emerald-800 font-medium">2-3 business days</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-1/3 animate-pulse" />
                  </div>
                  <p className="text-xs text-emerald-500 mt-2">
                    You'll receive an email once verification is complete
                  </p>
                </div>
              )}
              
              {isRejected && (
                <div className="mt-4 p-3 bg-red-100 rounded-xl">
                  <p className="text-sm text-red-700 font-medium mb-2">Issues to fix:</p>
                  <ul className="text-xs text-red-600 space-y-1">
                    {!farmer.documents.businessLicense && <li>• Business License missing</li>}
                    {!farmer.documents.nationalId && <li>• National ID missing</li>}
                    {!farmer.documents.insurance && <li>• Insurance Certificate missing</li>}
                    {!farmer.documents.certifications && <li>• Certifications missing (optional)</li>}
                  </ul>
                  <Link href="/farmer/verification">
                    <button className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
                      Complete Verification
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
            
            {/* Documents Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
            >
              <h3 className="font-heading font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Documents Status
              </h3>
              <div className="space-y-3">
                {[
                  { key: "businessLicense", label: "Business License", status: farmer.documents.businessLicense },
                  { key: "nationalId", label: "National ID / Passport", status: farmer.documents.nationalId },
                  { key: "insurance", label: "Insurance Certificate", status: farmer.documents.insurance },
                  { key: "certifications", label: "Certifications", status: farmer.documents.certifications, optional: true },
                ].map((doc) => (
                  <div key={doc.key} className="flex items-center justify-between py-2 border-b border-emerald-100 last:border-0">
                    <span className="text-sm text-emerald-700">{doc.label}</span>
                    {doc.status ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {doc.optional ? "Optional" : "Pending"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {isPending && (
                <Link href="/farmer/verification">
                  <button className="mt-4 w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    View Documents
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
            >
              <h3 className="font-heading font-semibold text-emerald-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/farmer/activities/new">
                  <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                    <span className="text-emerald-700">➕ Add New Activity</span>
                    <ChevronRight className="h-4 w-4 text-emerald-500" />
                  </button>
                </Link>
                <Link href="/farmer/calendar">
                  <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                    <span className="text-emerald-700">📅 Manage Calendar</span>
                    <ChevronRight className="h-4 w-4 text-emerald-500" />
                  </button>
                </Link>
                <Link href="/farmer/profile/edit">
                  <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                    <span className="text-emerald-700">✏️ Edit Farm Profile</span>
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
function StatCard({ icon: Icon, label, value, suffix, color }: { 
  icon: any;
  label: string;
  value: number | string;
  suffix?: string;
  color: 'emerald' | 'accent' | 'amber' | 'blue';
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    accent: "bg-accent/10 text-accent",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-2 rounded-xl ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">
        {value}
        {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
      </p>
      <p className="text-sm text-emerald-600 mt-0.5">{label}</p>
    </div>
  );
}