"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function Visitor2FAVerify() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("pending2FAUserId");
    const storedEmail = localStorage.getItem("pending2FAEmail");
    
    if (!storedUserId || !storedEmail) {
      setError("Session expired. Please login again.");
      setTimeout(() => router.push("/auth/login/visitor"), 2000);
      return;
    }
    
    setUserId(storedUserId);
    setEmail(storedEmail);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Please enter a 6‑digit verification code");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }
      
      // Clear temporary storage
      localStorage.removeItem("pending2FAUserId");
      localStorage.removeItem("pending2FAEmail");
      
      // Store user data and role
      localStorage.setItem("userRole", "visitor");
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userData", JSON.stringify(data.user));
      
      router.push("/visitor/dashboard");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", role: "visitor", resend2FA: true }),
      });
      if (response.ok) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) clearInterval(timer);
            return prev - 1;
          });
        }, 1000);
        alert("A new verification code has been sent to your email.");
      } else {
        throw new Error("Failed to resend code");
      }
    } catch (err) {
      setError("Could not resend code. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleVerify} className="space-y-5">
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

            <div className="text-center text-sm text-white/60 mb-2">
              We sent a 6‑digit code to <strong>{email}</strong>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="000000"
                autoFocus
              />
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
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Sign In
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </motion.button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className={`text-sm ${countdown > 0 ? "text-white/40" : "text-accent hover:underline"}`}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link
                href="/auth/login/visitor"
                className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
