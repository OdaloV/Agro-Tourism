// src/app/visitor/dashboard/components/FavoriteCard.tsx
import { Heart, Star, Share2, X } from "lucide-react";
import Link from "next/link";

interface FavoriteFarm {
  id: number;
  farmName: string;
  location: string;
  rating: number;
  activities?: string[];
}

interface FavoriteCardProps {
  farm: FavoriteFarm;
  onRemove: (id: number) => void;
  onShare: (farm: FavoriteFarm) => void;
}

export function FavoriteCard({ farm, onRemove, onShare }: FavoriteCardProps) {
  return (
    <div className="border border-emerald-100 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-900">{farm.farmName}</h3>
          <p className="text-sm text-emerald-600">{farm.location}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm text-emerald-700">{farm.rating}</span>
          </div>
          {farm.activities && farm.activities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {farm.activities.slice(0, 3).map((activity, idx) => (
                <span key={idx} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {activity}
                </span>
              ))}
              {farm.activities.length > 3 && (
                <span className="text-xs text-emerald-500">+{farm.activities.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onShare(farm)}
            className="p-2 hover:bg-emerald-50 rounded-lg"
            title="Share"
          >
            <Share2 className="h-4 w-4 text-emerald-500" />
          </button>
          <button
            onClick={() => onRemove(farm.id)}
            className="p-2 hover:bg-red-50 rounded-lg"
            title="Remove from favorites"
          >
            <X className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Link href={`/farms/${farm.id}`}>
          <button className="w-full py-2 bg-accent text-white rounded-lg text-sm">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
}