// "use client";

// import { useState } from "react";
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
// } from "lucide-react";
// import { AuthCard } from "@/components/auth/AuthCard";

// export default function Farmereg() {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     // Account Info
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",

//     // Farm Details
//     farmName: "",
//     farmSize: "",
//     yearEst: "",
//     location: "",
//     coordinates: "-1.2921, 36.8219",

//     // Farm Type & Activities
//     farmType: "",
//     activities: [] as string[],
//     accommodation: false,
//     maxGuests: "",
//     facilities: [] as string[],

//     // Media & Documents
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
//   });

//   const farmTypes = [
//     { id: "vegetables", label: "Vegetables", icon: "🥬" },
//     { id: "dairy", label: "Dairy", icon: "🐄" },
//     { id: "livestock", label: "Livestock", icon: "🐑" },
//     { id: "mixed", label: "Mixed Farming", icon: "🌽" },
//     { id: "orchard", label: "Orchard", icon: "🍎" },
//     { id: "vineyard", label: "Vineyard", icon: "🍇" },
//   ];

//   const activityOptions = [
//     { id: "tours", label: "Farm Tours", icon: "🚜" },
//     { id: "harvesting", label: "Harvesting", icon: "🌾" },
//     { id: "animal-feeding", label: "Animal Feeding", icon: "🐓" },
//     { id: "cheese-making", label: "Cheese Making", icon: "🧀" },
//     { id: "cider-tasting", label: "Cider Tasting", icon: "🍎" },
//     { id: "workshops", label: "Workshops", icon: "🎨" },
//     { id: "camping", label: "Camping", icon: "⛺" },
//     { id: "fishing", label: "Fishing", icon: "🎣" },
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
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleFileUpload = (field: string, file: File) => {
//     if (field.startsWith("documents.")) {
//       const docField = field.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         documents: {
//           ...prev.documents,
//           [docField]: file,
//         },
//       }));
//     } else if (field === "photos") {
//       setFormData((prev) => ({
//         ...prev,
//         photos: [...prev.photos, file],
//       }));
//     }
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
//     }

//     setErrors(newErrors);
//     return !Object.values(newErrors).some((error) => error !== "");
//   };

//   const handleNext = () => {
//     if (validateStep()) {
//       setStep(step + 1);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (validateStep()) {
//       console.log("Farmer registration:", formData);
//       router.push("/auth/register/farmer");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
//       <div className="w-full max-w-3xl">
//         <AuthCard
//           title="Register Your Farm"
//           subtitle="Join Kenya's fastest growing agricultural tourism platform"
//           icon={<Tractor className="w-8 h-8 text-accent" />}
//           role="farmer"
//         >
//           {/* Progress Steps */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-4">
//               {[1, 2, 3, 4].map((s) => (
//                 <div key={s} className="flex items-center flex-1">
//                   <motion.div
//                     animate={{
//                       scale: step === s ? 1.1 : 1,
//                       backgroundColor: step >= s ? "#EAB308" : "#ffffff20",
//                     }}
//                     className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
//                       step >= s ? "text-emerald-950" : "text-white/50"
//                     }`}
//                   >
//                     {step > s ? "✓" : s}
//                   </motion.div>
//                   {s < 4 && (
//                     <div className="flex-1 h-1 mx-2 bg-white/20 rounded-full overflow-hidden">
//                       <motion.div
//                         initial={{ width: 0 }}
//                         animate={{ width: step > s ? "100%" : "0%" }}
//                         className="h-full bg-accent"
//                       />
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-between px-1 text-xs text-white/40">
//               <span>Account</span>
//               <span>Farm Details</span>
//               <span>Activities</span>
//               <span>Verification</span>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <AnimatePresence mode="wait">
//               {/* Step 1: Account Creation */}
//               {step === 1 && (
//                 <motion.div
//                   key="step1"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-5"
//                 >
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-white/80">
//                         Full Name
//                       </label>
//                       <div className="relative group">
//                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
//                         <input
//                           name="name"
//                           value={formData.name}
//                           onChange={handleChange}
//                           className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                           placeholder="John Mwangi"
//                         />
//                       </div>
//                       {errors.name && (
//                         <p className="text-sm text-red-400 flex items-center gap-1">
//                           <AlertCircle className="h-4 w-4" />
//                           {errors.name}
//                         </p>
//                       )}
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-white/80">
//                         Phone Number
//                       </label>
//                       <div className="relative group">
//                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
//                         <input
//                           name="phone"
//                           value={formData.phone}
//                           onChange={handleChange}
//                           className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                           placeholder="+254 712 345 678"
//                         />
//                       </div>
//                       {errors.phone && (
//                         <p className="text-sm text-red-400 flex items-center gap-1">
//                           <AlertCircle className="h-4 w-4" />
//                           {errors.phone}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-white/80">
//                       Email Address
//                     </label>
//                     <div className="relative group">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
//                       <input
//                         name="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                         placeholder="farmer@example.com"
//                       />
//                     </div>
//                     {errors.email && (
//                       <p className="text-sm text-red-400 flex items-center gap-1">
//                         <AlertCircle className="h-4 w-4" />
//                         {errors.email}
//                       </p>
//                     )}
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-white/80">
//                         Password
//                       </label>
//                       <div className="relative group">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
//                         <input
//                           name="password"
//                           type={showPassword ? "text" : "password"}
//                           value={formData.password}
//                           onChange={handleChange}
//                           className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                           placeholder="••••••••"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
//                         >
//                           {showPassword ? (
//                             <EyeOff className="h-5 w-5" />
//                           ) : (
//                             <Eye className="h-5 w-5" />
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-white/80">
//                         Confirm Password
//                       </label>
//                       <div className="relative group">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
//                         <input
//                           name="confirmPassword"
//                           type={showConfirmPassword ? "text" : "password"}
//                           value={formData.confirmPassword}
//                           onChange={handleChange}
//                           className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                           placeholder="••••••••"
//                         />
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setShowConfirmPassword(!showConfirmPassword)
//                           }
//                           className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
//                         >
//                           {showConfirmPassword ? (
//                             <EyeOff className="h-5 w-5" />
//                           ) : (
//                             <Eye className="h-5 w-5" />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   {errors.password && (
//                     <p className="text-sm text-red-400">{errors.password}</p>
//                   )}
//                   {errors.confirmPassword && (
//                     <p className="text-sm text-red-400">
//                       {errors.confirmPassword}
//                     </p>
//                   )}
//                 </motion.div>
//               )}

//               {/* Step 2: Farm Details */}
//               {step === 2 && (
//                 <motion.div
//                   key="step2"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-5"
//                 >
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-white/80">
//                       Farm Name
//                     </label>
//                     <input
//                       name="farmName"
//                       value={formData.farmName}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                       placeholder="Green Acres Farm"
//                     />
//                     {errors.farmName && (
//                       <p className="text-sm text-red-400">{errors.farmName}</p>
//                     )}
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-white/80">
//                         Farm Size (acres)
//                       </label>
//                       <div className="relative">
//                         <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
//                         <input
//                           name="farmSize"
//                           type="number"
//                           value={formData.farmSize}
//                           onChange={handleChange}
//                           className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                           placeholder="5"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-white/80">
//                         Year Established
//                       </label>
//                       <div className="relative">
//                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
//                         <input
//                           name="yearEst"
//                           type="number"
//                           value={formData.yearEst}
//                           onChange={handleChange}
//                           className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                           placeholder="2010"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-white/80">
//                       Location
//                     </label>
//                     <div className="relative">
//                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
//                       <input
//                         name="location"
//                         value={formData.location}
//                         onChange={handleChange}
//                         className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
//                         placeholder="Kiambu, Kenya"
//                       />
//                     </div>
//                     {errors.location && (
//                       <p className="text-sm text-red-400">{errors.location}</p>
//                     )}
//                   </div>

//                   {/* Map Integration */}
//                   <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                     <div className="flex items-center justify-between mb-3">
//                       <span className="text-sm font-medium text-white/80">
//                         📍 Farm Location
//                       </span>
//                       <button
//                         type="button"
//                         className="flex items-center gap-1 px-3 py-1 bg-accent text-white text-sm rounded-lg hover:bg-accent/90"
//                       >
//                         <MapPin className="h-4 w-4" />
//                         Use Current
//                       </button>
//                     </div>
//                     <div className="h-40 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-white/10">
//                       <p className="text-sm text-white/40">
//                         Map preview will appear here
//                       </p>
//                     </div>
//                     <p className="text-xs text-white/30 mt-2">
//                       Coordinates: {formData.coordinates}
//                     </p>
//                   </div>
//                 </motion.div>
//               )}

//               {/* Step 3: Activities & Facilities */}
//               {step === 3 && (
//                 <motion.div
//                   key="step3"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-5"
//                 >
//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-3">
//                       Farm Type
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                       {farmTypes.map((type) => (
//                         <motion.label
//                           key={type.id}
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                           className={`
//                             relative p-3 rounded-xl border cursor-pointer text-center
//                             ${
//                               formData.farmType === type.id
//                                 ? "bg-accent/20 border-accent"
//                                 : "bg-white/5 border-white/10 hover:bg-white/10"
//                             }
//                           `}
//                         >
//                           <input
//                             type="radio"
//                             name="farmType"
//                             value={type.id}
//                             checked={formData.farmType === type.id}
//                             onChange={handleChange}
//                             className="absolute opacity-0"
//                           />
//                           <div className="text-2xl mb-1">{type.icon}</div>
//                           <div className="text-xs text-white">{type.label}</div>
//                         </motion.label>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-3">
//                       Activities Offered
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                       {activityOptions.map((activity) => (
//                         <motion.label
//                           key={activity.id}
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                           className={`
//                             relative p-3 rounded-xl border cursor-pointer
//                             ${
//                               formData.activities.includes(activity.id)
//                                 ? "bg-accent/20 border-accent"
//                                 : "bg-white/5 border-white/10 hover:bg-white/10"
//                             }
//                           `}
//                         >
//                           <input
//                             type="checkbox"
//                             value={activity.id}
//                             checked={formData.activities.includes(activity.id)}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 setFormData({
//                                   ...formData,
//                                   activities: [
//                                     ...formData.activities,
//                                     activity.id,
//                                   ],
//                                 });
//                               } else {
//                                 setFormData({
//                                   ...formData,
//                                   activities: formData.activities.filter(
//                                     (a) => a !== activity.id,
//                                   ),
//                                 });
//                               }
//                             }}
//                             className="absolute opacity-0"
//                           />
//                           <div className="text-2xl mb-1">{activity.icon}</div>
//                           <div className="text-xs text-white">
//                             {activity.label}
//                           </div>
//                         </motion.label>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-3">
//                       Facilities
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                       {facilityOptions.map((facility) => (
//                         <motion.label
//                           key={facility.id}
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                           className={`
//                             relative p-3 rounded-xl border cursor-pointer
//                             ${
//                               formData.facilities.includes(facility.id)
//                                 ? "bg-accent/20 border-accent"
//                                 : "bg-white/5 border-white/10 hover:bg-white/10"
//                             }
//                           `}
//                         >
//                           <input
//                             type="checkbox"
//                             value={facility.id}
//                             checked={formData.facilities.includes(facility.id)}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 setFormData({
//                                   ...formData,
//                                   facilities: [
//                                     ...formData.facilities,
//                                     facility.id,
//                                   ],
//                                 });
//                               } else {
//                                 setFormData({
//                                   ...formData,
//                                   facilities: formData.facilities.filter(
//                                     (f) => f !== facility.id,
//                                   ),
//                                 });
//                               }
//                             }}
//                             className="absolute opacity-0"
//                           />
//                           <div className="text-2xl mb-1">{facility.icon}</div>
//                           <div className="text-xs text-white">
//                             {facility.label}
//                           </div>
//                         </motion.label>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-white/80 mb-2">
//                         Accommodation?
//                       </label>
//                       <div className="flex gap-4">
//                         <label className="flex items-center gap-2">
//                           <input
//                             type="radio"
//                             name="accommodation"
//                             checked={formData.accommodation === true}
//                             onChange={() =>
//                               setFormData({ ...formData, accommodation: true })
//                             }
//                             className="text-accent focus:ring-accent"
//                           />
//                           <span className="text-white/80">Yes</span>
//                         </label>
//                         <label className="flex items-center gap-2">
//                           <input
//                             type="radio"
//                             name="accommodation"
//                             checked={formData.accommodation === false}
//                             onChange={() =>
//                               setFormData({ ...formData, accommodation: false })
//                             }
//                             className="text-accent focus:ring-accent"
//                           />
//                           <span className="text-white/80">No</span>
//                         </label>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-white/80 mb-2">
//                         Max Guests
//                       </label>
//                       <input
//                         name="maxGuests"
//                         type="number"
//                         value={formData.maxGuests}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
//                         placeholder="20"
//                       />
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {/* Step 4: Media & Verification */}
//               {step === 4 && (
//                 <motion.div
//                   key="step4"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   className="space-y-5"
//                 >
//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-3">
//                       Farm Photos
//                     </label>
//                     <div className="grid grid-cols-3 gap-3">
//                       {[1, 2, 3].map((i) => (
//                         <motion.label
//                           key={i}
//                           whileHover={{ scale: 1.02 }}
//                           className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10"
//                         >
//                           <input
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                           />
//                           <Camera className="h-6 w-6 text-white/40 mb-1" />
//                           <span className="text-xs text-white/40">Upload</span>
//                         </motion.label>
//                       ))}
//                       <motion.label
//                         whileHover={{ scale: 1.02 }}
//                         className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10"
//                       >
//                         <input
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           multiple
//                         />
//                         <Upload className="h-6 w-6 text-white/40" />
//                       </motion.label>
//                     </div>
//                     <p className="text-xs text-white/30 mt-2">
//                       Upload up to 10 photos
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-2">
//                       Video Link (YouTube/Vimeo)
//                     </label>
//                     <input
//                       name="videoLink"
//                       value={formData.videoLink}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
//                       placeholder="https://youtube.com/watch?v=..."
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-3">
//                       Verification Documents
//                     </label>
//                     <div className="space-y-3">
//                       {[
//                         {
//                           key: "businessLicense",
//                           label: "Business License",
//                           icon: "📄",
//                         },
//                         {
//                           key: "nationalId",
//                           label: "National ID / Passport",
//                           icon: "🆔",
//                         },
//                         {
//                           key: "insurance",
//                           label: "Insurance Certificate",
//                           icon: "📋",
//                         },
//                         {
//                           key: "certifications",
//                           label: "Certifications",
//                           icon: "🏅",
//                         },
//                       ].map((doc) => (
//                         <motion.div
//                           key={doc.key}
//                           whileHover={{ scale: 1.01 }}
//                           className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
//                         >
//                           <div className="flex items-center gap-3">
//                             <span className="text-2xl">{doc.icon}</span>
//                             <span className="text-sm text-white/80">
//                               {doc.label}
//                             </span>
//                           </div>
//                           <label className="cursor-pointer">
//                             <input
//                               type="file"
//                               accept=".pdf,.jpg,.jpeg,.png"
//                               className="hidden"
//                               onChange={(e) => {
//                                 if (e.target.files?.[0]) {
//                                   handleFileUpload(
//                                     `documents.${doc.key}`,
//                                     e.target.files[0],
//                                   );
//                                 }
//                               }}
//                             />
//                             <div className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">
//                               <Upload className="h-4 w-4" />
//                               Upload
//                             </div>
//                           </label>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Navigation Buttons */}
//             <div className="flex gap-3 pt-4">
//               {step > 1 && (
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   type="button"
//                   onClick={() => setStep(step - 1)}
//                   className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl"
//                 >
//                   Back
//                 </motion.button>
//               )}

//               {step < 4 ? (
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   type="button"
//                   onClick={handleNext}
//                   className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl flex items-center justify-center gap-2"
//                 >
//                   Continue
//                   <ArrowRight className="h-5 w-5" />
//                 </motion.button>
//               ) : (
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   type="submit"
//                   className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl flex items-center justify-center gap-2"
//                 >
//                   Submit for Review
//                   <Shield className="h-5 w-5" />
//                 </motion.button>
//               )}
//             </div>
//           </form>
//         </AuthCard>
//       </div>
//     </div>
//   );
// }
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
} from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ACTIVITY_CATEGORIES } from "@/app/profile/farmerprofile/options";

export default function Farmereg() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Account Info
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Farm Details
    farmName: "",
    farmSize: "",
    yearEst: "",
    location: "",
    coordinates: "-1.2921, 36.8219",

    // Farm Type & Activities
    farmType: "",
    activities: [] as string[],
    customActivities: [] as string[],
    newActivityInput: "",
    newActivityCategory: "",
    accommodation: false,
    maxGuests: "",
    facilities: [] as string[],

    // Media & Documents
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

  const activityOptions = [
    { id: "tours", label: "Farm Tours", icon: "🚜" },
    { id: "harvesting", label: "Harvesting", icon: "🌾" },
    { id: "animal-feeding", label: "Animal Feeding", icon: "🐓" },
    { id: "cheese-making", label: "Cheese Making", icon: "🧀" },
    { id: "cider-tasting", label: "Cider Tasting", icon: "🍎" },
    { id: "workshops", label: "Workshops", icon: "🎨" },
    { id: "camping", label: "Camping", icon: "⛺" },
    { id: "fishing", label: "Fishing", icon: "🎣" },
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

  // Custom Activity Handlers
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
      // Combine all activities
      const allActivities = [...formData.activities, ...formData.customActivities];
      console.log("Farmer registration:", { ...formData, allActivities });
      router.push("/auth/register/farmer");
    }
  };

  // Get all selected activities for display
  const allSelectedActivities = [...formData.activities, ...formData.customActivities];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <AuthCard
          title="Register Your Farm"
          subtitle="Join Kenya's fastest growing agricultural tourism platform"
          icon={<Tractor className="w-8 h-8 text-accent" />}
          role="farmer"
        >
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
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
                  {s < 4 && (
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
              <span>Account</span>
              <span>Farm Details</span>
              <span>Activities</span>
              <span>Verification</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Account Creation */}
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
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                      <label className="block text-sm font-medium text-white/80">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                    <label className="block text-sm font-medium text-white/80">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent" />
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password}</p>
                  )}
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400">
                      {errors.confirmPassword}
                    </p>
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
                    <label className="block text-sm font-medium text-white/80">
                      Farm Name
                    </label>
                    <input
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="Green Acres Farm"
                    />
                    {errors.farmName && (
                      <p className="text-sm text-red-400">{errors.farmName}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Farm Size (acres)
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <input
                          name="farmSize"
                          type="number"
                          value={formData.farmSize}
                          onChange={handleChange}
                          className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Year Established
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <input
                          name="yearEst"
                          type="number"
                          value={formData.yearEst}
                          onChange={handleChange}
                          className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          placeholder="2010"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                        placeholder="Kiambu, Kenya"
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-red-400">{errors.location}</p>
                    )}
                  </div>

                  {/* Map Integration */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white/80">
                        📍 Farm Location
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1 bg-accent text-white text-sm rounded-lg hover:bg-accent/90"
                      >
                        <MapPin className="h-4 w-4" />
                        Use Current
                      </button>
                    </div>
                    <div className="h-40 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-white/10">
                      <p className="text-sm text-white/40">
                        Map preview will appear here
                      </p>
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Coordinates: {formData.coordinates}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Activities & Facilities - UPDATED with Custom Activities */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Farm Type (existing) */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Farm Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {farmTypes.map((type) => (
                        <motion.label
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative p-3 rounded-xl border cursor-pointer text-center
                            ${
                              formData.farmType === type.id
                                ? "bg-accent/20 border-accent"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="farmType"
                            value={type.id}
                            checked={formData.farmType === type.id}
                            onChange={handleChange}
                            className="absolute opacity-0"
                          />
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-xs text-white">{type.label}</div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Activities Section - NEW with Categories & Custom Support */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Activities Offered
                    </label>

                    {/* Predefined Activities by Category */}
                    <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-2">
                      {Object.entries(ACTIVITY_CATEGORIES).map(
                        ([category, activities]) => (
                          <div key={category}>
                            <h4 className="text-xs font-medium text-white/60 mb-2">
                              {category}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {activities.map((activity) => (
                                <label
                                  key={activity}
                                  className="flex items-center text-sm text-white/80"
                                >
                                  <input
                                    type="checkbox"
                                    value={activity}
                                    checked={formData.activities.includes(
                                      activity,
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData({
                                          ...formData,
                                          activities: [
                                            ...formData.activities,
                                            activity,
                                          ],
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          activities:
                                            formData.activities.filter(
                                              (a) => a !== activity,
                                            ),
                                        });
                                      }
                                    }}
                                    className="mr-2 accent-accent"
                                  />
                                  <span className="text-xs">{activity}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* Custom Activity Input */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-white/60 mb-2">
                        Don't see your activity? Add it:
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={formData.newActivityInput}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newActivityInput: e.target.value,
                            })
                          }
                          placeholder="e.g., Cheese Making"
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        />
                        <select
                          value={formData.newActivityCategory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newActivityCategory: e.target.value,
                            })
                          }
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        >
                          <option value="">Select category</option>
                          {Object.keys(ACTIVITY_CATEGORIES).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomActivity}
                        disabled={
                          !formData.newActivityInput.trim() ||
                          !formData.newActivityCategory
                        }
                        className="w-full py-2 bg-accent/80 hover:bg-accent text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Custom Activity
                      </button>
                    </div>

                    {/* Display Selected Activities */}
                    {allSelectedActivities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-white/60 mb-2">
                          Selected Activities:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allSelectedActivities.map((activity) => (
                            <span
                              key={activity}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                            >
                              {activity}
                              <button
                                type="button"
                                onClick={() => {
                                  if (formData.activities.includes(activity)) {
                                    setFormData({
                                      ...formData,
                                      activities: formData.activities.filter(
                                        (a) => a !== activity,
                                      ),
                                    });
                                  } else {
                                    removeCustomActivity(activity);
                                  }
                                }}
                                className="text-accent hover:text-accent/80"
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
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Facilities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {facilityOptions.map((facility) => (
                        <motion.label
                          key={facility.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative p-3 rounded-xl border cursor-pointer
                            ${
                              formData.facilities.includes(facility.id)
                                ? "bg-accent/20 border-accent"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            value={facility.id}
                            checked={formData.facilities.includes(facility.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  facilities: [
                                    ...formData.facilities,
                                    facility.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  facilities: formData.facilities.filter(
                                    (f) => f !== facility.id,
                                  ),
                                });
                              }
                            }}
                            className="absolute opacity-0"
                          />
                          <div className="text-2xl mb-1">{facility.icon}</div>
                          <div className="text-xs text-white">
                            {facility.label}
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Accommodation?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="accommodation"
                            checked={formData.accommodation === true}
                            onChange={() =>
                              setFormData({ ...formData, accommodation: true })
                            }
                            className="text-accent focus:ring-accent"
                          />
                          <span className="text-white/80">Yes</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="accommodation"
                            checked={formData.accommodation === false}
                            onChange={() =>
                              setFormData({ ...formData, accommodation: false })
                            }
                            className="text-accent focus:ring-accent"
                          />
                          <span className="text-white/80">No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Max Guests
                      </label>
                      <input
                        name="maxGuests"
                        type="number"
                        value={formData.maxGuests}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
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
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Farm Photos
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <motion.label
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                          />
                          <Camera className="h-6 w-6 text-white/40 mb-1" />
                          <span className="text-xs text-white/40">Upload</span>
                        </motion.label>
                      ))}
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          multiple
                        />
                        <Upload className="h-6 w-6 text-white/40" />
                      </motion.label>
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Upload up to 10 photos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Video Link (YouTube/Vimeo)
                    </label>
                    <input
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Verification Documents
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          key: "businessLicense",
                          label: "Business License",
                          icon: "📄",
                        },
                        {
                          key: "nationalId",
                          label: "National ID / Passport",
                          icon: "🆔",
                        },
                        {
                          key: "insurance",
                          label: "Insurance Certificate",
                          icon: "📋",
                        },
                        {
                          key: "certifications",
                          label: "Certifications",
                          icon: "🏅",
                        },
                      ].map((doc) => (
                        <motion.div
                          key={doc.key}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{doc.icon}</span>
                            <span className="text-sm text-white/80">
                              {doc.label}
                            </span>
                          </div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(
                                    `documents.${doc.key}`,
                                    e.target.files[0],
                                  );
                                }
                              }}
                            />
                            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">
                              <Upload className="h-4 w-4" />
                              Upload
                            </div>
                          </label>
                        </motion.div>
                      ))}
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
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                >
                  Back
                </motion.button>
              )}

              {step < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl flex items-center justify-center gap-2"
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
