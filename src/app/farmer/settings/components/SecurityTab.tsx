// src/app/farmer/settings/components/SecurityTab.tsx
"use client";

import { useState } from "react";
import { Smartphone, Download, Trash2, AlertTriangle, Loader2, Mail } from "lucide-react";

interface SecurityTabProps {
  twoFactorEnabled: boolean;
  userEmail?: string;
  onSave: (data: any) => void;
  saving: boolean;
}

export default function SecurityTab({ twoFactorEnabled, userEmail, onSave, saving }: SecurityTabProps) {
  const [twoFactor, setTwoFactor] = useState(twoFactorEnabled);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTwoFactorToggle = async () => {
    if (!twoFactor) {
      // Enable 2FA
      if (!confirm(`Enable two-factor authentication? You'll receive a verification code via email at ${userEmail} when logging in.`)) {
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch('/api/auth/2fa/enable', {
          method: 'POST',
        });
        
        if (response.ok) {
          setTwoFactor(true);
          onSave({ two_factor_enabled: true });
          alert(`2FA enabled! You'll receive a code via email at ${userEmail} when logging in.`);
        } else {
          const data = await response.json();
          alert(data.error || "Failed to enable 2FA");
        }
      } catch (error) {
        alert("Failed to enable 2FA");
      } finally {
        setLoading(false);
      }
    } else {
      // Disable 2FA
      if (confirm("Are you sure you want to disable two-factor authentication?")) {
        setLoading(true);
        try {
          const response = await fetch('/api/auth/2fa/disable', {
            method: 'POST',
          });
          if (response.ok) {
            setTwoFactor(false);
            onSave({ two_factor_enabled: false });
            alert("2FA disabled successfully");
          } else {
            alert("Failed to disable 2FA");
          }
        } catch (error) {
          alert("Failed to disable 2FA");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/farmer/data/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `farm-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert("Data exported successfully!");
    } catch (error) {
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete account? This cannot be undone.")) return;
    try {
      const response = await fetch('/api/farmer/account/delete', { method: 'DELETE' });
      if (response.ok) {
        localStorage.clear();
        window.location.href = "/auth";
      }
    } catch (error) {
      alert("Failed to delete account");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Security Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Protect your account</p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-emerald-600" />
          <h3 className="font-medium text-emerald-900">Two-Factor Authentication</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Receive verification code via email when logging in</p>
            <p className="text-xs text-gray-400 mt-1">
              {twoFactor 
                ? `✅ Enabled - codes sent to ${userEmail}` 
                : "Add an extra layer of security to your account"}
            </p>
          </div>
          <button
            onClick={handleTwoFactorToggle}
            disabled={loading || saving}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              twoFactor
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            } disabled:opacity-50`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : twoFactor ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </div>

      {/* Data Export */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-emerald-600" />
          <h3 className="font-medium text-emerald-900">Data Export</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Download all your farm data</p>
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-2"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Export Data"}
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
            <p className="text-red-700">Permanently delete your account</p>
          </div>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Delete Account
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Warning Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-800">Keep your password secure. HarvestHost never asks for it via email or phone.</p>
        </div>
      </div>
    </div>
  );
}