'use client';

import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Check, Plus, Minus } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useRouter } from 'next/navigation';

export default function ProductDetailActions({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    router.push('/checkout');
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center border-2 border-[#144732]/20 rounded-2xl p-1 bg-[#faf8f4]">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-black text-sm text-[#144732]">
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            added
              ? 'bg-[#22c55e] text-white'
              : 'bg-[#144732] hover:bg-[#0b2b1e] text-white hover:shadow-lg hover:shadow-[#144732]/20'
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              <span>कार्ट में जोड़ा गया (Added!)</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart (कार्ट में जोड़ें)</span>
            </>
          )}
        </button>
      </div>

      {/* Buy Now Button */}
      <button
        onClick={handleBuyNow}
        className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-[#d4a359] via-[#fef08a] to-[#bc853c] text-[#0b2b1e] hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4a359]/20 cursor-pointer"
      >
        <span>तुरंत खरीदें (Buy Now)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
