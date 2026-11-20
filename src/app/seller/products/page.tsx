'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  Search,
  SlidersHorizontal,
  IndianRupee,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';

interface SellerProduct {
  id: string;
  productId: string;
  sellerProductId?: string;
  name: string;
  brand: string;
  unit: string;
  categorySlug: string;
  categoryName: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  availableStock: number;
  isActive: boolean;
  imageUrl?: string;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Active editing states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/seller/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.warn('Failed to load seller products:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle saving updated selling price
  async function handleSavePrice(productId: string, mrp: number) {
    if (tempPrice <= 0) {
      setStatusMessage({ text: 'Selling price must be greater than 0.', isError: true });
      return;
    }
    if (tempPrice > mrp) {
      setStatusMessage({
        text: `Selling price (₹${tempPrice}) cannot exceed Base MRP (₹${mrp}).`,
        isError: true,
      });
      return;
    }

    setSavingId(productId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/seller/products/${productId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellingPrice: tempPrice }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to update price.', isError: true });
      } else {
        setStatusMessage({ text: 'Selling price updated successfully!', isError: false });
        setEditingPriceId(null);
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  sellingPrice: tempPrice,
                  discountPercentage: Math.round(((p.mrp - tempPrice) / p.mrp) * 100),
                }
              : p
          )
        );
      }
    } catch {
      setStatusMessage({ text: 'Network error updating price.', isError: true });
    } finally {
      setSavingId(null);
    }
  }

  // Handle saving updated stock
  async function handleSaveStock(productId: string) {
    if (tempStock < 0) {
      setStatusMessage({ text: 'Stock cannot be negative.', isError: true });
      return;
    }

    setSavingId(productId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/seller/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: tempStock }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to update stock.', isError: true });
      } else {
        setStatusMessage({ text: 'Stock quantity updated successfully!', isError: false });
        setEditingStockId(null);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, availableStock: tempStock } : p))
        );
      }
    } catch {
      setStatusMessage({ text: 'Network error updating stock.', isError: true });
    } finally {
      setSavingId(null);
    }
  }

  // Filter products by search and stock status
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStock === 'LOW') {
      return p.availableStock > 0 && p.availableStock < 5;
    }
    if (filterStock === 'OUT') {
      return p.availableStock <= 0;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Products &amp; Stock Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict seller isolation &bull; Real-time pricing &amp; inventory control
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
            <span>Refresh Catalog</span>
          </button>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
              statusMessage.isError
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-black uppercase tracking-wider underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Stock Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, brand, or category..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStock('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                filterStock === 'ALL'
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilterStock('LOW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                filterStock === 'LOW'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Low Stock (&lt;5)
            </button>
            <button
              onClick={() => setFilterStock('OUT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                filterStock === 'OUT'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading seller catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No products found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery
              ? `No catalog items match "${searchQuery}".`
              : 'No products currently mapped to your seller account.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredProducts.map((p) => {
            const isEditingPrice = editingPriceId === p.id;
            const isEditingStock = editingStockId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Product Title and Brand */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      {p.brand} &bull; {p.categoryName}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="text-[11px] text-slate-500">Unit: {p.unit}</div>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="shrink-0">
                    {p.availableStock <= 0 ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                        Out of Stock
                      </span>
                    ) : p.availableStock < 5 ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md animate-pulse">
                        Low ({p.availableStock})
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        In Stock ({p.availableStock})
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Stock Controls Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {/* Price Block */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Selling Price</span>
                      <span className="line-through text-slate-400">MRP ₹{p.mrp}</span>
                    </div>

                    {isEditingPrice ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-600">₹</span>
                          <input
                            type="number"
                            min="1"
                            max={p.mrp}
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFD000]"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSavePrice(p.id, p.mrp)}
                            disabled={savingId === p.id}
                            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-0.5"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="text-sm font-black text-slate-900">
                          ₹{p.sellingPrice}
                          <span className="text-[10px] font-bold text-emerald-600 ml-1">
                            ({p.discountPercentage}% OFF)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingPriceId(p.id);
                            setTempPrice(p.sellingPrice);
                          }}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                          title="Edit selling price"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stock Block */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Available Stock
                    </div>

                    {isEditingStock ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={tempStock}
                            onChange={(e) => setTempStock(Math.max(0, Number(e.target.value)))}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFD000]"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSaveStock(p.id)}
                            disabled={savingId === p.id}
                            className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-0.5"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="text-sm font-black text-slate-900">
                          {p.availableStock} units
                        </div>
                        <button
                          onClick={() => {
                            setEditingStockId(p.id);
                            setTempStock(p.availableStock);
                          }}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                          title="Edit stock quantity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
