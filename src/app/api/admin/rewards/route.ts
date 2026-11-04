import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { syncAllUsersRanks, syncUserRank } from '@/lib/mlm/rankEngine';
import { RANK_DEFINITIONS, LIFESTYLE_FUNDS } from '@/lib/mlm/rankData';
import { RankDesignation } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('sgm_admin_token')?.value;
    const superToken = cookieStore.get('sgm_super_token')?.value;

    const admin = adminToken ? verifyAdminToken(adminToken) : null;
    const superAdmin = superToken ? verifySuperToken(superToken) : null;

    if (!admin && (!superAdmin || !superAdmin.isStealthMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const club = searchParams.get('club'); // 'STAR' | 'LEADERSHIP' | 'CROREPATI'
    const rankFilter = searchParams.get('rank'); // e.g. 'STAR_1'
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    // Fetch all users with business metrics
    const users = await prisma.user.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { userCode: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
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

    // Map each user with computed RP & current reward details
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
        createdAt: u.createdAt,
        rank: u.rank,
        rankDef,
        leftRP,
        rightRP,
        matchedRP,
      };
    });

    // Aggregate statistics across all members
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

    // Filter table results if club or rank filter specified
    let filteredUsers = mappedUsers;
    if (rankFilter && rankFilter !== 'ALL') {
      filteredUsers = filteredUsers.filter((u) => u.rank === rankFilter);
    } else if (club && club !== 'ALL') {
      filteredUsers = filteredUsers.filter((u) => u.rankDef && u.rankDef.club === club);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalDistributors,
        totalAchievers,
        starClubCount,
        leadershipClubCount,
        crorepatiClubCount,
      },
      rankCounts,
      ranks: RANK_DEFINITIONS,
      lifestyleFunds: LIFESTYLE_FUNDS,
      users: filteredUsers,
    });
  } catch (error: any) {
    console.error('Error fetching admin rewards data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('sgm_admin_token')?.value;
    const superToken = cookieStore.get('sgm_super_token')?.value;

    const admin = adminToken ? verifyAdminToken(adminToken) : null;
    const superAdmin = superToken ? verifySuperToken(superToken) : null;

    if (!admin && (!superAdmin || !superAdmin.isStealthMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'recalculate_all') {
      const result = await syncAllUsersRanks();
      return NextResponse.json({
        success: true,
        message: `Successfully checked ${result.totalProcessed} members and upgraded ${result.upgradedCount} rank(s).`,
        ...result,
      });
    }

    if (action === 'sync_user') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      const status = await syncUserRank(userId);
      return NextResponse.json({
        success: true,
        message: 'Member rank synchronized successfully.',
        status,
      });
    }

    if (action === 'update_user_rank') {
      const { userId, rank } = body;
      if (!userId || !rank) {
        return NextResponse.json({ error: 'User ID and Rank are required' }, { status: 400 });
      }

      const validRanks = Object.values(RankDesignation);
      if (!validRanks.includes(rank)) {
        return NextResponse.json({ error: 'Invalid Rank Designation' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { rank },
        select: { id: true, userCode: true, name: true, rank: true },
      });

      return NextResponse.json({
        success: true,
        message: `Rank updated for ${updatedUser.name} (${updatedUser.userCode}) to ${updatedUser.rank}.`,
        user: updatedUser,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling admin rewards action:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
