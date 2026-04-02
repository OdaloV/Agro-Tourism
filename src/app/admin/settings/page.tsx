// src/app/admin/settings/page.tsx - Updated (SMS removed)

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
    platformEmail: "admin@harvesthost.com",
    commissionRate: 10,
    minBookingAmount: 300,
    maxGuestsPerBooking: 100,
    verificationRequired: true,
    autoApprove: false,
    notificationEmail: true,
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
          platformEmail: data.platform_email || "admin@harvesthost.com",
          commissionRate: parseInt(data.commission_rate) || 10,
          minBookingAmount: parseInt(data.min_booking_amount) || 300,
          maxGuestsPerBooking: parseInt(data.max_guests_per_booking) || 100,
          verificationRequired: data.verification_required === 'true',
          autoApprove: data.auto_approve === 'true',
          notificationEmail: data.notification_email === 'true',
          maintenanceMode: data.maintenance_mode === 'true',
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
      const response = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_name: settings.platformName,
          platform_email: settings.platformEmail,
          commission_rate: settings.commissionRate,
          min_booking_amount: settings.minBookingAmount,
          max_guests_per_booking: settings.maxGuestsPerBooking,
          verification_required: settings.verificationRequired,
          auto_approve: settings.autoApprove,
          notification_email: settings.notificationEmail,
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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-bold text-card-foreground">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">Manage platform configuration</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</p>
          </motion.div>
        )}

        {/* Platform Settings */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-5 border-b border-border bg-muted/30">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">Platform Settings</h2>
            <p className="text-sm text-muted-foreground">Configure general platform options</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Platform Name</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-accent text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Platform Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={settings.platformEmail}
                  onChange={(e) => setSettings({...settings, platformEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-accent text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Commission & Pricing */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-5 border-b border-border bg-muted/30">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">Commission & Pricing</h2>
            <p className="text-sm text-muted-foreground">Set platform fees and booking limits</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Commission Rate (%)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({...settings, commissionRate: parseInt(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Percentage taken from each booking</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Minimum Booking Amount (KES)</label>
              <input
                type="number"
                value={settings.minBookingAmount}
                onChange={(e) => setSettings({...settings, minBookingAmount: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-accent text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Max Guests Per Booking</label>
              <input
                type="number"
                value={settings.maxGuestsPerBooking}
                onChange={(e) => setSettings({...settings, maxGuestsPerBooking: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-accent text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Verification Settings */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-5 border-b border-border bg-muted/30">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">Verification & Approvals</h2>
            <p className="text-sm text-muted-foreground">Configure farm verification rules</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Require Verification</p>
                <p className="text-sm text-muted-foreground">Farmers must verify before listing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.verificationRequired}
                  onChange={(e) => setSettings({...settings, verificationRequired: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Auto-Approve Listings</p>
                <p className="text-sm text-muted-foreground">Automatically approve verified farmers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApprove}
                  onChange={(e) => setSettings({...settings, autoApprove: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings - Email Only */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-5 border-b border-border bg-muted/30">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">Notification Settings</h2>
            <p className="text-sm text-muted-foreground">Configure admin email alerts</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationEmail}
                  onChange={(e) => setSettings({...settings, notificationEmail: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-5 border-b border-border bg-muted/30">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">System Settings</h2>
            <p className="text-sm text-muted-foreground">Advanced platform settings</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Enable dark theme for admin panel</p>
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
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
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