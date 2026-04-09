// src/app/farmer/schedule/components/CalendarHeader.tsx
"use client";

import { ChevronLeft, ChevronRight, Grid3x3, List } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: "month" | "list";
  onViewChange: (view: "month" | "list") => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-emerald-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={onToday}
          className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* View Toggle - Removed "week" option */}
        <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
          <button
            onClick={() => onViewChange("month")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${
              viewMode === "month"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`px-3 py-1.5 rounded-md text-sm transition ${
              viewMode === "list"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={onPrev}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}