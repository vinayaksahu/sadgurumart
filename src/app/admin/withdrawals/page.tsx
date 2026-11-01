import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import AdminWithdrawalActions from './AdminWithdrawalActions';

export default async function AdminWithdrawalsPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const isAdmin = adminToken && verifyAdminToken(adminToken);
  const isSuper = superToken && verifySuperToken(superToken)?.isStealthMaster;

  if (!isAdmin && !isSuper) redirect('/adminlogin');

  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      user: { select: { userCode: true, name: true, mobile: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <header className="bg-white border-b border-[#e8e3d5] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 rounded-xl hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <div className="font-black text-lg text-[#144732]">Bank Payout Settlements Desk</div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#92580a]">
                Weekly Bank Transfer Approvals & Deductions
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-[#144732]">
              विड्रॉल अनुरोध सूची ({withdrawals.length} कुल अनुरोध)
            </h2>
          </div>

          {withdrawals.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              कोई लंबित विड्रॉल अनुरोध नहीं है।
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
                          <div className="font-bold text-slate-800">{bank?.bankName}</div>
                          <div className="font-mono text-slate-600">A/C: {bank?.accountNumber}</div>
                          <div className="font-mono text-[10px] text-slate-500">IFSC: {bank?.ifscCode}</div>
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
      </main>
    </div>
  );
}
