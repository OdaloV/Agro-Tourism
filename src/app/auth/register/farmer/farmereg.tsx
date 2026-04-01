// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   User,
//   Mail,
//   Phone,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   CheckCircle,
//   AlertCircle,
//   Tractor,
//   MapPin,
//   Calendar,
//   Ruler,
//   Upload,
//   Camera,
//   Store,
//   Shield,
//   Sparkles,
//   Globe,
//   Plus,
//   X,
//   ChevronRight,
//   ChevronLeft,
//   LogIn,
// } from "lucide-react";
// import { AuthCard } from "@/components/auth/AuthCard";
// import { ACTIVITY_CATEGORIES } from "@/app/profile/farmerprofile/options";

// export default function Farmereg() {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [uploading, setUploading] = useState({
//     photo: false,
//     document: false
//   });
  
//   // 👇 ADD THIS REF to track if user has clicked submit
//   const hasClickedSubmit = useRef(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     farmName: "",
//     farmSize: "",
//     yearEst: "",
//     location: "",
//     farmDescription: "",
//     coordinates: "-1.2921, 36.8219",
//     farmType: "",
//     activities: [] as string[],
//     customActivities: [] as string[],
//     newActivityInput: "",
//     newActivityCategory: "",
//     accommodation: false,
//     maxGuests: "",
//     facilities: [] as string[],
//     photos: [] as File[],
//     videoLink: "",
//     documents: {
//       businessLicense: null as File | null,
//       nationalId: null as File | null,
//       insurance: null as File | null,
//       certifications: null as File | null,
//     },
//   });

//   const [errors, setErrors] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     farmName: "",
//     farmSize: "",
//     location: "",
//     farmDescription: "",
//     maxGuests: "",
//   });

//   // Step monitor useEffect
//   useEffect(() => {
//     console.log("STEP CHANGED TO:", step);
//     console.log("Current URL:", window.location.href);
    
//     if (step === 4) {
//       console.log("REACHED STEP 4 - monitoring for redirect");
      
//       const beforeUnloadHandler = () => {
//         console.log("PAGE IS ABOUT TO UNLOAD/NAVIGATE from step 4");
//       };
//       window.addEventListener('beforeunload', beforeUnloadHandler);
      
//       return () => {
//         window.removeEventListener('beforeunload', beforeUnloadHandler);
//       };
//     }
//   }, [step]);

//   // localStorage monitor useEffect
//   useEffect(() => {
//     console.log("=== REGISTRATION PAGE MOUNTED ===");
//     console.log("Current localStorage state:");
//     console.log("userRole:", localStorage.getItem("userRole"));
//     console.log("isAuthenticated:", localStorage.getItem("isAuthenticated"));
//     console.log("userData:", localStorage.getItem("userData"));
//     console.log("Current URL:", window.location.href);
    
//     const originalSetItem = localStorage.setItem;
//     localStorage.setItem = function(this: Storage, key: string, value: string): void {
//       console.log(`🔴 localStorage.setItem called: ${key} = ${value}`);
//       console.trace();
//       originalSetItem.call(this, key, value);
//     };
    
//     return () => {
//       localStorage.setItem = originalSetItem;
//     };
//   }, []);

//   // 👇 ADD THIS - reset the click ref when step changes away from 4
//   useEffect(() => {
//     if (step !== 4) {
//       hasClickedSubmit.current = false;
//     }
//   }, [step]);

//   const farmTypes = [
//     { id: "vegetables", label: "Vegetables", icon: "🥬" },
//     { id: "dairy", label: "Dairy", icon: "🐄" },
//     { id: "livestock", label: "Livestock", icon: "🐑" },
//     { id: "mixed", label: "Mixed Farming", icon: "🌽" },
//     { id: "orchard", label: "Orchard", icon: "🍎" },
//     { id: "vineyard", label: "Vineyard", icon: "🍇" },
//   ];

