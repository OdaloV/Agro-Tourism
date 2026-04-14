"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Users, DollarSign, Clock, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface GroupSettings {
  max_guests_per_booking: number;
  daily_capacity: number;
  discount_tier1_min: number;
  discount_tier1_percent: number;
  discount_tier2_min: number;
  discount_tier2_percent: number;
  discount_tier3_min: number;
  discount_tier3_percent: number;
  advance_notice_tier1_days: number;
  advance_notice_tier2_days: number;
  advance_notice_tier3_days: number;
  require_deposit_for_large_groups: boolean;
  require_waiver_for_groups: boolean;
  require_coordinator_for_groups: boolean;
}

export default function FarmerGroupSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState<GroupSettings>({
    max_guests_per_booking: 50,
    daily_capacity: 200,
    discount_tier1_min: 11,
    discount_tier1_percent: 10,
    discount_tier2_min: 21,
    discount_tier2_percent: 15,
    discount_tier3_min: 51,
    discount_tier3_percent: 20,
    advance_notice_tier1_days: 3,
    advance_notice_tier2_days: 7,
    advance_notice_tier3_days: 14,
    require_deposit_for_large_groups: false,
    require_waiver_for_groups: false,
    require_coordinator_for_groups: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }
      const user = JSON.parse(userData);
      
      const response = await fetch(`/api/farmer/profile?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          max_guests_per_booking: data.max_guests_per_booking || 50,
          daily_capacity: data.daily_capacity || 200,
          discount_tier1_min: data.discount_tier1_min || 11,
          discount_tier1_percent: data.discount_tier1_percent || 10,
          discount_tier2_min: data.discount_tier2_min || 21,
          discount_tier2_percent: data.discount_tier2_percent || 15,
          discount_tier3_min: data.discount_tier3_min || 51,
          discount_tier3_percent: data.discount_tier3_percent || 20,
          advance_notice_tier1_days: data.advance_notice_tier1_days || 3,
          advance_notice_tier2_days: data.advance_notice_tier2_days || 7,
          advance_notice_tier3_days: data.advance_notice_tier3_days || 14,
          require_deposit_for_large_groups: data.require_deposit_for_large_groups || false,
          require_waiver_for_groups: data.require_waiver_for_groups || false,
          require_coordinator_for_groups: data.require_coordinator_for_groups || false,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch('/api/farmer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...settings
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="mb-6">
          <Link href="/farmer/settings" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Settings
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-emerald-900">Group Booking Settings</h1>
            <p className="text-emerald-600 mt-1">Configure settings for large group bookings</p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-100 border border-green-300 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">Settings saved successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
          {/* Capacity Settings */}
          <div className="p-6 border-b border-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Maximum Guests Per Booking</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={settings.max_guests_per_booking}
                  onChange={(e) => setSettings({...settings, max_guests_per_booking: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-emerald-500 mt-1">Maximum number of people allowed per booking</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Daily Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.daily_capacity}
                  onChange={(e) => setSettings({...settings, daily_capacity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-emerald-500 mt-1">Maximum total guests per day</p>
              </div>
            </div>
          </div>

          {/* Discount Tiers */}
          <div className="p-6 border-b border-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Group Discount Tiers
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">11-20 guests</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.discount_tier1_percent}
                    onChange={(e) => setSettings({...settings, discount_tier1_percent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg"
                  />
                  <p className="text-xs text-emerald-500 mt-1">% off</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">21-50 guests</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.discount_tier2_percent}
                    onChange={(e) => setSettings({...settings, discount_tier2_percent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg"
                  />
                  <p className="text-xs text-emerald-500 mt-1">% off</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">50+ guests</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.discount_tier3_percent}
                    onChange={(e) => setSettings({...settings, discount_tier3_percent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg"
                  />
                  <p className="text-xs text-emerald-500 mt-1">% off</p>
                </div>
              </div>
            </div>
          </div>

          {/* Advance Notice */}
          <div className="p-6 border-b border-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Advance Notice Required
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">11-20 guests</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.advance_notice_tier1_days}
                  onChange={(e) => setSettings({...settings, advance_notice_tier1_days: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg"
                />
                <p className="text-xs text-emerald-500 mt-1">days notice required</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">21-50 guests</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.advance_notice_tier2_days}
                  onChange={(e) => setSettings({...settings, advance_notice_tier2_days: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg"
                />
                <p className="text-xs text-emerald-500 mt-1">days notice required</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">50+ guests</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.advance_notice_tier3_days}
                  onChange={(e) => setSettings({...settings, advance_notice_tier3_days: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg"
                />
                <p className="text-xs text-emerald-500 mt-1">days notice required</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Group Booking Requirements
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_deposit_for_large_groups}
                  onChange={(e) => setSettings({...settings, require_deposit_for_large_groups: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-emerald-700">Require deposit for 50+ guests (50%)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_waiver_for_groups}
                  onChange={(e) => setSettings({...settings, require_waiver_for_groups: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-emerald-700">Require signed waiver for groups</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_coordinator_for_groups}
                  onChange={(e) => setSettings({...settings, require_coordinator_for_groups: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-emerald-700">Require group coordinator contact</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-emerald-50/30 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}