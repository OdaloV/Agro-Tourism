"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  X,
  ArrowLeft,
  CheckCheck,
  Check,
  Search,
  RefreshCw,
  Package,
  Trash2,
} from "lucide-react";

interface Conversation {
  conversation_id: number;
  farm_id: number;
  farm_name: string;
  subject: string;
  other_party_name: string;
  other_party_role: string;
  other_party_id: number;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  product_id?: number;
  product_name?: string;
  product_photo?: string;
  product_price?: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
  product_id?: number;
  product_name?: string;
  product_price?: number;
  product_photo?: string;
}

export default function FarmerMessages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Select conversation from URL query param when conversations are loaded
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0 && !selectedConversation) {
      const found = conversations.find(c => c.conversation_id === parseInt(conversationId));
      if (found) {
        setSelectedConversation(found);
      }
    }
  }, [conversations, searchParams, selectedConversation]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
      checkOnlineStatus();
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation && document.visibilityState === 'visible') {
        checkTypingStatus(selectedConversation.conversation_id);
        checkOnlineStatus();
      }
    }, 10000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      if (response.ok) {
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !selectedConversation && !searchParams.get("conversation")) {
          setSelectedConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const checkOnlineStatus = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`/api/messages/status?userId=${selectedConversation.other_party_id}&userRole=visitor`);
      const data = await response.json();
      setIsOtherOnline(data.isOnline);
    } catch (error) {
      console.error("Error checking online status:", error);
    }
  };

  const checkTypingStatus = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/messages/typing?conversationId=${conversationId}`);
      const data = await response.json();
      setIsTyping(data.isTyping);
    } catch (error) {
      console.error("Error checking typing status:", error);
    }
  };

  const sendTypingIndicator = async (isTypingNow: boolean) => {
    if (!selectedConversation) return;
    
    try {
      await fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversationId: selectedConversation.conversation_id, 
          isTyping: isTypingNow 
        })
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;
    
    const now = Date.now();
    if (now - lastTypingSentRef.current < 3000) return;
    lastTypingSentRef.current = now;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    sendTypingIndicator(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!currentUserId) {
      alert("Please login to send messages");
      return;
    }
    
    setSending(true);
    try {
      const body: any = {
        message: newMessage.trim(),
      };
      
      if (selectedConversation) {
        body.conversationId = selectedConversation.conversation_id;
      }
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewMessage("");
        sendTypingIndicator(false);
        
        if (selectedConversation) {
          await fetchMessages(selectedConversation.conversation_id);
          await fetchConversations();
        }
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return msgDate.toLocaleDateString();
    }
  };

  // Set farmer online status
  useEffect(() => {
    const setOnlineStatus = async () => {
      if (currentUserId) {
        await fetch('/api/messages/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isOnline: true })
        });
      }
    };
    
    setOnlineStatus();
    
    return () => {
      fetch('/api/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false })
      });
    };
  }, [currentUserId]);

  const filteredConversations = conversations.filter(conv =>
    conv.other_party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.farm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.last_message && conv.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  const ProductPreview = ({ productName, productPrice, productPhoto, productId }: any) => {
    if (!productId) return null;
    
    return (
      <Link href={`/marketplace/product/${productId}`}>
        <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 flex gap-2 cursor-pointer hover:border-emerald-400 transition">
          {productPhoto && (
            <img src={productPhoto} className="w-10 h-10 object-cover rounded" alt={productName} />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{productName}</p>
            <p className="text-emerald-600 text-sm font-semibold">KES {productPrice}</p>
            <p className="text-xs text-gray-400">Click to view product</p>
          </div>
        </div>
      </Link>
    );
  };

  // Delete entire conversation
  const deleteConversation = async () => {
    if (!selectedConversation) return;
    if (!confirm("Delete this entire conversation? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/messages/conversations/${selectedConversation.conversation_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Remove from conversations list
        setConversations(conversations.filter(c => c.conversation_id !== selectedConversation.conversation_id));
        setSelectedConversation(null);
        alert("Conversation deleted.");
      } else {
        alert("Failed to delete conversation.");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("An error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Messages</h1>
              <p className="text-emerald-600 mt-1">Chat with visitors interested in your farm</p>
            </div>
            {totalUnread > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-xl">
                <MessageCircle className="h-5 w-5 text-accent" />
                <span className="font-medium text-accent">{totalUnread} unread</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, farm or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={fetchConversations}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="p-3 border-b border-emerald-100 bg-emerald-50/50">
                <h3 className="font-medium text-emerald-800">Conversations</h3>
              </div>
              <div className="divide-y divide-emerald-100 max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-emerald-500">No conversations yet</p>
                    <p className="text-sm text-emerald-400">When visitors message you, they'll appear here</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.conversation_id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedConversation?.conversation_id === conv.conversation_id
                          ? "bg-accent/5 border-l-4 border-accent"
                          : "hover:bg-emerald-50"
                      } ${conv.unread_count > 0 ? "bg-emerald-50/30" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium truncate ${conv.unread_count > 0 ? "text-emerald-900 font-semibold" : "text-gray-700"}`}>
                              {conv.other_party_name}
                            </h4>
                            {conv.unread_count > 0 && (
                              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-500 mt-1">{conv.farm_name}</p>
                          {conv.product_name && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {conv.product_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conv.last_message}
                          </p>
                        </div>
                        {conv.last_message_time && (
                          <span className="text-xs text-emerald-400 whitespace-nowrap ml-2">
                            {formatTime(conv.last_message_time)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                        {selectedConversation.other_party_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">
                          {selectedConversation.other_party_name}
                        </h3>
                        <p className="text-xs flex items-center gap-2">
                          <span className="text-emerald-500">{selectedConversation.farm_name}</span>
                          {selectedConversation.product_name && (
                            <span className="text-blue-500 text-xs flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {selectedConversation.product_name}
                            </span>
                          )}
                          {isOtherOnline && (
                            <span className="text-green-500 text-xs">● Online</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={deleteConversation}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                      <p className="text-emerald-500">No messages yet</p>
                      <p className="text-sm text-emerald-400">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMyMessage = msg.sender_id === currentUserId;
                      
                      return (
                        <div key={msg.id}>
                          <div
                            className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isMyMessage
                                  ? "bg-accent text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                              }`}
                            >
                              <p className="text-sm break-words">{msg.message}</p>
                              <div className={`text-xs mt-1 flex items-center gap-1 ${
                                isMyMessage ? "text-white/70" : "text-gray-400"
                              }`}>
                                {formatTime(msg.created_at)}
                                {isMyMessage && (
                                  msg.is_read ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Preview in Message */}
                          {msg.product_id && (
                            <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mt-1`}>
                              <div className="max-w-[70%]">
                                <ProductPreview
                                  productId={msg.product_id}
                                  productName={msg.product_name}
                                  productPrice={msg.product_price}
                                  productPhoto={msg.product_photo}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm border border-gray-100">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-emerald-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center h-[600px] flex flex-col items-center justify-center">
                <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-500 text-lg mb-2">No conversation selected</p>
                <p className="text-emerald-400 text-sm">Select a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
