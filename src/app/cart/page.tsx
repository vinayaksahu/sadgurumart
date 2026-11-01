'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalMrp,
    totalDp,
    totalSavings,
    totalPV,
    totalBV,
    itemCount,
  } = useCart();

  const deliveryFee = totalDp >= 500 || totalDp === 0 ? 0 : 50;
  const finalTotal = totalDp + deliveryFee;

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#144732] tracking-tight">
              Shopping Cart (शॉपिंग कार्ट)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {itemCount} उत्पाद कार्ट में उपलब्ध हैं
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart (खाली करें)</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto my-12">
            <div className="w-20 h-20 rounded-full bg-[#faf8f4] border-2 border-[#d4a359]/30 flex items-center justify-center text-4xl mx-auto mb-4">
              🛒
            </div>
            <h2 className="text-xl font-black text-[#144732]">आपकी कार्ट खाली है</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              SGM Mart के दैनिक किचन, हेल्थ और पर्सनल केयर उत्पाद डिस्काउंटेड DP मूल्य पर खरीदें।
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#144732] text-white font-bold text-sm hover:bg-[#0b2b1e] transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>उत्पाद देखें (Explore Store)</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#e8e3d5] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-20 h-20 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] flex items-center justify-center text-3xl flex-shrink-0">
                      🍃
                    </div>
                    <div>
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-extrabold text-[#144732] text-base hover:text-[#92580a] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-[#144732]">₹{item.dpPrice}</span>
                        <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                        <span className="text-[10px] font-bold text-[#92580a] bg-[#fdfaf3] px-2 py-0.5 rounded-md border border-[#d4a359]/30">
                          {item.pv} PV | {item.bv} BV
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#144732]/20 rounded-xl p-1 bg-[#faf8f4]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-black text-xs text-[#144732]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div className="font-black text-base text-[#144732]">
                        ₹{item.dpPrice * item.quantity}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {item.pv * item.quantity} PV
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Summary Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border-2 border-[#144732]/20 rounded-3xl p-6 shadow-xl sticky top-28 space-y-6">
                <h2 className="text-lg font-black text-[#144732] pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4a359]" />
                  <span>Order Summary (ऑर्डर सारांश)</span>
                </h2>

                {/* MLM Points Accrual */}
                <div className="p-3.5 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-[#144732]">
                    <span>कुल मैचिंग PV अर्जित:</span>
                    <span className="font-black text-sm">{totalPV} PV</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#92580a]">
                    <span>कुल रीपरचेस BV अर्जित:</span>
                    <span className="font-black text-sm">{totalBV} BV</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-[#144732]/10">
                    * ऑर्डर डिलीवरी के उपरांत यह पॉइंट्स आपके बिज़नेस वॉल्यूम में जुड़ जाएंगे।
                  </div>
                </div>

                {/* Billing Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>कुल MRP मूल्य:</span>
                    <span className="line-through">₹{totalMrp}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>डिस्ट्रीब्यूटर डिस्काउंट बचत:</span>
                    <span>- ₹{totalSavings}</span>
                  </div>

                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>DP सबटोटल:</span>
                    <span>₹{totalDp}</span>
                  </div>

                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>डिलीवरी चार्ज:</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-700">निःशुल्क (FREE)</strong> : `₹${deliveryFee}`}</span>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-center text-lg font-black text-[#144732]">
                    <span>कुल देय राशि:</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4a359] via-[#fef08a] to-[#bc853c] text-[#0b2b1e] font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4a359]/25 cursor-pointer"
                >
                  <span>चेकआउट आगे बढ़ें (Checkout)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#144732]" />
                  <span>100% सुरक्षित भुगतान एवं पारदर्शी बिलिंग</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
