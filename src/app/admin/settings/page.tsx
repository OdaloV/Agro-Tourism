"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Globe,
  Shield,
  DollarSign,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { StatCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

interface AdminSettings {
  platformName: string;
  platformEmail: string;
  commissionRate: number;
  minBookingAmount: number;
  maxGuestsPerBooking: number;
  maintenanceMode: boolean;
  darkMode: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<AdminSettings>({
    platformName: "HarvestHost",
    platformEmail: "harvesthostadmin@gmail.com",
    commissionRate: 10,
    minBookingAmount: 300,
    maxGuestsPerBooking: 100,
    maintenanceMode: false,
    darkMode: false,
  });

  useEffect(() => {
    setMounted(true);
    
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        setSettings({
          platformName: data.platform_name || "HarvestHost",
          platformEmail: data.platform_email || "harvesthostadmin@gmail.com",
          commissionRate: parseInt(data.commission_rate) || 10,
          minBookingAmount: parseInt(data.min_booking_amount) || 300,
          maxGuestsPerBooking: parseInt(data.max_guests_per_booking) || 100,
          maintenanceMode: data.maintenance_mode === true || data.maintenance_mode === 'true',
          darkMode: localStorage.getItem('admin-theme') === 'dark',
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
    
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_name: settings.platformName,
          platform_email: settings.platformEmail,
          commission_rate: settings.commissionRate,
          min_booking_amount: settings.minBookingAmount,
          max_guests_per_booking: settings.maxGuestsPerBooking,
          maintenance_mode: settings.maintenanceMode,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('admin-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('admin-theme', 'light');
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Skeleton Loading State
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="h-5 w-32 bg-muted rounded-lg animate-pulse mb-4"></div>
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2"></div>
          </div>

          {/* Platform Settings Skeleton */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-emerald-100">
              <div className="h-6 w-40 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-1"></div>
            </div>
            <div className="p-5 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-32 bg-muted rounded-lg animate-pulse mb-2"></div>
                  <div className="h-10 w-full bg-muted rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Commission & Pricing Skeleton */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-emerald-100">
              <div className="h-6 w-48 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-1"></div>
            </div>
            <div className="p-5 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-40 bg-muted rounded-lg animate-pulse mb-2"></div>
                  <div className="h-10 w-full bg-muted rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Section Skeleton */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-40 bg-muted rounded-lg animate-pulse"></div>
                  <div className="h-4 w-full bg-muted rounded-lg animate-pulse mt-2"></div>
                  <div className="h-4 w-3/4 bg-muted rounded-lg animate-pulse mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button Skeleton */}
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-muted rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-bold text-emerald-900">Admin Settings</h1>
          <p className="text-emerald-600 mt-1">Manage platform configuration</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-100 border border-green-200 rounded-xl p-3 flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">Settings saved successfully!</p>
          </motion.div>
        )}

        {/* Platform Settings */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Platform Settings</h2>
            <p className="text-sm text-emerald-600">Configure general platform options</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Platform Name</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Platform Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <input
                  type="email"
                  value={settings.platformEmail}
                  onChange={(e) => setSettings({...settings, platformEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
                />
              </div>
              <p className="text-xs text-emerald-500 mt-1">All system notifications will be sent to this email</p>
            </div>
          </div>
        </div>

        {/* Commission & Pricing */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Commission & Pricing</h2>
            <p className="text-sm text-emerald-600">Set platform fees and booking limits</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Commission Rate (%)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({...settings, commissionRate: parseInt(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
                />
              </div>
              <p className="text-xs text-emerald-500 mt-1">Farmers receive {100 - settings.commissionRate}% of each booking</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Minimum Booking Amount (KES)</label>
              <input
                type="number"
                min="0"
                value={settings.minBookingAmount}
                onChange={(e) => setSettings({...settings, minBookingAmount: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Max Guests Per Booking</label>
              <input
                type="number"
                min="1"
                value={settings.maxGuestsPerBooking}
                onChange={(e) => setSettings({...settings, maxGuestsPerBooking: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-900"
              />
            </div>
          </div>
        </div>

        {/* Verification & Approvals */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Verification & Approvals</h2>
            <p className="text-sm text-emerald-600">Farm verification requirements (Always Required)</p>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Verification Required</p>
                <p className="text-sm text-blue-600 mt-1">
                  All farmers MUST submit verification documents before their farms can be listed on the platform.
                  Each submission is manually reviewed by an administrator.
                </p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs font-medium text-blue-700">Required Documents:</p>
                  <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
                    <li>National ID / Passport</li>
                    <li>Business License / Registration Certificate</li>
                    <li>Farm Ownership Proof / Lease Agreement</li>
                    <li>Insurance Certificate (if applicable)</li>
                  </ul>
                </div>
                <p className="text-xs text-blue-500 mt-3">
                  Verification status: Pending → Under Review → Approved / Rejected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">System Settings</h2>
            <p className="text-sm text-emerald-600">Advanced platform settings</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Maintenance Mode</p>
                <p className="text-sm text-emerald-600">Put the platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Dark Mode</p>
                <p className="text-sm text-emerald-600">Enable dark theme for admin panel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => {
                    setSettings({...settings, darkMode: e.target.checked});
                    if (e.target.checked) {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('admin-theme', 'dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('admin-theme', 'light');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Notifications Info */}
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Email Notifications (Always Enabled)</p>
              <p className="text-sm text-green-600">
                Admin email notifications are always enabled. You will receive alerts at:
                <strong className="block mt-1">{settings.platformEmail}</strong>
              </p>
              <ul className="text-sm text-green-600 mt-2 list-disc list-inside">
                <li>New farm registrations and document submissions</li>
                <li>Verification approval/rejection actions</li>
                <li>System alerts and maintenance updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}