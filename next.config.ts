import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // React compiler for performance
  reactCompiler: true,
  
  // Allow dev access from network devices
  allowedDevOrigins: ['192.168.100.7', 'localhost', '*.local'],
  
  // React strict mode for better development
  reactStrictMode: true,
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "your-storage-domain.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  
  // Turbopack configuration
  turbopack: {
    // Optional: Add turbopack-specific configuration here if needed
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    // ... (keep your existing workboxOptions)
  },
})(nextConfig);