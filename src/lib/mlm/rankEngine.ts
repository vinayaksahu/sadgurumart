import { prisma } from '@/lib/prisma';
import { RankDesignation, User } from '@prisma/client';
import { RANK_DEFINITIONS, RankDefinition, LIFESTYLE_FUNDS } from './rankData';

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
    }
  >;
}

/**
 * Calculates real-time RP and rank progression for a given user
 */
export function calculateRankProgress(user: {
  rank: RankDesignation;
  leftVolumePV?: number;
  rightVolumePV?: number;
  leftCarryForwardPV?: number;
  rightCarryForwardPV?: number;
  totalMatchingPaidPV?: number;
  rewardPointsRP?: number;
}): UserRankStatus {
  const leftVol = (user.leftVolumePV || 0) + (user.leftCarryForwardPV || 0) + (user.totalMatchingPaidPV || 0);
  const rightVol = (user.rightVolumePV || 0) + (user.rightCarryForwardPV || 0) + (user.totalMatchingPaidPV || 0);
  
  // RP is accumulated based on 1:1 Left & Right Matching
  const matchedRP = Math.max(
    user.rewardPointsRP || 0,
    user.totalMatchingPaidPV || 0,
    Math.min(leftVol, rightVol)
  );

  // Find user's highest qualified rank based on matchedRP
  let qualifiedRankDef: RankDefinition | null = null;
  for (let i = RANK_DEFINITIONS.length - 1; i >= 0; i--) {
    if (matchedRP >= RANK_DEFINITIONS[i].requiredRP) {
      qualifiedRankDef = RANK_DEFINITIONS[i];
      break;
    }
  }

  // Also check if user was manually assigned a rank higher than matchedRP
  const assignedRankDef = RANK_DEFINITIONS.find((r) => r.id === user.rank) || null;
  const currentRank = (assignedRankDef && (!qualifiedRankDef || assignedRankDef.level >= qualifiedRankDef.level))
    ? assignedRankDef
    : qualifiedRankDef;

  const currentLevel = currentRank ? currentRank.level : 0;

  // Next rank
  const nextRank = RANK_DEFINITIONS.find((r) => r.level === currentLevel + 1) || null;

  let progressPercent = 0;
  let rpNeededForNext = 0;

  if (nextRank) {
    const prevRequired = currentRank ? currentRank.requiredRP : 0;
    const interval = nextRank.requiredRP - prevRequired;
    const progressInInterval = Math.max(0, matchedRP - prevRequired);
    progressPercent = Math.min(100, Math.round((progressInInterval / interval) * 100));
    rpNeededForNext = Math.max(0, nextRank.requiredRP - matchedRP);
  } else if (currentRank && currentRank.level === 15) {
    progressPercent = 100;
    rpNeededForNext = 0;
  }

  const allRanks = RANK_DEFINITIONS.map((r) => {
    let status: 'ACHIEVED' | 'CURRENT' | 'NEXT' | 'LOCKED' = 'LOCKED';
    let rankProgress = 0;
    let rpNeeded = Math.max(0, r.requiredRP - matchedRP);

    if (currentRank && r.level === currentRank.level) {
      status = 'CURRENT';
      rankProgress = 100;
    } else if (currentRank && r.level < currentRank.level) {
      status = 'ACHIEVED';
      rankProgress = 100;
    } else if (nextRank && r.level === nextRank.level) {
      status = 'NEXT';
      rankProgress = progressPercent;
    } else {
      status = 'LOCKED';
      rankProgress = Math.min(100, Math.round((matchedRP / r.requiredRP) * 100));
    }

    return {
      ...r,
      status,
      progressPercent: rankProgress,
      rpNeeded,
    };
  });

  return {
    currentRank,
    rankEnum: user.rank,
    rankName: currentRank ? currentRank.name : 'Distributor',
    rankHindiName: currentRank ? currentRank.hindiName : 'डिस्ट्रिब्यूटर (शुरुआती)',
    rankLevel: currentLevel,
    leftRP: leftVol,
    rightRP: rightVol,
    matchedRP,
    nextRank,
    progressPercent,
    rpNeededForNext,
    allRanks,
  };
}

/**
 * Re-evaluates a single user's rank from DB and upgrades user.rank if qualified
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
    },
  });

  if (!user) return null;

  const status = calculateRankProgress(user);

  // If calculated rank enum is higher than currently saved in DB, update DB
  if (status.currentRank && status.currentRank.id !== user.rank) {
    // Only upgrade (do not downgrade automatically unless admin overrides)
    const currentDbDef = RANK_DEFINITIONS.find((r) => r.id === user.rank);
    const currentDbLevel = currentDbDef ? currentDbDef.level : 0;

    if (status.currentRank.level > currentDbLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          rank: status.currentRank.id,
          rewardPointsRP: status.matchedRP,
        },
      });
    }
  }

  return status;
}

/**
 * Evaluates all active members across the database and updates their rank designations
 */
export async function syncAllUsersRanks(): Promise<{
  totalProcessed: number;
  upgradedCount: number;
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

  for (const u of users) {
    const status = calculateRankProgress(u);
    if (status.currentRank && status.currentRank.id !== u.rank) {
      const currentDbDef = RANK_DEFINITIONS.find((r) => r.id === u.rank);
      const currentDbLevel = currentDbDef ? currentDbDef.level : 0;

      if (status.currentRank.level > currentDbLevel) {
        await prisma.user.update({
          where: { id: u.id },
          data: {
            rank: status.currentRank.id,
            rewardPointsRP: status.matchedRP,
          },
        });
        upgradedCount++;
      }
    }
  }

  return {
    totalProcessed: users.length,
    upgradedCount,
  };
}
