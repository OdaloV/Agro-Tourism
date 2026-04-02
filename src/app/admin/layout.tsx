// src/app/admin/layout.tsx
"use client";

import { AdminThemeProvider, useAdminTheme } from '@/components/admin/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dark mode toggle button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}