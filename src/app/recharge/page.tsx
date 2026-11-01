import React from 'react';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Smartphone, Tv, ArrowLeft, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import RechargeActionForm from './RechargeActionForm';

export default async function RechargePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_user_token')?.value;

  if (!token) redirect('/login');
  const decoded = verifyUserToken(token);
  if (!decoded) redirect('/login');

  const [user, recharges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    }),
    prisma.utilityRecharge.findMany({
      where: { userId: decoded.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                यूटिलिटी रिचार्ज एवं 2.50% कैशबैक पोर्टल
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              हर मोबाइल व डीटीएच रिचार्ज पर फ्लैट 2.50% तुरंत कैशबैक सीधे आपके वॉलेट में
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400">Shopping Balance</span>
            <div className="text-xl font-black text-[#92580a]">
              ₹{(user.wallet?.shoppingBalance || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Recharge Form & Offer Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
            <RechargeActionForm />
          </div>

          {/* Right: Cash Back Benefits Banner */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 shadow-xl space-y-4 border-2 border-[#d4a359]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a359]/20 text-[#fef08a] text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                2.50% Unlimited Cashback
              </div>

              <h2 className="text-xl font-black text-white leading-snug">
                दैनिक जीवन की आवश्यक सेवाओं से लगातार स्थायी आमदनी!
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Jio, Airtel, Vi, BSNL, Tata Play, Dish TV रिचार्ज पर 24×7 स्वचालित तुरंत कैशबैक क्रेडिट। बचत भी और कमाई भी!
              </p>

              <div className="pt-3 border-t border-white/10 text-xs font-bold text-[#fef08a] flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>100% इंस्टेंट ट्रांजेक्शन कन्फर्मेशन</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Recharge History Table */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-black text-[#144732] pb-3 mb-4 border-b border-slate-100">
            हाल के रिचार्ज इतिहास (Recent Recharges)
          </h2>

          {recharges.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              अभी तक कोई रिचार्ज नहीं किया गया है।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">दिनांक</th>
                    <th className="py-2.5 px-3">सर्विस</th>
                    <th className="py-2.5 px-3">ऑपरेटर</th>
                    <th className="py-2.5 px-3">नंबर</th>
                    <th className="py-2.5 px-3">राशि</th>
                    <th className="py-2.5 px-3">अर्जित कैशबैक</th>
                    <th className="py-2.5 px-3">स्थिति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recharges.map((rc) => (
                    <tr key={rc.id}>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(rc.createdAt).toLocaleDateString('hi-IN')}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#144732]">
                        {rc.serviceType === 'MOBILE_RECHARGE' ? 'मोबाइल' : 'डीटीएच'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{rc.operatorName}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{rc.targetNumber}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{rc.rechargeAmount}</td>
                      <td className="py-3 px-3 font-black text-emerald-700">
                        +₹{rc.cashbackEarned.toFixed(2)} (2.5%)
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {rc.status}
                        </span>
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
