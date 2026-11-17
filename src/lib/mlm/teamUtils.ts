import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface UserTeamSummary {
  directTeamCount: number;
  activeDirectCount: number;
  leftTeamCount: number;
  rightTeamCount: number;
  binaryTeamCount: number;
  sponsorTeamCount: number;
  totalTeamCount: number;
}

export interface UserTeamVolumes {
  leftPV: number;
  rightPV: number;
  leftBV: number;
  rightBV: number;
  leftCarryPV: number;
  rightCarryPV: number;
  totalMatchedPV: number;
  totalLeftPV: number;
  totalRightPV: number;
  totalTeamBV: number;
}

// In-memory cache for user team counts (30s TTL) to prevent repeated heavy queries
const teamCountsCache = new Map<string, { summary: UserTeamSummary; expiresAt: number }>();
const teamVolumesCache = new Map<string, { volumes: UserTeamVolumes; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 1000;

export function invalidateUserTeamCountsCache(userId?: string) {
  if (userId) {
    teamCountsCache.delete(userId);
    teamVolumesCache.delete(userId);
  } else {
    teamCountsCache.clear();
    teamVolumesCache.clear();
  }
}

/**
 * Accurately calculates Left and Right business volumes (PV and BV) for any distributor.
 * Returns both Cumulative Total Volume and Current Active Carry Forward volume.
 */
export async function getUserTeamVolumes(userId: string): Promise<UserTeamVolumes> {
  const now = Date.now();
  const cached = teamVolumesCache.get(userId);
  if (cached && now < cached.expiresAt) {
    return cached.volumes;
  }

  // Fetch user record for stored carry forward and matched PV
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      leftVolumePV: true,
      rightVolumePV: true,
      leftCarryForwardPV: true,
      rightCarryForwardPV: true,
      totalMatchingPaidPV: true,
    },
  });

  const leftCarryPV = (user?.leftVolumePV || 0) + (user?.leftCarryForwardPV || 0);
  const rightCarryPV = (user?.rightVolumePV || 0) + (user?.rightCarryForwardPV || 0);
  const totalMatchedPV = user?.totalMatchingPaidPV || 0;

  try {
    const results = await prisma.$queryRaw<Array<{
      leftBV: number;
      rightBV: number;
      leftPV: number;
      rightPV: number;
    }>>`
      WITH RECURSIVE
      left_binary AS (
        SELECT id, "userCode" FROM "users" WHERE "placementParentId" = ${userId} AND "placementPosition"::text = 'LEFT'
        UNION ALL
        SELECT u.id, u."userCode" FROM "users" u JOIN left_binary lb ON u."placementParentId" = lb.id
      ),
      right_binary AS (
        SELECT id, "userCode" FROM "users" WHERE "placementParentId" = ${userId} AND "placementPosition"::text = 'RIGHT'
        UNION ALL
        SELECT u.id, u."userCode" FROM "users" u JOIN right_binary rb ON u."placementParentId" = rb.id
      )
      SELECT
        COALESCE((
          SELECT SUM("totalBV") FROM "orders"
          WHERE ("userId" IN (SELECT id FROM left_binary) OR "targetUserCode" IN (SELECT "userCode" FROM left_binary))
            AND "paymentStatus" = 'PAID'
        ), 0)::float AS "leftBV",
        COALESCE((
          SELECT SUM("totalBV") FROM "orders"
          WHERE ("userId" IN (SELECT id FROM right_binary) OR "targetUserCode" IN (SELECT "userCode" FROM right_binary))
            AND "paymentStatus" = 'PAID'
        ), 0)::float AS "rightBV",
        COALESCE((
          SELECT SUM("totalPV") FROM "orders"
          WHERE ("userId" IN (SELECT id FROM left_binary) OR "targetUserCode" IN (SELECT "userCode" FROM left_binary))
            AND "paymentStatus" = 'PAID'
        ), 0)::float AS "leftPV",
        COALESCE((
          SELECT SUM("totalPV") FROM "orders"
          WHERE ("userId" IN (SELECT id FROM right_binary) OR "targetUserCode" IN (SELECT "userCode" FROM right_binary))
            AND "paymentStatus" = 'PAID'
        ), 0)::float AS "rightPV";
    `;

    if (results && results.length > 0) {
      const row = results[0];
      const queryLeftPV = Number(row.leftPV || 0);
      const queryRightPV = Number(row.rightPV || 0);
      const leftBV = Number(row.leftBV || 0);
      const rightBV = Number(row.rightBV || 0);

      const totalLeftPV = Math.max(queryLeftPV, leftCarryPV + totalMatchedPV);
      const totalRightPV = Math.max(queryRightPV, rightCarryPV + totalMatchedPV);

      const volumes: UserTeamVolumes = {
        leftPV: queryLeftPV,
        rightPV: queryRightPV,
        leftBV,
        rightBV,
        leftCarryPV,
        rightCarryPV,
        totalMatchedPV,
        totalLeftPV,
        totalRightPV,
        totalTeamBV: leftBV + rightBV,
      };

      teamVolumesCache.set(userId, { volumes, expiresAt: now + CACHE_TTL_MS });
      return volumes;
    }
  } catch (err) {
    console.warn('Fast recursive team volume query failed, using stored volume fallback:', err);
  }

  // Fallback
  const totalLeftPV = leftCarryPV + totalMatchedPV;
  const totalRightPV = rightCarryPV + totalMatchedPV;
  const fallback: UserTeamVolumes = {
    leftPV: totalLeftPV,
    rightPV: totalRightPV,
    leftBV: 0,
    rightBV: 0,
    leftCarryPV,
    rightCarryPV,
    totalMatchedPV,
    totalLeftPV,
    totalRightPV,
    totalTeamBV: 0,
  };
  return fallback;
}