//   const facilityOptions = [
//     { id: "parking", label: "Parking", icon: "🅿️" },
//     { id: "restrooms", label: "Restrooms", icon: "🚻" },
//     { id: "restaurant", label: "Restaurant", icon: "🍽️" },
//     { id: "wifi", label: "WiFi", icon: "📶" },
//     { id: "picnic", label: "Picnic Area", icon: "🧺" },
//     { id: "camping", label: "Camping Site", icon: "⛺" },
//     { id: "playground", label: "Playground", icon: "🎪" },
//     { id: "shop", label: "Farm Shop", icon: "🛒" },
//   ];

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleFileUpload = async (field: string, file: File) => {
//     if (field === "photos") {
//       setUploading(prev => ({ ...prev, photo: true }));
//       await new Promise(resolve => setTimeout(resolve, 500));
//       setFormData(prev => ({
//         ...prev,
//         photos: [...prev.photos, file]
//       }));
//       setUploading(prev => ({ ...prev, photo: false }));
//     } else if (field.startsWith("documents.")) {
//       setUploading(prev => ({ ...prev, document: true }));
//       await new Promise(resolve => setTimeout(resolve, 500));
//       const docField = field.split(".")[1];
//       setFormData(prev => ({
//         ...prev,
//         documents: {
//           ...prev.documents,
//           [docField]: file
//         }
//       }));
//       setUploading(prev => ({ ...prev, document: false }));
//     }
//   };

//   const handleAddCustomActivity = () => {
//     if (formData.newActivityInput.trim() && formData.newActivityCategory) {
//       const activityWithCategory = `${formData.newActivityInput.trim()} (${formData.newActivityCategory})`;
//       if (
//         !formData.activities.includes(activityWithCategory) &&
//         !formData.customActivities.includes(activityWithCategory)
//       ) {
//         setFormData({
//           ...formData,
//           customActivities: [...formData.customActivities, activityWithCategory],
//           newActivityInput: "",
//           newActivityCategory: "",
//         });
//       }
//     }
//   };

//   const removeCustomActivity = (activity: string) => {
//     setFormData({
//       ...formData,
//       customActivities: formData.customActivities.filter((a) => a !== activity),
//     });
//   };

//   const validateStep = () => {
//     const newErrors = { ...errors };

//     if (step === 1) {
//       if (!formData.name) newErrors.name = "Name is required";
//       if (!formData.email) newErrors.email = "Email is required";
//       else if (!/\S+@\S+\.\S+/.test(formData.email))
//         newErrors.email = "Email is invalid";
//       if (!formData.phone) newErrors.phone = "Phone is required";
//       if (!formData.password) newErrors.password = "Password is required";
//       else if (formData.password.length < 8)
//         newErrors.password = "Minimum 8 characters";
//       if (formData.password !== formData.confirmPassword) {
//         newErrors.confirmPassword = "Passwords do not match";
//       }
//     }

//     if (step === 2) {
//       if (!formData.farmName) newErrors.farmName = "Farm name is required";
//       if (!formData.farmSize) newErrors.farmSize = "Farm size is required";
//       if (!formData.location) newErrors.location = "Location is required";
//       if (!formData.farmDescription) newErrors.farmDescription = "Farm description is required";
//     }

//     if (step === 3) {
//       if (formData.accommodation === true) {
//         if (!formData.maxGuests || formData.maxGuests.trim() === "") {
//           newErrors.maxGuests = "Please enter the maximum number of guests you can accommodate";
//         } else if (parseInt(formData.maxGuests) <= 0) {
//           newErrors.maxGuests = "Max guests must be greater than 0";
//         }
//       }
//     }

//     setErrors(newErrors);
//     return !Object.values(newErrors).some((error) => error !== "");
//   };

//   const handleNext = () => {
//     console.log("handleNext called, current step:", step);
//     const isValid = validateStep();
//     console.log("Validation result:", isValid);
    
//     if (isValid) {
//       setStep(step + 1);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   // 👇 UPDATED handleSubmit with the click ref check
//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   if (step !== 4) return;
//   if (!hasClickedSubmit.current) {
//     console.log("⚠️ Automatic form submission detected - ignoring.");
//     return;
//   }
  
//   if (submitting) return;
//   if (!validateStep()) return;
  
//   setSubmitting(true);
  
//   const allActivities = [...formData.activities, ...formData.customActivities];
  
//   const farmerData = {
//     farmName: formData.farmName,
//     location: formData.location,
//     farmSize: formData.farmSize,
//     yearEst: formData.yearEst,
//     farmDescription: formData.farmDescription,
//     farmType: formData.farmType,
//     accommodation: formData.accommodation,
//     maxGuests: formData.maxGuests,
//     allActivities: allActivities,
//     facilities: formData.facilities,
//   };
  
//   try {
//     console.log("Sending registration request...");
//     const response = await fetch('/api/auth/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         password: formData.password,
//         role: 'farmer',
//         farmerData: farmerData
//       }),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.error || 'Registration failed');
//     }
    
//     console.log("Registration successful:", data);
    
//     // The cookies are now set by the API, so we don't need localStorage
//     // Just redirect to verification page
//     router.push('/farmer/verification');
    
//   } catch (error: any) {
//     console.error('Registration error:', error);
//     setError(error.message);
//   } finally {
//     setSubmitting(false);
//     hasClickedSubmit.current = false;
//   }
// };

//   const allSelectedActivities = [...formData.activities, ...formData.customActivities];

//   const stepTitles = [
//     { number: 1, title: "Account Setup", description: "Create your login credentials" },
//     { number: 2, title: "Farm Details", description: "Tell us about your farm" },
//     { number: 3, title: "Activities & Facilities", description: "What visitors can enjoy" },
//     { number: 4, title: "Media & Verification", description: "Showcase your farm" },
//   ];

//   const isDocUploaded = (docKey: string) => {
//     return formData.documents[docKey as keyof typeof formData.documents] !== null;
//   };

//   // Prevent Enter key from submitting form on steps 1-3
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && step !== 4) {
//       e.preventDefault();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <AuthCard
//           title="Register Your Farm"
//           subtitle="Join Kenya's fastest growing agricultural tourism platform"
//           icon={<Tractor className="w-10 h-10 text-accent" />}
//           role="farmer"
//         >
//           {/* Progress Steps */}
//           <div className="mb-10">
//             <div className="flex items-center justify-between">
//               {[1, 2, 3, 4].map((s) => (
//                 <div key={s} className="flex items-center flex-1">
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
//                       step >= s
//                         ? "bg-accent text-emerald-900"
//                         : "bg-white/10 text-white/40"
//                     }`}
//                   >
//                     {step > s ? (
//                       <CheckCircle className="h-5 w-5" />
//                     ) : (
//                       <span className="text-base font-medium">{s}</span>
//                     )}
//                   </div>
//                   {s < 4 && (
//                     <div className="flex-1 h-0.5 mx-3 bg-white/10">
//                       <div
//                         className={`h-full bg-accent transition-all duration-500 ${
//                           step > s ? "w-full" : "w-0"
//                         }`}
//                       />
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-between mt-3 px-1">
//               {stepTitles.map((s) => (
//                 <div key={s.number} className="text-center flex-1">
//                   <p className={`text-sm font-medium ${step >= s.number ? "text-white" : "text-white/40"}`}>
//                     {s.title}
//                   </p>
//                   <p className="text-xs text-white/30 mt-0.5 hidden md:block">
//                     {s.description}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Debug: Show current step */}
//           <div className="text-center text-white/50 text-xs mb-2">
//             Step {step} of 4
//           </div>

//           <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
//             {error && (
//               <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
//                 <p className="text-red-400 text-sm text-center">{error}</p>
//               </div>
//             )}

//             <AnimatePresence mode="wait">
//               {step === 1 && (
//                 <motion.div
//                   key="step1"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-6"
//                 >
//                   <div className="grid md:grid-cols-2 gap-5">
//                     <div className="space-y-2">
//                       <label className="block text-white/80 font-medium text-base">Full Name</label>
//                       <div className="relative">
//                         <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                         <input name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="John Mwangi" />
//                       </div>
//                       {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
//                     </div>
//                     <div className="space-y-2">
//                       <label className="block text-white/80 font-medium text-base">Phone Number</label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                         <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="+254 712 345 678" />
//                       </div>
//                       {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-white/80 font-medium text-base">Email Address</label>
//                     <div className="relative">
//                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                       <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="farmer@example.com" />
//                     </div>
//                     {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
//                   </div>
//                   <div className="grid md:grid-cols-2 gap-5">
//                     <div className="space-y-2">
//                       <label className="block text-white/80 font-medium text-base">Password</label>
//                       <div className="relative">
//                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                         <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="••••••••" />
//                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
//                       </div>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="block text-white/80 font-medium text-base">Confirm Password</label>
//                       <div className="relative">
//                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                         <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="••••••••" />
//                         <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="relative my-6">
//                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
//                     <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-white/40">Already have an account?</span></div>
//                   </div>
//                   <Link href="/auth/login/farmer"><button type="button" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20"><LogIn className="h-5 w-5" /> Login to Existing Account</button></Link>
//                 </motion.div>
//               )}

//               {step === 2 && (
//                 <motion.div
//                   key="step2"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-5"
//                 >
//                   <div className="space-y-2">
//                     <label className="block text-white/80 font-medium text-base">Farm Name <span className="text-red-500">*</span></label>
//                     <input name="farmName" value={formData.farmName} onChange={handleChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="Green Acres Farm" />
//                     {errors.farmName && <p className="text-sm text-red-400">{errors.farmName}</p>}
//                   </div>
//                   <div className="grid md:grid-cols-2 gap-5">
//                     <div className="space-y-2">
//                       <label className="block text-white/80 font-medium text-base">Farm Size (acres) <span className="text-red-500">*</span></label>
//                       <div className="relative">
//                         <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                         <input name="farmSize" type="number" value={formData.farmSize} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="5" />
//                       </div>
//                       {errors.farmSize && <p className="text-sm text-red-400">{errors.farmSize}</p>}
//                     </div>
//                     <div className="space-y-2">
//                       <label className="block text-white/80 font-medium text-base">Year Established</label>
//                       <div className="relative">
//                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                         <input name="yearEst" type="number" value={formData.yearEst} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="2010" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-white/80 font-medium text-base">Farm Location <span className="text-red-500">*</span></label>
//                     <div className="relative">
//                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                       <input name="location" value={formData.location} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="Kiambu, Kenya" />
//                     </div>
//                     {errors.location && <p className="text-sm text-red-400">{errors.location}</p>}
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-white/80 font-medium text-base">Farm Description <span className="text-red-500">*</span></label>
//                     <textarea name="farmDescription" rows={4} value={formData.farmDescription} onChange={handleChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="Describe your farm, what makes it special..." />
//                     {errors.farmDescription && <p className="text-sm text-red-400">{errors.farmDescription}</p>}
//                   </div>
//                 </motion.div>
//               )}

//               {step === 3 && (
//                 <motion.div
//                   key="step3"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-6"
//                 >
//                   <div>
//                     <label className="block text-white/80 font-medium text-base mb-3">Farm Type</label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                       {farmTypes.map((type) => (
//                         <button key={type.id} type="button" onClick={() => setFormData({ ...formData, farmType: type.id })} className={`p-3 rounded-xl border text-center transition-all ${formData.farmType === type.id ? "bg-accent/20 border-accent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
//                           <div className="text-3xl mb-1">{type.icon}</div>
//                           <div className="text-sm text-white/80">{type.label}</div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-white/80 font-medium text-base mb-3">Activities Offered</label>
//                     <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
//                       {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
//                         <div key={category} className="bg-white/5 rounded-xl p-4">
//                           <h4 className="text-accent font-medium text-sm mb-3">{category}</h4>
//                           <div className="grid grid-cols-2 gap-2">
//                             {activities.map((activity) => (
//                               <label key={activity} className="flex items-center gap-2 text-white/80 text-sm">
//                                 <input type="checkbox" checked={formData.activities.includes(activity)} onChange={(e) => {
//                                   if (e.target.checked) setFormData({ ...formData, activities: [...formData.activities, activity] });
//                                   else setFormData({ ...formData, activities: formData.activities.filter((a) => a !== activity) });
//                                 }} className="w-4 h-4 accent-accent" />
//                                 <span>{activity}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="mt-4 bg-white/5 rounded-xl p-4">
//                       <p className="text-white/60 text-sm mb-3">Don't see your activity? Add a custom one:</p>
//                       <div className="grid grid-cols-2 gap-3 mb-3">
//                         <input type="text" value={formData.newActivityInput} onChange={(e) => setFormData({ ...formData, newActivityInput: e.target.value })} placeholder="Activity name" className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm" />
//                         <select value={formData.newActivityCategory} onChange={(e) => setFormData({ ...formData, newActivityCategory: e.target.value })} className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm">
//                           <option value="">Select category</option>
//                           {Object.keys(ACTIVITY_CATEGORIES).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
//                         </select>
//                       </div>
//                       <button type="button" onClick={handleAddCustomActivity} disabled={!formData.newActivityInput.trim() || !formData.newActivityCategory} className="w-full py-2.5 bg-accent/80 hover:bg-accent text-white rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add Custom Activity</button>
//                     </div>

//                     {allSelectedActivities.length > 0 && (
//                       <div className="mt-4">
//                         <p className="text-white/60 text-sm mb-2">Selected Activities:</p>
//                         <div className="flex flex-wrap gap-2">
//                           {allSelectedActivities.map((activity) => (
//                             <span key={activity} className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/20 text-accent text-sm rounded-full">
//                               {activity}
//                               <button type="button" onClick={() => {
//                                 if (formData.activities.includes(activity)) setFormData({ ...formData, activities: formData.activities.filter((a) => a !== activity) });
//                                 else removeCustomActivity(activity);
//                               }} className="hover:text-accent/80"><X className="h-3 w-3" /></button>
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-white/80 font-medium text-base mb-3">Facilities</label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                       {facilityOptions.map((facility) => (
//                         <label key={facility.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.facilities.includes(facility.id) ? "bg-accent/20 border-accent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
//                           <input type="checkbox" checked={formData.facilities.includes(facility.id)} onChange={(e) => {
//                             if (e.target.checked) setFormData({ ...formData, facilities: [...formData.facilities, facility.id] });
//                             else setFormData({ ...formData, facilities: formData.facilities.filter((f) => f !== facility.id) });
//                           }} className="w-4 h-4 accent-accent" />
//                           <span className="text-2xl">{facility.icon}</span>
//                           <span className="text-sm text-white/80">{facility.label}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-5">
//                     <div>
//                       <label className="block text-white/80 font-medium text-base mb-2">Accommodation</label>
//                       <div className="flex gap-4">
//                         <label className="flex items-center gap-2"><input type="radio" checked={formData.accommodation === true} onChange={() => setFormData({ ...formData, accommodation: true })} className="w-4 h-4 accent-accent" /><span className="text-white/80">Yes</span></label>
//                         <label className="flex items-center gap-2"><input type="radio" checked={formData.accommodation === false} onChange={() => setFormData({ ...formData, accommodation: false })} className="w-4 h-4 accent-accent" /><span className="text-white/80">No</span></label>
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-white/80 font-medium text-base mb-2">Max Guests {formData.accommodation && <span className="text-red-400 text-sm">*</span>}</label>
//                       <input name="maxGuests" type="number" value={formData.maxGuests} onChange={handleChange} className={`w-full px-4 py-2.5 bg-white/10 border ${errors.maxGuests ? 'border-red-400' : 'border-white/20'} rounded-xl text-white text-base`} placeholder={formData.accommodation ? "e.g., 20 (required)" : "Optional"} />
//                       {errors.maxGuests && <p className="mt-1 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.maxGuests}</p>}
//                       {formData.accommodation && !errors.maxGuests && formData.maxGuests && <p className="mt-1 text-xs text-green-400">✓ Can accommodate up to {formData.maxGuests} guests</p>}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
              

//               {step === 4 && (
//                 <motion.div
//                   key="step4"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-6"
//                 >
//                   <div>
//                     <label className="block text-white/80 font-medium text-base mb-3">Farm Photos</label>
//                     <div className="grid grid-cols-4 gap-3">
//                       {formData.photos.map((photo, index) => (
//                         <div key={index} className="aspect-square bg-accent/20 rounded-xl flex flex-col items-center justify-center">
//                           <CheckCircle className="h-6 w-6 text-green-400 mb-1" />
//                           <span className="text-xs text-white/60">Uploaded</span>
//                         </div>
//                       ))}
//                       {[...Array(Math.max(0, 4 - formData.photos.length))].map((_, i) => (
//                         <label key={i} className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10">
//                           <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload("photos", e.target.files[0]); }} />
//                           {uploading.photo ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Camera className="h-6 w-6 text-white/40 mb-1" /><span className="text-xs text-white/40">Upload</span></>}
//                         </label>
//                       ))}
//                     </div>
//                     <p className="text-xs text-white/30 mt-2">Upload up to 10 photos of your farm</p>
//                   </div>

//                   <div>
//                     <label className="block text-white/80 font-medium text-base mb-2">Video Link (YouTube/Vimeo)</label>
//                     <input name="videoLink" value={formData.videoLink} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-base" placeholder="https://youtube.com/watch?v=..." />
//                   </div>

//                   <div>
//                     <label className="block text-white/80 font-medium text-base mb-3">Verification Documents</label>
//                     <div className="space-y-3">
//                       {[
//                         { key: "businessLicense", label: "Business License", icon: "📄" },
//                         { key: "nationalId", label: "National ID / Passport", icon: "🆔" },
//                         { key: "insurance", label: "Insurance Certificate", icon: "📋" },
//                         { key: "certifications", label: "Certifications", icon: "🏅" },
//                       ].map((doc) => (
//                         <div key={doc.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
//                           <div className="flex items-center gap-3"><span className="text-2xl">{doc.icon}</span><span className="text-white/80">{doc.label}</span></div>
//                           {isDocUploaded(doc.key) ? (
//                             <div className="flex items-center gap-2 text-green-400"><CheckCircle className="h-4 w-4" /><span className="text-sm">Uploaded</span></div>
//                           ) : (
//                             <label className="cursor-pointer">
//                               <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(`documents.${doc.key}`, e.target.files[0]); }} />
//                               <div className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm">{uploading.document ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <><Upload className="h-4 w-4" /> Upload</>}</div>
//                             </label>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Navigation Buttons - UPDATED with onClick on submit button */}
//             <div className="flex gap-4 pt-6">
//               {step > 1 && (
//                 <button type="button" onClick={() => setStep(step - 1)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium">
//                   <ChevronLeft className="h-5 w-5" /> Back
//                 </button>
//               )}
//               {step < 4 ? (
//                 <button type="button" onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium">
//                   Continue <ChevronRight className="h-5 w-5" />
//                 </button>
//               ) : (
//                 <button 
//                   type="submit" 
//                   disabled={submitting} 
//                   onClick={() => {
//                     console.log("✅ User clicked Submit button");
//                     hasClickedSubmit.current = true;
//                   }}
//                   className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium disabled:opacity-50"
//                 >
//                   {submitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Submitting...</> : <>Submit for Review <Shield className="h-5 w-5" /></>}
//                 </button>
//               )}
//             </div>
//           </form>
//         </AuthCard>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
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
  LogIn,
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ACTIVITY_CATEGORIES } from "@/app/profile/farmerprofile/options";

