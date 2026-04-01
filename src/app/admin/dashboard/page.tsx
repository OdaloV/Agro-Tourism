"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

// Types
type StatColor = 'amber' | 'green' | 'emerald' | 'accent';

interface PendingFarm {
  id: number;
  profile_id: number;
  farm_name: string;
  farmer_name: string;
  farm_location: string;
  submitted_at: string;
  verification_status: string;
  user_id: number;
  email: string;
  phone: string;
  documents: Array<{ type: string; url: string }>;
}

interface VerifiedFarm {
  id: number;
  farm_name: string;
  farmer_name: string;
  farm_location: string;
  verified_date: string;
  rating: number;
  bookings: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "reports">("pending");
  const [pendingFarms, setPendingFarms] = useState<PendingFarm[]>([]);
  const [verifiedFarms, setVerifiedFarms] = useState<VerifiedFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<PendingFarm | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const userRole = localStorage.getItem("userRole");
    
    if (!userData || userRole !== "admin") {
      router.push("/auth/login/admin");
      return;
    }
    
    fetchPendingVerifications();
    fetchVerifiedFarms();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    
    router.push("/auth");
  };

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/admin/verifications?status=pending');
      const data = await response.json();
      setPendingFarms(data);
    } catch (error) {
      console.error("Error fetching pending farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedFarms = async () => {
    try {
      const response = await fetch('/api/admin/verifications?status=approved');
      const data = await response.json();
      setVerifiedFarms(data.map((farm: any) => ({
        id: farm.profile_id,
        farm_name: farm.farm_name,
        farmer_name: farm.farmer_name,
        farm_location: farm.farm_location,
        verified_date: farm.verified_at || farm.submitted_at,
        rating: 4.5,
        bookings: 0,
      })));
    } catch (error) {
      console.error("Error fetching verified farms:", error);
    }
  };

  const handleApprove = async (farm: PendingFarm) => {
  setProcessingId(farm.profile_id);
  try {
    // Get the actual logged-in admin's ID from localStorage
    const userData = localStorage.getItem("userData");
    const adminId = userData ? JSON.parse(userData).id : null;
    
    const response = await fetch('/api/admin/verifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: farm.profile_id,
        status: 'approved',
        notes: '',
        adminId: adminId  // ← Use actual admin ID (26)
      })
    });

    if (response.ok) {
      alert(`Farm "${farm.farm_name}" has been approved and is now live!`);
      setPendingFarms(prev => prev.filter(f => f.profile_id !== farm.profile_id));
      fetchVerifiedFarms();
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

const handleReject = async (farm: PendingFarm) => {
  if (!rejectionNote) {
    alert("Please provide a reason for rejection");
    return;
  }

  setProcessingId(farm.profile_id);
  try {
    // Get the actual logged-in admin's ID from localStorage
    const userData = localStorage.getItem("userData");
    const adminId = userData ? JSON.parse(userData).id : null;
    
    const response = await fetch('/api/admin/verifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: farm.profile_id,
        status: 'rejected',
        notes: rejectionNote,
        adminId: adminId 
      })
    });

    if (response.ok) {
      alert(`Farm "${farm.farm_name}" has been rejected. Farmer will be notified.`);
      setShowRejectModal(false);
      setRejectionNote("");
      setPendingFarms(prev => prev.filter(f => f.profile_id !== farm.profile_id));
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

  const stats = {
    pending: pendingFarms.length,
    verified: verifiedFarms.length,
    totalFarmers: pendingFarms.length + verifiedFarms.length,
    totalBookings: 156,
    totalRevenue: 245000,
  };

  const filteredPendingFarms = pendingFarms.filter(farm =>
    farm.farm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.farm_location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      {/* Admin Header */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-emerald-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-emerald-600">
                  Platform Management Console
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search farms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:border-accent"
                />
              </div>
              <button className="p-2 hover:bg-emerald-50 rounded-xl transition-colors">
                <Settings className="h-5 w-5 text-emerald-600" />
              </button>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="Pending Verifications"
            value={stats.pending}
            color="amber"
          />
          <StatCard
            icon={CheckCircle}
            label="Verified Farms"
            value={stats.verified}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Total Farmers"
            value={stats.totalFarmers}
            color="emerald"
          />
          <StatCard
            icon={Calendar}
            label="Total Bookings"
            value={stats.totalBookings}
            color="accent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-emerald-200 mb-6">
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
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            icon={TrendingUp}
            label="Reports"
            count={null}
          />
        </div>

        {/* Pending Verifications Tab */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {filteredPendingFarms.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-emerald-600">No pending verifications</p>
              </div>
            ) : (
              filteredPendingFarms.map((farm) => (
                <VerificationCard
                  key={farm.profile_id}
                  farm={farm}
                  onApprove={() => handleApprove(farm)}
                  onReject={() => {
                    setSelectedFarm(farm);
                    setShowRejectModal(true);
                  }}
                  onViewDocuments={() => setSelectedFarm(farm)}
                  processing={processingId === farm.profile_id}
                />
              ))
            )}
          </div>
        )}

        {/* Verified Farms Tab */}
        {activeTab === "verified" && (
          <div className="space-y-4">
            {verifiedFarms.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-emerald-600">No verified farms yet</p>
              </div>
            ) : (
              verifiedFarms.map((farm) => (
                <VerifiedFarmCard key={farm.id} farm={farm} />
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-6">
            <h3 className="text-lg font-heading font-semibold text-emerald-900 mb-4">
              Platform Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportCard
                title="Farmer Registrations"
                description="View all farmer registrations and verification status"
                icon={Users}
                href="/admin/reports/farmers"
              />
              <ReportCard
                title="Financial Summary"
                description="View platform earnings and commission reports"
                icon={DollarSign}
                href="/admin/reports/financial"
              />
              <ReportCard
                title="Booking Analytics"
                description="Track booking trends and popular activities"
                icon={TrendingUp}
                href="/admin/reports/bookings"
              />
              <ReportCard
                title="User Activity"
                description="Monitor visitor and farmer engagement"
                icon={Activity}
                href="/admin/reports/activity"
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedFarm && (
        <DocumentPreviewModal
          farm={selectedFarm}
          onClose={() => setSelectedFarm(null)}
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

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: { 
  icon: any;
  label: string;
  value: number;
  color: StatColor;
}) {
  const colors: Record<StatColor, string> = {
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <div className={`inline-flex p-3 rounded-xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">{value}</p>
      <p className="text-sm text-emerald-600 mt-1">{label}</p>
    </div>
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
      className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
        active
          ? "bg-white text-accent border-t border-l border-r border-emerald-200 -mb-px"
          : "text-emerald-600 hover:bg-emerald-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
      {count !== null && count > 0 && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active
              ? "bg-accent/10 text-accent"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Verification Card Component
function VerificationCard({ farm, onApprove, onReject, onViewDocuments, processing }: { 
  farm: PendingFarm;
  onApprove: () => void;
  onReject: () => void;
  onViewDocuments: () => void;
  processing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                {farm.farm_name}
              </h3>
            </div>
            <p className="text-sm text-emerald-600">
              {farm.farmer_name} • {farm.farm_location}
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              Submitted: {new Date(farm.submitted_at).toLocaleDateString()}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {farm.documents && farm.documents.map((doc: any, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full"
                >
                  📄 {doc.type?.replace(/_/g, ' ')}
                </span>
              ))}
              {(!farm.documents || farm.documents.length === 0) && (
                <span className="text-xs text-emerald-400">No documents uploaded</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onViewDocuments}
              className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
              title="View Documents"
            >
              <Eye className="h-5 w-5 text-emerald-500" />
            </button>
            <button
              onClick={onReject}
              disabled={processing}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              disabled={processing}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {processing ? "Processing..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Verified Farm Card Component
function VerifiedFarmCard({ farm }: { farm: VerifiedFarm }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-heading font-semibold text-emerald-900">
              {farm.farm_name}
            </h3>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          </div>
          <p className="text-sm text-emerald-600">
            {farm.farmer_name} • {farm.farm_location}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-emerald-500">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {farm.rating}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {farm.bookings} bookings
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Verified {new Date(farm.verified_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}

// Report Card Component
function ReportCard({ title, description, icon: Icon, href }: { 
  title: string;
  description: string;
  icon: any;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="p-4 border border-emerald-100 rounded-xl hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-accent/10 transition-colors">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <h4 className="font-semibold text-emerald-900">{title}</h4>
        </div>
        <p className="text-sm text-emerald-600">{description}</p>
      </div>
    </Link>
  );
}

// Document Preview Modal Component
function DocumentPreviewModal({ farm, onClose }: { 
  farm: PendingFarm;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-emerald-900">
            {farm.farm_name} - Verification Documents
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-emerald-50 rounded-lg">
            <XCircle className="h-5 w-5 text-emerald-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
          {farm.documents && farm.documents.length > 0 ? (
            farm.documents.map((doc: any, idx: number) => (
              <div key={idx} className="border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-emerald-900">
                    {doc.type?.replace(/_/g, ' ').toUpperCase()}
                  </span>
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
              </div>
            ))
          ) : (
            <p className="text-center text-emerald-500 py-8">No documents uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Rejection Modal Component
function RejectionModal({ onConfirm, onClose, note, setNote }: { 
  onConfirm: () => void;
  onClose: () => void;
  note: string;
  setNote: (note: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-4 border-b border-emerald-100">
          <h3 className="text-lg font-heading font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Reject Verification
          </h3>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-emerald-800 mb-2">
            Reason for Rejection
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent text-emerald-900"
            placeholder="Explain why the verification was rejected..."
          />
          <p className="text-xs text-emerald-500 mt-2">
            This message will be sent to the farmer for correction.
          </p>
        </div>
        <div className="p-4 border-t border-emerald-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
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

// Activity Icon Component
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}