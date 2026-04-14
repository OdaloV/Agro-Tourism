"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  TrendingUp,
  MessageCircle,
  Shield,
  Tractor,
  Settings,
  LogOut,
  Star, // Add Star icon for Reviews
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useState } from "react";

const navigationItems = [
  {
    href: "/farmer/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/farmer/verification",
    label: "Verification",
    icon: Shield,
  },
  {
    href: "/farmer/activities",
    label: "Activities",
    icon: Tractor,
  },
  {
    href: "/farmer/schedule",
    label: "Schedule",
    icon: Calendar,
  },
  {
    href: "/farmer/analytics",
    label: "Analytics",
    icon: TrendingUp,
  },
  {
    href: "/farmer/messages",
    label: "Messages",
    icon: MessageCircle,
  },
  {
    href: "/farmer/reviews",  // Add Reviews section
    label: "Reviews",
    icon: Star,
  },
  {
    href: "/farmer/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("farmer-theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Check if dark class is already set
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-gray-900 dark:to-gray-800">
        <div className="flex">
          <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-gray-900 border-r border-emerald-100 dark:border-gray-700">
            <div className="p-4">Loading...</div>
          </aside>
          <main className="md:ml-64 flex-1">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-emerald-100 dark:border-gray-700 transition-colors duration-200 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        }`}>
          <div className="flex-1 flex flex-col min-h-0">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-emerald-100 dark:border-gray-700">
              <Link
                href="/farmer/dashboard"
                className="flex items-center gap-2"
              >
                <Tractor className="h-6 w-6 text-accent" />
                <span className={`text-lg font-heading font-bold ${
                  theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'
                }`}>
                  HarvestHost
                </span>
              </Link>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                theme === 'light' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-emerald-900 text-emerald-300'
              }`}>
                Farmer
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-accent/10 text-accent font-medium"
                        : theme === 'light' 
                          ? "text-emerald-600 hover:bg-emerald-50" 
                          : "text-emerald-400 hover:bg-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-accent" : theme === 'light' ? "text-emerald-500" : "text-emerald-400"
                      }`}
                    />
                    <span className="text-sm">{item.label}</span>
                    {item.label === "Verification" && !isActive && (
                      <span className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-emerald-100 dark:border-gray-700">
              <button
                onClick={logout}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all ${
                  theme === 'light'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-red-400 hover:bg-red-900/20'
                }`}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:ml-64 flex-1">{children}</main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t border-emerald-100 dark:border-gray-700 md:hidden z-20 ${
        theme === 'light' ? 'bg-white' : 'bg-gray-900'
      }`}>
        <div className="flex justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
                  isActive ? "text-accent" : theme === 'light' ? "text-emerald-500" : "text-emerald-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">
                  {item.label === "Dashboard" ? "Home" : item.label}
                </span>
                {item.label === "Verification" && !isActive && (
                  <span className="absolute top-1 right-1/4 w-1.5 h-1.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}