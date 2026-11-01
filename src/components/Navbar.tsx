'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Users, Sparkles, PhoneCall, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8e3d5]">
      {/* Top Banner Notice */}
      <div className="bg-[#0b2b1e] text-[#fef08a] px-4 py-1.5 text-xs font-bold text-center border-b border-[#d4a359]/30 tracking-wider flex items-center justify-between max-w-7xl mx-auto">
        <span className="hidden sm:inline">🇮🇳 “बेरोजगारी और रोग मुक्त हो भारत हमारा” • SGM MART ONLINE SERVICE</span>
        <span className="sm:hidden">SGM MART ONLINE SERVICE</span>
        <span className="text-[11px] text-slate-300 font-normal">हेल्पलाइन: <strong className="text-[#fef08a]">6267392508</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#d4a359] shadow-md group-hover:scale-105 transition-transform p-0.5">
            <img src="/sgm_logo.png" alt="SGM Mart Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-black text-2xl tracking-tight text-[#144732] leading-none">
              SGM MART
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#d4a359] mt-0.5">
              Online Service
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-700">
          <Link href="/" className="hover:text-[#144732] transition-colors">Home (होम)</Link>
          <Link href="/store" className="hover:text-[#144732] transition-colors">All Products (उत्पाद)</Link>
          <Link href="/#incomes" className="hover:text-[#144732] transition-colors">16 Income Plan</Link>
          <Link href="/#compliance" className="hover:text-[#144732] transition-colors">Rules & Legal</Link>
        </nav>

        {/* Right Action Buttons & Cart */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#144732] hover:border-[#144732] transition-all bg-[#faf8f4]"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#144732]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#92580a] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/login"
            className="px-4 py-2.5 rounded-xl border-2 border-[#144732] text-[#144732] font-bold text-sm hover:bg-[#144732] hover:text-white transition-all duration-200"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="hidden sm:flex px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#144732]/20 transition-all duration-200 items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#fef08a]" />
            <span>Join Free</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
