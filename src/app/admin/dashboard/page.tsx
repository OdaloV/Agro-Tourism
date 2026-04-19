"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from "@/components/ui/Skeleton";

interface Farm {
  id: number;
  profile_id: number;
  farm_name: string;
  farmer_name: string;
  farmer_email: string;
  farmer_phone: string;
  farm_location: string;
  farm_size: number;
  farm_type: string;
  submitted_at: string;
  verified_at?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  documents: Array<{ type: string; url: string; filename: string }>;
  photos?: string[];
}

interface Booking {
  id: number;
  farm_name: string;
  farmer_name: string;
  booking_date: string;
  guests_count: number;
  total_amount: number;
  commission: number;
  platform_earnings: number;
  farmer_earnings: number;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Stats data
  const [stats, setStats] = useState({
    totalFarms: 0,
    pendingVerifications: 0,
    approvedFarms: 0,
    rejectedFarms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    platformEarnings: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['pending', 'verified', 'rejected', 'all', 'bookings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllFarms();
    fetchBookings();
    fetchStats();
  }, []);

  useEffect(() => {
    filterFarms();
  }, [activeTab, searchQuery, farms]);

  const fetchAllFarms = async () => {
    try {
      const response = await fetch('/api/admin/farms?all=true');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setFarms(data);
      setFilteredFarms(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching farms:", error);
      setLoading(false);
      setFarms([]);
      setFilteredFarms([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data);
      setStatsLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStatsLoading(false);
    }
  };

  const filterFarms = () => {
    let filtered = farms;
    
    if (activeTab === 'pending') {
      filtered = filtered.filter(f => f.verification_status === 'pending');
    } else if (activeTab === 'verified') {
      filtered = filtered.filter(f => f.verification_status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(f => f.verification_status === 'rejected');
    } else if (activeTab === 'all') {
      filtered = filtered.filter(f => f.verification_status === 'pending' || f.verification_status === 'approved');
    }
    
    if (searchQuery) {
      filtered = filtered.filter(farm =>
        farm.farm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.farm_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredFarms(filtered);
  };

  const handleApprove = async (farm: Farm) => {
    setProcessingId(farm.profile_id);
    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: farm.profile_id,
          status: 'approved',
          notes: '',
        })
      });

      if (response.ok) {
        alert(`✅ Farm "${farm.farm_name}" has been approved!`);
        await fetchAllFarms();
        await fetchStats();
      } else {
        throw new Error("Failed to approve");
      }
    } catch (error) {
      console.error("Error approving farm:", error);
      alert("Failed to approve farm. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (farm: Farm) => {
    if (!rejectionNote) {
      alert("Please provide a reason for rejection");
      return;
    }

    setProcessingId(farm.profile_id);
    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: farm.profile_id,
          status: 'rejected',
          notes: rejectionNote,
        })
      });

