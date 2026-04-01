"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock pending verifications
const pendingVerifications = [
  {
    id: 1,
    farmName: "Green Acres Farm",
    farmerName: "John Mutua",
    location: "Kiambu, Kenya",
    submittedDate: "2024-03-18",
    documents: {
      titleDeed: { status: "pending", issue: null },
      digitalSearch: { status: "pending", issue: null },
      businessPermit: { status: "pending", issue: null },
      nationalId: { status: "pending", issue: null },
    },
    status: "pending",
  },
  {
    id: 2,
    farmName: "Highland Orchard",
    farmerName: "Mary Wanjiku",
    location: "Nyeri, Kenya",
    submittedDate: "2024-03-17",
    documents: {
      titleDeed: {
        status: "rejected",
        issue: "Blurry document - text not readable",
      },
      digitalSearch: { status: "pending", issue: null },
      businessPermit: { status: "pending", issue: null },
      nationalId: { status: "pending", issue: null },
    },
    status: "pending",
  },
];

// Mock verified farms
const verifiedFarms = [
  {
    id: 1,
    farmName: "Sunrise Dairy",
    farmerName: "Peter Omondi",
    location: "Nakuru, Kenya",
    verifiedDate: "2024-03-15",
    rating: 4.8,
    bookings: 24,
    status: "active",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "pending" | "verified" | "reports"
  >("pending");
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const stats = {
    pending: pendingVerifications.length,
    verified: verifiedFarms.length,
    totalFarmers: pendingVerifications.length + verifiedFarms.length,
    totalBookings: 156,
    totalRevenue: 245000,
  };

  const handleApprove = (farm: any) => {
    console.log("Approving farm:", farm);
    // In real app, this would trigger notification and update status
    alert(`Farm "${farm.farmName}" has been approved and is now live!`);
  };

  const handleReject = (farm: any) => {
    if (!rejectionNote) {
      alert("Please provide a reason for rejection");
      return;
    }
    console.log("Rejecting farm:", farm, "Reason:", rejectionNote);
    setShowRejectModal(false);
    setRejectionNote("");
    alert(
      `Farm "${farm.farmName}" has been rejected. Farmer will be notified.`,
    );
  };

  const handleViewDocuments = (farm: any) => {
    setSelectedFarm(farm);
  };

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
            {pendingVerifications.map((farm) => (
              <VerificationCard
                key={farm.id}
                farm={farm}
                onApprove={() => handleApprove(farm)}
                onReject={() => setShowRejectModal(true)}
                onViewDocuments={() => handleViewDocuments(farm)}
              />
            ))}
            {pendingVerifications.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-emerald-600">No pending verifications</p>
              </div>
            )}
          </div>
        )}

        {/* Verified Farms Tab */}
        {activeTab === "verified" && (
          <div className="space-y-4">
            {verifiedFarms.map((farm) => (
              <VerifiedFarmCard key={farm.id} farm={farm} />
            ))}
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
      {showRejectModal && (
        <RejectionModal
          onConfirm={() =>
            handleReject(selectedFarm || pendingVerifications[0])
          }
          onClose={() => setShowRejectModal(false)}
          note={rejectionNote}
          setNote={setRejectionNote}
        />
      )}
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
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

function TabButton({ active, onClick, icon: Icon, label, count }: any) {
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

function VerificationCard({ farm, onApprove, onReject, onViewDocuments }: any) {
  const hasRejected = Object.values(farm.documents).some(
    (doc: any) => doc.status === "rejected",
  );
  const rejectedDocs = Object.entries(farm.documents).filter(
    ([_, doc]: any) => doc.status === "rejected",
  );

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
                {farm.farmName}
              </h3>
              {hasRejected && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  Action Required
                </span>
              )}
            </div>
            <p className="text-sm text-emerald-600">
              {farm.farmerName} • {farm.location}
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              Submitted: {farm.submittedDate}
            </p>

            {/* Document Status */}
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(farm.documents).map(([docName, doc]: any) => (
                <span
                  key={docName}
                  className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "verified"
                      ? "bg-green-100 text-green-600"
                      : doc.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {doc.status === "rejected"
                    ? `❌ ${docName.replace(/([A-Z])/g, " $1").trim()}`
                    : doc.status === "verified"
                      ? `✓ ${docName.replace(/([A-Z])/g, " $1").trim()}`
                      : `⏳ ${docName.replace(/([A-Z])/g, " $1").trim()}`}
                </span>
              ))}
            </div>

            {/* Rejection Details */}
            {hasRejected && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-xs font-medium text-red-700 mb-2">
                  Issues to fix:
                </p>
                {rejectedDocs.map(([docName, doc]: any) => (
                  <p
                    key={docName}
                    className="text-xs text-red-600 flex items-start gap-1"
                  >
                    <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    {docName.replace(/([A-Z])/g, " $1").trim()}: {doc.issue}
                  </p>
                ))}
              </div>
            )}
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
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VerifiedFarmCard({ farm }: any) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-heading font-semibold text-emerald-900">
              {farm.farmName}
            </h3>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          </div>
          <p className="text-sm text-emerald-600">
            {farm.farmerName} • {farm.location}
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
              Verified {farm.verifiedDate}
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

function ReportCard({ title, description, icon: Icon, href }: any) {
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

function DocumentPreviewModal({ farm, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-emerald-900">
            {farm.farmName} - Verification Documents
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-50 rounded-lg"
          >
            <XCircle className="h-5 w-5 text-emerald-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
          {Object.entries(farm.documents).map(([docName, doc]: any) => (
            <div
              key={docName}
              className="border border-emerald-100 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-emerald-900">
                  {docName.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "verified"
                      ? "bg-green-100 text-green-600"
                      : doc.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
              {doc.issue && (
                <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded-lg">
                  Issue: {doc.issue}
                </p>
              )}
              <button className="mt-3 flex items-center gap-1 text-sm text-accent hover:underline">
                <Eye className="h-4 w-4" />
                View Document
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RejectionModal({ onConfirm, onClose, note, setNote }: any) {
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

// Add missing import for Activity
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
