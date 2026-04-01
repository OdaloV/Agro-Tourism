// src/app/visitor/dashboard/components/MessageItem.tsx
import { Mail, Bell, Calendar, MessageCircle } from "lucide-react";

interface Message {
  id: number;
  from: string;
  farmName: string;
  message: string;
  date: string;
  read: boolean;
  type: "booking_confirmation" | "reminder" | "announcement" | "direct";
}

interface MessageItemProps {
  message: Message;
  onMarkRead: (id: number) => void;
}

const messageIcons = {
  booking_confirmation: <CheckCircle className="h-5 w-5 text-green-500" />,
  reminder: <Bell className="h-5 w-5 text-amber-500" />,
  announcement: <Megaphone className="h-5 w-5 text-purple-500" />,
  direct: <MessageCircle className="h-5 w-5 text-blue-500" />,
};

import { CheckCircle, Megaphone } from "lucide-react";

export function MessageItem({ message, onMarkRead }: MessageItemProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition cursor-pointer ${
        message.read ? 'border-emerald-100' : 'border-accent bg-accent/5'
      }`}
      onClick={() => onMarkRead(message.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {messageIcons[message.type]}
          <span className="font-medium text-emerald-900">{message.from}</span>
          {!message.read && <span className="w-2 h-2 bg-accent rounded-full"></span>}
        </div>
        <span className="text-xs text-emerald-400">{new Date(message.date).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-emerald-600">{message.message}</p>
      <p className="text-xs text-emerald-400 mt-2">Farm: {message.farmName}</p>
    </div>
  );
}