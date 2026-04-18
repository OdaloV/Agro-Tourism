"use client";

import { useState } from "react";
import { X, Calendar, CalendarCheck } from "lucide-react";

interface AvailabilityModalProps {
  onClose: () => void;
  onBlockDates: (startDate: string, endDate: string, reason: string) => void;
  onSyncGoogleCalendar?: () => void;
  googleCalendarConnected?: boolean;
  isSyncing?: boolean;
}

export default function AvailabilityModal({
  onClose,
  onBlockDates,
  onSyncGoogleCalendar,
  googleCalendarConnected = false,
  isSyncing = false,
}: AvailabilityModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("End date must be after start date");
      return;
    }

    setSubmitting(true);
    await onBlockDates(startDate, endDate, reason);
    
    // If sync to Google Calendar is enabled and available
    if (syncToGoogle && googleCalendarConnected && onSyncGoogleCalendar) {
      await onSyncGoogleCalendar();
    }
    
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emerald-900">Block Dates</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Farm maintenance, Vacation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Google Calendar Sync Option */}
          {googleCalendarConnected && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="syncToGoogle"
                checked={syncToGoogle}
                onChange={(e) => setSyncToGoogle(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <label htmlFor="syncToGoogle" className="text-sm text-gray-700">
                Also block these dates in Google Calendar
              </label>
            </div>
          )}

          {/* Google Calendar Status */}
          {googleCalendarConnected && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700">
                Google Calendar is connected. Bookings will sync automatically.
              </span>
            </div>
          )}

          {!googleCalendarConnected && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-amber-700">
                Connect Google Calendar in Settings to auto-sync your availability.
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? "Blocking..." : "Block Dates"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}