"use client";

import dynamic from "next/dynamic";
import { Shield } from "lucide-react";
import {
  StatCardSkeleton,
  TableSkeleton,
} from "@/components/ui/Skeleton";

// Dynamically import the main dashboard with no SSR
const AdminDashboardContent = dynamic(
  () => import("@/components/admin/AdminDashboardContent"),
  { 
    ssr: false,
    loading: () => <AdminDashboardSkeleton />
  }
);

// Loading skeleton for the dashboard
function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="h-7 w-48 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-1"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="h-6 w-32 bg-muted rounded-lg animate-pulse"></div>
          </div>
          <TableSkeleton rows={5} columns={4} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
