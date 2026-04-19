"use client";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "rounded";
}

export function Skeleton({ className = "", variant = "default" }: SkeletonProps) {
  const variants = {
    default: "rounded-lg",
    circular: "rounded-full",
    rounded: "rounded-2xl",
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${className}`}
    />
  );
}

// Base skeleton components
export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton variant="circular" className="h-12 w-12" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function FarmCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function FarmDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <Skeleton className="h-96 w-full rounded-2xl" />
          
          {/* Description */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Activities */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <ActivityCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="p-4 border-b border-border bg-gradient-to-r from-muted/50 to-card">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function MessageSkeleton({ isMyMessage = false }: { isMyMessage?: boolean }) {
  return (
    <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isMyMessage ? "bg-accent/20" : "bg-card border border-border"
      }`}>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="p-4 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton variant="circular" className="h-10 w-10" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-48 ml-12" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function FarmProfileSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" className="h-16 w-16" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function EarningsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-40" />
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-border">
              {[...Array(columns)].map((_, j) => (
                <td key={j} className="p-4">
                  <Skeleton className="h-4 w-32" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Additional skeleton components for specific use cases

export function ReviewCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function PaymentHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-40" />
        </div>
        <TableSkeleton rows={4} columns={5} />
      </div>
    </div>
  );
}

export function CalendarDaySkeleton() {
  return (
    <div className="border border-border rounded-lg p-2 h-32">
      <Skeleton className="h-5 w-8 mb-2" />
      <div className="space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function AnalyticsCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-3 w-48" />
      <div className="mt-4 pt-4 border-t border-border">
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  );
}