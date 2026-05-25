import { Suspense } from "react";
import MessagesContent from "./MessagesContent";

export default function FarmerMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
