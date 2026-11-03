'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    mrp: number;
    dpPrice: number;
    pv: number;
    bv: number;
    isActivation?: boolean;
    description: string;
    category?: { name: string; slug: string };
    images?: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const discountPercent = Math.round(((product.mrp - product.dpPrice) / product.mrp) * 100);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-white border border-[#e8e3d5] hover:border-[#144732]/40 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Activation Package or Discount Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {product.isActivation && (
          <span className="bg-[#144732] text-[#fef08a] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            ⭐ एक्टिवेशन पैकेज
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-[#92580a] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      <div>
        {/* Product Image / Visual Showcase */}
        <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-2xl mb-4 bg-[#faf8f4] relative aspect-square flex items-center justify-center border border-[#e8e3d5]">
          {product.images && product.images.length > 0 && product.images[0] ? (
            <img 
              src={formatGoogleDriveUrl(product.images[0])} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#144732]/5 border-2 border-[#d4a359]/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
              {product.category?.slug === 'kitchen-care' ? '🍵' : 
               product.category?.slug === 'health-care' ? '🌿' : 
               product.category?.slug === 'personal-care' ? '✨' : 
               product.category?.slug === 'home-care' ? '🪔' : '📦'}
            </div>
          )}
        </Link>

        {/* Category & Title */}
        {product.category && (
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#92580a] mb-1">
            {product.category.name}
          </div>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-extrabold text-[#144732] text-base group-hover:text-[#92580a] transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* PV & BV Badges */}
        <div className="flex items-center gap-2 mt-3">
          <div className="px-2.5 py-1 rounded-lg bg-[#eaf5ed] border border-[#144732]/20 text-[#144732] text-xs font-black">
            {product.pv} PV
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#fdfaf3] border border-[#d4a359]/40 text-[#92580a] text-xs font-black">
            {product.bv} BV
          </div>
        </div>
      </div>

      {/* Pricing and Add to Cart Button */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-semibold line-through">
            MRP ₹{product.mrp}
          </div>
          <div className="text-xl font-black text-[#144732] leading-none">
            ₹{product.dpPrice} <span className="text-[11px] font-bold text-slate-500">DP</span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm ${
            added
              ? 'bg-[#22c55e] text-white scale-95'
              : 'bg-[#144732] hover:bg-[#0b2b1e] text-white hover:shadow-md hover:shadow-[#144732]/20'
          }`}
          title="Add to Cart"
        >
          {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
