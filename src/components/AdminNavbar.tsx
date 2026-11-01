'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  LayoutGrid, 
  LogOut, 
  MoreHorizontal,
  ExternalLink,
  User,
  ShieldCheck
} from 'lucide-react';

interface AdminNavbarProps {
  title?: string;
  subtitle?: string;
  role?: string;
  username?: string;
  isSuperAdmin?: boolean;
}

interface MenuItem {
  label: string;
  href: string;
  external?: boolean;
  badge?: string | number;
}

interface MenuGroup {
  id: string;
  title: string;
  badge?: string | number;
  items: MenuItem[];
}

export default function AdminNavbar({
  title = 'SGM Mart Staff Admin Desk',
  subtitle = 'Staff Management Console',
  role = 'STAFF_ADMIN',
  username = 'ADMIN ADMIN ()',
  isSuperAdmin = false,
}: AdminNavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [pendingFundCount, setPendingFundCount] = useState<number>(0);

  // Fetch pending fund requests notification count
  useEffect(() => {
    let isMounted = true;
    const fetchPendingFunds = async () => {
      try {
        const res = await fetch('/api/admin/funds?countOnly=true');
        const data = await res.json();
        if (isMounted && data.success && typeof data.pendingCount === 'number') {
          setPendingFundCount(data.pendingCount);
        }
      } catch (err) {
        // Silently catch in navbar
      }
    };
    fetchPendingFunds();
    const interval = setInterval(fetchPendingFunds, 30000); // Poll every 30 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  const toggleGroup = (groupId: string) => {
    setExpandedGroup((prev) => (prev === groupId ? null : groupId));
  };

  const logoutHref = `/api/auth/logout?target=${isSuperAdmin ? 'superadmin' : 'admin'}&redirect=/adminlogin`;
  const homeHref = isSuperAdmin ? '/superadmin/dashboard' : '/admin/dashboard';

  // 7 Admin Accordion Groups synchronized with distinct, purpose-built admin pages
  const menuGroups: MenuGroup[] = [
    {
      id: 'geneology',
      title: 'Geneology',
      items: [
        { label: 'Binary Tree', href: '/admin/genealogy' },
        { label: 'Downline Tree', href: '/admin/members?view=downline' },
        { label: 'Direct Referral List', href: '/admin/members?view=directs' },
      ],
    },
    {
      id: 'master',
      title: 'Master',
      items: [
        { label: 'Add Package', href: '/admin/settings?tab=plan' },
        { label: 'Package List', href: '/admin/settings?tab=plan' },
        { label: 'Add Product', href: '/admin/inventory?action=add' },
        { label: 'Product List', href: '/admin/inventory' },
        { label: 'Orders & Dispatch', href: '/admin/orders' },
      ],
    },
    {
      id: 'member-panel',
      title: 'Members & Network (मेंबर्स डायरेक्टरी)',
      items: [
        { label: 'Search Members', href: '/admin/members' },
        { label: 'Red Members List (Inactive)', href: '/admin/members?status=inactive' },
        { label: 'Green Members List (Active)', href: '/admin/members?status=active' },
        { label: 'Downline Members', href: '/admin/members?view=downline' },
        { label: 'Sponsor List', href: '/admin/members?view=sponsors' },
        { label: 'Customerwise Orders', href: '/admin/orders' },
        { label: 'Change Admin Password', href: '/admin/settings?tab=general' },
        { label: 'Add Admin User', href: '/admin/settings?tab=general' },
      ],
    },
    {
      id: 'payouts',
      title: 'Payouts',
      items: [
        { label: 'Pending Withdrawals', href: '/admin/withdrawals?status=pending' },
        { label: 'Approved Withdrawals', href: '/admin/withdrawals?status=approved' },
        { label: 'Daily Closing & Payout', href: '/admin/withdrawals?view=closing' },
        { label: 'TDS Deductions Report', href: '/admin/withdrawals?view=tds' },
      ],
    },
    {
      id: 'banking',
      title: 'Banking',
      items: [
        { label: 'Bank Details (KYC)', href: '/admin/kyc' },
        { label: 'TDS Reports', href: '/admin/withdrawals?view=tds' },
        { label: 'Add Expancess', href: '/admin/withdrawals?view=tds' },
        { label: 'Expancess List', href: '/admin/withdrawals?view=tds' },
        { label: 'Add Income', href: '/admin/withdrawals' },
        { label: 'Income List', href: '/admin/withdrawals' },
        { label: 'Add Advance', href: '/admin/withdrawals' },
        { label: 'Advance List', href: '/admin/withdrawals' },
      ],
    },
    {
      id: 'activation-fund',
      title: 'Activation Fund',
      badge: pendingFundCount > 0 ? pendingFundCount : undefined,
      items: [
        {
          label: 'Issue Fund',
          href: '/admin/funds',
          badge: pendingFundCount > 0 ? `${pendingFundCount} New` : undefined,
        },
        { label: 'Manage Fund', href: '/admin/funds?tab=all' },
      ],
    },
    {
      id: 'news-events',
      title: 'News & Events',
      items: [
        { label: 'News & Events (Notice)', href: '/admin/settings?tab=notice' },
        { label: 'Add Meeting & Seminars', href: '/admin/gallery?category=SEMINAR&action=add' },
        { label: 'Meeting List', href: '/admin/gallery?category=SEMINAR' },
        { label: 'Add Category For Gallery', href: '/admin/gallery' },
        { label: 'Gallery Category List', href: '/admin/gallery' },
        { label: 'Add Picture in gallery', href: '/admin/gallery?action=add' },
        { label: 'Gallery Picture List', href: '/admin/gallery' },
        { label: 'Add Banner', href: '/admin/settings?tab=notice' },
        { label: 'Banner List', href: '/admin/settings?tab=notice' },
        { label: 'Popup List', href: '/admin/settings?tab=popup' },
        { label: 'Send SMS', href: '/admin/settings?tab=general' },
        { label: 'Complaint List', href: 'https://wa.me/916267392508?text=Admin%20Support%20Tickets', external: true },
        { label: 'Contact List', href: '/admin/settings?tab=general' },
      ],
    },
  ];

  return (
    <>
      {/* Top Header Bar matching reference mobile view */}
      <header className="sticky top-0 z-40 bg-[#18181b] text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full min-w-0">
          {/* Left: Hamburger Button + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Open Admin Menu"
              title="Admin Navigation"
            >
              <Menu className="w-6 h-6" />
              {pendingFundCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#18181b] animate-ping" />
              )}
              {pendingFundCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#18181b]" />
              )}
            </button>

            {/* Desktop Brand Details */}
            <div className="hidden sm:block min-w-0">
              <div className="font-black text-sm sm:text-base text-white leading-none truncate">
                {title}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4a359] mt-0.5 truncate">
                {role} • {username}
              </div>
            </div>
          </div>

          {/* Center: Circular SGM MART Logo */}
          <Link href={homeHref} className="flex items-center justify-center shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#d4a359] shadow p-0.5 hover:scale-105 transition-transform">
              <img src="/sgm_logo.png" alt="SGM Mart Logo" className="w-full h-full object-contain" />
            </div>
          </Link>

          {/* Right: More Options & Quick Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="More Options"
              title="More Options"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>

            {/* Desktop Quick Logout */}
            <a
              href={logoutHref}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </a>
          </div>
        </div>
      </header>

      {/* Side Panel Drawer (Slide from LEFT) */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Drawer Body */}
          <div className="relative w-[85%] sm:w-80 max-w-full bg-white text-slate-800 shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              {/* Header with Blue Mountain Gradient and Avatar Silhouette */}
              <div className="p-6 relative bg-gradient-to-b from-[#1e40af] via-[#2563eb] to-[#3b82f6] text-white">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                  {/* User Silhouette Avatar */}
                  <div className="w-16 h-16 rounded-full bg-white/95 p-1 border-2 border-white shadow-lg flex items-center justify-center text-[#2563eb] font-black text-2xl mb-2">
                    <User className="w-9 h-9 text-[#0284c7]" />
                  </div>
                  <div className="font-black text-base tracking-tight leading-tight">
                    {username}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-white/80 mt-0.5">
                    {role} Console
                  </div>
                </div>
              </div>

              {/* Navigation Header Label */}
              <div className="px-5 pt-4 pb-2">
                <div className="text-xs font-black uppercase tracking-wider text-[#2563eb]">
                  Navigation
                </div>
              </div>

              {/* Home Action Button (Solid Blue) */}
              <div className="px-4 mb-2">
                <Link
                  href={homeHref}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md font-bold text-sm text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow transition-all"
                >
                  <Home className="w-4 h-4 text-white" />
                  <span>Home</span>
                </Link>
              </div>

              {/* Collapsible Accordion Groups */}
              <div className="px-4 py-1 space-y-1">
                {menuGroups.map((group) => {
                  const isExpanded = expandedGroup === group.id;

                  return (
                    <div key={group.id} className="overflow-hidden">
                      {/* Group Header Button */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-[#3b82f6] text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LayoutGrid className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-slate-500'}`} />
                          <span>{group.title}</span>
                          {group.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                              {group.badge}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${isExpanded ? 'text-white' : 'text-slate-400'}`}>
                          {isExpanded ? '—' : '+'}
                        </span>
                      </button>

                      {/* Sub-menu items when expanded */}
                      {isExpanded && (
                        <div className="border-l-2 border-slate-200 ml-6 pl-3 py-2 space-y-2 animate-in fade-in-50 duration-200">
                          {group.items.map((subItem) => {
                            const isCurrent = pathname === subItem.href;

                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                target={subItem.external ? '_blank' : undefined}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between text-xs font-semibold py-1 pr-2 transition-colors ${
                                  isCurrent
                                    ? 'text-[#2563eb] font-bold'
                                    : 'text-slate-600 hover:text-[#2563eb]'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {isCurrent && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shrink-0" />
                                  )}
                                  <span>{subItem.label}</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {subItem.badge && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
                                      {subItem.badge}
                                    </span>
                                  )}
                                  {subItem.external && (
                                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2 mt-4">
              <a
                href={logoutHref}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-bold">Admin Logout (लॉगआउट)</span>
              </a>
              <div className="text-[10px] text-center text-slate-400">
                SGM Mart Online Service • Admin Console
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
