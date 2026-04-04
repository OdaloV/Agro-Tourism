// src/app/farmer/settings/components/ProfileSettingsTab.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Save, Camera, Trash2 } from "lucide-react";

interface ProfileSettingsTabProps {
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  onSave: (data: any) => void;
  saving: boolean;
}

export default function ProfileSettingsTab({ user, onSave, saving }: ProfileSettingsTabProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ✅ Bug 1 Fix: Fetch existing photo on mount
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch("/api/farmer/profile/photo");
        if (response.ok) {
          const data = await response.json();
          setProfilePhoto(data.photoUrl || null);
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    };
    fetchPhoto();
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    onSave({ type: "password", ...passwordData });
    setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    setShowPasswordForm(false);
  };

  // ✅ Bug 2 & 3 Fix: Use server URL, not base64, and refresh router
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setUploadingPhoto(true);

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      const response = await fetch("/api/farmer/profile/photo", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload photo");

      const data = await response.json();
      // ✅ Use the server URL, not base64 preview
      setProfilePhoto(data.photoUrl);
      router.refresh(); // ✅ Forces Next.js to re-fetch server data
      alert("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to delete your profile photo?")) return;
    
    setUploadingPhoto(true);
    try {
      const response = await fetch("/api/farmer/profile/photo", {
        method: "DELETE",
      });
      if (response.ok) {
        setProfilePhoto(null);
        router.refresh(); // ✅ Smooth refresh instead of window.location.reload()
        alert("Profile photo deleted successfully!");
      } else {
        throw new Error("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Photo */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-accent flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || "F"}</span>
              )}
            </div>
            <div className="absolute -bottom-2 right-0 flex gap-1">
              <label className="p-1.5 bg-accent rounded-full cursor-pointer hover:bg-accent/90 transition">
                <Camera className="h-3 w-3 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
              {profilePhoto && (
                <button
                  onClick={handleDeletePhoto}
                  className="p-1.5 bg-red-500 rounded-full cursor-pointer hover:bg-red-600 transition"
                  title="Delete photo"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Upload a profile photo</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        <p className="text-sm text-gray-500 mb-6">Update your personal information</p>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support for assistance.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
                placeholder="+254 XXX XXX XXX"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
        <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure</p>
        
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}