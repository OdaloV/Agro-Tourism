// src/app/farmer/activities/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/app/profile/farmerprofile/options";

export default function AddActivity() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const activityName = selectedActivity || (customActivity && `${customActivity} (${customCategory})`);
    
    if (!activityName) {
      alert("Please select or add an activity");
      setSaving(false);
      return;
    }

    // Here you would save to your backend
    console.log("Adding activity:", activityName);
    
    setTimeout(() => {
      router.push("/farmer/activities");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/farmer/activities" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Activities
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h1 className="text-2xl font-heading font-bold text-emerald-900">Add New Activity</h1>
            <p className="text-emerald-600 mt-1">What can visitors do on your farm?</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Predefined Activities by Category */}
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-3">Choose from existing activities:</label>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
                  <div key={category}>
                    <h4 className="font-medium text-accent mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {activities.map((activity) => (
                        <label key={activity} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="activity"
                            value={activity}
                            checked={selectedActivity === activity}
                            onChange={() => setSelectedActivity(activity)}
                            className="accent-accent"
                          />
                          <span className="text-sm text-emerald-700">{activity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-emerald-400">OR</span>
              </div>
            </div>

            {/* Custom Activity */}
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-2">Add a custom activity:</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Activity name"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  className="px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                >
                  <option value="">Select category</option>
                  {Object.keys(ACTIVITY_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : <><Plus className="h-5 w-5" /> Add Activity</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}