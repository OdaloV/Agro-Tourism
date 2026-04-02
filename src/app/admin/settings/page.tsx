"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Globe,
  Bell,
  Shield,
  Users,
  DollarSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
} from "lucide-react";

interface AdminSettings {
  platformName: string;
  platformEmail: string;
  commissionRate: number;
  minBookingAmount: number;
  maxGuestsPerBooking: number;
  verificationRequired: boolean;
  autoApprove: boolean;
  notificationEmail: boolean;
  notificationSMS: boolean;
  maintenanceMode: boolean;
  darkMode: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({
    platformName: "HarvestHost",
    platformEmail: "admin@harvesthost.com",
    commissionRate: 10,
    minBookingAmount: 500,
    maxGuestsPerBooking: 20,
    verificationRequired: true,
    autoApprove: false,
    notificationEmail: true,
    notificationSMS: false,
    maintenanceMode: false,
    darkMode: false,
  });

  useEffect(() => {
    setMounted(true);
    // In production, fetch settings from API
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSaving(false);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 py-8">
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

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-600">Settings saved successfully!</p>
          </motion.div>
        )}

        {/* Platform Settings */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Platform Settings</h2>
            <p className="text-sm text-emerald-500">Configure general platform options</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Platform Name</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Platform Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="email"
                  value={settings.platformEmail}
                  onChange={(e) => setSettings({...settings, platformEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Commission & Pricing */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Commission & Pricing</h2>
            <p className="text-sm text-emerald-500">Set platform fees and booking limits</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Commission Rate (%)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({...settings, commissionRate: parseInt(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
              <p className="text-xs text-emerald-500 mt-1">Percentage taken from each booking</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Minimum Booking Amount (KES)</label>
              <input
                type="number"
                value={settings.minBookingAmount}
                onChange={(e) => setSettings({...settings, minBookingAmount: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Max Guests Per Booking</label>
              <input
                type="number"
                value={settings.maxGuestsPerBooking}
                onChange={(e) => setSettings({...settings, maxGuestsPerBooking: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Verification Settings */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Verification & Approvals</h2>
            <p className="text-sm text-emerald-500">Configure farm verification rules</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Require Verification</p>
                <p className="text-sm text-emerald-500">Farmers must verify before listing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.verificationRequired}
                  onChange={(e) => setSettings({...settings, verificationRequired: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Auto-Approve Listings</p>
                <p className="text-sm text-emerald-500">Automatically approve verified farmers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApprove}
                  onChange={(e) => setSettings({...settings, autoApprove: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Notification Settings</h2>
            <p className="text-sm text-emerald-500">Configure admin notifications</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Email Notifications</p>
                <p className="text-sm text-emerald-500">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationEmail}
                  onChange={(e) => setSettings({...settings, notificationEmail: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">SMS Notifications</p>
                <p className="text-sm text-emerald-500">Receive urgent alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSMS}
                  onChange={(e) => setSettings({...settings, notificationSMS: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">System Settings</h2>
            <p className="text-sm text-emerald-500">Advanced platform settings</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Maintenance Mode</p>
                <p className="text-sm text-emerald-500">Put the platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">Dark Mode</p>
                <p className="text-sm text-emerald-500">Enable dark theme for admin panel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition disabled:opacity-50"
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