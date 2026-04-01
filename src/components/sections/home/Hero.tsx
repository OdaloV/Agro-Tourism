import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-farm.jpg"
          alt="Kenyan farm landscape with rolling hills"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-secondary/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Glassmorphism heading container */}
          <div className="inline-block mb-6 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <h1 className="text-4xl font-heading font-bold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
              Discover Authentic
              <span className="block text-accent">Farm Experiences</span>
            </h1>
          </div>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 drop-shadow-lg bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            Connect with nature, learn about sustainable farming, and create
            unforgettable memories on working farms across Kenya.
          </p>

          {/* Glassmorphism Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md p-2 shadow-2xl border border-white/20">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Search farms, activities, or produce..."
                  className="w-full py-2 bg-transparent outline-none text-white placeholder:text-white/50"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/80 text-white rounded-xl px-6 shadow-lg border border-white/20">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
