"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Plus, Trash2, Eye, Edit } from "lucide-react";

interface Product {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  unit_type: string;
  photos: string[];
  status: string;
  views: number;
  created_at: string;
}

export default function MyProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      router.push("/auth/login/farmer");
      return;
    }
    
    const user = JSON.parse(userData);
    fetchProducts(user.id);
  }, []);

  const fetchProducts = async (farmerId: number) => {
    try {
      const response = await fetch(`/api/marketplace/products/my?farmerId=${farmerId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm("Delete this product?")) {
      try {
        await fetch(`/api/marketplace/products/${id}`, { method: "DELETE" });
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
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
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">My Products</h1>
          <p className="text-emerald-600 mt-1">Manage your marketplace listings</p>
        </div>
        <Link href="/farmer/marketplace/post">
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-emerald-100">
          <Package className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-emerald-600 text-lg mb-2">No products yet</p>
          <p className="text-emerald-500 mb-6">Start selling by posting your first product</p>
          <Link href="/farmer/marketplace/post">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg">
              Post Your First Product
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition">
              {product.photos && product.photos.length > 0 && (
                <img src={product.photos[0]} className="w-full h-48 object-cover" alt={product.product_name} />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-emerald-900 text-lg">{product.product_name}</h3>
                <p className="text-emerald-600 font-bold mt-1">KES {product.price} / {product.unit_type}</p>
                <p className="text-sm text-gray-500 mt-1">Stock: {product.quantity} {product.unit_type} | Views: {product.views}</p>
                <div className="flex gap-2 mt-4">
                  <Link href={`/marketplace/product/${product.id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-1 px-3 py-2 border border-emerald-600 text-emerald-600 rounded-lg text-sm hover:bg-emerald-50">
                      <Eye className="h-4 w-4" /> View
                    </button>
                  </Link>
                  <Link href={`/farmer/marketplace/edit/${product.id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
