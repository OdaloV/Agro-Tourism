"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PostProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    price: "",
    quantity: "",
    unit_type: "kg",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
  });

  const categories = ["Vegetables", "Fruits", "Dairy", "Eggs", "Meat", "Honey", "Grains", "Herbs", "Other"];

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setFarmerId(user.id);
      setFormData(prev => ({
        ...prev,
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
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
    if (!farmerId) {
      alert("Please login first");
      return;
    }
    
    setLoading(true);
    
    // Convert photos to base64
    const photoBase64 = await Promise.all(
      photos.map(async (photo) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
      })
    );
    
    const response = await fetch("/api/marketplace/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        photos: photoBase64,
        farmer_id: farmerId,
      }),
    });
    
    if (response.ok) {
      router.push("/farmer/marketplace/my-products");
    } else {
      alert("Failed to post product");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Sell Product</h1>
      
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
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <span className="text-2xl text-gray-400">+</span>
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
            className="w-full p-3 border rounded-xl"
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
            className="w-full p-3 border rounded-xl"
          >
            <option value="">Select category</option>
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2">Price (KES) *</label>
            <input
              required
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border rounded-xl"
              placeholder="500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Quantity *</label>
            <div className="flex gap-2">
              <input
                required
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="flex-1 p-3 border rounded-xl"
                placeholder="10"
              />
              <select
                value={formData.unit_type}
                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                className="w-24 p-3 border rounded-xl"
              >
                <option>kg</option>
                <option>piece</option>
                <option>bunch</option>
                <option>liter</option>
                <option>dozen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium mb-2">Farm Location *</label>
          <input
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-3 border rounded-xl"
            placeholder="Nairobi, Kenya"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-xl"
            placeholder="Describe your product..."
          />
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="space-y-3">
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border rounded-xl"
              placeholder="Phone number"
            />
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border rounded-xl"
              placeholder="Email address"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Product"}
        </button>
      </form>
    </div>
  );
}
