"use client";

import { useState, useEffect } from "react";
import { Plus, X, Edit2, Trash2, Save, DollarSign, Tag } from "lucide-react";

interface Activity {
  id: number;
  name: string;
  category: string | null;
  price: number;
  is_free: boolean;
  currency: string;
  is_custom: boolean;
}

export default function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
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

  const handleAddActivity = async () => {
    if (!formData.name.trim()) {
      alert("Please enter activity name");
      return;
    }

    try {
      const response = await fetch('/api/farmer/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || null,
          price: formData.is_free ? 0 : formData.price,
          is_free: formData.is_free,
          currency: formData.currency
        })
      });

      if (response.ok) {
        await fetchActivities();
        setShowAddForm(false);
        setFormData({
          name: "",
          category: "",
          price: 0,
          is_free: false,
          currency: "KES"
        });
        alert("Activity added successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add activity");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity");
    }
  };

  const handleUpdateActivity = async (id: number) => {
    if (!formData.name.trim()) {
      alert("Please enter activity name");
      return;
    }

    try {
      const response = await fetch(`/api/farmer/activities?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || null,
          price: formData.is_free ? 0 : formData.price,
          is_free: formData.is_free,
          currency: formData.currency
        })
      });

      if (response.ok) {
        await fetchActivities();
        setEditingId(null);
        setFormData({
          name: "",
          category: "",
          price: 0,
          is_free: false,
          currency: "KES"
        });
        alert("Activity updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update activity");
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity");
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

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

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData({
      name: activity.name,
      category: activity.category || "",
      price: activity.price,
      is_free: activity.is_free,
      currency: activity.currency
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      category: "",
      price: 0,
      is_free: false,
      currency: "KES"
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-emerald-900">Farm Activities</h3>
        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition"
          >
            <Plus className="h-4 w-4" />
            Add Activity
          </button>
        )}
      </div>

      {/* Add Activity Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <h4 className="font-medium text-emerald-800 mb-3">Add New Activity</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Activity name (e.g., Tractor Ride, Cheese Making)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price })}
                  className="rounded border-emerald-300 text-accent focus:ring-accent"
                />
                <span className="text-sm text-emerald-700">Free Activity</span>
              </label>
            </div>
            {!formData.is_free && (
              <div className="flex gap-3">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"
              >
                Save Activity
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
      )}

      {/* Activities List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-emerald-500">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activities added yet</p>
            <p className="text-sm mt-1">Click "Add Activity" to list your farm experiences</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100"
            >
              {editingId === activity.id ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Category"
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_free}
                        onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price })}
                        className="rounded border-emerald-300 text-accent"
                      />
                      <span className="text-sm text-emerald-700">Free</span>
                    </label>
                  </div>
                  {!formData.is_free && (
                    <div className="flex gap-3">
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                      >
                        <option value="KES">KES</option>
                        <option value="USD">USD</option>
                      </select>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateActivity(activity.id)}
                      className="px-3 py-1 bg-accent text-white rounded-lg text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-emerald-900">{activity.name}</p>
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
                          {activity.currency} {activity.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(activity)}
                      className="p-1.5 hover:bg-emerald-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}