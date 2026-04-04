// src/app/components/ThemeToggle.tsx
"use client";

import { Sun, Moon } from "lucide-react";
import { useFarmerTheme } from "@/components/admin/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useFarmerTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500" />
      )}
    </button>
  );
}