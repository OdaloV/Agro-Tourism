"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";

interface Product {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  unit_type: string;
  photos: string[];
  location: string;
  category: string;
  farmer_name: string;
  farm_name: string;
  created_at: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = ["All", "Vegetables", "Fruits", "Dairy", "Eggs", "Meat", "Honey", "Grains"];

  useEffect(() => {
    fetchProducts();
  }, [page, category, search]);

  const fetchProducts = async () => {
    try {
      const url = `/api/marketplace/products?page=${page}&limit=12&category=${category}&search=${search}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (page === 1) {
        setProducts(data.products);
      } else {
        setProducts([...products, ...data.products]);
      }
      setHasMore(data.products.length === 12);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          {categories.map(cat => (
            <option key={cat} value={cat === "All" ? "" : cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-64"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/marketplace/product/${product.id}`}>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                  {product.photos?.[0] && (
                    <img src={product.photos[0]} className="w-full h-48 object-cover" alt={product.product_name} />
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold line-clamp-1">{product.product_name}</h3>
                    <p className="text-emerald-600 font-bold mt-1">KES {product.price}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {product.location}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 border rounded-xl hover:bg-gray-50"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
