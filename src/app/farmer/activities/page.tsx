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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <div className="flex items-center gap-3">
              <Link href="/farmer/activities/new">
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                  <Plus className="h-5 w-5" />
                  Add Activity
                </button>
              </Link>
            </div>
          </div>

          {/* Activities List */}
          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-500">No activities added yet</p>
                <Link href="/farmer/activities/new">
                  <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
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
                      <div className="p-4 bg-white border border-emerald-200 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-emerald-900">Edit Activity</h3>
                          <button
                            onClick={cancelEdit}
                            className="p-1 hover:bg-gray-100 rounded-lg transition"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-1">
                              Activity Name
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-1">
                              Category (Optional)
                            </label>
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              placeholder="e.g., Farm Tour, Workshop"
                              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
                            />
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.is_free}
                                onChange={(e) => setEditForm({ ...editForm, is_free: e.target.checked, price: e.target.checked ? 0 : editForm.price })}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-sm text-emerald-700">Free Activity</span>
                            </label>
                          </div>
                          
                          {!editForm.is_free && (
                            <div className="flex gap-3">
                              <div className="w-32">
                                <label className="block text-sm font-medium text-emerald-700 mb-1">Currency</label>
                                <select
                                  value={editForm.currency}
                                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-gray-900"
                                >
                                  <option value="KES">KES</option>
                                  <option value="USD">USD</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-emerald-700 mb-1">Price</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-gray-900"
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={handleUpdate}
                              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode - Improved contrast for badges
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-emerald-900">{activity.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {activity.category && (
                              <span className="text-xs text-white bg-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                {activity.category}
                              </span>
                            )}
                            {activity.is_free ? (
                              <span className="text-xs text-white bg-green-600 px-2 py-0.5 rounded-full font-medium">
                                Free
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-emerald-700">
                                {activity.currency} {activity.price?.toLocaleString()}
                              </span>
                            )}
                            {activity.is_custom && (
                              <span className="text-xs text-white bg-amber-600 px-2 py-0.5 rounded-full font-medium">
                                Custom
                              </span>
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