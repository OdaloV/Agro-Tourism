// src/app/visitor/dashboard/settings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Bell,
  Globe,
  Lock,
  CreditCard,
  MapPin,
  Languages,
  Moon,
  Sun,
  Save,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Shield,
  Trash2,
  LogOut,
  Camera,
  X,
  Upload,
} from "lucide-react";
import Image from "next/image";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  language: string;
  theme: "light" | "dark" | "system";
  profilePhoto: string | null;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    bookingUpdates: boolean;
    reminders: boolean;
  };
}

export default function VisitorSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    location: "",
    language: "en",
    theme: "light",
    profilePhoto: null,
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      bookingUpdates: true,
      reminders: true,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchProfile = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/auth/login/visitor");
          return;
        }

        const user = JSON.parse(userData);
        
        // Try to load profile photo from localStorage or API
        const savedPhoto = localStorage.getItem("visitor_profile_photo");
        
        setProfile({
          id: user.id || 1,
          name: user.name || "John Visitor",
          email: user.email || "visitor@example.com",
          phone: user.phone || "+254712345678",
          location: "Nairobi, Kenya",
          language: "en",
          theme: "light",
          profilePhoto: savedPhoto || null,
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            bookingUpdates: true,
            reminders: true,
          },
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, mounted]);

 // Replace the handleProfilePhotoUpload function:
const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file (JPEG, PNG, etc.)");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("File size must be less than 5MB");
    return;
  }

  setUploadingPhoto(true);

  try {
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      // Save to database
      const response = await fetch('/api/user/visitorpfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorpfp: base64String })
      });
      
      if (response.ok) {
        setProfile({ ...profile, profilePhoto: base64String });
        localStorage.setItem("visitor_profile_photo", base64String);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert("Failed to save photo to database");
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Error uploading photo:", error);
    alert("Failed to upload photo. Please try again.");
  } finally {
    setUploadingPhoto(false);
  }
};

