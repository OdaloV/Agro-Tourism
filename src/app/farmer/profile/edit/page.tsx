// src/app/farmer/profile/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Tractor,
  MapPin,
  Calendar,
  Ruler,
  FileText,
  Camera,
  Home,
  Activity,
  Building,
  AlertCircle,
} from "lucide-react";

export default function EditFarmerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    farmName: "",
    farmLocation: "",
    farmSize: "",
    yearEstablished: "",
    farmDescription: "",
    accommodation: false,
    maxGuests: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
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
          setFormData({
            farmName: data.farmName || "",
            farmLocation: data.farmLocation || "",
            farmSize: data.farmSize || "",
            yearEstablished: data.yearEstablished || "",
            farmDescription: data.farmDescription || "",
            accommodation: data.accommodation || false,
            maxGuests: data.maxGuests || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const userData = localStorage.getItem("userData");
    if (!userData) return;

    const user = JSON.parse(userData);

    try {
      const response = await fetch("/api/farmer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => router.push("/farmer/dashboard"), 1500);
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/farmer/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h1 className="text-2xl font-heading font-bold text-emerald-900">Edit Farm Profile</h1>
            <p className="text-emerald-600 mt-1">Update your farm information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-sm">{success}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Farm Name</label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Location</label>
              <input
                type="text"
                value={formData.farmLocation}
                onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Farm Size (acres)</label>
                <input
                  type="text"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Year Established</label>
                <input
                  type="text"
                  value={formData.yearEstablished}
                  onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Farm Description</label>
              <textarea
                rows={4}
                value={formData.farmDescription}
                onChange={(e) => setFormData({ ...formData, farmDescription: e.target.value })}
                className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Accommodation</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.accommodation === true} onChange={() => setFormData({ ...formData, accommodation: true })} className="accent-accent" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.accommodation === false} onChange={() => setFormData({ ...formData, accommodation: false })} className="accent-accent" />
                    <span>No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Max Guests</label>
                <input
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : <><Save className="h-5 w-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}