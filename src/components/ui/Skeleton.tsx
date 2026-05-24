import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-12 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      <div className="border-b border-border bg-muted/50">
        <div className="flex gap-4 p-4">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 flex-1 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4 border-b border-border">
          {[...Array(columns)].map((_, colIdx) => (
            <div key={colIdx} className="h-4 flex-1 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="h-5 w-32 bg-muted rounded-lg animate-pulse mb-6" />
      <div className="flex items-end gap-2 h-48">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted rounded-t-lg animate-pulse"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}
