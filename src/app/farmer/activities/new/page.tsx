"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, DollarSign } from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/app/profile/farmerprofile/options";
import { Skeleton } from "@/components/ui/Skeleton";

// Convert readonly arrays to mutable for TypeScript
type ActivityCategories = {
  [key: string]: string[];
};

// Helper function to get category for selected activity
const getActivityCategory = (activityName: string): string | null => {
  for (const [category, activities] of Object.entries(ACTIVITY_CATEGORIES)) {
    if ((activities as readonly string[]).includes(activityName)) {
      return category;
    }
  }
  return null;
};

export default function AddActivity() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Price related states
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [currency, setCurrency] = useState("KES");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let activityName = "";
    let activityCategory = null;

    if (selectedActivity) {
      activityName = selectedActivity;
      activityCategory = getActivityCategory(selectedActivity);
    } else if (customActivity) {
      activityName = customCategory ? `${customActivity} (${customCategory})` : customActivity;
      activityCategory = customCategory || null;
    }
    
    if (!activityName) {
      alert("Please select or add an activity");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/farmer/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activityName,
          category: activityCategory,
          price: isFree ? 0 : price,
          is_free: isFree,
          currency: currency
        })
      });

      if (response.ok) {
        alert("Activity added successfully!");
        router.push("/farmer/activities");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add activity");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity");
    } finally {
      setSaving(false);
    }
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
                      {(activities as readonly string[]).map((activity) => (
                        <label key={activity} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="activity"
                            value={activity}
                            checked={selectedActivity === activity}
                            onChange={() => {
                              setSelectedActivity(activity);
                              setCustomActivity("");
                              setCustomCategory("");
                            }}
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
                  onChange={(e) => {
                    setCustomActivity(e.target.value);
                    setSelectedActivity("");
                  }}
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
              {customActivity && !customCategory && (
                <p className="text-xs text-red-500 mt-1">Please select a category for your custom activity</p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h3 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Pricing
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => {
                      setIsFree(e.target.checked);
                      if (e.target.checked) setPrice(0);
                    }}
                    className="rounded border-emerald-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-emerald-700">This activity is free</span>
                </label>

                {!isFree && (
                  <div className="flex gap-3">
                    <div className="w-32">
                      <label className="block text-xs text-emerald-600 mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
                      >
                        <option value="KES">KES</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-emerald-600 mb-1">Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-emerald-500 mt-2">
                  {isFree 
                    ? "Visitors can enjoy this activity at no cost." 
                    : `Visitors will pay ${currency} ${price || 0} per person for this activity.`}
                </p>
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