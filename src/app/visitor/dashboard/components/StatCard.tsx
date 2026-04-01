// src/app/visitor/dashboard/components/StatCard.tsx
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: "emerald" | "red" | "amber" | "blue";
  onClick?: () => void;
}

const colorStyles = {
  emerald: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
};

export function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition-all"
    >
      <div className={`inline-flex p-2 rounded-xl ${colorStyles[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-emerald-900 mt-3">{value}</p>
      <p className="text-sm text-emerald-600 mt-0.5">{label}</p>
    </div>
  );
}