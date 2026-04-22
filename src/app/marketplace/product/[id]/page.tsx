"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, MessageCircle, Share2, MapPin, ArrowLeft } from "lucide-react";

interface Product {
  id: number;
  product_name: string;
  category: string;
  price: number;
  quantity: number;
  unit_type: string;
  description: string;
  photos: string[];
  location: string;
  phone: string;
  email: string;
  farmer_id: number;
  farmer_name: string;
  farm_name: string;
  views: number;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const storedUser = localStorage.getItem("userData");
      const uid = storedUser ? JSON.parse(storedUser).id : null;
      const url = uid
        ? `/api/marketplace/products/${params.id}?userId=${uid}`
        : `/api/marketplace/products/${params.id}`;
      const response = await fetch(url);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  const startChat = async () => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      router.push("/auth/login/visitor");
      return;
    }

    const user = JSON.parse(userData);
    if (!product) return;

    if (user.id === product.farmer_id) {
      alert("This is your own product");
      return;
    }

    setStartingChat(true);
    try {
      // ─── Step 1: get farmer_profiles.id (farmProfileId) from profile API ───
      // The profile route now returns farmProfileId explicitly
      const profileRes = await fetch(`/api/farmer/profile?userId=${product.farmer_id}`);
      const profileData = await profileRes.json();

      const farmProfileId = profileData.farmProfileId;

      if (!farmProfileId) {
        console.error("farmProfileId missing from profile response:", profileData);
        alert("Unable to start chat — farm profile not found.");
        return;
      }

      // ─── Step 2: create/reuse conversation using farmer_profiles.id ───
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: farmProfileId,          // ← farmer_profiles.id ✓
          product_id: product.id,
          message: `Hi, I'm interested in your product: ${product.product_name}. Price: KES ${product.price}`,
          subject: `Product Inquiry: ${product.product_name}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start conversation");
      }

      const conversationId = data.conversationId ?? data.conversation_id;

      if (!conversationId) {
        console.error("No conversationId in response:", data);
        router.push("/visitor/dashboard/messages");
        return;
      }

      // ─── Step 3: redirect to correct path ───
      router.push(`/visitor/dashboard/messages?conversation=${conversationId}`);

    } catch (error: any) {
      console.error("Error starting chat:", error);
      alert(error.message || "Failed to start chat. Please try again.");
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
        <Link href="/marketplace" className="text-emerald-600 mt-2 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/marketplace">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="font-semibold">Product Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {product.photos && product.photos.length > 0 && (
          <img
            src={product.photos[0]}
            className="w-full h-96 object-cover rounded-xl"
            alt={product.product_name}
          />
        )}

        <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <h1 className="text-2xl font-bold">{product.product_name}</h1>
          <p className="text-3xl text-emerald-600 font-bold mt-2">
            KES {product.price} / {product.unit_type}
          </p>
          <p className="text-gray-600 mt-1">
            Available: {product.quantity} {product.unit_type}s
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">{product.category}</span>
            <span>👁️ {product.views} views</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Farm Location
          </h3>
          <p className="text-gray-700">{product.location}</p>
          <p className="text-sm text-gray-500 mt-1">{product.farm_name || product.farmer_name}</p>
        </div>

        {product.description && (
          <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <h3 className="font-semibold mb-3">Seller Information</h3>
          <p className="text-gray-700">{product.farm_name || product.farmer_name}</p>
          <p className="text-sm text-gray-500">
            Member since {new Date(product.created_at).getFullYear()}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={startChat}
            disabled={startingChat}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {startingChat ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
            {startingChat ? "Starting chat..." : "Chat with Seller"}
          </button>

          <button
            onClick={() => setShowContact(true)}
            className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl font-semibold"
          >
            Contact
          </button>

          <button
            onClick={shareProduct}
            className="px-6 py-3 border rounded-xl flex items-center justify-center"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              Contact {product.farm_name || "Farmer"}
            </h3>
            <div className="space-y-3">
              <a href={`tel:${product.phone}`} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                <Phone className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold">Call</p>
                  <p className="text-sm text-gray-600">{product.phone}</p>
                </div>
              </a>
              <a href={`mailto:${product.email}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-gray-600">{product.email}</p>
                </div>
              </a>
              <button
                onClick={startChat}
                disabled={startingChat}
                className="w-full flex items-center gap-3 p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-60"
              >
                <MessageCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Chat In-App</p>
                  <p className="text-sm text-emerald-200">Message seller directly</p>
                </div>
              </button>
            </div>
            <button onClick={() => setShowContact(false)} className="w-full mt-4 p-3 border rounded-xl">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}