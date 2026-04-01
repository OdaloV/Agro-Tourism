// src/app/farmer/activities/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Edit, ArrowLeft, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  name: string;
  category?: string;
  isCustom?: boolean;
}

export default function FarmerActivities() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }

      try {
        const user = JSON.parse(userData);
        const response = await fetch(`/api/farmer/profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const activityList = data.activities || [];
          setActivities(activityList.map((name: string, index: number) => ({
            id: index.toString(),
            name: name,
            isCustom: name.includes("(")
          })));
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/farmer/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">My Activities</h1>
              <p className="text-emerald-600 mt-1">Activities you offer on your farm</p>
            </div>
            <Link href="/farmer/activities/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90">
                <Plus className="h-5 w-5" />
                Add Activity
              </button>
            </Link>
          </div>

          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No activities added yet</p>
                <Link href="/farmer/activities/new">
                  <button className="mt-4 px-4 py-2 bg-accent text-white rounded-xl">Add your first activity</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-emerald-900">{activity.name}</h3>
                      {activity.isCustom && <p className="text-xs text-emerald-500">Custom activity</p>}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-emerald-100 rounded-lg">
                        <Edit className="h-4 w-4 text-emerald-600" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}