// src/app/farmer/activities/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  Activity, 
  Save, 
  X,
  DollarSign,
  Tag 
} from "lucide-react";

interface ActivityItem {
  id: number;
  name: string;
  category?: string;
  price: number;
  is_free: boolean;
  currency: string;
  is_custom?: boolean;
}

export default function FarmerActivities() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: 0,
    is_free: false,
    currency: "KES"
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/farmer/activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/farmer/activities?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchActivities();
        alert("Activity deleted successfully!");
      } else {
        alert("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity");
    }
  };

  const startEdit = (activity: ActivityItem) => {
    setEditingId(activity.id);
    setEditForm({
      name: activity.name,
      category: activity.category || "",
      price: activity.price,
      is_free: activity.is_free,
      currency: activity.currency || "KES"
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      category: "",
      price: 0,
      is_free: false,
      currency: "KES"
    });
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim()) {
      alert("Please enter an activity name");
      return;
    }

    try {
      const response = await fetch(`/api/farmer/activities?id=${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category || null,
          price: editForm.is_free ? 0 : editForm.price,
          is_free: editForm.is_free,
          currency: editForm.currency
        })
      });

      if (response.ok) {
        await fetchActivities();
        cancelEdit();
        alert("Activity updated successfully!");
      } else {
        alert("Failed to update activity");
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity");
    }
  };

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
        
        {/* Back Button */}
        <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">My Activities</h1>
              <p className="text-emerald-600 mt-1">Manage activities you offer on your farm</p>
            </div>
            <Link href="/farmer/activities/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition">
                <Plus className="h-5 w-5" />
                Add Activity
              </button>
            </Link>
          </div>

          {/* Activities List */}
          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No activities added yet</p>
                <Link href="/farmer/activities/new">
                  <button className="mt-4 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition">
                    Add your first activity
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-emerald-50 rounded-xl overflow-hidden">
                    {editingId === activity.id ? (
                      // Edit Mode
                      <div className="p-4">
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Activity name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
                          />
                          <input
                            type="text"
                            placeholder="Category (optional)"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
                          />
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.is_free}
                                onChange={(e) => setEditForm({ ...editForm, is_free: e.target.checked, price: e.target.checked ? 0 : editForm.price })}
                                className="rounded border-emerald-300"
                              />
                              <span className="text-sm text-emerald-700">Free Activity</span>
                            </label>
                          </div>
                          {!editForm.is_free && (
                            <div className="flex gap-3">
                              <select
                                value={editForm.currency}
                                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                className="px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                              >
                                <option value="KES">KES</option>
                                <option value="USD">USD</option>
                              </select>
                              <input
                                type="number"
                                placeholder="Price"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                                className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={handleUpdate}
                              className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-emerald-900">{activity.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {activity.category && (
                              <span className="text-xs text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">
                                {activity.category}
                              </span>
                            )}
                            {activity.is_free ? (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Free
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-accent">
                                {activity.currency} {activity.price?.toLocaleString()}
                              </span>
                            )}
                            {activity.is_custom && (
                              <span className="text-xs text-emerald-400">Custom</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(activity)}
                            className="p-2 hover:bg-emerald-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id, activity.name)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
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