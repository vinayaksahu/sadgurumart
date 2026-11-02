import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Layers, ArrowLeft, CheckCircle2, Clock, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default async function AutoPoolPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_user_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyUserToken(token);
  if (!decoded) {
    redirect('/login');
  }

  const [user, entries, autopoolTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    }),
    prisma.autoPoolEntry.findMany({
      where: { userId: decoded.id },
      include: { children: true },
      orderBy: { poolLevel: 'asc' },
    }),
    prisma.walletTransaction.findMany({
      where: {
        wallet: { userId: decoded.id },
        type: 'AUTOPOOL_INCOME',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  if (!user) {
    redirect('/login');
  }

  const poolLevels = [
    { level: 1, formula: '2 × ₹100', gross: '₹ 200', upgrade: '₹ 125', net: '₹ 75', req: 2 },
    { level: 2, formula: '4 × ₹125', gross: '₹ 500', upgrade: '₹ 300', net: '₹ 200', req: 4 },
    { level: 3, formula: '8 × ₹300', gross: '₹ 2,400', upgrade: '₹ 1,000', net: '₹ 1,400', req: 8 },
    { level: 4, formula: '16 × ₹1,000', gross: '₹ 16,000', upgrade: '₹ 6,000', net: '₹ 10,000', req: 16 },
    { level: 5, formula: '32 × ₹6,000', gross: '₹ 1,92,000', upgrade: '₹ 75,000', net: '₹ 1,17,000', req: 32 },
    { level: 6, formula: '64 × ₹75,000', gross: '₹ 48,00,000', upgrade: '₹ 10,00,000', net: '₹ 38,00,000', req: 64 },
    { level: 7, formula: '128 × ₹10,00,000', gross: '₹ 12,80,00,000', upgrade: 'NIL (0)', net: '₹ 12,80,00,000', req: 128 },
  ];

  const entryMap = new Map(entries.map((e) => [e.poolLevel, e]));

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <MemberNavbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#144732] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a359]/20 text-[#fef08a] text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Global 2x2 Universal Spillover Matrix
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                नॉन-वर्किंग महा ऑटोपूल योजना (7 लेवल्स)
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                पूरे भारत से आने वाली आईडियों का स्वतः प्लेसमेंट • ₹13.19 करोड़ से अधिक कुल संभावित आय
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-300">AutoPool Reserve Fund</div>
              <div className="text-2xl font-black text-[#fef08a]">
                ₹{(user.wallet?.autoPoolReserve || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* 7 Levels Master Table */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#144732]">
              ऑटोपूल स्तर एवं अपग्रेड चार्ट (Levels 1 to 7)
            </h2>
            <span className="text-xs font-bold text-slate-500">
              100% पारदर्शी ऑटो-अपग्रेड सिस्टम
            </span>
          </div>

          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="bg-[#144732] text-white uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">लेवल (Level)</th>
                  <th className="py-3 px-4">मैट्रिक्स गणना</th>
                  <th className="py-3 px-4">कुल राशि (Gross)</th>
                  <th className="py-3 px-4">अपग्रेड कटौती</th>
                  <th className="py-3 px-4">शुद्ध आमदनी (Net)</th>
                  <th className="py-3 px-4 text-center rounded-r-xl">आपकी स्थिति (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {poolLevels.map((lvl) => {
                  const userEntry = entryMap.get(lvl.level);
                  const isCompleted = userEntry?.isCompleted || false;
                  const inProgress = !!userEntry && !isCompleted;

                  return (
                    <tr key={lvl.level} className="hover:bg-slate-50">
                      <td className="py-4 px-4 font-black text-[#144732]">
                        <span className="px-2.5 py-1 rounded-lg bg-[#eaf5ed] border border-[#144732]/20">
                          Level {lvl.level}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">{lvl.formula}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">{lvl.gross}</td>
                      <td className="py-4 px-4 font-bold text-red-600">{lvl.upgrade}</td>
                      <td className="py-4 px-4 font-black text-emerald-700 text-sm">{lvl.net}</td>
                      <td className="py-4 px-4 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : inProgress ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                            <Clock className="w-3.5 h-3.5" />
                            In Progress ({userEntry.children.length}/{lvl.req})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            Queued for Upgrade
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grand Total Bar */}
          <div className="bg-[#144732] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-bold text-sm">
              🏆 कुल 7 लेवल्स की संभावित नेट आमदनी (Total Potential Net Income):
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#fef08a]">
              ₹ 13,19,28,675 /- <span className="text-xs font-normal text-slate-300">(तेरह करोड़ उन्नीस लाख+)</span>
            </div>
          </div>
        </div>

        {/* AutoPool Received Income & Transactions History */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#144732]">
                AutoPool Credit History (ऑटोपूल आमदनी इतिहास)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ऑल-इंडिया स्पिलओवर द्वारा आपके वॉलेट में प्राप्त समस्त ऑटोपूल इनकम का विवरण।
              </p>
            </div>
            <div className="text-xs font-bold text-[#144732] bg-[#eaf5ed] px-3 py-1.5 rounded-xl border border-[#144732]/20">
              Total Credits: {autopoolTransactions.length}
            </div>
          </div>

          {autopoolTransactions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-sm font-black text-slate-800">
                No AutoPool Income Received Yet
              </div>
              <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                जैसे ही राष्ट्रीय स्तर पर नए सदस्य आपके 2x2 मैट्रिक्स में जुड़ेंगे, ऑटोपूल राशि आपके वॉलेट में स्वतः क्रेडिट हो जाएगी।
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {autopoolTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {tx.remarks || 'Universal AutoPool Spillover Income'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {tx.referenceId || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 font-mono text-sm">
                        +₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                        ₹{tx.closingBalance.toLocaleString('en-IN')}
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
