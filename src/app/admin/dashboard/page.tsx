// src/app/admin/dashboard/page.tsx - FIXED (removed duplicate fetchBookings)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  MessageCircle,
  TrendingUp,
  Users,
  Building,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Search,
  Filter,
  Star,
  Flag,
  Settings,
  LogOut,
  Image as ImageIcon,
  Receipt,
  BarChart3,
  Activity,
} from "lucide-react";

type TabType = 'pending' | 'verified' | 'rejected' | 'all' | 'bookings';

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
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<Farm[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchAllFarms();
    fetchBookings();
  }, []);

  useEffect(() => {
    filterFarms();
  }, [activeTab, searchQuery, farms]);

  const fetchAllFarms = async () => {
    try {
      console.log("Fetching farms from API...");
      const response = await fetch('/api/admin/farms?all=true');
      
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Farms data received:", data.length);
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
      console.log("Fetching bookings from API...");
      const response = await fetch('/api/admin/bookings');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bookings error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Bookings data received:", data.bookings?.length || 0);
      setBookings(data.bookings || []);
      setFilteredBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      setFilteredBookings([]);
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

  const handleCardClick = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const stats = {
    pending: farms.filter(f => f.verification_status === 'pending').length,
    verified: farms.filter(f => f.verification_status === 'approved').length,
    rejected: farms.filter(f => f.verification_status === 'rejected').length,
    totalFarmers: farms.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.platform_earnings || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Shield className="h-6 w-6 text-accent" />
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
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search farms by name, farmer or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent w-64 md:w-80"
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
              <button
    onClick={() => router.push("/admin/analytics")}
    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
    title="Analytics"
  >
    <BarChart3 className="h-5 w-5 text-muted-foreground" />
    <span className="text-sm hidden sm:inline">Analytics</span>
  </button>
              <button
                onClick={() => router.push("/admin/settings")}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  localStorage.clear();
                  router.push("/auth");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Clickable Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="Pending Verifications"
            value={stats.pending}
            color="amber"
            onClick={() => handleCardClick("pending")}
            isActive={activeTab === "pending"}
          />
          <StatCard
            icon={CheckCircle}
            label="Verified Farms"
            value={stats.verified}
            color="green"
            onClick={() => handleCardClick("verified")}
            isActive={activeTab === "verified"}
          />
          <StatCard
            icon={Users}
            label="Total Farmers"
            value={stats.totalFarmers}
            color="emerald"
            onClick={() => handleCardClick("all")}
            isActive={activeTab === "all"}
          />
          <StatCard
            icon={Calendar}
            label="Total Bookings"
            value={stats.totalBookings}
            color="accent"
            onClick={() => handleCardClick("bookings")}
            isActive={activeTab === "bookings"}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            icon={Clock}
            label="Pending Verification"
            count={stats.pending}
          />
          <TabButton
            active={activeTab === "verified"}
            onClick={() => setActiveTab("verified")}
            icon={CheckCircle}
            label="Verified Farms"
            count={stats.verified}
          />
          <TabButton
            active={activeTab === "rejected"}
            onClick={() => setActiveTab("rejected")}
            icon={XCircle}
            label="Rejected Farms"
            count={stats.rejected}
          />
          <TabButton
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            icon={Building}
            label="All Farms"
            count={stats.totalFarmers}
          />
          <TabButton
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
            icon={DollarSign}
            label="Bookings"
            count={stats.totalBookings}
          />
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
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Commission (10%)</th>
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
                          <td className="p-4 text-accent font-medium">KES {booking.commission?.toLocaleString() || 0}</td>
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

      {/* Farm Details Modal */}
      {showFarmModal && selectedFarm && (
        <FarmDetailsModal
          farm={selectedFarm}
          onClose={() => setShowFarmModal(false)}
          onPhotoClick={(photo) => setSelectedPhoto(photo)}
        />
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <PhotoPreviewModal
          photoUrl={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Rejection Modal */}
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

// Clickable Stat Card Component
function StatCard({ icon: Icon, label, value, color, onClick, isActive }: { 
  icon: any;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
  isActive: boolean;
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <button
      onClick={onClick}
      className={`bg-card rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md w-full text-left ${
        isActive ? 'border-accent ring-2 ring-accent/20' : 'border-border'
      }`}
    >
      <div className={`inline-flex p-3 rounded-xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-2xl font-bold text-card-foreground mt-3">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </button>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label, count }: { 
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count: number | null;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all whitespace-nowrap ${
        active
          ? "bg-card text-accent border-t border-l border-r border-border -mb-px"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
      {count !== null && count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
        }`}>
          {count}
        </span>
      )}
    </button>
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

// Farm Details Modal with Photo Preview
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
                    className="aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-accent transition-all"
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
                    className="flex items-center gap-1 text-sm text-accent hover:underline"
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
            className="w-full p-3 border border-border rounded-xl focus:outline-none focus:border-accent bg-background text-foreground"
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