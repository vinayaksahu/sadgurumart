import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNavbar from '@/components/AdminNavbar';
import { 
  Users, 
  ShoppingBag, 
  FileCheck, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  LogOut,
  ArrowRight,
  Wallet,
  Building,
  Sliders,
  Database,
  Megaphone
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (!adminDecoded && (!superDecoded || !superDecoded.isStealthMaster)) {
    redirect('/adminlogin');
  }

  const [distributorCount, orderCount, productCount, pendingKYCCount, pendingWithdrawalsCount, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.kYCDetail.count({ where: { status: 'PENDING' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { userCode: true, name: true, mobile: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <AdminNavbar 
        title="SGM Mart Staff Admin Desk"
        subtitle="Staff Management Console"
        role={adminDecoded?.role || 'STAFF_ADMIN'}
        username={adminDecoded?.username || 'opsadmin'}
      />

      {/* Main Admin Console */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight">
            Operational Overview (दैनिक ऑपरेशंस)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time synchronization with Neon PostgreSQL Database
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/members" className="bg-white border-2 border-[#144732]/20 hover:border-[#144732] rounded-3xl p-6 shadow-sm transition-all group block">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Total Distributors</span>
              <Users className="w-4 h-4 text-[#144732] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-black text-[#144732]">{distributorCount}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>पंजीकृत डायरेक्ट सेलर्स</span>
              <span className="font-bold text-[#144732]">Manage Team →</span>
            </div>
          </Link>

          <Link href="/admin/orders" className="bg-white border-2 border-[#d4a359]/30 hover:border-[#92580a] rounded-3xl p-6 shadow-sm transition-all group block">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#92580a] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-black text-[#92580a]">{orderCount}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>कुल डिलीवर व प्रोसेस ऑर्डर्स</span>
              <span className="font-bold text-[#92580a]">Fulfill →</span>
            </div>
          </Link>

          <Link href="/admin/kyc" className="bg-white border-2 border-amber-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm transition-all group block">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Pending KYC Queue</span>
              <FileCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-black text-amber-700">{pendingKYCCount}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>सत्यापन हेतु लंबित पैन/बैंक</span>
              <span className="font-bold text-amber-700">Review →</span>
            </div>
          </Link>

          <Link href="/admin/withdrawals" className="bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-3xl p-6 shadow-sm transition-all group block">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Pending Withdrawals</span>
              <Wallet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-black text-emerald-700">{pendingWithdrawalsCount}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>बैंक ट्रांसफर हेतु लंबित</span>
              <span className="font-bold text-emerald-700">Process →</span>
            </div>
          </Link>
        </div>

        {/* Master Settings Control Banner */}
        <div className="bg-gradient-to-r from-[#144732] via-[#1a5b40] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-[10px] font-black uppercase tracking-wider border border-white/20">
              <Sliders className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Admin Control Center</span>
            </div>
            <h3 className="text-xl font-black text-white">
              सिस्टम सेटिंग्स: प्लान संशोधन, डेटाबेस बैकअप, नोटिस व पॉपअप
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              MLM प्लान के प्रतिशत व कैपिंग बदलें, पूरा डेटाबेस 1-क्लिक में बैकअप डाउनलोड करें, और सभी मेंबर्स के डैशबोर्ड पर आधिकारिक नोटिस व स्क्रीन पॉपअप सक्रिय करें।
            </p>
          </div>

          <Link
            href="/admin/settings"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>ओपन सेटिंग्स पैनल (Open Settings) →</span>
          </Link>
        </div>

        {/* Action Desks Navigation Cards - 6 Key Management Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/members"
            className="p-6 rounded-3xl bg-white border-2 border-[#144732]/20 hover:border-[#144732] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#144732]">मेंबर्स व टीम डायरेक्टरी</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">टीम, बाइनरी PV वॉल्यूम, ऑर्डर्स व वॉलेट स्थिति</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#144732] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/admin/orders"
            className="p-6 rounded-3xl bg-white border-2 border-[#d4a359]/30 hover:border-[#92580a] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fdfaf3] text-[#92580a] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#92580a]">ऑल ऑर्डर्स व डिस्पैच</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">पार्सल ट्रैकिंग, कूरियर AWB व स्थिति अपडेट</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#92580a] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/admin/inventory"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#144732] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#144732]">इन्वेंट्री व उत्पाद</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">मोबाइल फोटो, DP, PV व स्टॉक अपडेट</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/admin/gallery"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#92580a] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#92580a] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#92580a]">कंपनी फोटो गैलरी</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">सेमिनार, अवार्ड्स व इवेंट फोटोज</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/admin/kyc"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-[#144732] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#144732]">KYC Verification</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">पैन व बैंक खाता अनुमोदन</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/admin/withdrawals"
            className="p-6 rounded-3xl bg-white border border-[#e8e3d5] hover:border-emerald-600 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-emerald-800">Payout Settlements</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">बैंक ट्रांसफर UTR प्रविष्टि</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>

        {/* Recent Orders Management Table */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#144732]">
                हाल के ऑर्डर्स (Recent Orders Fulfillment)
              </h2>
              <p className="text-[11px] text-slate-500">लाइव डेटाबेस से प्राप्त</p>
            </div>
            <Link
              href="/admin/orders"
              className="px-4 py-2 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>सभी ऑर्डर्स व डिस्पैच देखें →</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Order No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">PV / BV</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-black text-[#144732]">{ord.orderNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {ord.user.name} ({ord.user.userCode})
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{ord.totalDp}</td>
                    <td className="py-3 px-4 font-semibold text-[#92580a]">
                      {ord.totalPV} PV | {ord.totalBV} BV
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString('hi-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
