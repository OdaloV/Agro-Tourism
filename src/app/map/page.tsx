"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  Minus,
  LocateFixed,
  Navigation,
  Star,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// Mock farm data for map pins
const farms = [
  {
    id: 1,
    name: "Green Valley Orchard",
    location: "Kiambu",
    distance: "2km",
    rating: 4.9,
    image: "/images/farm-field.jpg",
    coordinates: { top: "30%", left: "40%" },
    activity: "🍏 U-Pick",
  },
  {
    id: 2,
    name: "Mountain B&B",
    location: "Nyeri",
    distance: "5km",
    rating: 4.7,
    image: "/images/farm-field.jpg",
    coordinates: { top: "45%", left: "65%" },
    activity: "🏡 Farm Stay",
  },
  {
    id: 3,
    name: "Sunrise Dairy",
    location: "Nakuru",
    distance: "8km",
    rating: 4.8,
    image: "/images/farm-field.jpg",
    coordinates: { top: "60%", left: "30%" },
    activity: "🥛 Dairy Tour",
  },
];

export default function MapPage() {
  const [selectedFarm, setSelectedFarm] = useState<(typeof farms)[0] | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-emerald-950">
      {/* Map Background (Simulated with gradient) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2831&auto=format&fit=crop')",
          filter: "brightness(0.7) saturate(1.2)",
        }}
      />

      {/* Map Overlay (for terrain effect) */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 to-emerald-950/50" />

      {/* Floating Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-2">
          <Search className="h-5 w-5 text-emerald-600 ml-2" />
          <input
            type="text"
            placeholder="Search farm or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 py-3 bg-transparent outline-none text-emerald-900 placeholder:text-emerald-400"
          />
          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl mr-1"
            onClick={() => console.log("Searching for:", searchQuery)}
          >
            Go
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white shadow-xl border border-white/30 text-emerald-700"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white shadow-xl border border-white/30 text-emerald-700"
        >
          <Minus className="h-5 w-5" />
        </Button>
      </div>

      {/* Recenter Button */}
      <div className="absolute right-4 top-1/2 z-20">
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white shadow-xl border border-white/30 text-emerald-700"
          onClick={() => console.log("Recenter to GPS")}
        >
          <LocateFixed className="h-5 w-5" />
        </Button>
      </div>

      {/* Map Pins */}
      <div className="absolute inset-0 z-10">
        {farms.map((farm) => (
          <button
            key={farm.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: farm.coordinates.top, left: farm.coordinates.left }}
            onClick={() => setSelectedFarm(farm)}
          >
            {/* Pin */}
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl border-2 border-accent flex items-center justify-center hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              {/* Farm name tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-emerald-900/90 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full whitespace-nowrap border border-white/20">
                  {farm.name}
                </div>
              </div>
              {/* Activity badge */}
              <div className="absolute -top-1 -right-1 bg-accent text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {farm.activity}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Floating Info Card (shown when farm is selected) */}
      {selectedFarm && (
        <div className="absolute bottom-24 left-4 right-4 z-30 animate-slide-up">
          <Card className="bg-white/95 backdrop-blur-md border border-white/30 shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Farm Image Placeholder */}
                <div className="h-16 w-16 rounded-xl bg-emerald-100 flex-shrink-0 overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-emerald-900">
                      {selectedFarm.name}
                    </h3>
                    <button
                      onClick={() => setSelectedFarm(null)}
                      className="text-emerald-400 hover:text-emerald-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-emerald-600 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {selectedFarm.location} • {selectedFarm.distance}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="text-xs font-bold text-emerald-700">
                        {selectedFarm.rating}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-500">
                      {selectedFarm.activity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${selectedFarm.name}`,
                      "_blank",
                    )
                  }
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
                <Link href={`/farms/${selectedFarm.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Navigation (already exists, but we'll add a note) */}
      {/* Note: BottomNav component is already included via layout */}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
