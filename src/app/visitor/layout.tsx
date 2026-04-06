// // src/app/visitor/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  Heart,
  MessageCircle,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Star,
  Eye,
  Menu,
  X,
} from "lucide-react";

const navigationItems = [
  { href: "/visitor/dashboard", label: "Dashboard", icon: Home },
  { href: "/farms", label: "Discover Farms", icon: Search },
  { href: "/visitor/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/visitor/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/visitor/dashboard/recent", label: "Recent Views", icon: Eye },
  { href: "/visitor/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/visitor/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/visitor/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/visitor/dashboard/settings", label: "Settings", icon: Settings },
];

export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Visitor");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");

    if (!isAuthenticated || userRole !== "visitor") {
      router.push("/auth/login/visitor");
      return;
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || "Visitor");
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [router, mounted]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      window.location.href = "/auth";
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">

      {/* ── Fixed sidebar (desktop always visible, mobile slide-in) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-emerald-100
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        {/* Sidebar header */}
        <div className="p-6 border-b border-emerald-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link
              href="/visitor/dashboard"
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-xl font-heading font-bold text-emerald-900">
                HarvestHost
              </span>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                Visitor
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User info */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-emerald-600">Farm Explorer</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const showBadge = item.label === "Messages" && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${active ? "text-emerald-600" : "text-emerald-500"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {showBadge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-emerald-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Right side: mobile topbar + scrollable content ── */}
      <div className="md:pl-72 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-emerald-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="h-6 w-6 text-emerald-600" />
          </button>
          <h1 className="text-lg font-bold text-emerald-900">HarvestHost</h1>
          <Link href="/visitor/dashboard/messages" className="p-2 -mr-2 relative">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 md:hidden z-30">
        <div className="flex justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const showBadge = item.label === "Messages" && unreadCount > 0;
            const shortLabel =
              item.label === "Dashboard" ? "Home" :
              item.label === "Discover Farms" ? "Explore" :
              item.label === "My Bookings" ? "Bookings" :
              item.label === "Recent Views" ? "Recent" :
              item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
                  active ? "text-emerald-600" : "text-emerald-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{shortLabel}</span>
                {showBadge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}