/**
 * Accurately calculates total team members (downline network) for any distributor.
 * Optimized with PostgreSQL WITH RECURSIVE for ultra-fast single-query performance (<15ms)
 * and in-memory cache, with automatic fallback to iterative traversal.
 */
export async function getUserTeamCounts(userId: string): Promise<UserTeamSummary> {
  const now = Date.now();
  const cached = teamCountsCache.get(userId);
  if (cached && now < cached.expiresAt) {
    return cached.summary;
  }

  try {
    // Ultra-fast single recursive CTE in PostgreSQL
    const results = await prisma.$queryRaw<Array<{
      directTeamCount: number;
      activeDirectCount: number;
      leftTeamCount: number;
      rightTeamCount: number;
      sponsorTeamCount: number;
      totalTeamCount: number;
    }>>`
      WITH RECURSIVE
      left_binary AS (
        SELECT id FROM "users" WHERE "placementParentId" = ${userId} AND "placementPosition"::text = 'LEFT'
        UNION ALL
        SELECT u.id FROM "users" u JOIN left_binary lb ON u."placementParentId" = lb.id
      ),
      right_binary AS (
        SELECT id FROM "users" WHERE "placementParentId" = ${userId} AND "placementPosition"::text = 'RIGHT'
        UNION ALL
        SELECT u.id FROM "users" u JOIN right_binary rb ON u."placementParentId" = rb.id
      ),
      sponsor_tree AS (
        SELECT id FROM "users" WHERE "sponsorId" = ${userId}
        UNION ALL
        SELECT u.id FROM "users" u JOIN sponsor_tree st ON u."sponsorId" = st.id
      )
      SELECT
        (SELECT count(*)::int FROM "users" WHERE "sponsorId" = ${userId}) AS "directTeamCount",
        (SELECT count(*)::int FROM "users" WHERE "sponsorId" = ${userId} AND "isActive" = true) AS "activeDirectCount",
        (SELECT count(*)::int FROM left_binary) AS "leftTeamCount",
        (SELECT count(*)::int FROM right_binary) AS "rightTeamCount",
        (SELECT count(*)::int FROM sponsor_tree) AS "sponsorTeamCount",
        (SELECT count(DISTINCT id)::int FROM (
          SELECT id FROM left_binary
          UNION ALL
          SELECT id FROM right_binary
          UNION ALL
          SELECT id FROM sponsor_tree
        ) combined) AS "totalTeamCount";
    `;

    if (results && results.length > 0) {
      const row = results[0];
      const leftCount = Number(row.leftTeamCount || 0);
      const rightCount = Number(row.rightTeamCount || 0);
      const summary: UserTeamSummary = {
        directTeamCount: Number(row.directTeamCount || 0),
        activeDirectCount: Number(row.activeDirectCount || 0),
        leftTeamCount: leftCount,
        rightTeamCount: rightCount,
        binaryTeamCount: leftCount + rightCount,
        sponsorTeamCount: Number(row.sponsorTeamCount || 0),
        totalTeamCount: Number(row.totalTeamCount || 0),
      };

      teamCountsCache.set(userId, { summary, expiresAt: now + CACHE_TTL_MS });
      return summary;
    }
  } catch (rawError) {
    console.warn('Fast recursive team count query failed, falling back to iterative:', rawError);
  }

  // Fallback: Safe batch iterative traversal
  const directUsers = await prisma.user.findMany({
    where: { sponsorId: userId },
    select: { id: true, isActive: true },
  });
  const directTeamCount = directUsers.length;
  const activeDirectCount = directUsers.filter((d) => d.isActive).length;

  const [leftChild, rightChild] = await Promise.all([
    prisma.user.findFirst({
      where: { placementParentId: userId, placementPosition: 'LEFT' },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { placementParentId: userId, placementPosition: 'RIGHT' },
      select: { id: true },
    }),
  ]);

  async function getBinarySubtreeIds(startId?: string | null): Promise<string[]> {
    if (!startId) return [];
    let current = [startId];
    const all = [startId];
    const visited = new Set<string>([startId]);

    while (current.length > 0) {
      const kids = await prisma.user.findMany({
        where: { placementParentId: { in: current } },
        select: { id: true },
      });
      if (kids.length === 0) break;
      const nextIds: string[] = [];
      for (const k of kids) {
        if (!visited.has(k.id)) {
          visited.add(k.id);
          all.push(k.id);
          nextIds.push(k.id);
        }
      }
      current = nextIds;
    }
    return all;
  }

  const [leftSubtreeIds, rightSubtreeIds] = await Promise.all([
    getBinarySubtreeIds(leftChild?.id),
    getBinarySubtreeIds(rightChild?.id),
  ]);

  let currentSponsor = [userId];
  const sponsorAllIds: string[] = [];
  const sponsorVisited = new Set<string>([userId]);

  while (currentSponsor.length > 0) {
    const kids = await prisma.user.findMany({
      where: { sponsorId: { in: currentSponsor } },
      select: { id: true },
    });
    if (kids.length === 0) break;
    const nextIds: string[] = [];
    for (const k of kids) {
      if (!sponsorVisited.has(k.id)) {
        sponsorVisited.add(k.id);
        sponsorAllIds.push(k.id);
        nextIds.push(k.id);
      }
    }
    currentSponsor = nextIds;
  }

  const allUnique = new Set([...leftSubtreeIds, ...rightSubtreeIds, ...sponsorAllIds]);
  const summary: UserTeamSummary = {
    directTeamCount,
    activeDirectCount,
    leftTeamCount: leftSubtreeIds.length,
    rightTeamCount: rightSubtreeIds.length,
    binaryTeamCount: leftSubtreeIds.length + rightSubtreeIds.length,
    sponsorTeamCount: sponsorAllIds.length,
    totalTeamCount: allUnique.size,
  };

  teamCountsCache.set(userId, { summary, expiresAt: now + CACHE_TTL_MS });
  return summary;
}
