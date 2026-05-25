import { Suspense } from "react";
import AdminLoginContent from "./AdminLoginContent";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-5">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
