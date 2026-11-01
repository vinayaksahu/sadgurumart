import { prisma } from '@/lib/prisma';

export interface BinaryPlacementResult {
  parentId: string;
  position: 'LEFT' | 'RIGHT';
}

/**
 * Finds the extreme spillover placement under a given parent on LEFT or RIGHT leg
 */
export async function findSpilloverPlacement(
  startUserId: string,
  preferredPosition: 'LEFT' | 'RIGHT'
): Promise<BinaryPlacementResult> {
  let currentParentId = startUserId;

  while (true) {
    // Check if currentParent already has a child on preferredPosition
    const existingChild = await prisma.user.findFirst({
      where: {
        placementParentId: currentParentId,
        placementPosition: preferredPosition,
      },
      select: { id: true },
    });

    if (!existingChild) {
      // Slot is open!
      return {
        parentId: currentParentId,
        position: preferredPosition,
      };
    }

    // Traverse deeper down the preferred extreme leg
    currentParentId = existingChild.id;
  }
}

/**
 * Propagate PV volume up the binary tree when an order or activation occurs
 */
export async function propagateBinaryVolume(
  userId: string,
  pvAmount: number
): Promise<void> {
  if (pvAmount <= 0) return;

  let currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, placementParentId: true, placementPosition: true },
  });

  while (currentUser && currentUser.placementParentId && currentUser.placementPosition) {
    const parentId = currentUser.placementParentId;
    const pos = currentUser.placementPosition;

    if (pos === 'LEFT') {
      await prisma.user.update({
        where: { id: parentId },
        data: { leftVolumePV: { increment: pvAmount } },
      });
    } else if (pos === 'RIGHT') {
      await prisma.user.update({
        where: { id: parentId },
        data: { rightVolumePV: { increment: pvAmount } },
      });
    }

    // Move up to the next ancestor
    currentUser = await prisma.user.findUnique({
      where: { id: parentId },
      select: { id: true, placementParentId: true, placementPosition: true },
    });
  }
}

/**
 * Executes Binary Matching calculation for an individual user
 */
export async function calculateUserBinaryMatching(
  userId: string
): Promise<{
  matchedPV: number;
  matchingIncome: number;
  leftCarry: number;
  rightCarry: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      directReferrals: { select: { id: true, placementPosition: true, isActive: true } },
    },
  });

  if (!user || !user.isActive) {
    return { matchedPV: 0, matchingIncome: 0, leftCarry: user?.leftCarryForwardPV || 0, rightCarry: user?.rightCarryForwardPV || 0 };
  }

  // Check 1:1 or First Pair qualification:
  // Must have at least 1 active direct referral on Left and 1 on Right (except root account)
  const isRoot = user.userCode === 'SGM10001';
  const hasActiveLeft = user.directReferrals.some((d) => d.placementPosition === 'LEFT' && d.isActive);
  const hasActiveRight = user.directReferrals.some((d) => d.placementPosition === 'RIGHT' && d.isActive);
  const isQualified = isRoot || (hasActiveLeft && hasActiveRight);

  const totalLeft = user.leftCarryForwardPV + user.leftVolumePV;
  const totalRight = user.rightCarryForwardPV + user.rightVolumePV;

  if (!isQualified || totalLeft <= 0 || totalRight <= 0) {
    // Just carry forward
    await prisma.user.update({
      where: { id: userId },
      data: {
        leftCarryForwardPV: totalLeft,
        rightCarryForwardPV: totalRight,
        leftVolumePV: 0,
        rightVolumePV: 0,
      },
    });
    return { matchedPV: 0, matchingIncome: 0, leftCarry: totalLeft, rightCarry: totalRight };
  }

  // 1:1 Matching
  const matchedPV = Math.min(totalLeft, totalRight);
  const matchingIncome = matchedPV * 0.10; // 10% Matching Income as per PDF

  const leftCarry = totalLeft - matchedPV;
  const rightCarry = totalRight - matchedPV;

  // Update user volume & matching record
  await prisma.user.update({
    where: { id: userId },
    data: {
      leftCarryForwardPV: leftCarry,
      rightCarryForwardPV: rightCarry,
      leftVolumePV: 0,
      rightVolumePV: 0,
      totalMatchingPaidPV: { increment: matchedPV },
      rewardPointsRP: { increment: matchedPV }, // RP accumulates 1:1 for Awards & Rewards
    },
  });

  // Credit user wallet if income > 0
  if (matchingIncome > 0 && user.wallet) {
    await prisma.wallet.update({
      where: { id: user.wallet.id },
      data: {
        mainBalance: { increment: matchingIncome },
        totalEarned: { increment: matchingIncome },
      },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: user.wallet.id,
        type: 'BINARY_MATCHING',
        amount: matchingIncome,
        closingBalance: user.wallet.mainBalance + matchingIncome,
        remarks: `Binary Matching 10% on ${matchedPV} PV (L: ${totalLeft}, R: ${totalRight})`,
      },
    });
  }

  return { matchedPV, matchingIncome, leftCarry, rightCarry };
}
