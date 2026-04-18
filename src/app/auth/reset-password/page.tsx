"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          password: formData.password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login/farmer");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard
            title="Invalid Link"
            subtitle="The password reset link is invalid or has expired"
            icon={<AlertCircle className="w-8 h-8 text-red-400" />}
          >
            <div className="space-y-5">
              <Link
                href="/auth/forgot-password"
                className="block w-full text-center py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium"
              >
                Request New Link
              </Link>
              <Link
                href="/auth/login/farmer"
                className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/60 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </AuthCard>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard
            title="Password Reset Success!"
            subtitle="Your password has been changed"
            icon={<CheckCircle className="w-8 h-8 text-accent" />}
          >
            <div className="space-y-5">
              <p className="text-white/60 text-center">
                You can now login with your new password.
              </p>
              <Link
                href="/auth/login/farmer"
                className="block w-full text-center py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium"
              >
                Go to Login
              </Link>
            </div>
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Reset Password"
          subtitle="Enter your new password"
          icon={<Lock className="w-8 h-8 text-accent" />}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2"
              >
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>

            <Link
              href="/auth/login/farmer"
              className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/60 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}