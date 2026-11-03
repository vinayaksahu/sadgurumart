import { prisma } from '@/lib/prisma';

export interface UserTeamSummary {
  directTeamCount: number;
  activeDirectCount: number;
  leftTeamCount: number;
  rightTeamCount: number;
  binaryTeamCount: number;
  sponsorTeamCount: number;
  totalTeamCount: number;
}

/**
 * Accurately calculates total team members (downline network) for any distributor.
 * Traverses both Binary Tree (Left & Right legs) and Referral Sponsor Tree.
 */
export async function getUserTeamCounts(userId: string): Promise<UserTeamSummary> {
  // 1. Direct referrals
  const directUsers = await prisma.user.findMany({
    where: { sponsorId: userId },
    select: { id: true, isActive: true },
  });
  const directTeamCount = directUsers.length;
  const activeDirectCount = directUsers.filter((d) => d.isActive).length;

  // 2. Binary Subtrees (Left & Right)
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

  const binaryTeamCount = leftSubtreeIds.length + rightSubtreeIds.length;

  // 3. Sponsor downline
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
  const sponsorTeamCount = sponsorAllIds.length;

  // Total unique downline members
  const allUnique = new Set([...leftSubtreeIds, ...rightSubtreeIds, ...sponsorAllIds]);
  const totalTeamCount = allUnique.size;

  return {
    directTeamCount,
    activeDirectCount,
    leftTeamCount: leftSubtreeIds.length,
    rightTeamCount: rightSubtreeIds.length,
    binaryTeamCount,
    sponsorTeamCount,
    totalTeamCount,
  };
}
