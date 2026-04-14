"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, Calendar, Megaphone, Save, Star, MessageCircle, ShoppingBag } from "lucide-react";

interface NotificationSettingsTabProps {
  settings: {
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
  };
  onSave: (data: any) => void;
  saving: boolean;
}

export default function NotificationSettingsTab({ settings, onSave, saving }: NotificationSettingsTabProps) {
  const [formData, setFormData] = useState({
    // Email Notifications
    email_new_bookings: settings.email_new_bookings ?? true,
    email_new_messages: settings.email_new_messages ?? true,
    email_new_reviews: settings.email_new_reviews ?? true,
    email_promotions: settings.email_promotions ?? false,
    // SMS Notifications
    sms_alerts: settings.sms_alerts ?? false,
    // Booking Reminders
    reminder_upcoming_booking: settings.reminder_upcoming_booking ?? true,
    // Marketing
    marketing_emails: settings.marketing_emails ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleSetting = (key: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="h-6 w-6 text-emerald-600" />
        <div>
          <h2 className="text-xl font-semibold text-emerald-900">Notification Preferences</h2>
          <p className="text-sm text-emerald-500">Choose how you want to receive updates</p>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Email Notifications</h3>
        </div>
        <div className="space-y-4">
          <NotificationItem
            title="New Bookings"
            description="Receive email when someone books your farm"
            icon={ShoppingBag}
            enabled={formData.email_new_bookings}
            onToggle={() => toggleSetting("email_new_bookings")}
          />
          <NotificationItem
            title="New Messages"
            description="Receive email when visitors message you"
            icon={MessageCircle}
            enabled={formData.email_new_messages}
            onToggle={() => toggleSetting("email_new_messages")}
          />
          <NotificationItem
            title="New Reviews"
            description="Receive email when visitors leave reviews"
            icon={Star}
            enabled={formData.email_new_reviews}
            onToggle={() => toggleSetting("email_new_reviews")}
          />
          <NotificationItem
            title="Promotions & Updates"
            description="Receive platform news and feature updates"
            icon={Megaphone}
            enabled={formData.email_promotions}
            onToggle={() => toggleSetting("email_promotions")}
          />
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">SMS Notifications</h3>
        </div>
        <div className="space-y-4">
          <NotificationItem
            title="SMS Alerts"
            description="Receive text messages for important updates"
            icon={Smartphone}
            enabled={formData.sms_alerts}
            onToggle={() => toggleSetting("sms_alerts")}
          />
        </div>
      </div>

      {/* Booking Reminders */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Booking Reminders</h3>
        </div>
        <div className="space-y-4">
          <NotificationItem
            title="Upcoming Booking Reminders"
            description="Get reminded 1 day before a booking"
            icon={Calendar}
            enabled={formData.reminder_upcoming_booking}
            onToggle={() => toggleSetting("reminder_upcoming_booking")}
          />
        </div>
      </div>

      {/* Marketing Communications */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Marketing Communications</h3>
        </div>
        <div className="space-y-4">
          <NotificationItem
            title="Marketing Emails"
            description="Receive tips, insights, and special offers"
            icon={Megaphone}
            enabled={formData.marketing_emails}
            onToggle={() => toggleSetting("marketing_emails")}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 font-medium"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Notification Item Component
function NotificationItem({ 
  title, 
  description, 
  icon: Icon, 
  enabled, 
  onToggle 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  enabled: boolean; 
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-white rounded-lg">
          <Icon className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <p className="font-medium text-emerald-900">{title}</p>
          <p className="text-sm text-emerald-500">{description}</p>
        </div>
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