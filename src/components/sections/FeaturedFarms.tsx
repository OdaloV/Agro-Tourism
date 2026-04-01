import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const farms = [
  {
    id: 1,
    name: "Green Valley Farm",
    location: "Kiambu, Kenya",
    rating: 4.9,
    image: "/images/farm-field.jpg",
    price: "KES 2,500",
    duration: "3 hours",
    activities: ["Farm Tour", "Strawberry Picking"],
  },
  {
    id: 2,
    name: "Highland Orchard",
    location: "Nyeri, Kenya",
    rating: 4.8,
    image: "/images/farm-field.jpg",
    price: "KES 3,200",
    duration: "4 hours",
    activities: ["Apple Picking", "Cider Tasting"],
  },
  {
    id: 3,
    name: "Sunrise Dairy",
    location: "Nakuru, Kenya",
    rating: 4.9,
    image: "/images/farm-field.jpg",
    price: "KES 1,800",
    duration: "2 hours",
    activities: ["Milking Demo", "Cheese Making"],
  },
];

export function FeaturedFarms() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white" />

      <div className="container relative px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-emerald-900 mb-4">
            Featured Farms
          </h2>
          <p className="text-emerald-700/70 max-w-2xl mx-auto">
            Hand-picked experiences from Kenya's finest farms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {farms.map((farm) => (
            <Card
              key={farm.id}
              className="group relative overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/5" />

              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={farm.image}
                  alt={farm.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-lg">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-bold text-emerald-900">
                    {farm.rating}
                  </span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-4 left-4 bg-emerald-900/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
                  <Clock className="h-3 w-3 text-white" />
                  <span className="text-xs text-white">{farm.duration}</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6">
                <h3 className="text-xl font-heading font-bold text-emerald-900 mb-2">
                  {farm.name}
                </h3>

                <div className="flex items-center gap-1 text-emerald-600/70 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{farm.location}</span>
                </div>

                {/* Activity tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {farm.activities.map((activity) => (
                    <span
                      key={activity}
                      className="text-xs bg-emerald-100/50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/50"
                    >
                      {activity}
                    </span>
                  ))}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-2xl font-bold text-emerald-900">
                      {farm.price}
                    </span>
                    <span className="text-sm text-emerald-600/70 ml-1">
                      /person
                    </span>
                  </div>
                  <Link href={`/farms/${farm.id}`}>
                    <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-6 shadow-lg transition-all hover:shadow-xl border border-emerald-500/30">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/20 to-transparent" />
            </Card>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Link href="/farms">
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl px-8 py-6 text-lg backdrop-blur-sm"
            >
              Explore All Farms
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
