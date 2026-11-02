import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import AdminViewBanner from '@/components/AdminViewBanner';
import { prisma } from '@/lib/prisma';
import { getEffectiveMemberAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Smartphone, Tv, ArrowLeft, Sparkles, ShieldCheck, Zap, Clock, Lock } from 'lucide-react';
import RechargeActionForm from './RechargeActionForm';

interface RechargePageProps {
  searchParams?: Promise<{ user?: string; userId?: string }>;
}

export default async function RechargePage(props: RechargePageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const userParam = resolvedSearchParams?.user || resolvedSearchParams?.userId;

  const auth = await getEffectiveMemberAuth(userParam);
  if (!auth) {
    redirect('/login');
  }

  const [user, recharges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      include: { wallet: true },
    }),
    prisma.utilityRecharge.findMany({
      where: { userId: auth.userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      {auth.isAdminActive && (
        <AdminViewBanner userCode={user.userCode} userName={user.name} />
      )}
      <MemberNavbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                यूटिलिटी रिचार्ज एवं 2.50% कैशबैक पोर्टल
              </h1>
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                शीघ्र उपलब्ध (Coming Soon)
              </span>
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

        {/* Coming Soon Notice Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-white border-2 border-dashed border-amber-400 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-amber-950">
                यूटिलिटी व बिल पेमेंट्स सेवा शीघ्र लाइव होगी!
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                Under Integration
              </span>
            </div>
            <p className="text-xs text-amber-900/80 mt-1 leading-relaxed font-medium">
              प्रिय सदस्य, SGM Mart पर डायरेक्ट ऑपरेटर एवं BBPS (Bharat BillPay) गेटवे इंटीग्रेशन प्रक्रिया प्रगति पर है। बहुत जल्द आप अपने सभी मोबाइल, डीटीएच व बिल पेमेंट्स पर 2.50% फ्लैट कैशबैक सीधे वॉलेट में प्राप्त कर सकेंगे।
            </p>
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
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full min-w-[580px] text-left text-xs">
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
