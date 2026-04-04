// src/app/farmer/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  User,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Search,
  Filter,
  RefreshCw,
  PhoneCall,
  MapPin,
  ChevronRight,
  X,
  Reply,
  Flag,
} from "lucide-react";


interface Message {
  id: number;
  visitor_id: number;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  created_at: string;
  booking_id?: number;
  farm_name?: string;
  activity_name?: string;
}

interface Conversation {
  visitor_id: number;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
  messages: Message[];
}

export default function FarmerMessages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/farmer/messages');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedVisitor) return;

    setSending(true);
    try {
      const response = await fetch('/api/farmer/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: selectedVisitor.visitor_id,
          message: replyText,
          subject: `Re: ${selectedVisitor.messages[0]?.subject || 'Farm Inquiry'}`
        })
      });

      if (response.ok) {
        setReplyText("");
        await fetchMessages();
        // Update selected conversation
        const updated = conversations.find(c => c.visitor_id === selectedVisitor.visitor_id);
        if (updated) setSelectedVisitor(updated);
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (visitorId: number) => {
    try {
      await fetch('/api/farmer/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId })
      });
      await fetchMessages();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedVisitor(conversation);
    if (conversation.unread_count > 0) {
      markAsRead(conversation.visitor_id);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.visitor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.last_message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "unread") {
      return matchesSearch && conv.unread_count > 0;
    }
    return matchesSearch;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
       {/* Header */}
<div className="mb-6">
  <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
    <ArrowLeft className="h-5 w-5" />
    Back to Dashboard
  </Link>
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-heading font-bold text-emerald-900">Messages</h1>
      <p className="text-emerald-600 mt-1">Communicate with visitors interested in your farm</p>
    </div>
    <div className="flex items-center gap-3">
      {totalUnread > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-xl">
          <MessageCircle className="h-5 w-5 text-accent" />
          <span className="font-medium text-accent">{totalUnread} unread</span>
        </div>
      )}
    </div>
  </div>
</div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl transition ${
                  filterStatus === "all" 
                    ? "bg-accent text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("unread")}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  filterStatus === "unread" 
                    ? "bg-accent text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Unread
                {totalUnread > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {totalUnread}
                  </span>
                )}
              </button>
              <button
                onClick={fetchMessages}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Conversations List */}
          <div className="lg:col-span-1 space-y-3">
            {filteredConversations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-emerald-100">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">When visitors contact you, they'll appear here</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <motion.div
                  key={conv.visitor_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedVisitor?.visitor_id === conv.visitor_id
                      ? "border-accent ring-2 ring-accent/20"
                      : conv.unread_count > 0
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-emerald-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-accent rounded-full flex items-center justify-center text-white font-semibold">
                        {conv.visitor_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium truncate ${conv.unread_count > 0 ? "text-emerald-900 font-semibold" : "text-gray-700"}`}>
                          {conv.visitor_name}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(conv.last_message_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                      {conv.unread_count > 0 && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                          {conv.unread_count} new
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedVisitor ? (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-[600px]">
                {/* Conversation Header */}
                <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-accent rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {selectedVisitor.visitor_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-emerald-900">{selectedVisitor.visitor_name}</h2>
                      <div className="flex items-center gap-3 mt-0.5">
                        <a href={`mailto:${selectedVisitor.visitor_email}`} className="text-xs text-accent hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedVisitor.visitor_email}
                        </a>
                        {selectedVisitor.visitor_phone && (
                          <a href={`tel:${selectedVisitor.visitor_phone}`} className="text-xs text-accent hover:underline flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedVisitor.visitor_phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedVisitor(null)}
                      className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedVisitor.messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.visitor_id === selectedVisitor.visitor_id ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${
                          msg.visitor_id === selectedVisitor.visitor_id
                            ? "bg-gray-100 text-gray-800"
                            : "bg-accent text-white"
                        }`}
                      >
                        {msg.subject && (
                          <p className={`text-xs font-medium mb-1 ${msg.visitor_id === selectedVisitor.visitor_id ? "text-accent" : "text-white/80"}`}>
                            {msg.subject}
                          </p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.visitor_id === selectedVisitor.visitor_id ? "text-gray-400" : "text-white/60"}`}>
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-emerald-100 bg-gray-50">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                      className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition disabled:opacity-50 flex items-center gap-2 self-end"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center h-[600px] flex flex-col items-center justify-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
                <p className="text-sm text-gray-400 mt-1">Choose a message from the left to start replying</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}