// src/app/farmer/settings/components/ProfileSettingsTab.tsx
"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Save } from "lucide-react";

interface ProfileSettingsTabProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  onSave: (data: any) => void;
  saving: boolean;
}

export default function ProfileSettingsTab({ user, onSave, saving }: ProfileSettingsTabProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

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
    onSave(passwordData);
    setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    setShowPasswordForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Profile Information</h2>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
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
                value={user.email}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
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
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Change Password</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
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