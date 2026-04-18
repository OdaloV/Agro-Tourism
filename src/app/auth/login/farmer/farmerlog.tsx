"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Tractor, AlertCircle, Shield } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function FarmerLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password, 
          role: 'farmer' 
        })
      });
      
      const data = await response.json();
      
      // Check for 2FA FIRST
      if (data.requiresTwoFactor) {
        setShow2FA(true);
        setUserId(data.userId);
        setMessage(data.message || "Verification code sent to your email");
        setLoading(false);
        return;
      }
      
      // Then check for other errors
      if (!response.ok) {
        if (data.requiresVerification) {
          localStorage.setItem("pendingVerificationEmail", formData.email);
          router.push("/auth/verify-email");
          return;
        }
        
        if (data.requiresDocumentSubmission) {
          alert(data.error || "Please complete your farm verification by submitting documents.");
          router.push(data.redirectTo || "/farmer/verification");
          return;
        }
        
        throw new Error(data.error || 'Login failed');
      }
      
      // Successful login (no 2FA)
      if (data.user) {
        localStorage.setItem("userRole", "farmer");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("verificationStatus", data.user.verificationStatus || 'pending');
      }

      router.push("/farmer/dashboard");

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          code: twoFactorCode 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }
      
      if (data.success && data.user) {
        localStorage.setItem("userRole", "farmer");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(data.user));
        router.push("/farmer/dashboard");
      } else {
        throw new Error('Verification failed');
      }
      
    } catch (err: any) {
      console.error("2FA error:", err);
      setError(err.message || "Invalid verification code. Please try again.");
      setLoading(false);
    }
  };

  // Show 2FA form if required
  if (show2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard
            title="Two-Factor Authentication"
            subtitle="Enter the verification code sent to your email"
            icon={<Shield className="w-8 h-8 text-accent" />}
            role="farmer"
          >
            <div className="space-y-5">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"
                >
                  <p className="text-sm text-emerald-400 text-center">{message}</p>
                </motion.div>
              )}
              
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
                  Verification Code
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  autoFocus
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTwoFactorSubmit}
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              <button
                onClick={() => {
                  setShow2FA(false);
                  setTwoFactorCode("");
                  setError("");
                }}
                className="w-full text-center text-sm text-white/40 hover:text-white/60 transition"
              >
                ← Back to login
              </button>
            </div>
          </AuthCard>
        </div>
      </div>
    );
  }

  // Normal login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Farmer Login"
          subtitle="Manage your farm and bookings"
          icon={<Tractor className="w-8 h-8 text-accent" />}
          role="farmer"
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
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
                />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-accent hover:underline"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            New to HarvestHost?{" "}
            <Link
              href="/auth/register/farmer"
              className="text-accent hover:text-accent/80 font-medium hover:underline"
            >
              Register your farm
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}