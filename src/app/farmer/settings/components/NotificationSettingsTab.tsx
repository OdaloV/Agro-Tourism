// src/app/farmer/settings/components/NotificationSettingsTab.tsx
"use client";

import { useState } from "react";
import { Bell, Mail, Phone, Calendar, Star, Megaphone, Save } from "lucide-react";

interface NotificationSettingsTabProps {
  settings: {
    notification_email_bookings: boolean;
    notification_email_messages: boolean;
    notification_email_reviews: boolean;
    notification_email_promotions: boolean;
    notification_sms: boolean;
    notification_booking_reminders: boolean;
    marketing_emails: boolean;
  };
  onSave: (data: any) => void;
  saving: boolean;
}

export default function NotificationSettingsTab({ settings, onSave, saving }: NotificationSettingsTabProps) {
  const [formData, setFormData] = useState({
    email_bookings: settings.notification_email_bookings ?? true,
    email_messages: settings.notification_email_messages ?? true,
    email_reviews: settings.notification_email_reviews ?? true,
    email_promotions: settings.notification_email_promotions ?? false,
    sms: settings.notification_sms ?? false,
    booking_reminders: settings.notification_booking_reminders ?? true,
    marketing_emails: settings.marketing_emails ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Notification Preferences</h2>
        <p className="text-sm text-gray-500 mb-6">Choose how you want to receive updates</p>
      </div>

      {/* Email Notifications */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-emerald-900">Email Notifications</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700">New Bookings</span>
              <p className="text-xs text-gray-400">Receive email when someone books your farm</p>
            </div>
            <input
              type="checkbox"
              checked={formData.email_bookings}
              onChange={(e) => setFormData({ ...formData, email_bookings: e.target.checked })}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700">New Messages</span>
              <p className="text-xs text-gray-400">Receive email when visitors message you</p>
            </div>
            <input
              type="checkbox"
              checked={formData.email_messages}
              onChange={(e) => setFormData({ ...formData, email_messages: e.target.checked })}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700">New Reviews</span>
              <p className="text-xs text-gray-400">Receive email when visitors leave reviews</p>
            </div>
            <input
              type="checkbox"
              checked={formData.email_reviews}
              onChange={(e) => setFormData({ ...formData, email_reviews: e.target.checked })}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700">Promotions & Updates</span>
              <p className="text-xs text-gray-400">Receive platform news and feature updates</p>
            </div>
            <input
              type="checkbox"
              checked={formData.email_promotions}
              onChange={(e) => setFormData({ ...formData, email_promotions: e.target.checked })}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
          </label>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-emerald-900">SMS Notifications</h3>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-gray-700">SMS Alerts</span>
            <p className="text-xs text-gray-400">Receive text messages for important updates</p>
          </div>
          <input
            type="checkbox"
            checked={formData.sms}
            onChange={(e) => setFormData({ ...formData, sms: e.target.checked })}
            className="rounded border-gray-300 text-accent focus:ring-accent"
          />
        </label>
      </div>

      {/* Booking Reminders */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-emerald-900">Booking Reminders</h3>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-gray-700">Upcoming Booking Reminders</span>
            <p className="text-xs text-gray-400">Get reminded 1 day before a booking</p>
          </div>
          <input
            type="checkbox"
            checked={formData.booking_reminders}
            onChange={(e) => setFormData({ ...formData, booking_reminders: e.target.checked })}
            className="rounded border-gray-300 text-accent focus:ring-accent"
          />
        </label>
      </div>

      {/* Marketing Emails */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-emerald-900">Marketing Communications</h3>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-gray-700">Marketing Emails</span>
            <p className="text-xs text-gray-400">Receive tips, insights, and special offers</p>
          </div>
          <input
            type="checkbox"
            checked={formData.marketing_emails}
            onChange={(e) => setFormData({ ...formData, marketing_emails: e.target.checked })}
            className="rounded border-gray-300 text-accent focus:ring-accent"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}