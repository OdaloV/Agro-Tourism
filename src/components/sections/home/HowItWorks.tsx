import { Search, Calendar, Heart, MapPin } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Experience",
    description:
      "Browse through hundreds of verified farms and activities across Kenya",
    color: "text-emerald-600",
  },
  {
    icon: Calendar,
    title: "Book Instantly",
    description: "Secure your spot with easy online booking and M-Pesa payment",
    color: "text-accent",
  },
  {
    icon: Heart,
    title: "Create Memories",
    description: "Enjoy authentic farm experiences and connect with nature",
    color: "text-rose-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/30">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl font-heading font-bold text-emerald-900 mt-2 mb-4">
            How HarvestHost Works
          </h2>
          <p className="text-emerald-700/70 max-w-2xl mx-auto">
            Your journey to authentic farm experiences in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connection line (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-emerald-200 to-accent/30" />
                )}

                {/* Step card */}
                <div className="relative text-center p-8 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-white/80 backdrop-blur-sm mb-6 shadow-md ${step.color}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <h3 className="text-xl font-heading font-bold text-emerald-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-emerald-700/70">{step.description}</p>

                  {/* Location marker for first step */}
                  {index === 0 && (
                    <div className="absolute -bottom-2 -right-2">
                      <MapPin className="h-5 w-5 text-accent animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100/50 backdrop-blur-sm px-6 py-3 rounded-full border border-emerald-200/50">
            <span className="text-emerald-600">✨</span>
            <span className="text-emerald-700">
              Trusted by 50,000+ happy visitors across Kenya
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
