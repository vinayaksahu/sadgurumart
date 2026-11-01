'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck, 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  Award, 
  Layers, 
  Wallet, 
  FileCheck, 
  Smartphone,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when side panel is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const mainLinks = [
    { label: 'Home (होम)', href: '/', icon: Home },
    { label: 'All Products (उत्पाद)', href: '/store', icon: ShoppingBag },
    { label: '16 Income Plan (प्लान)', href: '/#incomes', icon: TrendingUp },
    { label: 'Awards & Ranks (रिवार्ड्स)', href: '/#rewards', icon: Award },
    { label: 'Rules & Legal (नियम)', href: '/#compliance', icon: ShieldCheck },
  ];

  const memberLinks = [
    { label: 'Member Dashboard (डैशबोर्ड)', href: '/dashboard', icon: Layers, badge: 'Member' },
    { label: 'Binary Tree (बाइनरी ट्री)', href: '/genealogy/binary', icon: Users },
    { label: '2x2 AutoPool (ऑटोपूल)', href: '/autopool', icon: TrendingUp, badge: '₹13 Cr+' },
    { label: 'Payout / Withdrawal (विड्रॉल)', href: '/payout', icon: Wallet },
    { label: 'KYC Verification (केवाईसी)', href: '/kyc', icon: FileCheck },
    { label: 'Mobile/DTH Recharge (रिचार्ज)', href: '/recharge', icon: Smartphone, badge: '2.5% Off' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e3d5]">
        {/* Top Banner Notice */}
        <div className="bg-[#0b2b1e] text-[#fef08a] px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold border-b border-[#d4a359]/30 tracking-wider flex items-center justify-between max-w-7xl mx-auto">
          <span className="truncate">🇮🇳 “बेरोजगारी और रोग मुक्त हो भारत हमारा” • SGM MART</span>
          <span className="text-[10px] sm:text-[11px] text-slate-300 font-normal shrink-0 ml-2">
            हेल्पलाइन: <a href="tel:6267392508" className="text-[#fef08a] font-bold hover:underline">6267392508</a>
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#d4a359] shadow-md group-hover:scale-105 transition-transform p-0.5">
              <img src="/sgm_logo.png" alt="SGM Mart Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-black text-xl sm:text-2xl tracking-tight text-[#144732] leading-none">
                SGM MART
              </div>
              <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#d4a359] mt-0.5">
                Online Service
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-bold text-slate-700">
            <Link href="/" className="hover:text-[#144732] transition-colors">Home (होम)</Link>
            <Link href="/store" className="hover:text-[#144732] transition-colors">All Products (उत्पाद)</Link>
            <Link href="/#incomes" className="hover:text-[#144732] transition-colors">16 Income Plan</Link>
            <Link href="/dashboard" className="hover:text-[#144732] transition-colors text-[#92580a]">Member Portal</Link>
            <Link href="/#compliance" className="hover:text-[#144732] transition-colors">Rules & Legal</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shopping Cart Icon (Visible on all screens) */}
            <Link
              href="/cart"
              className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#144732] hover:border-[#144732] transition-all bg-[#faf8f4]"
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#144732]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#92580a] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Desktop Sign In / Join Buttons */}
            <Link
              href="/login"
              className="hidden md:inline-flex px-3.5 py-2 rounded-xl border-2 border-[#144732] text-[#144732] font-bold text-xs sm:text-sm hover:bg-[#144732] hover:text-white transition-all duration-200"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-[#144732]/20 transition-all duration-200 items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fef08a]" />
              <span>Join Free</span>
            </Link>

            {/* Mobile & Tablet Hamburger Button (3 Parallel Lines) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 text-[#144732] bg-[#faf8f4] hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Open Mobile Menu"
              title="Menu (मेनू)"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Side Panel Drawer - Rendered outside header with z-[99999] */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Side Panel Drawer (Slide from Right, strictly in front of all page elements) */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] sm:w-96 max-w-full bg-white text-slate-800 shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#e8e3d5] flex items-center justify-between bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#d4a359]">
                    <img src="/sgm_logo.png" alt="SGM Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-black text-lg text-[#fef08a] leading-none">
                      SGM MART
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-[#d4a359] font-bold mt-0.5">
                      Online Service
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Auth Actions inside Drawer */}
              <div className="p-4 bg-[#faf8f4] border-b border-[#e8e3d5] grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-[#144732] text-[#144732] font-black text-xs hover:bg-[#144732] hover:text-white transition-all text-center"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In (लॉगिन)</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white font-black text-xs hover:opacity-90 shadow-md text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fef08a]" />
                  <span>Join Free</span>
                </Link>
              </div>

              {/* Main Navigation Links */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">
                  मुख्य पृष्ठ (Main Menu)
                </div>

                {mainLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-[#144732] hover:bg-[#144732]/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#144732] group-hover:scale-110 transition-transform" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#144732] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>

              {/* Member Services & Direct Selling Tools */}
              <div className="px-4 pb-4 space-y-1 border-t border-slate-100 pt-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#92580a] px-3 py-1.5">
                  मेम्बर टूल्स (Member Business Tools)
                </div>

                {memberLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-[#144732] hover:bg-[#144732]/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#92580a] group-hover:scale-110 transition-transform" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-[#144732]/10 text-[#144732]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer with Helpline */}
            <div className="p-4 border-t border-slate-100 bg-[#faf8f4] space-y-2">
              <a
                href="tel:6267392508"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-[#d4a359] text-[#144732] font-black text-xs shadow-sm hover:bg-slate-50 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-[#92580a]" />
                <span>कस्टमर केयर: 6267392508</span>
              </a>
              <div className="text-[9px] text-center text-slate-400">
                SGM Mart Online Service Pvt. Ltd. • “बेरोजगारी और रोग मुक्त हो भारत हमारा”
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
