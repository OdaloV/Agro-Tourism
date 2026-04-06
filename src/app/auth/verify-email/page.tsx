//src/app/auth/verify-email/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "expired" | "error"
  >("pending");
  const [error, setError] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from localStorage or userData
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    const userData = localStorage.getItem("userData");
    
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (userData) {
      try {
        const user = JSON.parse(userData);
        setEmail(user.email || "");
      } catch (e) {
        setEmail("");
      }
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

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedCode = pastedData.slice(0, 6).split("");
    
    const newCode = [...code];
    for (let i = 0; i < pastedCode.length && i < 6; i++) {
      if (/^\d$/.test(pastedCode[i])) {
        newCode[i] = pastedCode[i];
      }
    }
    setCode(newCode);
    
    // Focus the next empty input or last one
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setVerificationStatus("verified");
      
      // Update user data in localStorage
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        user.emailVerified = true;
        localStorage.setItem("userData", JSON.stringify(user));
      }
      
      // Clear pending email
      localStorage.removeItem("pendingVerificationEmail");

      // ✅ Redirect to login page after 2 seconds (not dashboard)
      setTimeout(() => {
        router.push("/auth/login/visitor");
      }, 2000);
      
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid or expired verification code");
      setVerificationStatus("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      setVerificationStatus("pending");
      setCode(["", "", "", "", "", ""]);
      
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
      
      // Show success message
      alert("Verification code resent! Check your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  // Success state - redirects to login
  if (verificationStatus === "verified") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard
            title="Email Verified!"
            subtitle="Your account has been successfully verified"
            icon={<CheckCircle className="w-8 h-8 text-green-500" />}
            role="visitor"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-white/80">
                Thank you for verifying your email. Redirecting you to the login page...
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
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Verify Your Email"
          subtitle="Enter the 6-digit code sent to your email"
          icon={<Mail className="w-8 h-8 text-accent" />}
          role="visitor"
        >
          <div className="space-y-6">
            {/* Email Display */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/70 text-center">
                Verification email sent to
              </p>
              <p className="text-white font-medium text-center mt-1">
                {email}
              </p>
            </div>

            {/* Error Message */}
            {(error || verificationStatus === "error") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2"
              >
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">{error || "Verification failed. Please try again."}</p>
              </motion.div>
            )}

            {/* Verification Code Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={code[i]}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40 text-center">
                Enter the 6-digit code we sent to your email
              </p>
            </div>

            {/* Verify Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all font-medium disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
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
                      Resend Verification Code
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
                Check your spam folder if you don't see the email in your inbox.
                The verification code expires in 15 minutes.
              </p>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/auth/login/visitor"
                className="text-sm text-white/40 hover:text-white/60"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}