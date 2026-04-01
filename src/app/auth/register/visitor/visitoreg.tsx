"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Globe,
  Bell,
  CreditCard,
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function Visitoreg() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferences: [] as string[],
    newsletter: true,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const preferences = [
    { id: "farm-tours", label: "Farm Tours", icon: "🚜" },
    { id: "u-pick", label: "U-Pick Activities", icon: "🍎" },
    { id: "farm-stays", label: "Farm Stays", icon: "🏡" },
    { id: "workshops", label: "Workshops", icon: "🎨" },
    { id: "marketplace", label: "Marketplace", icon: "🛒" },
    { id: "events", label: "Events", icon: "🎉" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    const newErrors = { ...errors };

    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.phone) newErrors.phone = "Phone is required";
      else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone))
        newErrors.phone = "Phone is invalid";
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      console.log("Visitor registered:", formData);
      // Store email for verification page
      localStorage.setItem("pendingVerificationEmail", formData.email);
      router.push("/auth/verify-email");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AuthCard
          title="Join HarvestHost"
          subtitle="Discover authentic farm experiences across Kenya"
          icon={<Sparkles className="w-8 h-8 text-accent" />}
          role="visitor"
        >
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <motion.div
                    animate={{
                      scale: step === s ? 1.1 : 1,
                      backgroundColor: step >= s ? "#EAB308" : "#ffffff20",
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? "text-emerald-950" : "text-white/50"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </motion.div>
                  {s < 3 && (
                    <div className="flex-1 h-1 mx-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: step > s ? "100%" : "0%" }}
                        className="h-full bg-accent"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between px-1 text-xs text-white/40">
              <span>Personal Info</span>
              <span>Security</span>
              <span>Preferences</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                        <input
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                          placeholder="John Mwangi"
                        />
                      </div>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.name}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                          placeholder="+254 712 345 678"
                        />
                      </div>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium mb-1">
                          Join our farming community
                        </h4>
                        <p className="text-sm text-white/50">
                          Get access to exclusive farm experiences and fresh
                          produce directly from local farmers.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Security */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
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
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </motion.p>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        "8+ characters",
                        "Uppercase letter",
                        "Number",
                        "Special character",
                      ].map((req) => (
                        <div
                          key={req}
                          className="flex items-center gap-1 text-xs text-white/40"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              formData.password.length >= 8
                                ? "bg-green-400"
                                : "bg-white/20"
                            }`}
                          />
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      What interests you? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {preferences.map((pref) => (
                        <motion.label
                          key={pref.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative p-4 rounded-xl border cursor-pointer transition-all
                            ${
                              formData.preferences.includes(pref.id)
                                ? "bg-accent/20 border-accent"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            value={pref.id}
                            checked={formData.preferences.includes(pref.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  preferences: [
                                    ...formData.preferences,
                                    pref.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  preferences: formData.preferences.filter(
                                    (p) => p !== pref.id,
                                  ),
                                });
                              }
                            }}
                            className="absolute opacity-0"
                          />
                          <div className="text-2xl mb-2">{pref.icon}</div>
                          <div className="text-sm font-medium text-white">
                            {pref.label}
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
                      />
                      <div>
                        <span className="text-white font-medium">
                          Receive updates & offers
                        </span>
                        <p className="text-sm text-white/40">
                          Get notified about new farms, experiences, and
                          seasonal produce
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/40">
                    <div className="p-2">
                      <CreditCard className="h-5 w-5 mx-auto mb-1 text-accent" />
                      Secure Payments
                    </div>
                    <div className="p-2">
                      <Bell className="h-5 w-5 mx-auto mb-1 text-accent" />
                      Instant Updates
                    </div>
                    <div className="p-2">
                      <Sparkles className="h-5 w-5 mx-auto mb-1 text-accent" />
                      Best Experiences
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
                >
                  Back
                </motion.button>
              )}

              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                >
                  Create Account
                  <Sparkles className="h-5 w-5" />
                </motion.button>
              )}
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-white/40">
              Already have an account?{" "}
              <Link
                href="/auth/login/visitor"
                className="text-accent hover:text-accent/80 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
