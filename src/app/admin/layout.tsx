"use client";

import { AdminThemeProvider } from '@/components/admin/ThemeProvider';
import { Sun, Moon, Menu, X, LayoutDashboard, Settings, LogOut, BarChart3, Clock, CheckCircle, XCircle, Building, Calendar, DollarSign, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.clear();
    router.push("/auth");
  };

  // Get current tab for mobile active state
  const getCurrentTab = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'pending';
  };

  // All sidebar items in one continuous list
  const sidebarItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/dashboard?tab=pending", label: "Pending Verification", icon: Clock },
    { href: "/admin/dashboard?tab=verified", label: "Verified Farms", icon: CheckCircle },
    { href: "/admin/dashboard?tab=rejected", label: "Rejected Farms", icon: XCircle },
    { href: "/admin/dashboard?tab=all", label: "All Farms", icon: Building },
    { href: "/admin/dashboard?tab=bookings", label: "Bookings", icon: DollarSign },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  // Mobile bottom navigation items
  const mobileNavItems = [
    { href: "/admin/dashboard", label: "Home", icon: Home },
    { href: "/admin/dashboard?tab=pending", label: "Pending", icon: Clock },
    { href: "/admin/dashboard?tab=verified", label: "Verified", icon: CheckCircle },
    { href: "/admin/dashboard?tab=bookings", label: "Bookings", icon: DollarSign },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href.includes("?tab=")) {
      const baseHref = href.split("?")[0];
      const tab = href.split("?tab=")[1];
      const currentTab = new URLSearchParams(window.location.search).get('tab');
      return pathname === baseHref && currentTab === tab;
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Simplified */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-card border-r border-border z-50
        transition-transform duration-300 ease-in-out w-72 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
    HarvestHost
  </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Dashboard</p>
          </div>
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* One Continuous List - No separations */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all
                ${isActive(item.href)
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'text-foreground hover:bg-muted'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-foreground hover:bg-muted transition-all md:hidden"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="text-sm font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        transition-all duration-300 md:ml-72
        ${isMobile ? 'pt-16 pb-20' : 'pt-4 pb-4'}
        px-4 md:px-6
      `}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
          <div className="flex justify-around items-center py-2">
            {mobileNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-all
                  ${isActive(item.href)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="hidden md:flex fixed bottom-4 right-4 z-50 p-3 bg-card rounded-full shadow-lg border border-border hover:bg-muted transition-all"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}