import { prisma } from '@/lib/prisma';
import { RankDesignation, User } from '@prisma/client';
import { RANK_DEFINITIONS, RankDefinition, LIFESTYLE_FUNDS } from './rankData';
import { creditIncomeWithAutoPoolCheck } from './incomeDistributor';

export interface UserRankStatus {
  currentRank: RankDefinition | null;
  rankEnum: RankDesignation;
  rankName: string;
  rankHindiName: string;
  rankLevel: number;
  leftRP: number;
  rightRP: number;
  matchedRP: number;
  nextRank: RankDefinition | null;
  progressPercent: number;
  rpNeededForNext: number;
  allRanks: Array<
    RankDefinition & {
      status: 'ACHIEVED' | 'CURRENT' | 'NEXT' | 'LOCKED';
      progressPercent: number;
      rpNeeded: number;
      isCredited?: boolean;
    }
  >;
}

/**
 * Calculates real-time RP and rank progression for a given user
 */
export function calculateRankProgress(
  user: {
    rank: RankDesignation;
    leftVolumePV?: number;
    rightVolumePV?: number;
    leftCarryForwardPV?: number;
    rightCarryForwardPV?: number;
    totalMatchingPaidPV?: number;
    rewardPointsRP?: number;
  },
  creditedRewardIds: string[] = []
): UserRankStatus {
  // Activation PV volume (Repurchase BV is NOT included in RP or Binary Matching)
  const leftVolPV = (user.leftVolumePV || 0) + (user.leftCarryForwardPV || 0) + (user.totalMatchingPaidPV || 0);
  const rightVolPV = (user.rightVolumePV || 0) + (user.rightCarryForwardPV || 0) + (user.totalMatchingPaidPV || 0);
  
  // Rule: 100 PV = 1 RP (1:1 Left & Right Matching)
  const leftRP = Math.floor(leftVolPV / 100);
  const rightRP = Math.floor(rightVolPV / 100);

  // RP is strictly earned from 1:1 Left & Right Matching (100 PV matched = 1 RP)
  const matchedRP = Math.floor((user.totalMatchingPaidPV || 0) / 100);

  // Find user's highest qualified rank strictly based on matchedRP
  let qualifiedRankDef: RankDefinition | null = null;
  for (let i = RANK_DEFINITIONS.length - 1; i >= 0; i--) {
    if (matchedRP >= RANK_DEFINITIONS[i].requiredRP) {
      qualifiedRankDef = RANK_DEFINITIONS[i];
      break;
    }
  }

  // The true earned rank is based on actual matching RP
  const currentRank = qualifiedRankDef;
  const currentLevel = currentRank ? currentRank.level : 0;

  // Next rank is the immediate next milestone
  const nextRank = RANK_DEFINITIONS.find((r) => r.level === currentLevel + 1) || null;

  let progressPercent = 0;
  let rpNeededForNext = 0;

  if (nextRank) {
    const prevRequired = currentRank ? currentRank.requiredRP : 0;
    const interval = nextRank.requiredRP - prevRequired;
    const progressInInterval = Math.max(0, matchedRP - prevRequired);
    progressPercent = Math.min(99, Math.round((progressInInterval / interval) * 100));
    rpNeededForNext = Math.max(0, nextRank.requiredRP - matchedRP);
  } else if (currentRank && currentRank.level === 15) {
    progressPercent = 100;
    rpNeededForNext = 0;
  }

  const creditedSet = new Set(creditedRewardIds);

  const allRanks = RANK_DEFINITIONS.map((r) => {
    let status: 'ACHIEVED' | 'CURRENT' | 'NEXT' | 'LOCKED' = 'LOCKED';
    let rankProgress = 0;
    let rpNeeded = Math.max(0, r.requiredRP - matchedRP);

    // CRITICAL: Qualification for each rank reward is strictly determined
    // by whether user's matched RP meets or exceeds the required RP
    if (matchedRP >= r.requiredRP) {
      if (currentRank && r.level === currentRank.level) {
        status = 'CURRENT';
      } else {
        status = 'ACHIEVED';
      }
      rankProgress = 100;
      rpNeeded = 0;
    } else if (nextRank && r.level === nextRank.level) {
      status = 'NEXT';
      rankProgress = progressPercent;
    } else {
      status = 'LOCKED';
      rankProgress = Math.min(99, Math.round((matchedRP / r.requiredRP) * 100));
    }

    const isCredited = creditedSet.has(`REWARD_${r.id}`) || creditedSet.has(r.id);

    return {
      ...r,
      status,
      progressPercent: rankProgress,
      rpNeeded,
      isCredited,
    };
  });

  return {
    currentRank,
    rankEnum: currentRank ? currentRank.id : 'DISTRIBUTOR',
    rankName: currentRank ? currentRank.name : 'Distributor',
    rankHindiName: currentRank ? currentRank.hindiName : 'डिस्ट्रिब्यूटर (शुरुआती)',
    rankLevel: currentLevel,
    leftRP,
    rightRP,
    matchedRP,
    nextRank,
    progressPercent,
    rpNeededForNext,
    allRanks,
  };
}

