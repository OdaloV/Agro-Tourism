// src/app/visitor/dashboard/components/QuickActionCard.tsx
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: "emerald" | "blue" | "purple" | "gray";
}

const colorStyles = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  gray: "bg-gray-50 text-gray-600",
};

export function QuickActionCard({ icon: Icon, title, description, href, color }: QuickActionCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-all cursor-pointer">
        <div className={`inline-flex p-2 rounded-xl ${colorStyles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-emerald-900 mt-3">{title}</h3>
        <p className="text-sm text-emerald-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}