// src/app/farmer/calendar/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

export default function FarmerCalendar() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/farmer/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h1 className="text-2xl font-heading font-bold text-emerald-900">Availability Calendar</h1>
            <p className="text-emerald-600 mt-1">Manage when your activities are available</p>
          </div>

          <div className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-500 mb-4">Calendar feature coming soon!</p>
            <p className="text-sm text-emerald-400">You'll be able to set availability for your farm activities here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}