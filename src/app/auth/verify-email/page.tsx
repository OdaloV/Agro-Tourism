"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "expired"
  >("pending");

  // Get email from URL params or localStorage
  const [email, setEmail] = useState("");

  useEffect(() => {
    // In a real app, get email from query params or context
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setEmail("visitor@example.com");
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset countdown
    setCountdown(60);
    setCanResend(false);
    setIsResending(false);

    // Start new countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = () => {
    // In a real app, this would verify the OTP code
    setVerificationStatus("verified");
    setTimeout(() => {
      router.push("/marketing");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Verify Your Email"
          subtitle="Check your inbox to complete registration"
          icon={<Mail className="w-8 h-8 text-accent" />}
          role="visitor"
        >
          {verificationStatus === "pending" && (
            <div className="space-y-6">
              {/* Info Message */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-white/70 text-center">
                  We've sent a verification email to
                </p>
                <p className="text-white font-medium text-center mt-1">
                  {email}
                </p>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/80">
                  Enter Verification Code
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-full aspect-square text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      onChange={(e) => {
                        const input = e.target;
                        if (input.value.length === 1 && input.nextSibling) {
                          (input.nextSibling as HTMLInputElement).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          (e.target as HTMLInputElement).value === ""
                        ) {
                          const prev = (e.target as HTMLInputElement)
                            .previousSibling;
                          if (prev) {
                            (prev as HTMLInputElement).focus();
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium"
              >
                Verify Email
                <CheckCircle className="h-5 w-5" />
              </motion.button>

              {/* Resend Section */}
              <div className="text-center">
                <p className="text-sm text-white/40 mb-2">
                  Didn't receive the email?
                </p>
                {canResend ? (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="flex items-center justify-center gap-2 text-accent hover:text-accent/80 text-sm font-medium mx-auto transition-colors disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-white/30">
                    Resend available in {countdown}s
                  </p>
                )}
              </div>

              {/* Help Text */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/40 text-center">
                  Check your spam folder if you don't see the email in your
                  inbox. The verification link expires in 24 hours.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === "verified" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white">
                Email Verified!
              </h3>
              <p className="text-white/60">
                Your account has been successfully verified. Redirecting you to
                the homepage...
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
            </div>
          )}

          {verificationStatus === "expired" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white">
                Link Expired
              </h3>
              <p className="text-white/60">
                Your verification link has expired. Request a new one below.
              </p>
              <button
                onClick={handleResendEmail}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium"
              >
                <RefreshCw className="h-5 w-5" />
                Send New Link
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login/visitor"
              className="text-sm text-white/40 hover:text-white/60"
            >
              ← Back to Login
            </Link>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
