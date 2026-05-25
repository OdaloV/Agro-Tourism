import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export function FarmCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

export function FarmDetailSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="h-96 bg-gray-200 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export const StatsCardSkeleton = StatCardSkeleton;

export function TableSkeleton({ rows = 4, columns }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-64 w-full bg-gray-200 rounded animate-pulse" />
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

export function ReviewableBookingSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function MessageSkeleton({ isMyMessage = false }: { isMyMessage?: boolean }) {
  return (
    <div className={`flex gap-2 mb-3 animate-pulse ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      {!isMyMessage && <div className="w-8 h-8 bg-gray-200 rounded-full" />}
      <div className={`flex-1 ${isMyMessage ? 'flex justify-end' : ''}`}>
        <div className={`bg-gray-200 rounded-2xl h-10 ${isMyMessage ? 'w-3/4' : 'w-3/4'}`} />
      </div>
      {isMyMessage && <div className="w-8 h-8 bg-gray-200 rounded-full" />}
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="border-b border-gray-100 p-4 flex items-center gap-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-24 mt-1" />
      </div>
    </div>
  );
}

export function PaymentCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    </div>
  );
}