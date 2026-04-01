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
  Tractor,
  MapPin,
  Calendar,
  Ruler,
  Upload,
  Camera,
  Store,
  Shield,
  Sparkles,
  Globe,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ACTIVITY_CATEGORIES } from "@/app/profile/farmerprofile/options";

export default function Farmereg() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    farmSize: "",
    yearEst: "",
    location: "",
    coordinates: "-1.2921, 36.8219",
    farmType: "",
    activities: [] as string[],
    customActivities: [] as string[],
    newActivityInput: "",
    newActivityCategory: "",
    accommodation: false,
    maxGuests: "",
    facilities: [] as string[],
    photos: [] as File[],
    videoLink: "",
    documents: {
      businessLicense: null as File | null,
      nationalId: null as File | null,
      insurance: null as File | null,
      certifications: null as File | null,
    },
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    farmSize: "",
    location: "",
  });

  const farmTypes = [
    { id: "vegetables", label: "Vegetables", icon: "🥬" },
    { id: "dairy", label: "Dairy", icon: "🐄" },
    { id: "livestock", label: "Livestock", icon: "🐑" },
    { id: "mixed", label: "Mixed Farming", icon: "🌽" },
    { id: "orchard", label: "Orchard", icon: "🍎" },
    { id: "vineyard", label: "Vineyard", icon: "🍇" },
  ];

  const facilityOptions = [
    { id: "parking", label: "Parking", icon: "🅿️" },
    { id: "restrooms", label: "Restrooms", icon: "🚻" },
    { id: "restaurant", label: "Restaurant", icon: "🍽️" },
    { id: "wifi", label: "WiFi", icon: "📶" },
    { id: "picnic", label: "Picnic Area", icon: "🧺" },
    { id: "camping", label: "Camping Site", icon: "⛺" },
    { id: "playground", label: "Playground", icon: "🎪" },
    { id: "shop", label: "Farm Shop", icon: "🛒" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileUpload = (field: string, file: File) => {
    if (field.startsWith("documents.")) {
      const docField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docField]: file,
        },
      }));
    } else if (field === "photos") {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, file],
      }));
    }
  };

  const handleAddCustomActivity = () => {
    if (formData.newActivityInput.trim() && formData.newActivityCategory) {
      const activityWithCategory = `${formData.newActivityInput.trim()} (${formData.newActivityCategory})`;
      if (
        !formData.activities.includes(activityWithCategory) &&
        !formData.customActivities.includes(activityWithCategory)
      ) {
        setFormData({
          ...formData,
          customActivities: [...formData.customActivities, activityWithCategory],
          newActivityInput: "",
          newActivityCategory: "",
        });
      }
    }
  };

  const removeCustomActivity = (activity: string) => {
    setFormData({
      ...formData,
      customActivities: formData.customActivities.filter((a) => a !== activity),
    });
  };

  const validateStep = () => {
    const newErrors = { ...errors };

    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8)
        newErrors.password = "Minimum 8 characters";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 2) {
      if (!formData.farmName) newErrors.farmName = "Farm name is required";
      if (!formData.farmSize) newErrors.farmSize = "Farm size is required";
      if (!formData.location) newErrors.location = "Location is required";
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
      const allActivities = [...formData.activities, ...formData.customActivities];
      console.log("Farmer registration:", { ...formData, allActivities });
      router.push("/auth/register/farmer");
    }
  };

  const allSelectedActivities = [...formData.activities, ...formData.customActivities];

  // Step titles for better readability
  const stepTitles = [
    { number: 1, title: "Account Setup", description: "Create your login credentials" },
    { number: 2, title: "Farm Details", description: "Tell us about your farm" },
    { number: 3, title: "Activities & Facilities", description: "What visitors can enjoy" },
    { number: 4, title: "Media & Verification", description: "Showcase your farm" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AuthCard
          title="Register Your Farm"
          subtitle="Join Kenya's fastest growing agricultural tourism platform"
          icon={<Tractor className="w-10 h-10 text-accent" />}
          role="farmer"
        >
          {/* Progress Steps - Simplified */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step >= s
                        ? "bg-accent text-emerald-900"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {step > s ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-base font-medium">{s}</span>
                    )}
                  </div>
                  {s < 4 && (
                    <div className="flex-1 h-0.5 mx-3 bg-white/10">
                      <div
                        className={`h-full bg-accent transition-all duration-500 ${
                          step > s ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-1">
              {stepTitles.map((s) => (
                <div key={s.number} className="text-center flex-1">
                  <p className={`text-sm font-medium ${step >= s.number ? "text-white" : "text-white/40"}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5 hidden md:block">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Account Setup */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="John Mwangi"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="+254 712 345 678"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                        placeholder="farmer@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {(errors.password || errors.confirmPassword) && (
                    <p className="text-sm text-red-400">{errors.password || errors.confirmPassword}</p>
                  )}
                </motion.div>
              )}

              {/* Step 2: Farm Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">
                      Farm Name
                    </label>
                    <input
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="Green Acres Farm"
                    />
                    {errors.farmName && <p className="text-sm text-red-400">{errors.farmName}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">
                        Farm Size (acres)
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          name="farmSize"
                          type="number"
                          value={formData.farmSize}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">
                        Year Established
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          name="yearEst"
                          type="number"
                          value={formData.yearEst}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="2010"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">
                      Farm Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                        placeholder="Kiambu, Kenya"
                      />
                    </div>
                    {errors.location && <p className="text-sm text-red-400">{errors.location}</p>}
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/80 font-medium">📍 Farm Location Map</span>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm rounded-xl hover:bg-accent/90 transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        Use Current Location
                      </button>
                    </div>
                    <div className="h-48 bg-emerald-900/30 rounded-xl flex items-center justify-center border border-white/10">
                      <p className="text-white/40">Map preview will appear here</p>
                    </div>
                    <p className="text-xs text-white/30 mt-2">Coordinates: {formData.coordinates}</p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Activities & Facilities - Cleaner Design */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Farm Type */}
                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">
                      Farm Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {farmTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, farmType: type.id })}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            formData.farmType === type.id
                              ? "bg-accent/20 border-accent"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div className="text-3xl mb-1">{type.icon}</div>
                          <div className="text-sm text-white/80">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities Section */}
                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">
                      Activities Offered
                    </label>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
                        <div key={category} className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-accent font-medium text-sm mb-3">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {activities.map((activity) => (
                              <label key={activity} className="flex items-center gap-2 text-white/80 text-sm">
                                <input
                                  type="checkbox"
                                  checked={formData.activities.includes(activity)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({ ...formData, activities: [...formData.activities, activity] });
                                    } else {
                                      setFormData({ ...formData, activities: formData.activities.filter((a) => a !== activity) });
                                    }
                                  }}
                                  className="w-4 h-4 accent-accent"
                                />
                                <span>{activity}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Custom Activity Input */}
                    <div className="mt-4 bg-white/5 rounded-xl p-4">
                      <p className="text-white/60 text-sm mb-3">Don't see your activity? Add a custom one:</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={formData.newActivityInput}
                          onChange={(e) => setFormData({ ...formData, newActivityInput: e.target.value })}
                          placeholder="Activity name"
                          className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent"
                        />
                        <select
                          value={formData.newActivityCategory}
                          onChange={(e) => setFormData({ ...formData, newActivityCategory: e.target.value })}
                          className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                        >
                          <option value="">Select category</option>
                          {Object.keys(ACTIVITY_CATEGORIES).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomActivity}
                        disabled={!formData.newActivityInput.trim() || !formData.newActivityCategory}
                        className="w-full py-2.5 bg-accent/80 hover:bg-accent text-white rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Custom Activity
                      </button>
                    </div>

                    {/* Selected Activities Tags */}
                    {allSelectedActivities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white/60 text-sm mb-2">Selected Activities:</p>
                        <div className="flex flex-wrap gap-2">
                          {allSelectedActivities.map((activity) => (
                            <span
                              key={activity}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/20 text-accent text-sm rounded-full"
                            >
                              {activity}
                              <button
                                type="button"
                                onClick={() => {
                                  if (formData.activities.includes(activity)) {
                                    setFormData({
                                      ...formData,
                                      activities: formData.activities.filter((a) => a !== activity),
                                    });
                                  } else {
                                    removeCustomActivity(activity);
                                  }
                                }}
                                className="hover:text-accent/80"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Facilities */}
                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">
                      Facilities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {facilityOptions.map((facility) => (
                        <label
                          key={facility.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            formData.facilities.includes(facility.id)
                              ? "bg-accent/20 border-accent"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.facilities.includes(facility.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, facilities: [...formData.facilities, facility.id] });
                              } else {
                                setFormData({ ...formData, facilities: formData.facilities.filter((f) => f !== facility.id) });
                              }
                            }}
                            className="w-4 h-4 accent-accent"
                          />
                          <span className="text-2xl">{facility.icon}</span>
                          <span className="text-sm text-white/80">{facility.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/80 font-medium text-base mb-2">
                        Accommodation
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={formData.accommodation === true}
                            onChange={() => setFormData({ ...formData, accommodation: true })}
                            className="w-4 h-4 accent-accent"
                          />
                          <span className="text-white/80">Yes</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={formData.accommodation === false}
                            onChange={() => setFormData({ ...formData, accommodation: false })}
                            className="w-4 h-4 accent-accent"
                          />
                          <span className="text-white/80">No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 font-medium text-base mb-2">
                        Max Guests
                      </label>
                      <input
                        name="maxGuests"
                        type="number"
                        value={formData.maxGuests}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Media & Verification */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">
                      Farm Photos
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <label
                          key={i}
                          className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <input type="file" accept="image/*" className="hidden" />
                          <Camera className="h-6 w-6 text-white/40 mb-1" />
                          <span className="text-xs text-white/40">Upload</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-white/30 mt-2">Upload up to 10 photos of your farm</p>
                  </div>

                  <div>
                    <label className="block text-white/80 font-medium text-base mb-2">
                      Video Link (YouTube/Vimeo)
                    </label>
                    <input
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">
                      Verification Documents
                    </label>
                    <div className="space-y-3">
                      {[
                        { key: "businessLicense", label: "Business License", icon: "📄" },
                        { key: "nationalId", label: "National ID / Passport", icon: "🆔" },
                        { key: "insurance", label: "Insurance Certificate", icon: "📋" },
                        { key: "certifications", label: "Certifications", icon: "🏅" },
                      ].map((doc) => (
                        <div key={doc.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{doc.icon}</span>
                            <span className="text-white/80">{doc.label}</span>
                          </div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(`documents.${doc.key}`, e.target.files[0]);
                                }
                              }}
                            />
                            <div className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors">
                              <Upload className="h-4 w-4" />
                              Upload
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </motion.button>
              )}

              {step < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-all"
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-all"
                >
                  Submit for Review
                  <Shield className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}