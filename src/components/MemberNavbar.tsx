'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  UserPlus,
  User,
  TrendingUp,
  Zap,
  Wallet,
  Users,
  Layers,
  ShoppingBag,
  Smartphone,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  HelpCircle
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

interface MemberNavbarProps {
  user?: {
    name?: string;
    userCode?: string;
    isActive?: boolean;
    rank?: string;
  } | null;
}

export default function MemberNavbar({ user: initialUser }: MemberNavbarProps) {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{
    name: string;
    userCode: string;
    isActive: boolean;
  }>({
    name: initialUser?.name || 'Member',
    userCode: initialUser?.userCode || 'SGM Member',
    isActive: initialUser?.isActive ?? true,
  });

  // Sync with /api/auth/me if not passed via props
  useEffect(() => {
    if (!initialUser?.userCode) {
      fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setSessionUser({
              name: data.user.name || 'Member',
              userCode: data.user.userCode || 'SGM Member',
              isActive: data.user.isActive ?? true,
            });
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  // Lock body scroll when side panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const registrationLink = `/register?ref=${encodeURIComponent(sessionUser.userCode || '')}`;

  const navMenuItems = [
    { label: 'Profile (प्रोफाइल व KYC)', href: '/kyc', icon: User },
    { label: 'My Income (16 इनकम व पेआउट)', href: '/payout', icon: TrendingUp },
    { label: 'Activation Fund (P2P फंड)', href: '/wallet', icon: Zap },
    { label: 'E-Wallet (वॉलेट व विड्रॉल)', href: '/wallet', icon: Wallet },
    { label: 'Genealogy (बाइनरी ट्री)', href: '/genealogy/binary', icon: Users },
    { label: 'AutoPool (2x2 ऑटोपूल)', href: '/autopool', icon: Layers },
    { label: 'My Orders (मेरे ऑर्डर्स)', href: '/orders', icon: ShoppingBag },
    { label: 'Complaint (शिकायत / सहायता)', href: 'https://wa.me/916267392508?text=Support%20Ticket', icon: HelpCircle },
    { label: 'Utility Recharge (रिचार्ज)', href: '/recharge', icon: Smartphone },
    { label: 'Shopping Store (स्टोर)', href: '/store', icon: ShoppingBag },
    { label: 'Main Website (वेबसाइट होम)', href: '/', icon: ExternalLink },
  ];

  return (
    <>
      {/* Top Portal Header Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white border-b border-[#d4a359]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between w-full min-w-0">
          {/* LEFT: Hamburger Menu Button (Opens Left Drawer) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#fef08a] border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Name */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#d4a359] shadow p-0.5 group-hover:scale-105 transition-transform">
                <img src="/sgm_logo.png" alt="SGM Mart Logo" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-lg tracking-tight text-white leading-none">
                  SGM MART
                </div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#fef08a] mt-0.5">
                  Member Portal
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER: Mobile Brand Title */}
          <div className="sm:hidden text-center">
            <span className="font-black text-base text-[#fef08a] tracking-tight">SGM MART</span>
            <span className="block text-[9px] text-slate-300 uppercase tracking-widest">Portal</span>
          </div>

          {/* RIGHT: Cart + User Profile Badge + Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#fef08a]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d4a359] text-[#0b2b1e] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Quick Member ID Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#d4a359] text-[#0b2b1e] font-black text-xs flex items-center justify-center">
                {sessionUser.name ? sessionUser.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="font-mono font-bold text-[#fef08a]">{sessionUser.userCode}</span>
            </div>

            {/* Logout Button */}
            <a
              href="/api/auth/logout?target=all&redirect=/login"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow border border-red-500/40"
              title="लॉगआउट (Logout)"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </a>
          </div>
        </div>
      </header>

      {/* Slide-out Left Side Panel Drawer - Rendered with z-[99999] */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Left Drawer Container (Slides from LEFT) */}
          <div className="fixed top-0 left-0 bottom-0 w-[84%] sm:w-80 max-w-full bg-white text-slate-800 shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              {/* Profile Card Header (Red/Orange Gradient matching user screenshot) */}
              <div className="bg-gradient-to-r from-[#d9381e] via-[#e25822] to-[#ea580c] text-white p-5 relative shadow-md">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                  {/* User Silhouette Avatar */}
                  <div className="w-16 h-16 rounded-full bg-white/95 p-1 border-2 border-white shadow-lg flex items-center justify-center text-[#d9381e] font-black text-2xl mb-2">
                    <User className="w-9 h-9 text-[#0284c7]" />
                  </div>
                  <div className="font-black text-base tracking-tight leading-tight">
                    {sessionUser.name}
                  </div>
                  <div className="text-xs font-mono font-bold text-white/90 mt-0.5">
                    ({sessionUser.userCode})
                  </div>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    sessionUser.isActive ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
                  }`}>
                    {sessionUser.isActive ? 'Active Member' : 'Pending Activation'}
                  </span>
                </div>
              </div>

              {/* Navigation Header Label */}
              <div className="px-5 pt-4 pb-2">
                <div className="text-xs font-black uppercase tracking-wider text-[#0284c7]">
                  Navigation
                </div>
              </div>

              {/* Action Buttons (Dashboard & New Registration in solid color) */}
              <div className="px-4 space-y-2 mb-3">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm text-white shadow-md transition-all ${
                    pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-[#d9381e] to-[#ea580c] ring-2 ring-[#ea580c]/50'
                      : 'bg-gradient-to-r from-[#d9381e] to-[#ea580c] hover:opacity-95'
                  }`}
                >
                  <Home className="w-5 h-5 text-white" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href={registrationLink}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-[#e25822] to-[#ea580c] hover:opacity-95 shadow-md transition-all"
                >
                  <UserPlus className="w-5 h-5 text-white" />
                  <span>New Registration</span>
                </Link>
              </div>

              {/* Detailed Menu List with '+' indicator matching screenshot */}
              <div className="px-3 divide-y divide-slate-100">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#144732]/10 text-[#144732] font-black'
                          : 'text-slate-700 hover:text-[#144732] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <span className="text-slate-400 font-bold text-sm">+</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <a
                href="/api/auth/logout?target=all&redirect=/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 shadow transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout (लॉगआउट)</span>
              </a>
              <div className="text-[10px] text-center text-slate-400">
                SGM Mart Online Service • Helpline: 6267392508
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}