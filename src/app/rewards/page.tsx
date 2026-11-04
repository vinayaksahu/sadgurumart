import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import AdminViewBanner from '@/components/AdminViewBanner';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getEffectiveMemberAuth } from '@/lib/auth/session';
import Link from 'next/link';
import { ArrowLeft, Award, Sparkles } from 'lucide-react';
import { calculateRankProgress } from '@/lib/mlm/rankEngine';
import RewardsView from './RewardsView';

export default async function RewardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string; userId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedUser = resolvedSearchParams?.user || resolvedSearchParams?.userId;

  const auth = await getEffectiveMemberAuth(requestedUser);
  if (!auth) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      wallet: true,
      kycDetail: true,
    },
  });

  if (!user) redirect('/login');

  const rankStatus = calculateRankProgress(user);

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      {auth.isAdminActive && (
        <AdminViewBanner userCode={user.userCode} userName={user.name} />
      )}
      <MemberNavbar user={user} isAdminActive={auth.isAdminActive} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Breadcrumb & Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-[#144732] tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-[#92580a]" />
                <span>Rank & Lifestyle Rewards (रैंक एवं लाइफस्टाइल रिवार्ड्स)</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 sm:pl-7">
              3% समर्पित लाइफस्टाइल रिवार्ड पूल • 15 ऐतिहासिक पदनाम • 4 लक्ज़री लाइफस्टाइल फंड्स
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/payout"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
            >
              ← Payout & Ledger
            </Link>
            <Link
              href="/genealogy/binary"
              className="px-4 py-2 rounded-xl bg-[#144732] text-[#fef08a] font-bold text-xs hover:bg-[#0b2b1e] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Binary Tree</span>
            </Link>
          </div>
        </div>

        {/* Client Interactive Tabbed Rewards View */}
        <RewardsView
          rankStatus={rankStatus}
          userName={user.name}
          userCode={user.userCode}
        />
      </main>
    </div>
  );
}
