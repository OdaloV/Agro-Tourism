"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard
            title="Check Your Email"
            subtitle="We've sent you a password reset link"
            icon={<CheckCircle className="w-8 h-8 text-accent" />}
          >
            <div className="space-y-5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-400">
                  We've sent a password reset link to:
                </p>
                <p className="text-white font-medium mt-2">{email}</p>
              </div>
              <p className="text-sm text-white/40 text-center">
                The link will expire in 1 hour. If you don't receive it, check your spam folder.
              </p>
              <Link
                href="/auth/login/farmer"
                className="block w-full text-center py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium"
              >
                Return to Login
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
          title="Forgot Password?"
          subtitle="Enter your email to reset your password"
          icon={<Mail className="w-8 h-8 text-accent" />}
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="farmer@example.com"
                />
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
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
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