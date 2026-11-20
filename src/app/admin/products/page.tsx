'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Store,
  Layers,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface MasterProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  unit: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  baseMrp: number;
  isActive: boolean;
  sellerCount: number;
  totalStock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch (err) {
      console.warn('Failed to load master products:', err);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique categories
  const categories = Array.from(new Set(products.map((p) => p.categoryName))).filter(Boolean);

  const filtered = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'ALL' || p.categoryName === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Master Products Catalog
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Platform canonical catalog &bull; Independent of seller prices &amp; inventory
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchProducts();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by brand, name, or SKU..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading master products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No products found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery ? `No products match "${searchQuery}".` : 'No products available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  <span>{p.brand}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {p.categoryName}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 line-clamp-2 mt-1">
                  {p.name}
                </h3>
                <div className="text-[11px] text-slate-500">Unit: {p.unit}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold">Base MRP</span>
                  <span className="font-black text-slate-900">₹{p.baseMrp}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sellers Offering</span>
                  </div>
                  <span className="font-bold text-slate-900">{p.sellerCount} Store(s)</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Aggregated Stock</span>
                  <span
                    className={`font-black ${
                      p.totalStock < 5 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {p.totalStock} units
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