export default function Farmereg() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const hasClickedSubmit = useRef(false);

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
    farmDescription: "",
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
    farmDescription: "",
    maxGuests: "",
  });

  // Step monitor useEffect
  useEffect(() => {
    console.log("STEP CHANGED TO:", step);
    console.log("Current URL:", window.location.href);
    
    if (step === 4) {
      console.log("REACHED STEP 4 - monitoring for redirect");
      
      const beforeUnloadHandler = () => {
        console.log("PAGE IS ABOUT TO UNLOAD/NAVIGATE from step 4");
      };
      window.addEventListener('beforeunload', beforeUnloadHandler);
      
      return () => {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
      };
    }
  }, [step]);

  // localStorage monitor useEffect
  useEffect(() => {
    console.log("=== REGISTRATION PAGE MOUNTED ===");
    console.log("Current localStorage state:");
    console.log("userRole:", localStorage.getItem("userRole"));
    console.log("isAuthenticated:", localStorage.getItem("isAuthenticated"));
    console.log("userData:", localStorage.getItem("userData"));
    console.log("Current URL:", window.location.href);
    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(this: Storage, key: string, value: string): void {
      console.log(`🔴 localStorage.setItem called: ${key} = ${value}`);
      console.trace();
      originalSetItem.call(this, key, value);
    };
    
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Reset the click ref when step changes away from 4
  useEffect(() => {
    if (step !== 4) {
      hasClickedSubmit.current = false;
    }
  }, [step]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileUpload = async (field: string, file: File) => {
    if (field === "photos") {
      setUploading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, file]
      }));
      setUploading(false);
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
      if (!formData.farmDescription) newErrors.farmDescription = "Farm description is required";
    }

    if (step === 3) {
      if (formData.accommodation === true) {
        if (!formData.maxGuests || formData.maxGuests.trim() === "") {
          newErrors.maxGuests = "Please enter the maximum number of guests you can accommodate";
        } else if (parseInt(formData.maxGuests) <= 0) {
          newErrors.maxGuests = "Max guests must be greater than 0";
        }
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleNext = () => {
    console.log("handleNext called, current step:", step);
    const isValid = validateStep();
    console.log("Validation result:", isValid);
    
    if (isValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step !== 4) return;
    if (!hasClickedSubmit.current) {
      console.log("⚠️ Automatic form submission detected - ignoring.");
      return;
    }
    
    if (submitting) return;
    if (!validateStep()) return;
    
    setSubmitting(true);
    
    const allActivities = [...formData.activities, ...formData.customActivities];
    
    const farmerData = {
      farmName: formData.farmName,
      location: formData.location,
      farmSize: formData.farmSize,
      yearEst: formData.yearEst,
      farmDescription: formData.farmDescription,
      farmType: formData.farmType,
      accommodation: formData.accommodation,
      maxGuests: formData.maxGuests,
      allActivities: allActivities,
      facilities: formData.facilities,
    };
    
    try {
      console.log("Sending registration request...");
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'farmer',
          farmerData: farmerData
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      console.log("Registration successful:", data);
      
      // Store user data in localStorage
      localStorage.setItem('userRole', 'farmer');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify({
        id: data.user.id,
        name: formData.name,
        email: formData.email,
        role: 'farmer',
        verificationStatus: 'pending',
        farmName: formData.farmName
      }));
      
      // Redirect to verification page for document upload
      router.push('/farmer/verification');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
      hasClickedSubmit.current = false;
    }
  };

  const allSelectedActivities = [...formData.activities, ...formData.customActivities];

  const stepTitles = [
    { number: 1, title: "Account Setup", description: "Create your login credentials" },
    { number: 2, title: "Farm Details", description: "Tell us about your farm" },
    { number: 3, title: "Activities & Facilities", description: "What visitors can enjoy" },
    { number: 4, title: "Farm Media", description: "Upload photos and video of your farm" },
  ];

  // Prevent Enter key from submitting form on steps 1-3
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step !== 4) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AuthCard
          title="Register Your Farm"
          subtitle="Join Kenya's fastest growing agricultural tourism platform"
          icon={<Tractor className="w-10 h-10 text-accent" />}
          role="farmer"
        >
          {/* Progress Steps */}
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

          {/* Debug: Show current step */}
          <div className="text-center text-white/50 text-xs mb-2">
            Step {step} of 4
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
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
                      <label className="block text-white/80 font-medium text-base">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="John Mwangi" />
                      </div>
                      {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="+254 712 345 678" />
                      </div>
                      {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="farmer@example.com" />
                    </div>
                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                      </div>
                    </div>
                  </div>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-white/40">Already have an account?</span></div>
                  </div>
                  <Link href="/auth/login/farmer"><button type="button" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20"><LogIn className="h-5 w-5" /> Login to Existing Account</button></Link>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">Farm Name <span className="text-red-500">*</span></label>
                    <input name="farmName" value={formData.farmName} onChange={handleChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="Green Acres Farm" />
                    {errors.farmName && <p className="text-sm text-red-400">{errors.farmName}</p>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">Farm Size (acres) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input name="farmSize" type="number" value={formData.farmSize} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="5" />
                      </div>
                      {errors.farmSize && <p className="text-sm text-red-400">{errors.farmSize}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-white/80 font-medium text-base">Year Established</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input name="yearEst" type="number" value={formData.yearEst} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="2010" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">Farm Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input name="location" value={formData.location} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="Kiambu, Kenya" />
                    </div>
                    {errors.location && <p className="text-sm text-red-400">{errors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-white/80 font-medium text-base">Farm Description <span className="text-red-500">*</span></label>
                    <textarea name="farmDescription" rows={4} value={formData.farmDescription} onChange={handleChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-base" placeholder="Describe your farm, what makes it special..." />
                    {errors.farmDescription && <p className="text-sm text-red-400">{errors.farmDescription}</p>}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">Farm Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {farmTypes.map((type) => (
                        <button key={type.id} type="button" onClick={() => setFormData({ ...formData, farmType: type.id })} className={`p-3 rounded-xl border text-center transition-all ${formData.farmType === type.id ? "bg-accent/20 border-accent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                          <div className="text-3xl mb-1">{type.icon}</div>
                          <div className="text-sm text-white/80">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">Activities Offered</label>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
                        <div key={category} className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-accent font-medium text-sm mb-3">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {activities.map((activity) => (
                              <label key={activity} className="flex items-center gap-2 text-white/80 text-sm">
                                <input type="checkbox" checked={formData.activities.includes(activity)} onChange={(e) => {
                                  if (e.target.checked) setFormData({ ...formData, activities: [...formData.activities, activity] });
                                  else setFormData({ ...formData, activities: formData.activities.filter((a) => a !== activity) });
                                }} className="w-4 h-4 accent-accent" />
                                <span>{activity}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 bg-white/5 rounded-xl p-4">
                      <p className="text-white/60 text-sm mb-3">Don't see your activity? Add a custom one:</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="text" value={formData.newActivityInput} onChange={(e) => setFormData({ ...formData, newActivityInput: e.target.value })} placeholder="Activity name" className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm" />
                        <select value={formData.newActivityCategory} onChange={(e) => setFormData({ ...formData, newActivityCategory: e.target.value })} className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm">
                          <option value="">Select category</option>
                          {Object.keys(ACTIVITY_CATEGORIES).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                      </div>
                      <button type="button" onClick={handleAddCustomActivity} disabled={!formData.newActivityInput.trim() || !formData.newActivityCategory} className="w-full py-2.5 bg-accent/80 hover:bg-accent text-white rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add Custom Activity</button>
                    </div>

                    {allSelectedActivities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white/60 text-sm mb-2">Selected Activities:</p>
                        <div className="flex flex-wrap gap-2">
                          {allSelectedActivities.map((activity) => (
                            <span key={activity} className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/20 text-accent text-sm rounded-full">
                              {activity}
                              <button type="button" onClick={() => {
                                if (formData.activities.includes(activity)) setFormData({ ...formData, activities: formData.activities.filter((a) => a !== activity) });
                                else removeCustomActivity(activity);
                              }} className="hover:text-accent/80"><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">Facilities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {facilityOptions.map((facility) => (
                        <label key={facility.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.facilities.includes(facility.id) ? "bg-accent/20 border-accent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                          <input type="checkbox" checked={formData.facilities.includes(facility.id)} onChange={(e) => {
                            if (e.target.checked) setFormData({ ...formData, facilities: [...formData.facilities, facility.id] });
                            else setFormData({ ...formData, facilities: formData.facilities.filter((f) => f !== facility.id) });
                          }} className="w-4 h-4 accent-accent" />
                          <span className="text-2xl">{facility.icon}</span>
                          <span className="text-sm text-white/80">{facility.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/80 font-medium text-base mb-2">Accommodation</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2"><input type="radio" checked={formData.accommodation === true} onChange={() => setFormData({ ...formData, accommodation: true })} className="w-4 h-4 accent-accent" /><span className="text-white/80">Yes</span></label>
                        <label className="flex items-center gap-2"><input type="radio" checked={formData.accommodation === false} onChange={() => setFormData({ ...formData, accommodation: false })} className="w-4 h-4 accent-accent" /><span className="text-white/80">No</span></label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 font-medium text-base mb-2">Max Guests {formData.accommodation && <span className="text-red-400 text-sm">*</span>}</label>
                      <input name="maxGuests" type="number" value={formData.maxGuests} onChange={handleChange} className={`w-full px-4 py-2.5 bg-white/10 border ${errors.maxGuests ? 'border-red-400' : 'border-white/20'} rounded-xl text-white text-base`} placeholder={formData.accommodation ? "e.g., 20 (required)" : "Optional"} />
                      {errors.maxGuests && <p className="mt-1 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.maxGuests}</p>}
                      {formData.accommodation && !errors.maxGuests && formData.maxGuests && <p className="mt-1 text-xs text-green-400">✓ Can accommodate up to {formData.maxGuests} guests</p>}
                    </div>
                  </div>
                </motion.div>
              )}
              

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-white/80 font-medium text-base mb-3">Farm Photos</label>
                    <div className="grid grid-cols-4 gap-3">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-accent/20 rounded-xl flex flex-col items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-400 mb-1" />
                          <span className="text-xs text-white/60">Uploaded</span>
                        </div>
                      ))}
                      {[...Array(Math.max(0, 4 - formData.photos.length))].map((_, i) => (
                        <label key={i} className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload("photos", e.target.files[0]); }} />
                          {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Camera className="h-6 w-6 text-white/40 mb-1" /><span className="text-xs text-white/40">Upload</span></>}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-white/30 mt-2">Upload up to 10 photos of your farm</p>
                  </div>

                  <div>
                    <label className="block text-white/80 font-medium text-base mb-2">Video Link (YouTube/Vimeo)</label>
                    <input 
                      name="videoLink" 
                      value={formData.videoLink} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-base" 
                      placeholder="https://youtube.com/watch?v=..." 
                    />
                    <p className="text-xs text-white/30 mt-1">Add a link to a video tour of your farm</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium">
                  <ChevronLeft className="h-5 w-5" /> Back
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium">
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting} 
                  onClick={() => {
                    console.log("✅ User clicked Submit button");
                    hasClickedSubmit.current = true;
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {submitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Submitting...</> : <>Submit for Review <Shield className="h-5 w-5" /></>}
                </button>
              )}
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}