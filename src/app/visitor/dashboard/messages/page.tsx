"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  X,
  ChevronLeft,
  CheckCheck,
  Check,
  Search,
  MapPin,
  Star,
  Package,
  Trash2,
} from "lucide-react";
import { 
  Skeleton, 
  ConversationSkeleton, 
  MessageSkeleton, 
  ChatHeaderSkeleton 
} from "@/components/ui/Skeleton";

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

interface Farm {
  id: number;
  farm_name: string;
  farm_location: string;
  city: string;
  county: string;
  average_rating: number | string | null;
  cover_photo: string;
}

export default function VisitorMessages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmIdParam = searchParams.get("farmId");
  const farmNameParam = searchParams.get("farmName");
  const productIdParam = searchParams.get("productId");
  const productNameParam = searchParams.get("productName");
  
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [farmSearch, setFarmSearch] = useState("");
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const getSafeRating = (rating: number | string | null | undefined): number => {
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'string') return parseFloat(rating) || 0;
    return 0;
  };

  const formatRating = (rating: number | string | null | undefined): string => {
    const safeRating = getSafeRating(rating);
    return safeRating.toFixed(1);
  };

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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      fetch('/api/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false })
      }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetch('/api/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: true })
      }).catch(() => {});
    }
  }, [currentUserId]);

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

  useEffect(() => {
    if (showNewChatModal) {
      fetchFarms();
    }
  }, [showNewChatModal]);

  useEffect(() => {
    if (productIdParam && productNameParam) {
      setSelectedProduct({ id: parseInt(productIdParam), name: productNameParam });
      setNewChatSubject(`Inquiry about product: ${productNameParam}`);
      setShowNewChatModal(true);
    } else if (farmIdParam && farmNameParam) {
      setSelectedFarm({ 
        id: parseInt(farmIdParam), 
        farm_name: farmNameParam,
        farm_location: "",
        city: "",
        county: "",
        average_rating: 0,
        cover_photo: ""
      });
      setNewChatSubject(`Inquiry about ${farmNameParam}`);
      setShowNewChatModal(true);
    }
  }, [farmIdParam, farmNameParam, productIdParam, productNameParam]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
      checkOnlineStatus();
      startPolling();
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (selectedConversation) {
          startPolling();
          checkOnlineStatus();
        }
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (!selectedConversation) return;
    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation && document.visibilityState === 'visible' && isMountedRef.current) {
        checkTypingStatus(selectedConversation.conversation_id);
      }
    }, 30000);
  }, [selectedConversation]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      if (response.ok && isMountedRef.current) {
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !selectedConversation && !searchParams.get("conversation")) {
          setSelectedConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const fetchFarms = async () => {
    setLoadingFarms(true);
    try {
      const response = await fetch(`/api/farms?limit=50`);
      const data = await response.json();
      if (response.ok && isMountedRef.current) {
        setFarms(data.farms || []);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      if (isMountedRef.current) setLoadingFarms(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await response.json();
      if (response.ok && isMountedRef.current) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (isMountedRef.current) setLoadingMessages(false);
    }
  };

  const checkOnlineStatus = async () => {
    if (!selectedConversation) return;
    try {
      const response = await fetch(`/api/messages/status?userId=${selectedConversation.other_party_id}&userRole=farmer`);
      const data = await response.json();
      if (isMountedRef.current) setIsOtherOnline(data.isOnline);
    } catch (error) {
      console.error("Error checking online status:", error);
    }
  };

  const checkTypingStatus = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/messages/typing?conversationId=${conversationId}`);
      const data = await response.json();
      if (isMountedRef.current) setIsTyping(data.isTyping);
    } catch (error) {}
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
    } catch (error) {}
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
      const body: any = { message: newMessage.trim() };
      if (selectedConversation) {
        body.conversationId = selectedConversation.conversation_id;
      } else if (selectedProduct) {
        body.farmId = selectedFarm?.id;
        body.product_id = selectedProduct.id;
        body.subject = newChatSubject || `Inquiry about product: ${selectedProduct.name}`;
      } else if (selectedFarm) {
        body.farmId = selectedFarm.id;
        body.subject = newChatSubject || `Inquiry about ${selectedFarm.farm_name}`;
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
        if (!selectedConversation && data.conversationId) {
          await fetchConversations();
          const newConv = conversations.find(c => c.conversation_id === data.conversationId);
          if (newConv) setSelectedConversation(newConv);
        } else if (selectedConversation) {
          await fetchMessages(selectedConversation.conversation_id);
          await fetchConversations();
        }
        setShowNewChatModal(false);
        setSelectedFarm(null);
        setSelectedProduct(null);
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

  const filteredFarms = farms.filter(farm =>
    farm.farm_name.toLowerCase().includes(farmSearch.toLowerCase()) ||
    (farm.city && farm.city.toLowerCase().includes(farmSearch.toLowerCase())) ||
    (farm.county && farm.county.toLowerCase().includes(farmSearch.toLowerCase()))
  );

  const ProductPreview = ({ productName, productPrice, productPhoto, productId }: any) => {
    if (!productId) return null;
    return (
      <Link href={`/marketplace/product/${productId}`}>
        <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 flex gap-2 cursor-pointer hover:border-emerald-400 transition">
          {productPhoto && <img src={productPhoto} className="w-10 h-10 object-cover rounded" alt={productName} />}
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
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="p-3 border-b border-emerald-100">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="divide-y divide-emerald-100">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ConversationSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-[600px]">
                <ChatHeaderSkeleton />
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <MessageSkeleton key={i} isMyMessage={i % 2 === 0} />
                  ))}
                </div>
                <div className="p-4 border-t border-emerald-100 bg-white">
                  <div className="flex gap-2">
                    <Skeleton className="flex-1 h-10 rounded-xl" />
                    <Skeleton className="h-10 w-20 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link href="/visitor/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-emerald-900">Messages</h1>
              <p className="text-emerald-600 mt-1">Chat with farmers about products and experiences</p>
            </div>
            <button onClick={() => setShowNewChatModal(true)} className="px-4 py-2 bg-accent text-white rounded-xl text-sm hover:bg-accent/90">
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
                    <button onClick={() => setShowNewChatModal(true)} className="mt-3 text-sm text-accent hover:underline">
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
                            <h4 className="font-medium text-emerald-900">{conv.other_party_name}</h4>
                            {conv.unread_count > 0 && (
                              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-500 mt-1">{conv.farm_name}</p>
                          {conv.product_name && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                              <Package className="h-3 w-3" /> {conv.product_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate mt-1">{conv.last_message}</p>
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
                <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                        {selectedConversation.other_party_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">{selectedConversation.other_party_name}</h3>
                        <p className="text-xs flex items-center gap-2">
                          <span className="text-emerald-500">{selectedConversation.farm_name}</span>
                          {selectedConversation.product_name && (
                            <span className="text-blue-500 text-xs flex items-center gap-1">
                              <Package className="h-3 w-3" /> {selectedConversation.product_name}
                            </span>
                          )}
                          {isOtherOnline && <span className="text-green-500 text-xs">● Online</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={deleteConversation}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {loadingMessages ? (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <MessageSkeleton key={i} isMyMessage={i % 2 === 0} />
                      ))}
                    </>
                  ) : messages.length === 0 ? (
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
                          <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isMyMessage ? "bg-accent text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                            }`}>
                              <p className="text-sm break-words">{msg.message}</p>
                              <div className={`text-xs mt-1 flex items-center gap-1 ${
                                isMyMessage ? "text-white/70" : "text-gray-400"
                              }`}>
                                {formatTime(msg.created_at)}
                                {isMyMessage && (msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                              </div>
                            </div>
                          </div>
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

                <div className="p-4 border-t border-emerald-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-accent"
                    />
                    <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
                      {sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="h-4 w-4" />}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center h-[600px] flex flex-col items-center justify-center">
                <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-500 text-lg mb-2">No conversation selected</p>
                <p className="text-emerald-400 text-sm">Select a conversation from the list or start a new one</p>
                <button onClick={() => setShowNewChatModal(true)} className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm">
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-emerald-900">Start New Conversation</h3>
              <button onClick={() => { setShowNewChatModal(false); setSelectedFarm(null); setSelectedProduct(null); setNewChatSubject(""); setNewMessage(""); }} className="p-1 hover:bg-emerald-50 rounded-lg">
                <X className="h-5 w-5 text-emerald-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Farms</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={farmSearch} onChange={(e) => setFarmSearch(e.target.value)} placeholder="Search by farm name or location..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select a Farm to Contact</label>
                {loadingFarms ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <Skeleton variant="circular" className="h-10 w-10" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-40 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {filteredFarms.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No farms found</p>
                    ) : (
                      filteredFarms.map((farm) => (
                        <div key={farm.id} onClick={() => setSelectedFarm(farm)} className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedFarm?.id === farm.id ? "bg-accent/10 border-accent border" : "hover:bg-gray-50 border border-transparent"
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-emerald-600">🌾</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-emerald-900">{farm.farm_name}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{farm.city || farm.county || farm.farm_location}</span>
                              </div>
                              {farm.average_rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{formatRating(farm.average_rating)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedFarm && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-emerald-600 mb-1">Selected Farm:</p>
                  <p className="font-medium text-emerald-900">{selectedFarm.farm_name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" value={newChatSubject} onChange={(e) => setNewChatSubject(e.target.value)} placeholder="What's this about?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={4} placeholder="Type your message here..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent" />
              </div>
            </div>

            <div className="p-4 border-t border-emerald-100 flex gap-3">
              <button onClick={() => { setShowNewChatModal(false); setSelectedFarm(null); setSelectedProduct(null); setNewChatSubject(""); setNewMessage(""); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={sendMessage} disabled={sending || !newMessage.trim() || !selectedFarm} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50">{sending ? "Sending..." : "Send Message"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