      if (response.ok) {
        alert(`❌ Farm "${farm.farm_name}" has been rejected.`);
        setShowRejectModal(false);
        setRejectionNote("");
        await fetchAllFarms();
        await fetchStats();
      } else {
        throw new Error("Failed to reject");
      }
    } catch (error) {
      console.error("Error rejecting farm:", error);
      alert("Failed to reject farm. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Admin Header Skeleton */}
        <div className="bg-card border-b border-border sticky top-0 z-20">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="h-7 w-48 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Farms Table Skeleton */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="h-6 w-32 bg-muted rounded-lg animate-pulse"></div>
            </div>
            <TableSkeleton rows={5} columns={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header - Responsive */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6 py-4">
          {/* Title section */}
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-card-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Platform Management Console
              </p>
            </div>
          </div>
          
          {/* Search Bar - Below on mobile, right on desktop */}
          <div className="relative w-full md:w-auto md:absolute md:top-1/2 md:right-6 md:-translate-y-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search farms by name, farmer or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Stats Cards */}
        {activeTab !== "bookings" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Farms</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">
                    {stats.totalFarms}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {stats.pendingVerifications}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Farms</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.approvedFarms}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Earnings</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">
                    KES {stats.platformEarnings?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto pb-2">
          {[
            { id: "pending", label: "Pending Verification", count: stats.pendingVerifications },
            { id: "verified", label: "Verified Farms", count: stats.approvedFarms },
            { id: "rejected", label: "Rejected Farms", count: stats.rejectedFarms },
            { id: "all", label: "All Farms", count: stats.totalFarms },
            { id: "bookings", label: "Bookings", count: stats.totalBookings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {(activeTab === "pending" || activeTab === "verified" || activeTab === "rejected" || activeTab === "all") && (
          <div className="space-y-4">
            {filteredFarms.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-card-foreground">No farms found</p>
              </div>
            ) : (
              filteredFarms.map((farm) => (
                <FarmCard
                  key={farm.profile_id}
                  farm={farm}
                  onApprove={() => handleApprove(farm)}
                  onReject={() => {
                    setSelectedFarm(farm);
                    setShowRejectModal(true);
                  }}
                  onViewDetails={() => {
                    setSelectedFarm(farm);
                    setShowFarmModal(true);
                  }}
                  processing={processingId === farm.profile_id}
                  showActions={activeTab === "pending"}
                />
              ))
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Farm Name</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Booking Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Guests</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Commission</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Farmer Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-4 text-foreground">{booking.farm_name}</td>
                          <td className="p-4 text-foreground">{booking.farmer_name}</td>
                          <td className="p-4 text-foreground">{new Date(booking.booking_date).toLocaleDateString()}</td>
                          <td className="p-4 text-foreground">{booking.guests_count}</td>
                          <td className="p-4 text-foreground">KES {booking.total_amount?.toLocaleString() || 0}</td>
                          <td className="p-4 text-emerald-600 font-medium">KES {booking.commission?.toLocaleString() || 0}</td>
                          <td className="p-4 text-green-600 font-medium">KES {booking.farmer_earnings?.toLocaleString() || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showFarmModal && selectedFarm && (
        <FarmDetailsModal
          farm={selectedFarm}
          onClose={() => setShowFarmModal(false)}
          onPhotoClick={(photo) => setSelectedPhoto(photo)}
        />
      )}

      {selectedPhoto && (
        <PhotoPreviewModal
          photoUrl={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {showRejectModal && selectedFarm && (
        <RejectionModal
          onConfirm={() => handleReject(selectedFarm)}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionNote("");
          }}
          note={rejectionNote}
          setNote={setRejectionNote}
        />
      )}
    </div>
  );
}

// Farm Card Component
function FarmCard({ farm, onApprove, onReject, onViewDetails, processing, showActions }: { 
  farm: Farm;
  onApprove: () => void;
  onReject: () => void;
  onViewDetails: () => void;
  processing: boolean;
  showActions: boolean;
}) {
  const statusColors = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    approved: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-heading font-semibold text-card-foreground">
                {farm.farm_name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[farm.verification_status]}`}>
                {farm.verification_status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {farm.farmer_name} • {farm.farm_location}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted: {new Date(farm.submitted_at).toLocaleDateString()}
            </p>
            
            {farm.rejection_reason && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <strong>Rejection reason:</strong> {farm.rejection_reason}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {farm.documents.map((doc, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                  📄 {doc.type?.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onViewDetails}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
              title="View Details"
            >
              <Eye className="h-5 w-5 text-muted-foreground" />
            </button>
            {showActions && (
              <>
                <button
                  onClick={onReject}
                  disabled={processing}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={onApprove}
                  disabled={processing}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Approve"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Farm Details Modal
function FarmDetailsModal({ farm, onClose, onPhotoClick }: { 
  farm: Farm;
  onClose: () => void;
  onPhotoClick: (photo: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-heading font-semibold text-card-foreground">
            {farm.farm_name} - Farm Details
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <XCircle className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Farmer Name</label>
              <p className="text-foreground font-medium">{farm.farmer_name}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <p className="text-foreground">{farm.farmer_email}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <p className="text-foreground">{farm.farmer_phone}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Location</label>
              <p className="text-foreground">{farm.farm_location}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Farm Size</label>
              <p className="text-foreground">{farm.farm_size} acres</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Farm Type</label>
              <p className="text-foreground">{farm.farm_type}</p>
            </div>
          </div>

          {farm.photos && farm.photos.length > 0 && (
            <div>
              <label className="text-sm font-medium text-card-foreground mb-3 block">Farm Photos</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {farm.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => onPhotoClick(photo)}
                    className="aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-emerald-500 transition-all"
                  >
                    <img src={photo} alt={`Farm photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-card-foreground mb-3 block">Verification Documents</label>
            <div className="space-y-3">
              {farm.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-card-foreground">{doc.type?.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{doc.filename}</p>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Photo Preview Modal
function PhotoPreviewModal({ photoUrl, onClose }: { photoUrl: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="relative max-w-5xl w-full">
        <img src={photoUrl} alt="Farm photo" className="w-full h-auto rounded-lg" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        >
          <XCircle className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}

// Rejection Modal
function RejectionModal({ onConfirm, onClose, note, setNote }: { 
  onConfirm: () => void;
  onClose: () => void;
  note: string;
  setNote: (note: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-md w-full">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-heading font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Reject Verification
          </h3>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Reason for Rejection
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full p-3 border border-border rounded-xl focus:outline-none focus:border-emerald-500 bg-background text-foreground"
            placeholder="Explain why the verification was rejected..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            This message will be sent to the farmer.
          </p>
        </div>
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-xl hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!note}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}