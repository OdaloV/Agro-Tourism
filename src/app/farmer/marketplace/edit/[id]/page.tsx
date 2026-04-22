"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
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
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/marketplace/products/${productId}`);
        if (response.ok) {
          const product = await response.json();
          setFormData({
            product_name: product.product_name,
            category: product.category,
            price: product.price.toString(),
            stock: product.quantity.toString(),
            unit_type: product.unit_type,
            description: product.description || "",
          });
          setExistingPhotos(product.photos || []);
        } else {
          alert("Product not found");
          router.push("/farmer/marketplace/my-products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setFetching(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewPhotos([...newPhotos, ...files]);
    setNewPhotoPreviews([...newPhotoPreviews, ...newPreviews]);
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPhotoPreviews[index]);
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
    setNewPhotoPreviews(newPhotoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert new photos to base64
    const newPhotoBase64 = await Promise.all(
      newPhotos.map(async (photo) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
      })
    );
    
    const allPhotos = [...existingPhotos, ...newPhotoBase64];
    
    const productData = {
      product_name: formData.product_name,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.stock) || 0,
      unit_type: formData.unit_type,
      description: formData.description || null,
      photos: allPhotos,
    };
    
    try {
      const response = await fetch(`/api/marketplace/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (response.ok) {
        router.push("/farmer/marketplace/my-products");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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

      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photos */}
        <div>
          <label className="block font-medium mb-2">Photos</label>
          
          {existingPhotos.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Current Photos:</p>
              <div className="grid grid-cols-3 gap-2">
                {existingPhotos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={photo} className="w-full h-full object-cover" alt={`Product ${i + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {newPhotoPreviews.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">New Photos to Add:</p>
              <div className="grid grid-cols-3 gap-2">
                {newPhotoPreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <Plus className="h-4 w-4" />
            Add More Photos
            <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>

        {/* Product Name */}
        <div>
          <label className="block font-medium mb-2">Product Name *</label>
          <input
            required
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="w-full p-3 border rounded-xl focus:outline-none focus:border-emerald-500"
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
              className="w-full p-3 border rounded-xl"
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
                className="flex-1 p-3 border rounded-xl"
              />
              <select
                value={formData.unit_type}
                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                className="w-24 p-3 border rounded-xl"
              >
                {unitTypes.map(unit => <option key={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <div className="flex gap-3">
          <Link href="/farmer/marketplace/my-products" className="flex-1">
            <button type="button" className="w-full p-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
