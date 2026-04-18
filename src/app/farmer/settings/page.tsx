"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Building,
  Bell,
  CreditCard,
  Clock,
  Shield,
  Save,
  RefreshCw,
  Calendar,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ProfileSettingsTab from "./components/ProfileSettingsTab";
import FarmSettingsTab from "./components/FarmSettingsTab";
import NotificationSettingsTab from "./components/NotificationSettingsTab";
import PaymentSettingsTab from "./components/PaymentSettingsTab";
import BusinessHoursTab from "./components/BusinessHoursTab";
import SecurityTab from "./components/SecurityTab";

interface SettingsData {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  farmer: {
    farm_name: string;
    farm_location: string;
    farm_size: string;
    year_established: number;
    farm_description: string;
    farm_type: string;
    accommodation: boolean;
    max_guests: number;
    video_link: string;
  };
  facilities: string[];
  settings: {
    email_new_bookings: boolean;
    email_new_messages: boolean;
    email_new_reviews: boolean;
    email_promotions: boolean;
    sms_alerts: boolean;
    reminder_upcoming_booking: boolean;
    marketing_emails: boolean;
  };
  payment: {
    bank_name: string;
    account_name: string;
    account_number: string;
    mpesa_number: string;
    payment_methods: string[];
    tax_id: string;
  };
  business_hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time: string;
    close_time: string;
  }>;
  two_factor_enabled: boolean;
  googleCalendar?: {
    connected: boolean;
    calendarId: string | null;
  };
}

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "farm", label: "Farm Profile", icon: Building },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "hours", label: "Business Hours", icon: Clock },
  { id: "security", label: "Security", icon: Shield },
];

export default function FarmerSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [calendarConnecting, setCalendarConnecting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/farmer/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/farmer/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });

      if (response.ok) {
        await fetchSettings();
        alert("Settings saved successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    setCalendarConnecting(true);
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }
      const user = JSON.parse(userData);

      // Initiate Google OAuth flow
      const response = await fetch('/api/calendar/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok && data.authUrl) {
        // Redirect to Google OAuth consent screen
        window.location.href = data.authUrl;
      } else {
        alert(data.error || "Failed to connect Google Calendar");
      }
    } catch (error) {
      console.error("Error connecting Google Calendar:", error);
      alert("Failed to connect Google Calendar");
    } finally {
      setCalendarConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar? Your bookings will no longer sync.")) {
      return;
    }

    setCalendarConnecting(true);
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        await fetchSettings();
        alert("Google Calendar disconnected successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to disconnect Google Calendar");
      }
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      alert("Failed to disconnect Google Calendar");
    } finally {
      setCalendarConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Failed to load settings</p>
          <button onClick={fetchSettings} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-emerald-900">Settings</h1>
              <p className="text-emerald-600 mt-1">Manage your account and farm preferences</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
                  activeTab === tab.id
                    ? "bg-white text-emerald-600 border-t border-l border-r border-emerald-200 -mb-px"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          {activeTab === "profile" && (
            <ProfileSettingsTab
              user={settings.user}
              onSave={(data) => handleSave("profile", data)}
              saving={saving}
            />
          )}
          
          {activeTab === "farm" && (
            <FarmSettingsTab
              farmer={settings.farmer}
              facilities={settings.facilities}
              onSave={(data) => handleSave("farm", data)}
              saving={saving}
            />
          )}
          
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-emerald-900 mb-4">Google Calendar Integration</h2>
                <p className="text-emerald-600 mb-6">
                  Connect your Google Calendar to automatically sync bookings and receive reminders.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Calendar Sync</h3>
                    <p className="text-sm text-emerald-600">
                      {settings.googleCalendar?.connected 
                        ? "Your Google Calendar is connected. Bookings will be automatically added."
                        : "Connect your Google Calendar to sync bookings and get reminders."}
                    </p>
                    {settings.googleCalendar?.connected && settings.googleCalendar.calendarId && (
                      <p className="text-xs text-emerald-500 mt-2">
                        Connected calendar: {settings.googleCalendar.calendarId}
                      </p>
                    )}
                  </div>
                  
                  {settings.googleCalendar?.connected ? (
                    <button
                      onClick={handleDisconnectGoogleCalendar}
                      disabled={calendarConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                    >
                      {calendarConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          Disconnect
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGoogleCalendar}
                      disabled={calendarConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {calendarConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          Connect Google Calendar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {settings.googleCalendar?.connected && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Calendar Connected</p>
                      <p className="text-xs text-green-600 mt-1">
                        When visitors book your farm, events will be automatically added to your Google Calendar.
                        You will also receive email reminders for upcoming bookings.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "notifications" && (
            <NotificationSettingsTab
              settings={settings.settings}
              onSave={(data) => handleSave("notifications", data)}
              saving={saving}
            />
          )}
          
          {activeTab === "payment" && (
            <PaymentSettingsTab
              payment={settings.payment}
              onSave={(data) => handleSave("payment", data)}
              saving={saving}
            />
          )}
          
          {activeTab === "hours" && (
            <BusinessHoursTab
              hours={settings.business_hours}
              onSave={(data) => handleSave("hours", data)}
              saving={saving}
            />
          )}
          
          {activeTab === "security" && (
            <SecurityTab
              twoFactorEnabled={settings.two_factor_enabled}
              onSave={(data) => handleSave("security", data)}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}