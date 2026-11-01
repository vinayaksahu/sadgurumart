import { prisma } from '@/lib/prisma';

export interface PoolLevelConfig {
  level: number;
  requiredChildren: number;
  ratePerChild: number;
  grossAmount: number;
  upgradeDeduction: number;
  netPayout: number;
}

export const AUTO_POOL_CONFIGS: Record<number, PoolLevelConfig> = {
  1: { level: 1, requiredChildren: 2, ratePerChild: 100, grossAmount: 200, upgradeDeduction: 125, netPayout: 75 },
  2: { level: 2, requiredChildren: 4, ratePerChild: 125, grossAmount: 500, upgradeDeduction: 300, netPayout: 200 },
  3: { level: 3, requiredChildren: 8, ratePerChild: 300, grossAmount: 2400, upgradeDeduction: 1000, netPayout: 1400 },
  4: { level: 4, requiredChildren: 16, ratePerChild: 1000, grossAmount: 16000, upgradeDeduction: 6000, netPayout: 10000 },
  5: { level: 5, requiredChildren: 32, ratePerChild: 6000, grossAmount: 192000, upgradeDeduction: 75000, netPayout: 117000 },
  6: { level: 6, requiredChildren: 64, ratePerChild: 75000, grossAmount: 4800000, upgradeDeduction: 1000000, netPayout: 3800000 },
  7: { level: 7, requiredChildren: 128, ratePerChild: 1000000, grossAmount: 128000000, upgradeDeduction: 0, netPayout: 128000000 },
};

/**
 * Places a user into the global AutoPool matrix for a given level (default Level 1)
 */
export async function placeInAutoPool(
  userId: string,
  poolLevel = 1
): Promise<any> {
  if (poolLevel > 7) return null;

  // Check if user already has an active entry in this level
  const existing = await prisma.autoPoolEntry.findFirst({
    where: { userId, poolLevel, isCompleted: false },
  });
  if (existing) return existing;

  // Find the oldest incomplete entry in this level to attach as child
  const openParent = await prisma.autoPoolEntry.findFirst({
    where: {
      poolLevel,
      isCompleted: false,
    },
    include: {
      children: true,
      user: { include: { wallet: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  let parentPoolId: string | null = null;
  let childPosition = 1;

  if (openParent) {
    parentPoolId = openParent.id;
    childPosition = openParent.children.length + 1;
  }

  // Create new entry
  const newEntry = await prisma.autoPoolEntry.create({
    data: {
      userId,
      poolLevel,
      parentPoolId,
      childPosition,
    },
  });

  // If this entry was placed under an open parent, check if parent completed this level
  if (openParent) {
    const config = AUTO_POOL_CONFIGS[poolLevel];
    const totalChildren = openParent.children.length + 1;

    if (totalChildren >= config.requiredChildren) {
      // Mark parent entry completed
      await prisma.autoPoolEntry.update({
        where: { id: openParent.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          grossAmount: config.grossAmount,
          upgradeDeducted: config.upgradeDeduction,
          netPaidOut: config.netPayout,
        },
      });

      // Credit parent wallet
      if (openParent.user.wallet) {
        await prisma.wallet.update({
          where: { id: openParent.user.wallet.id },
          data: {
            mainBalance: { increment: config.netPayout },
            autoPoolReserve: { increment: config.upgradeDeduction },
            totalEarned: { increment: config.netPayout },
          },
        });

        await prisma.walletTransaction.create({
          data: {
            walletId: openParent.user.wallet.id,
            type: 'AUTOPOOL_INCOME',
            amount: config.netPayout,
            closingBalance: openParent.user.wallet.mainBalance + config.netPayout,
            remarks: `Global AutoPool Level ${poolLevel} Completed! Net ₹${config.netPayout.toLocaleString('en-IN')} (Upgrade: ₹${config.upgradeDeduction})`,
          },
        });
      }

      // Automatically promote parent to the next level (if level < 7)
      if (poolLevel < 7) {
        await placeInAutoPool(openParent.userId, poolLevel + 1);
      }
    }
  }

  return newEntry;
}