/**
 * Credits eligible rank rewards to user's main wallet if not already credited.
 * Uses referenceId 'REWARD_' + rank.id for idempotency.
 */
export async function creditEligibleRankRewards(userId: string): Promise<{
  creditedCount: number;
  creditedAmount: number;
  creditedRanks: string[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      totalMatchingPaidPV: true,
      wallet: {
        select: {
          id: true,
          transactions: {
            where: {
              type: 'AWARD_REWARD',
            },
            select: {
              referenceId: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.wallet) {
    return { creditedCount: 0, creditedAmount: 0, creditedRanks: [] };
  }

  const matchedRP = Math.floor((user.totalMatchingPaidPV || 0) / 100);
  if (matchedRP < 30) {
    return { creditedCount: 0, creditedAmount: 0, creditedRanks: [] };
  }

  const existingRewardRefIds = new Set(
    user.wallet.transactions.map((t) => t.referenceId).filter(Boolean)
  );

  let creditedCount = 0;
  let creditedAmount = 0;
  const creditedRanks: string[] = [];

  for (const rank of RANK_DEFINITIONS) {
    // If qualified for this rank and reward has not been credited
    if (matchedRP >= rank.requiredRP) {
      const refId = `REWARD_${rank.id}`;
      if (!existingRewardRefIds.has(refId) && rank.rewardValueApprox > 0) {
        await creditIncomeWithAutoPoolCheck({
          userId: user.id,
          amount: rank.rewardValueApprox,
          type: 'AWARD_REWARD',
          referenceId: refId,
          remarks: `रैंक रिवार्ड - ${rank.name} (${rank.hindiName}): ${rank.rewardHindi}`,
        });
        existingRewardRefIds.add(refId);
        creditedCount++;
        creditedAmount += rank.rewardValueApprox;
        creditedRanks.push(rank.name);
      }
    }
  }

  return { creditedCount, creditedAmount, creditedRanks };
}

/**
 * Re-evaluates a single user's rank from DB, upgrades user.rank to matchedRP,
 * and credits any eligible rank rewards to the user's Main Wallet.
 */
export async function syncUserRank(userId: string): Promise<UserRankStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      rank: true,
      leftVolumePV: true,
      rightVolumePV: true,
      leftCarryForwardPV: true,
      rightCarryForwardPV: true,
      totalMatchingPaidPV: true,
      rewardPointsRP: true,
      wallet: {
        select: {
          transactions: {
            where: { type: 'AWARD_REWARD' },
            select: { referenceId: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Credit any eligible uncredited rank rewards first
  await creditEligibleRankRewards(userId);

  const existingRewardRefIds = (user.wallet?.transactions || [])
    .map((t) => t.referenceId)
    .filter(Boolean) as string[];

  const status = calculateRankProgress(user, existingRewardRefIds);
  const correctRank = status.currentRank ? status.currentRank.id : 'DISTRIBUTOR';

  if (user.rank !== correctRank || user.rewardPointsRP !== status.matchedRP) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        rank: correctRank,
        rewardPointsRP: status.matchedRP,
      },
    });
  }

  return status;
}

/**
 * Evaluates all active members across the database, updates their rank designations,
 * and credits any eligible rank rewards to their Main Wallet.
 */
export async function syncAllUsersRanks(): Promise<{
  totalProcessed: number;
  upgradedCount: number;
  totalRewardsCredited: number;
  totalRewardAmount: number;
}> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      rank: true,
      leftVolumePV: true,
      rightVolumePV: true,
      leftCarryForwardPV: true,
      rightCarryForwardPV: true,
      totalMatchingPaidPV: true,
      rewardPointsRP: true,
    },
  });

  let upgradedCount = 0;
  let totalRewardsCredited = 0;
  let totalRewardAmount = 0;

  for (const u of users) {
    const status = calculateRankProgress(u);
    const correctRank = status.currentRank ? status.currentRank.id : 'DISTRIBUTOR';

    if (u.rank !== correctRank || u.rewardPointsRP !== status.matchedRP) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          rank: correctRank,
          rewardPointsRP: status.matchedRP,
        },
      });
      upgradedCount++;
    }

    if (status.matchedRP >= 30) {
      const rewardRes = await creditEligibleRankRewards(u.id);
      totalRewardsCredited += rewardRes.creditedCount;
      totalRewardAmount += rewardRes.creditedAmount;
    }
  }

  return {
    totalProcessed: users.length,
    upgradedCount,
    totalRewardsCredited,
    totalRewardAmount,
  };
}
