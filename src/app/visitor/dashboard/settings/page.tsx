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
  Lock,
  MapPin,
  Moon,
  Sun,
  Save,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Trash2,
  Camera,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  theme: "light" | "dark" | "system";
  profilePhoto: string | null;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
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
    theme: "light",
    profilePhoto: null,
    twoFactorEnabled: false,
    notifications: {
      email: true,
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

  // Helper to apply theme (only called when user changes dropdown)
  const applyTheme = (theme: string) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Save theme to localStorage and apply, then dispatch event for layout
  const saveAndApplyTheme = (theme: string) => {
    localStorage.setItem("visitor-theme", theme);
    applyTheme(theme);
    // Dispatch a storage event so layout picks up change (in case layout is already mounted)
    window.dispatchEvent(new StorageEvent("storage", { key: "visitor-theme", newValue: theme }));
  };

  // On mount, only set the theme value from localStorage for the dropdown, but DO NOT apply it (layout already did)
  useEffect(() => {
    const savedTheme = localStorage.getItem("visitor-theme") as "light" | "dark" | "system" | null;
    if (savedTheme) {
      setProfile(prev => ({ ...prev, theme: savedTheme }));
    } else {
      // If no saved theme, default to light but DO NOT apply (layout already did)
      setProfile(prev => ({ ...prev, theme: "light" }));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchProfile = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData || userData === "undefined") {
          router.push("/auth/login/visitor");
          return;
        }

        const user = JSON.parse(userData);
        
        // Fetch profile photo
        const photoResponse = await fetch('/api/user/visitorpfp');
        let profilePhoto = null;
        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          profilePhoto = photoData.visitorpfp;
        }
        
        // Fetch notification preferences
        let notifications = {
          email: true,
          push: true,
          marketing: false,
          bookingUpdates: true,
          reminders: true,
        };
        
        try {
          const prefsResponse = await fetch('/api/user/notification-preferences');
          if (prefsResponse.ok) {
            const prefsData = await prefsResponse.json();
            notifications = {
              email: prefsData.email ?? true,
              push: prefsData.push ?? true,
              marketing: prefsData.marketing ?? false,
              bookingUpdates: prefsData.bookingUpdates ?? true,
              reminders: prefsData.reminders ?? true,
            };
          }
        } catch (e) {
          console.error("Error fetching notification preferences:", e);
        }
        
        // Fetch 2FA status
        let twoFactorEnabled = false;
        try {
          const twofaRes = await fetch('/api/user/2fa/status');
          if (twofaRes.ok) {
            const twofaData = await twofaRes.json();
            twoFactorEnabled = twofaData.enabled;
          }
        } catch (e) {
          console.error("Error fetching 2FA status:", e);
        }
        
        setProfile(prev => ({
          ...prev,
          id: user.id || 1,
          name: user.name || "John Visitor",
          email: user.email || "visitor@example.com",
          phone: user.phone || "+254712345678",
          location: "Nairobi, Kenya",
          // theme: keep existing value (already set from localStorage on mount)
          profilePhoto: profilePhoto,
          twoFactorEnabled: twoFactorEnabled,
          notifications: notifications,
        }));
        
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
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

  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      // Save profile info to localStorage
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        user.name = profile.name;
        user.email = profile.email;
        user.phone = profile.phone;
        user.profilePhoto = profile.profilePhoto;
        localStorage.setItem("userData", JSON.stringify(user));
      }
      
      // Save notification preferences
      await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.notifications.email,
          push: profile.notifications.push,
          bookingUpdates: profile.notifications.bookingUpdates,
          reminders: profile.notifications.reminders,
          marketing: profile.notifications.marketing,
        })
      });
      
      // Save 2FA preference
      await fetch('/api/user/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: profile.twoFactorEnabled })
      });
      
      // Note: Theme is NOT saved here – it's already saved when dropdown changes.
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setProfile(prev => ({ ...prev, theme }));
    saveAndApplyTheme(theme);
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
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      });
      
      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        alert("Password changed successfully!");
      } else {
        const data = await response.json();
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setShowDeleteModal(false);
        alert("Account deleted. We're sad to see you go!");
        localStorage.clear();
        router.push("/auth");
      } else {
        alert("Failed to delete account");
      }
    } catch (error) {
      alert("Failed to delete account");
    } finally {
      setSaving(false);
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                  <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">{profile.name?.charAt(0).toUpperCase() || "V"}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-lg" title="Upload photo">
                  <Camera className="h-4 w-4" />
                </button>
                {profile.profilePhoto && (
                  <button onClick={handleDeleteProfilePhoto} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg" title="Remove photo">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleProfilePhotoUpload} className="hidden" />
            </div>
            <p className="text-xs text-emerald-500 text-center">Click the camera icon to upload a profile photo (max 5MB)</p>
            {uploadingPhoto && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
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
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input type="text" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">Theme</label>
                <div className="relative">
                  {profile.theme === "light" ? <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" /> : <Moon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />}
                  <select value={profile.theme} onChange={(e) => handleThemeChange(e.target.value as any)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Notification Preferences</h2>
            <p className="text-sm text-emerald-500">Choose how you want to be notified</p>
          </div>
          <div className="p-5 space-y-4">
            <NotificationToggle icon={Bell} title="Email Notifications" description="Receive updates via email" checked={profile.notifications.email} onChange={() => toggleNotification("email")} />
            <NotificationToggle icon={Bell} title="Push Notifications" description="Browser notifications" checked={profile.notifications.push} onChange={() => toggleNotification("push")} />
            <NotificationToggle icon={Bell} title="Booking Updates" description="Status changes for your bookings" checked={profile.notifications.bookingUpdates} onChange={() => toggleNotification("bookingUpdates")} />
            <NotificationToggle icon={Bell} title="Reminders" description="Upcoming farm visits" checked={profile.notifications.reminders} onChange={() => toggleNotification("reminders")} />
            <NotificationToggle icon={Mail} title="Marketing Emails" description="Special offers and promotions" checked={profile.notifications.marketing} onChange={() => toggleNotification("marketing")} />
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg font-heading font-semibold text-emerald-900">Security</h2>
            <p className="text-sm text-emerald-500">Manage your password and two‑factor authentication</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg"><Shield className="h-5 w-5 text-emerald-500" /></div>
                <div><p className="font-medium text-emerald-900">Two-Factor Authentication</p><p className="text-sm text-emerald-500">Get a verification code via email when you log in</p></div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={profile.twoFactorEnabled} onChange={(e) => setProfile({...profile, twoFactorEnabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition">
              <div className="flex items-center gap-3"><Lock className="h-5 w-5 text-emerald-500" /><div className="text-left"><p className="font-medium text-emerald-900">Change Password</p><p className="text-sm text-emerald-500">Update your password</p></div></div>
              <ChevronLeft className="h-5 w-5 text-emerald-400 rotate-180" />
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between p-4 border border-red-100 rounded-xl hover:bg-red-50 transition">
              <div className="flex items-center gap-3"><Trash2 className="h-5 w-5 text-red-500" /><div className="text-left"><p className="font-medium text-red-600">Delete Account</p><p className="text-sm text-red-400">Permanently delete your account</p></div></div>
              <ChevronLeft className="h-5 w-5 text-red-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* Save button (does NOT save theme) */}
        <div className="flex justify-end">
          <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50">
            {saving ? "Saving..." : <><Save className="h-5 w-5" /> Save Profile & Notifications</>}
          </button>
        </div>
      </div>

      {/* Modals unchanged – they remain as before */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-emerald-100"><h3 className="text-lg font-heading font-semibold text-emerald-900">Change Password</h3></div>
            <div className="p-5 space-y-4">
              {passwordError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /><p className="text-sm text-red-600">{passwordError}</p></div>}
              <div><label className="block text-sm font-medium text-emerald-800 mb-1">Current Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" /><input type={showCurrentPassword ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" /><button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showCurrentPassword ? <EyeOff className="h-4 w-4 text-emerald-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}</button></div></div>
              <div><label className="block text-sm font-medium text-emerald-800 mb-1">New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" /><input type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNewPassword ? <EyeOff className="h-4 w-4 text-emerald-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}</button></div></div>
              <div><label className="block text-sm font-medium text-emerald-800 mb-1">Confirm New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" /><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900" /></div></div>
            </div>
            <div className="p-5 border-t border-emerald-100 flex gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50">Cancel</button>
              <button onClick={handleChangePassword} disabled={saving} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50">{saving ? "Changing..." : "Change Password"}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-red-100"><h3 className="text-lg font-heading font-semibold text-red-600">Delete Account</h3></div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 rounded-xl p-4"><p className="text-sm text-red-700 mb-2">⚠️ Warning: This action cannot be undone!</p><p className="text-xs text-red-600">Deleting your account will permanently remove all your data, including:</p><ul className="text-xs text-red-600 list-disc list-inside mt-2 space-y-1"><li>All your bookings and history</li><li>Saved favorite farms</li><li>Reviews you've written</li><li>Payment information</li></ul></div>
              <p className="text-sm text-emerald-600">Type <strong className="text-red-600">DELETE</strong> to confirm</p>
              <input type="text" placeholder="Type DELETE" className="w-full px-4 py-2 border border-red-200 rounded-xl focus:outline-none focus:border-red-400 text-gray-900" />
            </div>
            <div className="p-5 border-t border-emerald-100 flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={saving} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50">{saving ? "Deleting..." : "Delete Account"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationToggle({ icon: Icon, title, description, checked, onChange }: { icon: any; title: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3"><div className="p-2 bg-emerald-50 rounded-lg"><Icon className="h-5 w-5 text-emerald-500" /></div><div><p className="font-medium text-emerald-900">{title}</p><p className="text-sm text-emerald-500">{description}</p></div></div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  );
}
