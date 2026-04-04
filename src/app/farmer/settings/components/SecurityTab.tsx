// src/app/farmer/settings/components/SecurityTab.tsx
"use client";

import { useState } from "react";
import { Shield, Smartphone, Download, Trash2, AlertTriangle, Save } from "lucide-react";

interface SecurityTabProps {
  twoFactorEnabled: boolean;
  onSave: (data: any) => void;
  saving: boolean;
}

export default function SecurityTab({ twoFactorEnabled, onSave, saving }: SecurityTabProps) {
  const [twoFactor, setTwoFactor] = useState(twoFactorEnabled);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleTwoFactorToggle = () => {
    onSave({ two_factor: !twoFactor });
    setTwoFactor(!twoFactor);
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/farmer/data/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    
    try {
      const response = await fetch('/api/farmer/account/delete', { method: 'DELETE' });
      if (response.ok) {
        localStorage.clear();
        window.location.href = "/auth";
      } else {
        alert("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Security Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Protect your account and manage your data</p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-emerald-900">Two-Factor Authentication</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Add an extra layer of security to your account</p>
            <p className="text-xs text-gray-400 mt-1">Requires a verification code from your phone when logging in</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={handleTwoFactorToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>
      </div>

      {/* Data Export */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-accent" />
          <h3 className="font-medium text-emerald-900">Data Export</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Download all your farm data</p>
            <p className="text-xs text-gray-400 mt-1">Get a copy of your farm profile, bookings, and activities</p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h3 className="font-medium text-red-700">Delete Account</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-700">Permanently delete your account and all data</p>
            <p className="text-xs text-red-500 mt-1">This action cannot be undone. All your farm data will be lost.</p>
          </div>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Important Security Note</p>
            <p className="text-xs text-amber-700 mt-1">
              Keep your password secure and never share it with anyone. HarvestHost will never ask for your password via email or phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}