"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User, Map, LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export function Header() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-md border-b border-emerald-200/30 shadow-lg" />

      <div className="container relative flex h-16 items-center justify-between">
        {/* Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden bg-emerald-800/30 backdrop-blur-sm hover:bg-emerald-700/40 text-white border border-emerald-200/30"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/marketing" className="flex items-center">
            <span className="text-xl font-heading font-bold text-white drop-shadow-lg">
              HarvestHost
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          <Link
            href="/farms"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full bg-emerald-800/20 backdrop-blur-sm hover:bg-emerald-700/30 border border-emerald-200/20"
          >
            Farms
          </Link>
          <Link
            href="/market"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full bg-emerald-800/20 backdrop-blur-sm hover:bg-emerald-700/30 border border-emerald-200/20"
          >
            Marketplace
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full bg-emerald-800/20 backdrop-blur-sm hover:bg-emerald-700/30 border border-emerald-200/20"
          >
            About
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Map Button */}
          <Link href="/map">
            <Button
              size="icon"
              className="relative h-10 w-10 rounded-full bg-emerald-800/30 backdrop-blur-sm hover:bg-emerald-700/40 border border-emerald-200/30 text-white"
            >
              <Map className="h-5 w-5" />
            </Button>
          </Link>

          {/* Auth Section */}
          {isAuthenticated ? (
            <>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-emerald-800/30 backdrop-blur-sm flex items-center justify-center border border-emerald-200/40">
                  <User className="h-5 w-5 text-white drop-shadow" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-emerald-900/50 animate-pulse" />
              </div>
              <span className="hidden md:inline text-sm text-white/90 font-medium bg-emerald-800/20 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-200/20">
                {role === "farmer" ? "Farmer" : "Visitor"}
              </span>
              <Button
                onClick={logout}
                size="icon"
                className="h-10 w-10 rounded-full bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 border border-red-200/30 text-white"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl px-4 py-2">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
