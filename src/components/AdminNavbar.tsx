'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileCheck, 
  Wallet, 
  Layers, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ExternalLink,
  Clock,
  Package,
  Image as ImageIcon,
  ArrowLeftRight,
  Sliders,
  Settings
} from 'lucide-react';

interface AdminNavbarProps {
  title?: string;
  subtitle?: string;
  role?: string;
  username?: string;
  isSuperAdmin?: boolean;
}

export default function AdminNavbar({
  title = 'SGM Mart Staff Admin Desk',
  subtitle = 'Staff Management Console',
  role = 'STAFF_ADMIN',
  username = 'Administrator',
  isSuperAdmin = false,
}: AdminNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const navLinks = [
    { label: 'Admin Dashboard (डैशबोर्ड)', href: isSuperAdmin ? '/superadmin/dashboard' : '/admin/dashboard', icon: Layers },
    { label: 'System Settings (प्लान, बैकअप, नोटिस)', href: '/admin/settings', icon: Sliders },
    { label: 'Inventory Desk (इन्वेंट्री व उत्पाद)', href: '/admin/inventory', icon: Package },
    { label: 'Photo Gallery (फोटो गैलरी)', href: '/admin/gallery', icon: ImageIcon },
    { label: 'KYC Verification (केवाईसी सत्यापन)', href: '/admin/kyc', icon: FileCheck },
    { label: 'Withdrawal Approvals (विड्रॉल अप्रूवल)', href: '/admin/withdrawals', icon: Wallet },
    { label: 'Genealogy Network (बाइनरी ट्री)', href: '/genealogy/binary', icon: Users },
    { label: 'Public Store (स्टोर व्यू)', href: '/store', icon: ShoppingBag },
    { label: 'Trigger Daily Closing (दैनिक क्लोजिंग)', href: '/api/cron/daily-closing', icon: Clock, external: true },
  ];

  const logoutHref = isSuperAdmin ? '/superadminlogin' : '/adminlogin';

  return (
    <>
      <header className={`sticky top-0 z-40 border-b ${
        isSuperAdmin 
          ? 'bg-[#0b2b1e] border-[#d4a359]/30 text-white' 
          : 'bg-white border-[#e8e3d5] text-[#2d3748]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link href={isSuperAdmin ? '/superadmin/dashboard' : '/admin/dashboard'} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5 border shadow-sm ${
              isSuperAdmin 
                ? 'bg-[#051810] border-[#d4a359]' 
                : 'bg-white border-[#d4a359]'
            }`}>
              <img src="/sgm_logo.png" alt="SGM Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className={`font-black text-base sm:text-lg leading-none ${
                isSuperAdmin ? 'text-[#fef08a]' : 'text-[#144732]'
              }`}>
                {title}
              </div>
              <div className={`text-[10px] font-extrabold uppercase tracking-widest mt-0.5 ${
                isSuperAdmin ? 'text-[#d4a359]' : 'text-[#92580a]'
              }`}>
                {role} • {username}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold">
            <Link 
              href={isSuperAdmin ? '/superadmin/dashboard' : '/admin/dashboard'} 
              className={`hover:underline transition-colors ${isSuperAdmin ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#144732]'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/settings" 
              className={`flex items-center gap-1 font-black px-2.5 py-1 rounded-lg border transition-all ${
                isSuperAdmin 
                  ? 'bg-[#144732] border-[#d4a359] text-[#fef08a] hover:bg-[#1b5e43]' 
                  : 'bg-[#fdfaf3] border-[#d4a359] text-[#92580a] hover:bg-[#faf4e6]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
            <Link 
              href="/admin/inventory" 
              className={`hover:underline transition-colors ${isSuperAdmin ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#144732]'}`}
            >
              Inventory
            </Link>
            <Link 
              href="/admin/gallery" 
              className={`hover:underline transition-colors ${isSuperAdmin ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#144732]'}`}
            >
              Gallery
            </Link>
            <Link 
              href="/admin/kyc" 
              className={`hover:underline transition-colors ${isSuperAdmin ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#144732]'}`}
            >
              KYC Desk
            </Link>
            <Link 
              href="/admin/withdrawals" 
              className={`hover:underline transition-colors ${isSuperAdmin ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#144732]'}`}
            >
              Withdrawals
            </Link>
            <Link 
              href="/genealogy/binary" 
              className={`hover:underline transition-colors ${isSuperAdmin ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#144732]'}`}
            >
              Genealogy
            </Link>
          </nav>

          {/* Right Area: Desktop Switch Button + Desktop Logout + Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/api/auth/switch-portal?target=member"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all shadow-sm ${
                isSuperAdmin
                  ? 'bg-[#144732] border-[#d4a359] text-[#fef08a] hover:bg-[#1b5e43]'
                  : 'bg-[#faf8f4] border-[#d4a359] text-[#144732] hover:bg-[#eaf5ed]'
              }`}
              title="सदस्य पोर्टल में जाएँ (Switch to Member Portal)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Switch to Member (मेम्बर पोर्टल)</span>
            </a>

            <Link
              href={logoutHref}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isSuperAdmin 
                  ? 'border-red-500/50 text-red-400 hover:bg-red-950/40' 
                  : 'border-red-200 text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Link>

            {/* Mobile Hamburger (3 parallel lines) Button */}
            <button
              onClick={() => setIsOpen(true)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                isSuperAdmin
                  ? 'border-[#d4a359]/40 text-[#fef08a] hover:bg-[#144732]'
                  : 'border-slate-200 text-[#144732] hover:bg-slate-100'
              }`}
              aria-label="Open Admin Menu"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Drawer Panel for Mobile/Tablet - Rendered outside with z-[99999] */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Panel (Slide from Right, strictly in front of all page elements) */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] sm:w-96 max-w-full bg-white text-slate-800 shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 border border-[#d4a359]">
                    <img src="/sgm_logo.png" alt="SGM Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-black text-base text-[#fef08a] leading-none">
                      Admin Side Panel
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono mt-1">
                      {role} ({username})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="px-5 py-3 bg-[#fdf8ee] border-b border-[#e8e3d5] text-xs text-[#92580a] font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#92580a]" />
                  <span>Authorized Staff Access Area</span>
                </div>
              </div>

              {/* 1-Click Switch to Member Portal Button */}
              <div className="p-3.5 bg-[#fdfaf3] border-b border-[#e8e3d5]">
                <a
                  href="/api/auth/switch-portal?target=member"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-[#fef08a] font-black text-xs shadow-md transition-all"
                >
                  <ArrowLeftRight className="w-4 h-4 text-[#d4a359]" />
                  <span>सदस्य पोर्टल में जाएँ (Switch to Member)</span>
                </a>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-2">
                  एडमिनिस्ट्रेटिव मेनू (Admin Actions)
                </div>

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold text-slate-700 hover:text-[#144732] hover:bg-[#144732]/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#144732] group-hover:scale-110 transition-transform" />
                        <span>{link.label}</span>
                      </div>
                      {link.external && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                    </Link>
                  );
                })}
              </div>

              <div className="px-4 pt-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-2">
                  त्वरित पोर्टल (Quick Portals)
                </div>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Public Storefront (वेबसाइट देखें)</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Member Dashboard (मेम्बर पोर्टल)</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <Link
                href={logoutHref}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 text-white font-black text-sm hover:bg-red-700 shadow-md transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Admin Logout (लॉगआउट)</span>
              </Link>
              <div className="text-[10px] text-center text-slate-400">
                SGM Mart Online Service Pvt. Ltd. • Secure Admin Session
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
