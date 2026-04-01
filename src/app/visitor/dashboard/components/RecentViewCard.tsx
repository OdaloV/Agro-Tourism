// src/app/visitor/dashboard/components/RecentViewCard.tsx
import { Eye, MapPin } from "lucide-react";
import Link from "next/link";

interface RecentView {
  id: number;
  farmName: string;
  location: string;
  viewedAt: string;
}

interface RecentViewCardProps {
  view: RecentView;
  index: number;
}

export function RecentViewCard({ view, index }: RecentViewCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-400">#{index + 1}</span>
          <h3 className="font-medium text-emerald-900">{view.farmName}</h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-emerald-600 mt-1">
          <MapPin className="h-3 w-3" />
          <span>{view.location}</span>
        </div>
        <p className="text-xs text-emerald-400 mt-1">
          Viewed: {new Date(view.viewedAt).toLocaleDateString()}
        </p>
      </div>
      <Link href={`/farms/${view.id}`}>
        <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm">
          View Again
        </button>
      </Link>
    </div>
  );
}