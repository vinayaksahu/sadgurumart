import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building, 
  FileText,
  TrendingDown
} from 'lucide-react';
import WithdrawalActionForm from './WithdrawalActionForm';

export default async function PayoutPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_user_token')?.value;

  if (!token) redirect('/login');
  const decoded = verifyUserToken(token);
  if (!decoded) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      wallet: {
        include: {
          transactions: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      kycDetail: true,
      withdrawalRequests: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) redirect('/login');

  const wallet = user.wallet || {
    mainBalance: 0,
    shoppingBalance: 0,
    holdBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: [],
  };

  const hasKYC = !!user.kycDetail?.bankAccountNumber;

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <MemberNavbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                Payout & Wallet Ledger (विड्रॉल व लेजर)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              दैनिक क्लोजिंग • साप्ताहिक बैंक ट्रांसफर • 5% एडमिन + 5% TDS कटौती
            </p>
          </div>

          <Link
            href="/kyc"
            className="px-4 py-2 rounded-xl border-2 border-[#144732] text-[#144732] font-bold text-xs hover:bg-[#144732] hover:text-white transition-colors"
          >
            {hasKYC ? '✓ Bank Details Updated' : '⚠️ Update Bank & KYC'}
          </Link>
        </div>

        {/* Withdrawal Section & Bank Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Withdrawal Request Form */}
          <div className="lg:col-span-7 bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#92580a]">
                  AVAILABLE FOR WITHDRAWAL
                </span>
                <div className="text-3xl font-black text-[#144732]">
                  ₹{wallet.mainBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            {/* Client Component for Withdrawal Calculation & Submission */}
            <WithdrawalActionForm
              availableBalance={wallet.mainBalance}
              hasKYC={hasKYC}
              bankDetails={user.kycDetail}
            />
          </div>

          {/* Right: Statutory Rules & Bank Snapshot */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rules Card */}
            <div className="bg-[#faf8f4] border border-[#e8e3d5] rounded-3xl p-6 text-xs space-y-3">
              <div className="font-black text-[#144732] uppercase tracking-wider text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#92580a]" />
                <span>विड्रॉल नियम व शर्तें (Settlement Terms)</span>
              </div>
              <ul className="space-y-2 text-slate-600 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#144732] font-black">•</span>
                  <span><strong>न्यूनतम विड्रॉल:</strong> मात्र ₹100 होते ही बैंक खाते में विड्रॉल मान्य।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#144732] font-black">•</span>
                  <span><strong>क्लोजिंग चक्र:</strong> प्रतिदिन रात 12:00 बजे क्लोजिंग एवं साप्ताहिक बैंक ट्रांसफर।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#144732] font-black">•</span>
                  <span><strong>कटौती (Deductions):</strong> 5% एडमिन चार्ज + 5% सरकारी TDS लागू नियमानुसार।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#144732] font-black">•</span>
                  <span><strong>केवाईसी अनिवार्य:</strong> पैन कार्ड व बैंक खाता 100% सत्यापित होना आवश्यक है।</span>
                </li>
              </ul>
            </div>

            {/* Linked Bank Details Card */}
            {user.kycDetail && (
              <div className="bg-white border-2 border-[#144732]/20 rounded-3xl p-6 text-xs space-y-3">
                <div className="font-black text-[#144732] uppercase tracking-wider text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#144732]" />
                  <span>लिंक्ड बैंक खाता (Linked Bank)</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <div>बैंक का नाम: <strong className="text-slate-900">{user.kycDetail.bankName}</strong></div>
                  <div>खाता संख्या: <strong className="font-mono text-slate-900">{user.kycDetail.bankAccountNumber}</strong></div>
                  <div>IFSC कोड: <strong className="font-mono text-slate-900">{user.kycDetail.ifscCode}</strong></div>
                  <div>खाताधारक: <strong className="text-slate-900">{user.kycDetail.accountHolderName}</strong></div>
                  <div>पैन नंबर: <strong className="font-mono text-slate-900">{user.kycDetail.panNumber}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Withdrawal Requests Table */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-black text-[#144732] pb-3 mb-4 border-b border-slate-100">
            विड्रॉल अनुरोध इतिहास (Withdrawal Requests)
          </h2>

          {user.withdrawalRequests.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              अभी तक कोई विड्रॉल अनुरोध नहीं किया गया है।
            </div>
          ) : (
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">दिनांक</th>
                    <th className="py-2.5 px-3">अनुरोध राशि</th>
                    <th className="py-2.5 px-3">5% एडमिन</th>
                    <th className="py-2.5 px-3">5% TDS</th>
                    <th className="py-2.5 px-3">नेट देय</th>
                    <th className="py-2.5 px-3">स्थिति</th>
                    <th className="py-2.5 px-3">UTR / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.withdrawalRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString('hi-IN')}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">₹{req.requestedAmount}</td>
                      <td className="py-3 px-3 text-red-600 font-semibold">-₹{req.adminCharge}</td>
                      <td className="py-3 px-3 text-red-600 font-semibold">-₹{req.tdsAmount}</td>
                      <td className="py-3 px-3 font-black text-emerald-700">₹{req.netPayable}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {req.paymentTxId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Complete Double-Entry Wallet Ledger */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-black text-[#144732] pb-3 mb-4 border-b border-slate-100">
            वॉलेट लेन-देन लेजर (Full Transaction Ledger)
          </h2>

          {wallet.transactions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              कोई ट्रांजेक्शन रिकॉर्ड उपलब्ध नहीं है।
            </div>
          ) : (
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">दिनांक</th>
                    <th className="py-2.5 px-3">इनकम प्रकार</th>
                    <th className="py-2.5 px-3">विवरण</th>
                    <th className="py-2.5 px-3 text-right">राशि (Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallet.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('hi-IN')}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#144732]">
                        {tx.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-md">
                        {tx.remarks}
                      </td>
                      <td className={`py-3 px-3 text-right font-black ${
                        tx.amount > 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
