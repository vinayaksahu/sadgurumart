import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
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
  ShoppingBag,
  Smartphone,
  Building,
  ArrowLeftRight,
  LogOut,
  Home,
  IndianRupee,
  User
} from 'lucide-react';
import DashboardCopyBox from './DashboardCopyBox';
import { getSystemSettings } from '@/lib/settings';
import AdminNoticeBanner from '@/components/AdminNoticeBanner';
import AdminPopupModal from '@/components/AdminPopupModal';
import AdminViewBanner from '@/components/AdminViewBanner';
import { getEffectiveMemberAuth } from '@/lib/auth/session';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string; userId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedUser = resolvedSearchParams?.user || resolvedSearchParams?.userId;

  const auth = await getEffectiveMemberAuth(requestedUser);
  if (!auth) redirect('/login');

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        wallet: true,
        sponsor: { select: { userCode: true, name: true } },
        directReferrals: { select: { id: true, userCode: true, name: true, isActive: true, createdAt: true } },
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
        kycDetail: { select: { status: true, bankName: true } },
      },
    }),
    getSystemSettings(),
  ]);

  if (!user) redirect('/login');

  const wallet = user.wallet || {
    id: '',
    mainBalance: 0,
    p2pBalance: 0,
    shoppingBalance: 0,
    holdBalance: 0,
    autoPoolReserve: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  };

  const isKYCApproved = user.kycDetail?.status === 'APPROVED';

  // Live Incomes & Team Analytics matching Member Portal Mobile View
  const [walletTransactions, placementCount, userPaidOrders] = await Promise.all([
    user.wallet?.id
      ? prisma.walletTransaction.findMany({
          where: { walletId: user.wallet.id, walletScope: 'MAIN' },
          select: { type: true, amount: true },
        })
      : Promise.resolve([]),
    prisma.user.count({
      where: {
        OR: [{ sponsorId: user.id }, { placementParentId: user.id }],
      },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { targetUserCode: user.userCode },
        ],
        paymentStatus: 'PAID',
      },
      select: { totalPV: true, isActivation: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Compute active package PV bought
  const activationOrder = userPaidOrders.find((o) => o.isActivation || o.totalPV >= 100);
  const totalPersonalPV = userPaidOrders.reduce((sum, o) => sum + (o.totalPV || 0), 0);
  const activePackagePV = activationOrder?.totalPV || (user.isActive ? Math.max(100, totalPersonalPV) : 0);

  const getSum = (typeList: string[]) => {
    return walletTransactions
      .filter((t) => typeList.includes(t.type) && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const directTeamCount = user.directReferrals.length;
  const totalTeamCount = Math.max(placementCount, directTeamCount);

  const performanceCards = [
    { label: 'Active Package', value: user.isActive ? `${activePackagePV} PV` : '0 PV (Inactive)', gradient: 'from-[#059669] to-[#047857]', icon: Award },
    { label: 'Total Team', value: String(totalTeamCount), gradient: 'from-[#06b6d4] to-[#2563eb]', icon: Users },
    { label: 'Total Direct Team', value: String(directTeamCount), gradient: 'from-[#f43f5e] to-[#e11d48]', icon: User },
    { label: 'Total Direct Income', value: `₹${getSum(['DIRECT_REFERRAL']).toFixed(2)}`, gradient: 'from-[#3b82f6] to-[#4f46e5]', icon: User },
    { label: 'Matching Income', value: `₹${getSum(['BINARY_MATCHING']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: User },
    { label: 'Direct Sponsor Income', value: `₹${getSum(['SPONSOR_ROYALTY']).toFixed(2)}`, gradient: 'from-[#f43f5e] to-[#ea580c]', icon: TrendingUp },
    { label: 'Autopool Income', value: `₹${getSum(['AUTOPOOL_INCOME']).toFixed(2)}`, gradient: 'from-[#f43f5e] to-[#ec4899]', icon: TrendingUp },
    { label: 'Leadership Income', value: `₹${getSum(['LEADERSHIP_CTO']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'Repurchase Income', value: `₹${getSum(['REPURCHASE_TEAM']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'Repurchase Matching Income', value: '₹0.00', gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'CTO Income', value: `₹${getSum(['COMPANY_CTO']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'Bike Fund', value: `₹${getSum(['BIKE_FUND']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'Car Fund', value: `₹${getSum(['CAR_FUND']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'House Fund', value: `₹${getSum(['HOUSE_FUND']).toFixed(2)}`, gradient: 'from-[#6366f1] to-[#7c3aed]', icon: IndianRupee },
    { label: 'Total Income', value: `₹${wallet.totalEarned.toFixed(2)}`, gradient: 'from-[#4f46e5] to-[#7c3aed]', icon: IndianRupee },
    { label: 'Cash Wallet Balance', value: `₹${wallet.mainBalance.toFixed(2)}`, gradient: 'from-[#06b6d4] to-[#0284c7]', icon: IndianRupee },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      {auth.isAdminActive && (
        <AdminViewBanner userCode={user.userCode} userName={user.name} />
      )}
      <MemberNavbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Dashboard Top Greeting Banner (Matches Member Portal Mobile UI) */}
        <div className="bg-gradient-to-r from-[#d9381e] via-[#e25822] to-[#ea580c] rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Dashboard</h1>
            <p className="text-xs sm:text-sm text-white/95 font-medium mt-0.5">Welcome, {user.name} ({user.userCode})</p>
          </div>
          <div className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 shadow-xs">
            <Home className="w-4 h-4" />
            <span>&gt; Dashboard</span>
          </div>
        </div>
        {/* Admin Notice Banner (If enabled by Admin) */}
        {settings.noticeEnabled && (
          <AdminNoticeBanner
            enabled={settings.noticeEnabled}
            type={settings.noticeType}
            title={settings.noticeTitle}
            text={settings.noticeText}
            link={settings.noticeLink}
          />
        )}

        {/* Global Popup Modal for Members */}
        {settings.popupEnabled && (settings.popupTarget === 'ALL' || settings.popupTarget === 'MEMBERS') && (
          <AdminPopupModal
            enabled={settings.popupEnabled}
            title={settings.popupTitle}
            content={settings.popupContent}
            imageUrl={settings.popupImageUrl}
            buttonText={settings.popupButtonText}
            buttonLink={settings.popupButtonLink}
            updatedAt={settings.updatedAt}
          />
        )}

        {/* User Identity & Rank Header */}
        <div className="bg-gradient-to-r from-[#144732] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden w-full max-w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10 w-full min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-[#d4a359] flex items-center justify-center font-black text-2xl text-[#fef08a] shadow-md shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight break-words">{user.name}</h1>
                  <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    user.isActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'
                  }`}>
                    {user.isActive ? 'Active Member' : 'Pending Activation'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>Member ID: <strong className="text-[#fef08a] font-mono">{user.userCode}</strong></span>
                  <span>•</span>
                  <span>Rank: <strong className="text-emerald-300">{user.rank.replace('_', ' ')}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-[#fef08a] border border-[#d4a359]/30 font-bold">
                    <span>Package:</span>
                    <strong className="text-white font-mono font-black">{user.isActive ? `${activePackagePV} PV` : 'None (Inactive)'}</strong>
                  </span>
                  <span>•</span>
                  <span>KYC: <strong className={isKYCApproved ? 'text-emerald-300' : 'text-amber-300'}>
                    {user.kycDetail?.status || 'NOT SUBMITTED'}
                  </strong></span>
                  {user.sponsor && (
                    <>
                      <span>•</span>
                      <span>Sponsor: {user.sponsor.name} ({user.sponsor.userCode})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
              <Link
                href="/wallet"
                className="w-full lg:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md text-center"
              >
                <Wallet className="w-4 h-4 text-[#0b2b1e] shrink-0" />
                <span>वॉलेट हब व P2P (Wallet Hub)</span>
              </Link>
              <Link
                href="/orders"
                className="w-full lg:w-auto px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <ShoppingBag className="w-4 h-4 text-[#fef08a] shrink-0" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/kyc"
                className="w-full lg:w-auto px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <Building className="w-4 h-4 text-[#fef08a] shrink-0" />
                <span>Bank & KYC</span>
              </Link>
            </div>
          </div>

          {/* Referral Link Copy Bar */}
          <div className="mt-5 pt-4 sm:mt-6 sm:pt-5 border-t border-white/10 w-full min-w-0">
            <DashboardCopyBox userCode={user.userCode} />
          </div>
        </div>

        {/* Performance & Live Incomes Section (1-Column on Mobile, responsive grid on desktop) */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#144732]" />
              <span>लाइव इनकम व टीम परफॉरमेंस (Live Incomes & Team)</span>
            </h2>
            <Link href="/payout" className="text-xs font-bold text-[#144732] hover:underline">
              विस्तृत लेजर देखें →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {performanceCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-xl font-black text-slate-800 tracking-tight truncate">
                      {card.value}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                      {card.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Multi-Wallet Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Main Wallet */}
          <div className="bg-white border-2 border-[#144732]/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>1. Main Wallet (विड्रॉल)</span>
                <Wallet className="w-4 h-4 text-[#144732]" />
              </div>
              <div className="text-3xl font-black text-[#144732]">
                ₹{wallet.mainBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                साप्ताहिक बैंक ट्रांसफर व P2P हेतु
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#144732]">
              <Link href="/wallet" className="text-[#144732] hover:underline">P2P में भेजें</Link>
              <Link href="/wallet" className="text-[#92580a] hover:underline">बैंक विड्रॉल →</Link>
            </div>
          </div>

          {/* P2P Wallet */}
          <div className="bg-white border-2 border-[#92580a]/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between bg-gradient-to-b from-white to-[#fdfaf3]">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>2. P2P Wallet (ट्रांसफर)</span>
                <ArrowLeftRight className="w-4 h-4 text-[#92580a]" />
              </div>
              <div className="text-3xl font-black text-[#92580a]">
                ₹{wallet.p2pBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                सदस्य ट्रांसफर व आईडी एक्टिवेशन
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#92580a]">
              <Link href="/wallet" className="text-[#144732] hover:underline">आईडी एक्टिवेट करें</Link>
              <Link href="/wallet" className="hover:underline">P2P भेजें →</Link>
            </div>
          </div>

          {/* Repurchase / Shopping Wallet */}
          <div className="bg-white border-2 border-[#d4a359]/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>3. Repurchase Wallet (रीपरचेस)</span>
                <ShoppingBag className="w-4 h-4 text-[#92580a]" />
              </div>
              <div className="text-3xl font-black text-[#92580a]">
                ₹{wallet.shoppingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                100% एक्टिवेशन कैशबैक • रीपरचेस पर 5% उपयोग
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#92580a]">
              <Link href="/recharge" className="text-emerald-700 hover:underline">Recharge (Coming Soon) →</Link>
              <Link href="/store" className="hover:underline">Shop (5% Off) →</Link>
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

        {/* 4 Feature Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/genealogy/binary"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#144732] shadow-sm hover:shadow-md transition-all group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-[#144732]">Binary Genealogy</h3>
            <p className="text-xs text-slate-500 mt-1">
              लेफ्ट व राइट डाउनलाइन ट्री एवं लाइव मैचिंग स्थिति।
            </p>
          </Link>

          <Link
            href="/autopool"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-purple-600 shadow-sm hover:shadow-md transition-all group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-purple-900">2x2 AutoPool Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              ₹13.19 करोड़ की ऑल इंडिया ऑटोपूल पोजीशन स्थिति।
            </p>
          </Link>

          <Link
            href="/recharge"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-emerald-600 shadow-sm hover:shadow-md transition-all group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-emerald-900">Utility Recharge</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">शीघ्र उपलब्ध</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              मोबाइल व टीवी रिचार्ज सेवा शीघ्र प्रारंभ की जा रही है।
            </p>
          </Link>

          <Link
            href="/payout"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#92580a] shadow-sm hover:shadow-md transition-all group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fdfaf3] text-[#92580a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-[#92580a]">Payout & Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">
              बैंक विड्रॉल अनुरोध, 5% + 5% कटौती एवं पूरा लेजर।
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
                <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <Link href={`/orders/${ord.orderNumber}`} className="font-bold text-[#144732] hover:underline truncate block">
                      {ord.orderNumber}
                    </Link>
                    <div className="text-[11px] text-slate-400 truncate">
                      {new Date(ord.createdAt).toLocaleDateString('hi-IN')} • {ord.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
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
