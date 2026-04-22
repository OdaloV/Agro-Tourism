"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function PostProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    price: "",
    stock: "",
    unit_type: "kg",
    description: "",
  });

  const categories = ["Vegetables", "Fruits", "Dairy", "Eggs", "Meat", "Honey", "Grains", "Herbs", "Other"];
  const unitTypes = ["kg", "piece", "bunch", "liter", "dozen", "basket"];

  useEffect(() => {
    const fetchFarmerProfile = async () => {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/auth/login/farmer");
        return;
      }
      
      const user = JSON.parse(userData);
      
      try {
        const response = await fetch(`/api/farmer/profile?userId=${user.id}`);
        if (response.ok) {
          const profile = await response.json();
          setFarmerProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching farmer profile:", error);
      }
    };
    
    fetchFarmerProfile();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotos([...photos, ...files]);
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerProfile) {
      alert("Please wait for profile to load");
      return;
    }
    
    setLoading(true);
    
    const photoBase64 = await Promise.all(
      photos.map(async (photo) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
      })
    );
    
    const productData = {
      product_name: formData.product_name,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.stock) || 0,
      unit_type: formData.unit_type,
      description: formData.description || null,
      photos: photoBase64,
      location: farmerProfile.farm_location,
      phone: farmerProfile.phone,
      email: farmerProfile.email,
      farmer_id: farmerProfile.user_id,
    };
    
    try {
      const response = await fetch("/api/marketplace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (response.ok) {
        router.push("/farmer/marketplace/my-products");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to post product");
      }
    } catch (error) {
      console.error("Error posting product:", error);
      alert("Failed to post product");
    } finally {
      setLoading(false);
    }
  };

  if (!farmerProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <Link href="/farmer/marketplace/my-products" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="h-5 w-5" />
          Back to My Products
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Sell Product</h1>
      
      <div className="bg-emerald-50 p-4 rounded-xl mb-6">
        <h3 className="font-semibold text-emerald-800 mb-2">Farm Information</h3>
        <p className="text-emerald-700"><strong>Farm:</strong> {farmerProfile.farm_name}</p>
        <p className="text-emerald-700"><strong>Location:</strong> {farmerProfile.farm_location}</p>
        <p className="text-emerald-700"><strong>Contact:</strong> {farmerProfile.phone} | {farmerProfile.email}</p>
        <p className="text-xs text-emerald-500 mt-2">This information will be shown to buyers</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photos */}
        <div>
          <label className="block font-medium mb-2">Photos (up to 10)</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photoPreviews.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {photoPreviews.length < 10 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <Plus className="h-8 w-8 text-gray-400" />
              </label>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block font-medium mb-2">Product Name *</label>
          <input
            required
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="w-full p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
            placeholder="e.g., Fresh Tomatoes"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-2">Category *</label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select category</option>
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2">Price per {formData.unit_type} (KES) *</label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
              placeholder="500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Stock Available ({formData.unit_type}) *</label>
            <div className="flex gap-2">
              <input
                required
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="flex-1 p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
                placeholder="10"
              />
              <select
                value={formData.unit_type}
                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                className="w-24 p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
              >
                {unitTypes.map(unit => <option key={unit}>{unit}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Example: 10 kg available at KES 500 per kg</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
            placeholder="Describe your product..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {loading ? "Posting..." : "Post Product"}
        </button>
      </form>
    </div>
  );
}
