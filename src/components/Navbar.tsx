'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck, 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  LogIn, 
  Image as ImageIcon,
  Layers,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{
    isLoggedIn: boolean;
    isAdminActive: boolean;
    user: { userCode?: string; name?: string } | null;
  }>({
    isLoggedIn: false,
    isAdminActive: false,
    user: null,
  });

  // Check auth state on mount and sync with backend
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasAdmin = document.cookie.includes('sgm_admin_active=true');
      const hasUser = document.cookie.includes('sgm_user_active=true');
      setSession((prev) => ({
        ...prev,
        isAdminActive: hasAdmin,
        isLoggedIn: hasUser,
      }));
    }

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSession({
            isLoggedIn: data.isLoggedIn,
            isAdminActive: data.isAdminActive,
            user: data.user,
          });
        }
      })
      .catch(() => {});
  }, []);

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
    { label: 'Products (उत्पाद)', href: '/#products', icon: ShoppingBag },
    { label: 'Photo Gallery (गैलरी)', href: '/#gallery', icon: ImageIcon },
    { label: '16 Income Plan (प्लान)', href: '/#incomes', icon: TrendingUp },
    { label: 'Awards & Ranks (रिवार्ड्स)', href: '/#rewards', icon: Award },
    { label: 'Rules & Legal (नियम)', href: '/rules', icon: ShieldCheck },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e3d5]">
        {/* Top Banner Notice */}
        <div className="bg-[#0b2b1e] text-[#fef08a] px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold border-b border-[#d4a359]/30 tracking-wider flex items-center justify-between max-w-7xl mx-auto w-full overflow-hidden">
          <span className="truncate min-w-0 flex-1">🇮🇳 “बेरोजगारी और रोग मुक्त हो भारत हमारा” • SGM MART</span>
          <span className="text-[10px] sm:text-[11px] text-[#fef08a] font-bold shrink-0 ml-2">
            24x7 ऑनलाइन सपोर्ट
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between w-full min-w-0 gap-1.5 sm:gap-4">
          {/* LEFT: Hamburger Button on Mobile + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            {/* Mobile Hamburger on LEFT */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-200 text-[#144732] bg-[#faf8f4] hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Open Mobile Menu"
              title="Menu (मेनू)"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#d4a359] shadow-md group-hover:scale-105 transition-transform p-0.5 shrink-0">
                <img src="/sgm_logo.png" alt="SGM Mart Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="font-black text-base sm:text-2xl tracking-tight text-[#144732] leading-none truncate">
                  SGM MART
                </div>
                <div className="hidden xs:block text-[8px] sm:text-[10px] font-extrabold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-[#d4a359] mt-0.5 truncate">
                  Online Service
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-bold text-slate-700">
            <Link href="/" className="hover:text-[#144732] transition-colors">Home (होम)</Link>
            <Link href="/#products" className="hover:text-[#144732] transition-colors">Products (उत्पाद)</Link>
            <Link href="/#gallery" className="hover:text-[#144732] transition-colors">Gallery (गैलरी)</Link>
            <Link href="/#incomes" className="hover:text-[#144732] transition-colors">16 Income Plan</Link>
            <Link href="/rules" className="hover:text-[#144732] transition-colors">Rules & Legal</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Shopping Cart Icon */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center p-1 sm:p-1.5 hover:scale-110 active:scale-95 transition-transform shrink-0"
              title="Shopping Cart (शॉपिंग कार्ट)"
              aria-label="View Shopping Cart"
            >
              <span className="text-xl sm:text-2xl leading-none select-none">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-xs sm:text-sm font-black text-[#144732] leading-none select-none">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* When Logged In (Member): Show Member Dashboard button & Logout */}
            {session.isLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href="/dashboard"
                  className="px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#144732] text-[#fef08a] font-black text-[11px] sm:text-sm hover:bg-[#0b2b1e] transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm shrink-0"
                  title="Member Dashboard"
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Dashboard</span>
                </Link>
                <a
                  href="/api/auth/logout?target=user&redirect=/login"
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors shrink-0 flex items-center justify-center"
                  title="लॉगआउट करें (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            ) : session.isAdminActive ? (
              /* When Logged In (Admin): Show Admin Desk button & Logout */
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href="/admin/dashboard"
                  className="px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#18181b] text-[#fef08a] border border-white/20 font-black text-[11px] sm:text-sm hover:bg-black transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm shrink-0"
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                  <span className="hidden xs:inline">Admin Desk</span>
                  <span className="xs:hidden">Admin</span>
                </Link>
                <a
                  href="/api/auth/logout?target=admin&redirect=/adminlogin"
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors shrink-0 flex items-center justify-center"
                  title="एडमिन लॉगआउट (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            ) : (
              /* When Guest: Show Sign In and Join Free */
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Side Panel Drawer from LEFT - Rendered outside header with z-[99999] */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Side Panel Drawer (Slide from LEFT) */}
          <div className="fixed top-0 left-0 bottom-0 w-[85%] sm:w-80 max-w-full bg-white text-slate-800 shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
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

              {/* If Logged In: Show Member Identity & Quick Dashboard Link */}
              {session.isLoggedIn ? (
                <div className="p-4 bg-[#faf8f4] border-b border-[#e8e3d5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#144732] text-[#fef08a] font-black text-sm flex items-center justify-center shadow">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#144732]">
                        {session.user?.name || 'Member Active'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {session.user?.userCode || 'SGM Member'}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#144732] text-[#fef08a] font-black text-xs hover:bg-[#0b2b1e] transition-colors shadow-sm"
                  >
                    डैशबोर्ड →
                  </Link>
                </div>
              ) : session.isAdminActive ? (
                /* When Logged In as Admin: Show Admin Identity & Quick Desk Link */
                <div className="p-4 bg-[#18181b] border-b border-white/10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#d4a359] font-black text-sm flex items-center justify-center border border-white/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        Admin Desk Active
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        Staff Administration
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#d4a359] text-[#0b2b1e] font-black text-xs hover:bg-[#bc853c] transition-colors shadow-sm"
                  >
                    एडमिन डेस्क →
                  </Link>
                </div>
              ) : (
                /* When Guest: Show Sign In and Join Free */
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
              )}

              {/* Main Navigation Links */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">
                  मुख्य पृष्ठ (Main Menu)
                </div>

                {mainLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-[#144732] hover:bg-[#144732]/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#144732]" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#e8e3d5] bg-[#fdfaf3] space-y-1">
              <div className="text-xs text-center font-bold text-[#144732]">
                SGM Mart Online Service Pvt. Ltd.
              </div>
              <div className="text-[10px] text-center text-slate-400">
                24x7 सपोर्ट टिकट प्रणाली • Always Transparent
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
