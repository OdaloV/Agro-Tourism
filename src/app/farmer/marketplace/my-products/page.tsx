"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm("Delete this product?")) {
      await fetch(`/api/marketplace/products/${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/farmer/marketplace/post">
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
            + Add Product
          </button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No products yet</p>
          <Link href="/farmer/marketplace/post">
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
              Post Your First Product
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 border rounded-xl">
              {product.photos?.[0] && (
                <img src={product.photos[0]} className="w-24 h-24 object-cover rounded-lg" alt={product.product_name} />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{product.product_name}</h3>
                <p className="text-emerald-600 font-bold">KES {product.price} / {product.unit_type}</p>
                <p className="text-sm text-gray-500">Stock: {product.quantity} | Views: {product.views}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="text-red-500 px-3 py-1 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
