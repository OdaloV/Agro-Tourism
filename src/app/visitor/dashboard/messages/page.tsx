// src/app/visitor/dashboard/messages/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  X,
  ChevronLeft,
  CheckCheck,
  Check,
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
}

export default function VisitorMessages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmIdParam = searchParams.get("farmId");
  const farmNameParam = searchParams.get("farmName");
  
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatFarmId, setNewChatFarmId] = useState("");
  const [newChatSubject, setNewChatSubject] = useState("");
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

  // Handle farm ID from URL params
  useEffect(() => {
    if (farmIdParam && farmNameParam) {
      setNewChatFarmId(farmIdParam);
      setNewChatSubject(`Inquiry about ${farmNameParam}`);
      setShowNewChatModal(true);
    }
  }, [farmIdParam, farmNameParam]);

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
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Only poll every 10 seconds (not 2 seconds)
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if the tab is visible and we have a selected conversation
      if (selectedConversation && document.visibilityState === 'visible') {
        checkTypingStatus(selectedConversation.conversation_id);
      }
    }, 10000); // 10 seconds instead of 2
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
        if (data.conversations?.length > 0 && !selectedConversation) {
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
      const response = await fetch(`/api/messages/status?userId=${selectedConversation.other_party_id}&userRole=farmer`);
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
    // Only send typing indicator every 3 seconds max (debounce)
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
      } else if (newChatFarmId) {
        body.farmId = parseInt(newChatFarmId);
        body.subject = newChatSubject;
      }
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewMessage("");
        // Stop typing indicator
        sendTypingIndicator(false);
        
        if (!selectedConversation && data.conversationId) {
          await fetchConversations();
          const newConv = conversations.find(c => c.conversation_id === data.conversationId);
          if (newConv) setSelectedConversation(newConv);
        } else if (selectedConversation) {
          await fetchMessages(selectedConversation.conversation_id);
          await fetchConversations();
        }
        setShowNewChatModal(false);
        setNewChatFarmId("");
        setNewChatSubject("");
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

  // Set user online status when component mounts
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
    
    // Set offline when component unmounts
    return () => {
      fetch('/api/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false })
      });
    };
  }, [currentUserId]);

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
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Messages</h1>
              <p className="text-emerald-600 mt-1">Chat with farmers about your farm experiences</p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-accent text-white rounded-xl text-sm hover:bg-accent/90"
            >
              + New Message
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
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-emerald-500">No conversations yet</p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-3 text-sm text-accent hover:underline"
                    >
                      Start a conversation →
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.conversation_id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedConversation?.conversation_id === conv.conversation_id
                          ? "bg-accent/5 border-l-4 border-accent"
                          : "hover:bg-emerald-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-emerald-900">
                              {conv.other_party_name}
                            </h4>
                            {conv.unread_count > 0 && (
                              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-500 mt-1">{conv.farm_name}</p>
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
                        <p className="text-xs flex items-center gap-1">
                          <span className="text-emerald-500">{selectedConversation.farm_name}</span>
                          {isOtherOnline && (
                            <span className="text-green-500 text-xs">● Online</span>
                          )}
                        </p>
                      </div>
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
                        <div
                          key={msg.id}
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
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
                <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-500 text-lg mb-2">No conversation selected</p>
                <p className="text-emerald-400 text-sm">Select a conversation from the list or start a new one</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm"
                >
                  Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">
                Start New Conversation
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm ID
                </label>
                <input
                  type="number"
                  value={newChatFarmId}
                  onChange={(e) => setNewChatFarmId(e.target.value)}
                  placeholder="Enter farm ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newChatSubject}
                  onChange={(e) => setNewChatSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim() || !newChatFarmId}
                className="w-full py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}