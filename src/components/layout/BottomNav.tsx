"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Calendar, MessageCircle, Map } from "lucide-react"; // Added Map
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/marketing" },
  { icon: Map, label: "Map", href: "/map" }, // Changed from Store to Map
  { icon: Store, label: "Market", href: "/market" },
  { icon: Calendar, label: "Bookings", href: "/bookings" },
  { icon: MessageCircle, label: "Inbox", href: "/inbox" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-xl border-t border-emerald-200/20 shadow-2xl" />

      <div className="container relative flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                "px-4 py-1 rounded-2xl",
                isActive
                  ? "bg-emerald-800/30 backdrop-blur-sm -translate-y-1"
                  : "hover:bg-emerald-800/20 hover:backdrop-blur-sm",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-accent drop-shadow-lg"
                    : "text-white/70 group-hover:text-white",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-accent" : "text-white/60",
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-1 w-1 h-1 rounded-full bg-accent animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
