import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wallet, ShieldCheck, CheckCircle2, Clock, FileSpreadsheet, ArrowLeftRight, Zap } from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import AdminWithdrawalActions from './AdminWithdrawalActions';
import DailyClosingRunner from './DailyClosingRunner';

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string; tab?: string }>;
}) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const isAdmin = adminToken && verifyAdminToken(adminToken);
  const isSuper = superToken && verifySuperToken(superToken)?.isStealthMaster;

  if (!isAdmin && !isSuper) redirect('/adminlogin');

  const { status, view, tab } = (await searchParams) || {};

  const whereClause: any = {};
  if (status === 'pending') {
    whereClause.status = 'PENDING';
  } else if (status === 'approved') {
    whereClause.status = 'PAID';
  }

  const [withdrawals, totalPendingCount, totalPaidCount, activeMemberCount] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where: whereClause,
      include: {
        user: { select: { userCode: true, name: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PAID' } }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  const totalGross = withdrawals.reduce((sum, w) => sum + w.requestedAmount, 0);
  const totalTDS = withdrawals.reduce((sum, w) => sum + w.tdsAmount, 0);
  const totalAdminFee = withdrawals.reduce((sum, w) => sum + w.adminCharge, 0);
  const totalNet = withdrawals.reduce((sum, w) => sum + w.netPayable, 0);

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <AdminNavbar 
        title="Payout Settlements & Banking Desk"
        subtitle="Weekly Bank Transfer Approvals & TDS Deductions"
        role="STAFF_ADMIN"
        username={isAdmin ? (isAdmin as any).username : 'Admin'}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/withdrawals"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              !status && !view && !tab
                ? 'bg-[#144732] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            सभी विड्रॉल ({totalPendingCount + totalPaidCount})
          </Link>

          <Link
            href="/admin/withdrawals?status=pending"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              status === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>पेंडिंग भुगतान ({totalPendingCount})</span>
          </Link>

          <Link
            href="/admin/withdrawals?status=approved"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              status === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>स्वीकृत भुगतान ({totalPaidCount})</span>
          </Link>

          <Link
            href="/admin/withdrawals?view=tds"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              view === 'tds'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>TDS व कटौती रिपोर्ट (5% + 5%)</span>
          </Link>

          <Link
            href="/admin/withdrawals?view=closing"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              view === 'closing'
                ? 'bg-[#144732] text-white shadow-sm ring-2 ring-[#d4a359]'
                : 'bg-white border border-[#d4a359]/50 text-[#144732] hover:bg-amber-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>दैनिक क्लोजिंग व पेआउट (Daily Closing)</span>
          </Link>
        </div>

        {view === 'closing' ? (
          <DailyClosingRunner activeMemberCount={activeMemberCount} />
        ) : (
          <>
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500">कुल ग्रॉस विड्रॉल</div>
                <div className="text-xl sm:text-2xl font-black text-[#144732] mt-0.5">₹{totalGross.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500">5% सरकारी TDS</div>
                <div className="text-xl sm:text-2xl font-black text-blue-700 mt-0.5">₹{totalTDS.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500">5% एडमिनिस्ट्रेटिव चार्ज</div>
                <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">₹{totalAdminFee.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500">नेट बैंक भुगतान</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">₹{totalNet.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Withdrawals Table Card */}
            <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h2 className="text-base font-black text-[#144732]">
                  {status === 'pending' ? 'पेंडिंग विड्रॉल अनुरोध (Pending Queue)' :
                   status === 'approved' ? 'स्वीकृत बैंक भुगतान (Paid Settlements)' :
                   view === 'tds' ? 'TDS व कानूनी कटौती रिपोर्ट (TDS Ledger)' :
                   `विड्रॉल अनुरोध सूची (${withdrawals.length} कुल अनुरोध)`}
                </h2>
              </div>

              {withdrawals.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  इस श्रेणी में कोई विड्रॉल अनुरोध नहीं है।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-3">दिनांक</th>
                        <th className="py-3 px-3">Member ID</th>
                        <th className="py-3 px-3">बैंक खाता विवरण</th>
                        <th className="py-3 px-3">ग्रॉस राशि</th>
                        <th className="py-3 px-3">5% एडमिन + 5% TDS</th>
                        <th className="py-3 px-3">नेट देय (Net Transfer)</th>
                        <th className="py-3 px-3">स्थिति / UTR</th>
                        <th className="py-3 px-3 text-right">कार्रवाई</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {withdrawals.map((req) => {
                        const bank = req.bankSnapshot as any;
                        return (
                          <tr key={req.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString('hi-IN')}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-[#144732]">
                              {req.user.userCode}
                              <div className="text-[10px] text-slate-500 font-normal">{req.user.name}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{bank?.bankName || 'N/A'}</div>
                              <div className="font-mono text-slate-600">A/C: {bank?.accountNumber || 'N/A'}</div>
                              <div className="font-mono text-[10px] text-slate-500">IFSC: {bank?.ifscCode || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-800">₹{req.requestedAmount}</td>
                            <td className="py-3 px-3 text-red-600 font-semibold">
                              -₹{req.adminCharge + req.tdsAmount} (10%)
                            </td>
                            <td className="py-3 px-3 font-black text-emerald-700 text-sm">
                              ₹{req.netPayable}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status}
                              </span>
                              {req.paymentTxId && (
                                <div className="font-mono text-[10px] text-slate-500 mt-0.5">{req.paymentTxId}</div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <AdminWithdrawalActions requestId={req.id} currentStatus={req.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
