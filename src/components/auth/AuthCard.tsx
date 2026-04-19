"use client";

import { motion } from "framer-motion";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;  
  icon: React.ReactNode;
  role?: "visitor" | "farmer" | "admin";  
}

export function AuthCard({
  children,
  title,
  subtitle,
  icon,
  role,
}: AuthCardProps) {
  const gradients = {
    visitor: "from-emerald-500/20 via-emerald-600/10 to-transparent",
    farmer: "from-amber-500/20 via-amber-600/10 to-transparent",
    admin: "from-purple-500/20 via-purple-600/10 to-transparent",
    default: "from-emerald-500/20 via-emerald-600/10 to-transparent", 
  };

  // Use role-specific gradient or default
  const gradientClass = role ? gradients[role] : gradients.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background blur layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-emerald-800/30 to-amber-900/40 backdrop-blur-2xl rounded-3xl" />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-3xl`}
      />

      {/* Content */}
      <div className="relative p-8 md:p-10">
        {/* Header with icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-2xl"
          >
            <div className="text-4xl">{icon}</div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-heading font-bold text-white mb-2"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 max-w-md"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Form content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -z-10" />
      </div>
    </motion.div>
  );
}