"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, MessageCircle, Share2, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
    }
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/marketplace/products/${params.id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareProduct = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
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
    
    try {
      const response = await fetch("/api/marketplace/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.farmer_id,
          first_message: `Hi, I'm interested in ${product.product_name}`,
        }),
      });
      
      const data = await response.json();
      router.push(`/marketplace/chats/${data.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat");
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
      {/* Header */}
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
        {/* Images */}
        {product.photos && product.photos.length > 0 && (
          <img 
            src={product.photos[0]} 
            className="w-full h-96 object-cover rounded-xl" 
            alt={product.product_name} 
          />
        )}

        {/* Product Info */}
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

        {/* Farm Location */}
        <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Farm Location
          </h3>
          <p className="text-gray-700">{product.location}</p>
          <p className="text-sm text-gray-500 mt-1">{product.farm_name || product.farmer_name}</p>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        {/* Seller Info */}
        <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <h3 className="font-semibold mb-3">Seller Information</h3>
          <p className="text-gray-700">{product.farm_name || product.farmer_name}</p>
          <p className="text-sm text-gray-500">Member since {new Date(product.created_at).getFullYear()}</p>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={startChat}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Chat with Seller
          </button>
          
          <button
            onClick={() => setShowContact(true)}
            className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl font-semibold"
          >
            Contact
          </button>
          
          <button
            onClick={shareProduct}
            className="px-6 py-3 border rounded-xl flex items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Contact {product.farm_name || "Farmer"}</h3>
            
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
                className="w-full flex items-center gap-3 p-3 bg-emerald-600 text-white rounded-xl"
              >
                <MessageCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Chat In-App</p>
                  <p className="text-sm text-emerald-200">Message seller directly</p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowContact(false)}
              className="w-full mt-4 p-3 border rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
