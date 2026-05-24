import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: process.env.NODE_ENV === 'production',
  allowedDevOrigins: ['192.168.100.7', 'localhost', '*.local', '1086-129-222-187-33.ngrok-free.app', '*.ngrok-free.app'],
  reactStrictMode: process.env.NODE_ENV === 'production',
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
  turbopack: {},
  experimental: {
    optimizeCss: process.env.NODE_ENV === 'production',
  },
};

const pwaOptions: any = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {},
};

export default withPWA(pwaOptions)(nextConfig);