// Replace the handleDeleteProfilePhoto function:
const handleDeleteProfilePhoto = async () => {
  if (confirm("Are you sure you want to remove your profile photo?")) {
    try {
      const response = await fetch('/api/user/visitorpfp', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProfile({ ...profile, profilePhoto: null });
        localStorage.removeItem("visitor_profile_photo");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert("Failed to remove photo");
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      alert("Failed to remove photo");
    }
  }
};

// Also update the useEffect to fetch from database:
useEffect(() => {
  if (!mounted) return;

  const fetchProfile = async () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/visitor");
        return;
      }

      const user = JSON.parse(userData);
      
      // Fetch profile photo from database
      const photoResponse = await fetch('/api/user/visitorpfp');
      let profilePhoto = null;
      if (photoResponse.ok) {
        const photoData = await photoResponse.json();
        profilePhoto = photoData.visitorpfp;
      }
      
      setProfile({
        id: user.id || 1,
        name: user.name || "John Visitor",
        email: user.email || "visitor@example.com",
        phone: user.phone || "+254712345678",
        location: "Nairobi, Kenya",
        language: "en",
        theme: "light",
        profilePhoto: profilePhoto,
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false,
          bookingUpdates: true,
          reminders: true,
        },
      });
      
      // Also save to localStorage for quick access
      if (profilePhoto) {
        localStorage.setItem("visitor_profile_photo", profilePhoto);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  fetchProfile();
}, [router, mounted]);


  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSaving(false);
    
    // Update localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      user.name = profile.name;
      user.email = profile.email;
      user.phone = profile.phone;
      user.profilePhoto = profile.profilePhoto;
      localStorage.setItem("userData", JSON.stringify(user));
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSaving(false);
    alert("Password changed successfully!");
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowDeleteModal(false);
    setSaving(false);
    alert("Account deleted. We're sad to see you go!");
    localStorage.clear();
    router.push("/auth");
  };

  const toggleNotification = (key: keyof UserProfile["notifications"]) => {
    setProfile({
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: !profile.notifications[key],
      },
    });
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-bold text-emerald-900">Settings</h1>
          <p className="text-emerald-600 mt-1">Manage your account preferences</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-600">Settings saved successfully!</p>
          </motion.div>
        )}

        {/* Profile Photo Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Profile Photo</h2>
            <p className="text-sm text-emerald-500">Upload a photo to personalize your account</p>
          </div>
          <div className="p-5 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile.name?.charAt(0).toUpperCase() || "V"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="p-2 bg-accent text-white rounded-full hover:bg-accent/90 transition shadow-lg"
                  title="Upload photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
                {profile.profilePhoto && (
                  <button
                    onClick={handleDeleteProfilePhoto}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                    title="Remove photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleProfilePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-emerald-500 text-center">
              Click the camera icon to upload a profile photo (max 5MB)
            </p>
            {uploadingPhoto && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Profile Information</h2>
            <p className="text-sm text-emerald-500">Update your personal details</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Language</label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({...profile, language: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Theme</label>
                <div className="relative">
                  {profile.theme === "light" ? (
                    <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  ) : (
                    <Moon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  )}
                  <select
                    value={profile.theme}
                    onChange={(e) => setProfile({...profile, theme: e.target.value as any})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : <><Save className="h-5 w-5" /> Save Changes</>}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Notification Preferences</h2>
            <p className="text-sm text-emerald-500">Choose how you want to be notified</p>
          </div>
          <div className="p-5 space-y-4">
            <NotificationToggle
              icon={Bell}
              title="Email Notifications"
              description="Receive updates via email"
              checked={profile.notifications.email}
              onChange={() => toggleNotification("email")}
            />
            <NotificationToggle
              icon={Phone}
              title="SMS Notifications"
              description="Get text message alerts"
              checked={profile.notifications.sms}
              onChange={() => toggleNotification("sms")}
            />
            <NotificationToggle
              icon={Bell}
              title="Push Notifications"
              description="Browser notifications"
              checked={profile.notifications.push}
              onChange={() => toggleNotification("push")}
            />
            <NotificationToggle
              icon={Bell}
              title="Booking Updates"
              description="Status changes for your bookings"
              checked={profile.notifications.bookingUpdates}
              onChange={() => toggleNotification("bookingUpdates")}
            />
            <NotificationToggle
              icon={Bell}
              title="Reminders"
              description="Upcoming farm visits"
              checked={profile.notifications.reminders}
              onChange={() => toggleNotification("reminders")}
            />
            <NotificationToggle
              icon={Mail}
              title="Marketing Emails"
              description="Special offers and promotions"
              checked={profile.notifications.marketing}
              onChange={() => toggleNotification("marketing")}
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Security</h2>
            <p className="text-sm text-emerald-500">Manage your password and account security</p>
          </div>
          <div className="p-5 space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-emerald-500" />
                <div className="text-left">
                  <p className="font-medium text-emerald-900">Change Password</p>
                  <p className="text-sm text-emerald-500">Update your password</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-emerald-400 rotate-180" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between p-4 border border-red-100 rounded-xl hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-red-400">Permanently delete your account</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-red-400 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-emerald-100">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">Change Password</h3>
            </div>
            <div className="p-5 space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-emerald-100 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-red-100">
              <h3 className="text-lg font-heading font-semibold text-red-600">Delete Account</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-700 mb-2">⚠️ Warning: This action cannot be undone!</p>
                <p className="text-xs text-red-600">Deleting your account will permanently remove all your data, including:</p>
                <ul className="text-xs text-red-600 list-disc list-inside mt-2 space-y-1">
                  <li>All your bookings and history</li>
                  <li>Saved favorite farms</li>
                  <li>Reviews you've written</li>
                  <li>Payment information</li>
                </ul>
              </div>
              <p className="text-sm text-emerald-600">Type <strong className="text-red-600">DELETE</strong> to confirm</p>
              <input
                type="text"
                placeholder="Type DELETE"
                className="w-full px-4 py-2 border border-red-200 rounded-xl focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="p-5 border-t border-emerald-100 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({ icon: Icon, title, description, checked, onChange }: {
  icon: any;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-lg">
          <Icon className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <p className="font-medium text-emerald-900">{title}</p>
          <p className="text-sm text-emerald-500">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
      </label>
    </div>
  );
}