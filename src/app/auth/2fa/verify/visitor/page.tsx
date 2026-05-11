"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VisitorTwoFAVerification() {
  const router = useRouter();
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("pending2FAUserId");
    const storedEmail = localStorage.getItem("pending2FAEmail");
    if (storedUserId) setUserId(parseInt(storedUserId, 10));
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }
    if (!userId) {
      setError("Session expired. Please login again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid code');
      if (data.success && data.user) {
        localStorage.removeItem("pending2FAUserId");
        localStorage.removeItem("pending2FAEmail");
        localStorage.setItem("userRole", "visitor");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(data.user));
        router.push("/visitor/dashboard");
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      console.error("2FA error:", err);
      setError(err.message || "Invalid verification code");
      setLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem("pending2FAUserId");
    localStorage.removeItem("pending2FAEmail");
    router.push("/auth/login/visitor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Two-Factor Authentication"
          subtitle="Enter the verification code sent to your email"
          icon={<Shield className="w-8 h-8 text-accent" />}
          role="visitor"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
            {email && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-white/60">Code sent to:</p>
                <p className="text-sm text-white font-mono mt-1">{email}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Verification Code
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-accent"
                autoFocus
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Verifying...</>
              ) : (
                <>Verify & Login <ArrowRight className="h-5 w-5" /></>
              )}
            </motion.button>
            <button type="button" onClick={handleBack} className="w-full text-center text-sm text-white/40 hover:text-white/60">
              ← Back to login
            </button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
