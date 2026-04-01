import { Card } from "@/components/ui/card";
import { Apple, GraduationCap, Tent, PartyPopper, Leaf } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    icon: Apple,
    name: "U-Pick & Direct Sales",
    description: "Orchards & Farm Stands",
    action: "Find Fresh Produce",
    color: "text-primary",
    href: "/search?category=upick",
  },
  {
    icon: GraduationCap,
    name: "Education & Tours",
    description: "Workshops & School Trips",
    action: "Book an Experience",
    color: "text-secondary",
    href: "/search?category=education",
  },
  {
    icon: Tent,
    name: "Stays & Recreation",
    description: "Glamping & Farm-to-Table",
    action: "Check Availability",
    color: "text-accent",
    href: "/search?category=stays",
  },
  {
    icon: PartyPopper,
    name: "Events & Entertainment",
    description: "Festivals & Corn Mazes",
    action: "View Calendar",
    color: "text-primary",
    href: "/search?category=events",
  },
  {
    icon: Leaf,
    name: "Wellness & WWOOFing",
    description: "Retreats & Work-Exchange",
    action: "Learn More",
    color: "text-secondary",
    href: "/search?category=wellness",
  },
];

export function Categories() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Explore Farm Experiences
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover authentic Kenyan farm activities and create lasting
            memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.name}
                className="group relative overflow-hidden border-none bg-white/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {/* Glassmorphism background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/5" />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm group-hover:scale-110 transition-transform ${category.color}`}
                    >
                      <Icon className={`h-6 w-6`} />
                    </div>
                  </div>

                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>

                  <Link href={category.href}>
                    <button className="w-full py-2 px-4 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-foreground font-medium border border-white/20">
                      {category.action}
                    </button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
