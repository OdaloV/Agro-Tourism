// src/app/visitor/dashboard/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Bell,
  Calendar,
  MessageCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Reply,
  Trash2,
  Star,
  Archive,
  Filter,
} from "lucide-react";

interface Message {
  id: number;
  from: string;
  farmId: number;
  farmName: string;
  message: string;
  date: string;
  read: boolean;
  type: "booking_confirmation" | "reminder" | "announcement" | "direct";
}

export default function VisitorMessages() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "booking" | "reminder" | "announcement">("all");
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchMessages = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/auth/login/visitor");
          return;
        }

        // Mock messages data - replace with API call
        const mockMessages: Message[] = [
          {
            id: 1,
            from: "John (Green Acres Farm)",
            farmId: 1,
            farmName: "Green Acres Farm",
            message: "Your booking for the Farm Tour on April 15th is confirmed! We look forward to hosting you. Please arrive 15 minutes early.",
            date: "2024-04-01T10:30:00",
            read: false,
            type: "booking_confirmation",
          },
          {
            id: 2,
            from: "Sunrise Dairy",
            farmId: 2,
            farmName: "Sunrise Dairy",
            message: "Reminder: Your milking experience is tomorrow at 10:00 AM. Please bring comfortable shoes and arrive 15 minutes early.",
            date: "2024-03-30T08:00:00",
            read: true,
            type: "reminder",
          },
          {
            id: 3,
            from: "HarvestHost Team",
            farmId: 0,
            farmName: "HarvestHost",
            message: "🎉 Welcome to HarvestHost! We're excited to have you. Check out our featured farms this month with special discounts!",
            date: "2024-03-25T09:00:00",
            read: true,
            type: "announcement",
          },
          {
            id: 4,
            from: "Mary (Highland Orchard)",
            farmId: 3,
            farmName: "Highland Orchard",
            message: "Thank you for your interest in our Apple Picking experience! Do you have any dietary restrictions we should know about?",
            date: "2024-03-28T14:15:00",
            read: false,
            type: "direct",
          },
          {
            id: 5,
            from: "Green Acres Farm",
            farmId: 1,
            farmName: "Green Acres Farm",
            message: "Special offer: Book our Harvesting experience this weekend and get 20% off! Use code HARVEST20.",
            date: "2024-03-27T11:00:00",
            read: true,
            type: "announcement",
          },
        ];

        setMessages(mockMessages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router, mounted]);

  const handleMarkRead = (messageId: number) => {
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, read: true } : m
      )
    );
  };

  const handleDelete = (messageId: number) => {
    if (confirm("Delete this message?")) {
      setMessages(messages.filter((m) => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      alert(`Reply sent to ${selectedMessage.from}`);
      setReplyText("");
      setShowReplyModal(false);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "booking_confirmation":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "reminder":
        return <Bell className="h-5 w-5 text-amber-500" />;
      case "announcement":
        return <Megaphone className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "booking_confirmation":
        return "Booking Confirmation";
      case "reminder":
        return "Reminder";
      case "announcement":
        return "Announcement";
      default:
        return "Message";
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (activeFilter === "unread") return !msg.read;
    if (activeFilter === "booking") return msg.type === "booking_confirmation";
    if (activeFilter === "reminder") return msg.type === "reminder";
    if (activeFilter === "announcement") return msg.type === "announcement";
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Messages</h1>
              <p className="text-emerald-600 mt-1">Chat with farmers and get updates</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-accent text-white px-3 py-1 rounded-full text-sm">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Messages List - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              {/* Filters */}
              <div className="p-3 border-b border-emerald-100 bg-emerald-50/50">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <FilterButton
                    active={activeFilter === "all"}
                    onClick={() => setActiveFilter("all")}
                    label="All"
                    count={messages.length}
                  />
                  <FilterButton
                    active={activeFilter === "unread"}
                    onClick={() => setActiveFilter("unread")}
                    label="Unread"
                    count={unreadCount}
                  />
                  <FilterButton
                    active={activeFilter === "booking"}
                    onClick={() => setActiveFilter("booking")}
                    label="Bookings"
                    count={messages.filter(m => m.type === "booking_confirmation").length}
                  />
                  <FilterButton
                    active={activeFilter === "reminder"}
                    onClick={() => setActiveFilter("reminder")}
                    label="Reminders"
                    count={messages.filter(m => m.type === "reminder").length}
                  />
                </div>
              </div>

              {/* Message List */}
              <div className="divide-y divide-emerald-100 max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-emerald-500">No messages</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isSelected={selectedMessage?.id === message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read) handleMarkRead(message.id);
                      }}
                      getMessageIcon={getMessageIcon}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail - Right Column */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        {getMessageIcon(selectedMessage.type)}
                      </div>
                      <div>
                        <h2 className="text-xl font-heading font-semibold text-emerald-900">
                          {selectedMessage.from}
                        </h2>
                        <p className="text-sm text-emerald-500">
                          {selectedMessage.farmName} • {getTypeLabel(selectedMessage.type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowReplyModal(true)}
                        className="p-2 hover:bg-emerald-50 rounded-lg"
                        title="Reply"
                      >
                        <Reply className="h-5 w-5 text-emerald-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-emerald-400">
                      {new Date(selectedMessage.date).toLocaleString()}
                    </span>
                    {!selectedMessage.read && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>

                  {selectedMessage.type === "booking_confirmation" && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-2">✅ Booking Confirmed</p>
                      <p className="text-xs text-green-600">Your booking has been confirmed. Check your bookings page for details.</p>
                      <Link href="/visitor/dashboard/bookings">
                        <button className="mt-3 text-sm text-accent hover:underline">
                          View My Bookings →
                        </button>
                      </Link>
                    </div>
                  )}

                  {selectedMessage.type === "reminder" && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-sm text-amber-700 font-medium mb-2">⏰ Upcoming Experience</p>
                      <p className="text-xs text-amber-600">Don't forget your upcoming farm visit!</p>
                    </div>
                  )}

                  {selectedMessage.type === "direct" && (
                    <div className="mt-6">
                      <Link href={`/farms/${selectedMessage.farmId}`}>
                        <button className="text-sm text-accent hover:underline">
                          View Farm Profile →
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
                <Mail className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-500 text-lg mb-2">Select a message</p>
                <p className="text-emerald-400 text-sm">Choose a message from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Reply to {selectedMessage.from}
              </h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:border-accent text-emerald-900"
                placeholder="Type your reply here..."
              />
            </div>
            <div className="p-4 border-t border-emerald-100 flex gap-3">
              <button
                onClick={() => setShowReplyModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-50"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Button Component
function FilterButton({ active, onClick, label, count }: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-all whitespace-nowrap ${
        active
          ? "bg-accent text-white"
          : "bg-white text-emerald-600 hover:bg-emerald-100"
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1 text-xs ${active ? "text-white/80" : "text-emerald-400"}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

// Message Item Component
function MessageItem({ message, isSelected, onClick, getMessageIcon }: { 
  message: Message; 
  isSelected: boolean; 
  onClick: () => void; 
  getMessageIcon: (type: string) => React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all ${
        isSelected
          ? "bg-accent/5 border-l-4 border-accent"
          : "hover:bg-emerald-50"
      } ${!message.read ? "bg-emerald-50/50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getMessageIcon(message.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={`text-sm font-medium truncate ${!message.read ? "text-emerald-900" : "text-emerald-700"}`}>
              {message.from}
            </h4>
            <span className="text-xs text-emerald-400 whitespace-nowrap ml-2">
              {new Date(message.date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-emerald-500 mt-1 truncate">{message.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-emerald-400">{message.farmName}</span>
            {!message.read && <span className="w-2 h-2 bg-accent rounded-full"></span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing Megaphone icon
function Megaphone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11h18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
      <path d="M5 11v-3a4 4 0 0 1 8 0v3" />
      <path d="M13 5h6" />
      <path d="M17 11v3" />
    </svg>
  );
}