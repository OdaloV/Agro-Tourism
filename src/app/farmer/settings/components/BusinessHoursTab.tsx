// src/app/farmer/settings/components/BusinessHoursTab.tsx
"use client";

import { useState } from "react";
import { Clock, Save, Plus, X } from "lucide-react";

interface BusinessHoursTabProps {
  hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time: string;
    close_time: string;
  }>;
  onSave: (data: any) => void;
  saving: boolean;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BusinessHoursTab({ hours, onSave, saving }: BusinessHoursTabProps) {
  const [businessHours, setBusinessHours] = useState(() => {
    const defaultHours = dayNames.map((_, index) => ({
      day_of_week: index,
      is_open: true,
      open_time: "09:00",
      close_time: "17:00",
    }));
    
    if (hours && hours.length > 0) {
      return defaultHours.map(defaultHour => {
        const existing = hours.find(h => h.day_of_week === defaultHour.day_of_week);
        return existing || defaultHour;
      });
    }
    return defaultHours;
  });

  const [holidays, setHolidays] = useState<Array<{ date: string; reason: string }>>([]);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: "", reason: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ hours: businessHours, holidays });
  };

  const updateHour = (day: number, field: string, value: any) => {
    setBusinessHours(prev =>
      prev.map(h => h.day_of_week === day ? { ...h, [field]: value } : h)
    );
  };

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.reason) {
      setHolidays([...holidays, { ...newHoliday }]);
      setNewHoliday({ date: "", reason: "" });
      setShowHolidayForm(false);
    }
  };

  const removeHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Business Hours</h2>
        <p className="text-sm text-gray-500 mb-6">Set your regular operating hours</p>
      </div>

      {/* Regular Hours */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-emerald-900">Weekly Schedule</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {businessHours.map((day) => (
            <div key={day.day_of_week} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-32 font-medium text-gray-700">
                {dayNames[day.day_of_week]}
              </div>
              <div className="flex-1 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={day.is_open}
                    onChange={(e) => updateHour(day.day_of_week, "is_open", e.target.checked)}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </label>
                
                {day.is_open && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={day.open_time}
                      onChange={(e) => updateHour(day.day_of_week, "open_time", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={day.close_time}
                      onChange={(e) => updateHour(day.day_of_week, "close_time", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holiday Hours */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-emerald-900">Holiday / Special Hours</h3>
          <button
            type="button"
            onClick={() => setShowHolidayForm(true)}
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </button>
        </div>
        
        {showHolidayForm && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Reason (e.g., Christmas, Maintenance)"
                value={newHoliday.reason}
                onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={addHoliday}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowHolidayForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {holidays.length > 0 && (
          <div className="divide-y divide-gray-200">
            {holidays.map((holiday, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{new Date(holiday.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{holiday.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeHoliday(index)}
                  className="p-1 hover:bg-red-100 rounded-lg transition"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {holidays.length === 0 && !showHolidayForm && (
          <div className="p-8 text-center text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No holidays added</p>
            <p className="text-sm">Add dates when your farm will be closed</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Business Hours"}
      </button>
    </form>
  );
}