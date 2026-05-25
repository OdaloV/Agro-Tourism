import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <div className="h-8 w-32 bg-white/10 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-48 bg-white/10 rounded mx-auto animate-pulse"></div>
            <div className="mt-8 space-y-4">
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
