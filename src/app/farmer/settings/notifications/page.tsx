"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Bell, Mail, Smartphone, Calendar, Megaphone, Save, CheckCircle, AlertCircle } from "lucide-react";

interface NotificationSettings {
  // Email Notifications
  email_new_bookings: boolean;
  email_new_messages: boolean;
  email_new_reviews: boolean;
  email_promotions: boolean;
  
  // SMS Notifications
  sms_alerts: boolean;
  
  // Booking Reminders
  reminder_upcoming_booking: boolean;
  
  // Marketing
  marketing_emails: boolean;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_new_bookings: true,
    email_new_messages: true,
    email_new_reviews: true,
    email_promotions: false,
    sms_alerts: false,
    reminder_upcoming_booking: true,
    marketing_emails: false,
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
      
      const response = await fetch(`/api/farmer/notification-settings?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
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

      const response = await fetch('/api/farmer/notification-settings', {
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

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/settings" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Bell className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Notification Preferences</h1>
              <p className="text-emerald-600 mt-1">Choose how you want to receive updates</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-100 border border-green-300 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">Preferences saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Email Notifications */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-emerald-900">Email Notifications</h2>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Receive updates via email</p>
            </div>
            <div className="p-5 space-y-4">
              <NotificationItem
                title="New Bookings"
                description="Receive email when someone books your farm"
                enabled={settings.email_new_bookings}
                onToggle={() => toggleSetting("email_new_bookings")}
              />
              <NotificationItem
                title="New Messages"
                description="Receive email when visitors message you"
                enabled={settings.email_new_messages}
                onToggle={() => toggleSetting("email_new_messages")}
              />
              <NotificationItem
                title="New Reviews"
                description="Receive email when visitors leave reviews"
                enabled={settings.email_new_reviews}
                onToggle={() => toggleSetting("email_new_reviews")}
              />
              <NotificationItem
                title="Promotions & Updates"
                description="Receive platform news and feature updates"
                enabled={settings.email_promotions}
                onToggle={() => toggleSetting("email_promotions")}
              />
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-emerald-900">SMS Notifications</h2>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Receive text messages for important updates</p>
            </div>
            <div className="p-5 space-y-4">
              <NotificationItem
                title="SMS Alerts"
                description="Receive text messages for critical updates"
                enabled={settings.sms_alerts}
                onToggle={() => toggleSetting("sms_alerts")}
              />
            </div>
          </div>

          {/* Booking Reminders */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-emerald-900">Booking Reminders</h2>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Get notified about upcoming bookings</p>
            </div>
            <div className="p-5 space-y-4">
              <NotificationItem
                title="Upcoming Booking Reminders"
                description="Get reminded 1 day before a booking"
                enabled={settings.reminder_upcoming_booking}
                onToggle={() => toggleSetting("reminder_upcoming_booking")}
              />
            </div>
          </div>

          {/* Marketing Communications */}
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-emerald-900">Marketing Communications</h2>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Receive tips, insights, and special offers</p>
            </div>
            <div className="p-5 space-y-4">
              <NotificationItem
                title="Marketing Emails"
                description="Receive tips, insights, and special offers"
                enabled={settings.marketing_emails}
                onToggle={() => toggleSetting("marketing_emails")}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Item Component
function NotificationItem({ 
  title, 
  description, 
  enabled, 
  onToggle 
}: { 
  title: string; 
  description: string; 
  enabled: boolean; 
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-emerald-900">{title}</p>
        <p className="text-sm text-emerald-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  );
}