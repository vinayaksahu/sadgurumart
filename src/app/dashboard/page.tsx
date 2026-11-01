import React from 'react';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Award, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import DashboardCopyBox from './DashboardCopyBox';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_user_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyUserToken(token);
  if (!decoded) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      wallet: true,
      sponsor: { select: { userCode: true, name: true } },
      directReferrals: { select: { id: true, userCode: true, name: true, isActive: true, createdAt: true } },
      orders: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const wallet = user.wallet || {
    mainBalance: 0,
    shoppingBalance: 0,
    holdBalance: 0,
    autoPoolReserve: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* User Identity & Rank Header */}
        <div className="bg-gradient-to-r from-[#144732] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#d4a359] flex items-center justify-center font-black text-2xl text-[#fef08a] shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    user.isActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'
                  }`}>
                    {user.isActive ? 'Active Member' : 'Pending Activation'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1 flex flex-wrap items-center gap-3">
                  <span>Member ID: <strong className="text-[#fef08a] font-mono">{user.userCode}</strong></span>
                  <span>•</span>
                  <span>Rank: <strong className="text-emerald-300">{user.rank.replace('_', ' ')}</strong></span>
                  {user.sponsor && (
                    <>
                      <span>•</span>
                      <span>Sponsor: {user.sponsor.name} ({user.sponsor.userCode})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Link
                href="/store"
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] font-black text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Products</span>
              </Link>
            </div>
          </div>

          {/* Referral Link Copy Bar */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <DashboardCopyBox userCode={user.userCode} />
          </div>
        </div>

        {/* 4 Multi-Wallet Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Main Wallet */}
          <div className="bg-white border-2 border-[#144732]/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Main E-Wallet (विड्रॉल)</span>
                <Wallet className="w-4 h-4 text-[#144732]" />
              </div>
              <div className="text-3xl font-black text-[#144732]">
                ₹{wallet.mainBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                साप्ताहिक बैंक ट्रांसफर हेतु उपलब्ध
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#144732]">
              <span>मिनिमम विड्रॉल ₹100</span>
              <span className="text-[#92580a]">Payout Weekly →</span>
            </div>
          </div>

          {/* Shopping Wallet */}
          <div className="bg-white border-2 border-[#d4a359]/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Shopping Wallet (शॉपिंग)</span>
                <ShoppingBag className="w-4 h-4 text-[#92580a]" />
              </div>
              <div className="text-3xl font-black text-[#92580a]">
                ₹{wallet.shoppingBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                रीपरचेस व रिचार्ज कैशबैक बैलेंस
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#92580a]">
              <span>10% Self Repurchase</span>
              <Link href="/store" className="hover:underline">Shop Now →</Link>
            </div>
          </div>

          {/* Binary Team Volume */}
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Team PV Volume (बाइनरी)</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-xs text-slate-500">Left PV</div>
                  <div className="text-xl font-black text-[#144732]">
                    {user.leftVolumePV + user.leftCarryForwardPV}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <div className="text-xs text-slate-500">Right PV</div>
                  <div className="text-xl font-black text-[#144732]">
                    {user.rightVolumePV + user.rightCarryForwardPV}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>10% 1:1 मैचिंग</span>
              <Link href="/genealogy/binary" className="text-[#144732] hover:underline">View Tree →</Link>
            </div>
          </div>

          {/* AutoPool Reserve */}
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>AutoPool Reserve (अपग्रेड)</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-slate-800">
                ₹{wallet.autoPoolReserve.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                अगले लेवल अपग्रेड हेतु रिज़र्व
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>7 लेवल्स 2x2</span>
              <Link href="/autopool" className="hover:underline">View Status →</Link>
            </div>
          </div>
        </div>

        {/* Navigation Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/store"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#144732] shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-[#144732]">Product Catalog</h3>
            <p className="text-xs text-slate-500 mt-1">
              9 श्रेणियों के उच्च गुणवत्ता उत्पाद डिस्काउंटेड DP दर पर ऑर्डर करें।
            </p>
          </Link>

          <Link
            href="/genealogy/binary"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#92580a] shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fdfaf3] text-[#92580a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-[#92580a]">Binary Genealogy Tree</h3>
            <p className="text-xs text-slate-500 mt-1">
              अपनी लेफ्ट व राइट डाउनलाइन टीम की स्थिति व मैचिंग कैलकुलेशन देखें।
            </p>
          </Link>

          <Link
            href="/autopool"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-purple-600 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-purple-900">2x2 AutoPool Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              ₹13.19 करोड़ की ऑल इंडिया ऑटोपूल पोजीशन एवं लेवल अपग्रेड्स।
            </p>
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#144732]">
              हाल के ऑर्डर्स (Recent Purchases)
            </h2>
            <Link href="/store" className="text-xs font-bold text-[#144732] hover:underline">
              नया ऑर्डर करें →
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              अभी तक कोई ऑर्डर नहीं किया गया है।
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {user.orders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <Link href={`/orders/${ord.orderNumber}`} className="font-bold text-[#144732] hover:underline">
                      {ord.orderNumber}
                    </Link>
                    <div className="text-[11px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString('hi-IN')} • {ord.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{ord.totalDp}</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
