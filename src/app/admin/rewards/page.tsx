import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { RANK_DEFINITIONS, LIFESTYLE_FUNDS } from '@/lib/mlm/rankData';
import AdminRewardsClient from './AdminRewardsClient';
import Link from 'next/link';
import { ArrowLeft, Award, Sparkles } from 'lucide-react';

export default async function AdminRewardsPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (!adminDecoded && (!superDecoded || !superDecoded.isStealthMaster)) {
    redirect('/adminlogin');
  }

  // Fetch users with volume/RP
  const users = await prisma.user.findMany({
    select: {
      id: true,
      userCode: true,
      name: true,
      mobile: true,
      rank: true,
      isActive: true,
      createdAt: true,
      leftVolumePV: true,
      rightVolumePV: true,
      leftCarryForwardPV: true,
      rightCarryForwardPV: true,
      totalMatchingPaidPV: true,
      rewardPointsRP: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const mappedUsers = users.map((u) => {
    const leftRP = (u.leftVolumePV || 0) + (u.leftCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);
    const rightRP = (u.rightVolumePV || 0) + (u.rightCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);
    const matchedRP = Math.max(
      u.rewardPointsRP || 0,
      u.totalMatchingPaidPV || 0,
      Math.min(leftRP, rightRP)
    );

    const rankDef = RANK_DEFINITIONS.find((r) => r.id === u.rank) || null;

    return {
      id: u.id,
      userCode: u.userCode,
      name: u.name,
      mobile: u.mobile,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      rank: u.rank,
      rankDef,
      leftRP,
      rightRP,
      matchedRP,
    };
  });

  // Calculate statistics
  const rankCounts: Record<string, number> = {};
  RANK_DEFINITIONS.forEach((r) => {
    rankCounts[r.id] = mappedUsers.filter((u) => u.rank === r.id).length;
  });

  const totalDistributors = mappedUsers.length;
  const totalAchievers = mappedUsers.filter((u) => u.rank !== 'DISTRIBUTOR').length;
  const starClubCount = mappedUsers.filter((u) => {
    const def = RANK_DEFINITIONS.find((r) => r.id === u.rank);
    return def && def.club === 'STAR';
  }).length;
  const leadershipClubCount = mappedUsers.filter((u) => {
    const def = RANK_DEFINITIONS.find((r) => r.id === u.rank);
    return def && def.club === 'LEADERSHIP';
  }).length;
  const crorepatiClubCount = mappedUsers.filter((u) => {
    const def = RANK_DEFINITIONS.find((r) => r.id === u.rank);
    return def && def.club === 'CROREPATI';
  }).length;

  const stats = {
    totalDistributors,
    totalAchievers,
    starClubCount,
    leadershipClubCount,
    crorepatiClubCount,
  };

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <AdminNavbar
        title="SGM Mart Staff Admin Desk"
        subtitle="Rank & Lifestyle Rewards Console"
        role={adminDecoded?.role || 'STAFF_ADMIN'}
        username={adminDecoded?.username || 'opsadmin'}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-[#144732] tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-[#92580a]" />
                <span>Rank & Lifestyle Rewards Management</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 sm:pl-7">
              रैंक पदनाम • स्टार क्लब • लीडरशिप क्लब • करोड़पति क्लब • 4 लाइफस्टाइल रॉयल्टी फंड्स
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/members"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
            >
              ← मेंबर्स नेटवर्क
            </Link>
            <Link
              href="/admin/withdrawals"
              className="px-4 py-2 rounded-xl bg-[#144732] text-[#fef08a] font-bold text-xs hover:bg-[#0b2b1e] transition-colors shadow-xs"
            >
              पेआउट व विड्रॉल →
            </Link>
          </div>
        </div>

        {/* Client Interactive Component */}
        <AdminRewardsClient
          initialStats={stats}
          initialRankCounts={rankCounts}
          ranks={RANK_DEFINITIONS}
          lifestyleFunds={LIFESTYLE_FUNDS}
          initialUsers={mappedUsers}
        />
      </main>
    </div>
  );
}
