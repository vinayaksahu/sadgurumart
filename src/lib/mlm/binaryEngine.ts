import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';

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

  // Fetch system settings for dynamic MLM plan rules
  const settings = await getSystemSettings();
  const unitPV = (settings && settings.minActivationPV > 0) ? settings.minActivationPV : 100;
  const matchingPercent = (settings && settings.binaryMatchingPercent !== undefined) ? settings.binaryMatchingPercent : 10;
  const cappingPV = (settings && settings.dailyMatchingCappingPV > 0) ? settings.dailyMatchingCappingPV : 2500;
  const firstPairRatio = (settings && (settings as any).firstBinaryPairRatio) ? (settings as any).firstBinaryPairRatio : '1:2_OR_2:1';

  // Check whether first matching pair was already completed previously
  const hasDoneFirstPair = Boolean((user as any).firstBinaryPairDone || user.totalMatchingPaidPV > 0);

  let matchedPV = 0;
  let leftCarry = totalLeft;
  let rightCarry = totalRight;
  let pairDescription = '1:1 Ratio';
  let isNewFirstPairCompleted = false;

  if (!hasDoneFirstPair && firstPairRatio === '1:2_OR_2:1') {
    // FIRST PAIR CALCULATION (1:2 or 2:1)
    // 2:1 condition: Left >= 2 * unitPV AND Right >= 1 * unitPV
    // 1:2 condition: Left >= 1 * unitPV AND Right >= 2 * unitPV
    const is2to1Eligible = totalLeft >= 2 * unitPV && totalRight >= unitPV;
    const is1to2Eligible = totalLeft >= unitPV && totalRight >= 2 * unitPV;

    if (!is2to1Eligible && !is1to2Eligible) {
      // Team volume has not yet achieved 1:2 or 2:1 (e.g. only 100:100 or less).
      // Carry forward all volume until 1:2 or 2:1 is achieved.
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

    // Qualifies for First Pair (1:2 or 2:1)!
    let leftFirstDeduct = 0;
    let rightFirstDeduct = 0;

    if (totalLeft >= totalRight) {
      if (is2to1Eligible) {
        leftFirstDeduct = 2 * unitPV;
        rightFirstDeduct = 1 * unitPV;
        pairDescription = `First Pair 2:1 (${2 * unitPV}:${unitPV})`;
      } else {
        leftFirstDeduct = 1 * unitPV;
        rightFirstDeduct = 2 * unitPV;
        pairDescription = `First Pair 1:2 (${unitPV}:${2 * unitPV})`;
      }
    } else {
      if (is1to2Eligible) {
        leftFirstDeduct = 1 * unitPV;
        rightFirstDeduct = 2 * unitPV;
        pairDescription = `First Pair 1:2 (${unitPV}:${2 * unitPV})`;
      } else {
        leftFirstDeduct = 2 * unitPV;
        rightFirstDeduct = 1 * unitPV;
        pairDescription = `First Pair 2:1 (${2 * unitPV}:${unitPV})`;
      }
    }

    // The first pair counts as 1 matched unit (e.g. 100 PV)
    const firstPairMatchedPV = unitPV;

    // Remaining volume after first pair deduction
    const remLeft = totalLeft - leftFirstDeduct;
    const remRight = totalRight - rightFirstDeduct;

    // Subsequent volume in this same closing matches at 1:1
    const subsequentMatchedPV = Math.min(remLeft, remRight);

    matchedPV = firstPairMatchedPV + subsequentMatchedPV;
    leftCarry = remLeft - subsequentMatchedPV;
    rightCarry = remRight - subsequentMatchedPV;

    if (subsequentMatchedPV > 0) {
      pairDescription += ` + ${subsequentMatchedPV} PV (1:1)`;
    }
    isNewFirstPairCompleted = true;
  } else {
    // SUBSEQUENT PAIRS (Pure 1:1 Ratio)
    matchedPV = Math.min(totalLeft, totalRight);
    leftCarry = totalLeft - matchedPV;
    rightCarry = totalRight - matchedPV;
    pairDescription = '1:1 Ratio';
  }

  // Apply Daily Matching Capping (Default 2500 PV)
  const payablePV = cappingPV > 0 ? Math.min(matchedPV, cappingPV) : matchedPV;
  const matchingIncome = payablePV * (matchingPercent / 100);

  // Update user volume & matching record
  await prisma.user.update({
    where: { id: userId },
    data: {
      leftCarryForwardPV: leftCarry,
      rightCarryForwardPV: rightCarry,
      leftVolumePV: 0,
      rightVolumePV: 0,
      totalMatchingPaidPV: { increment: matchedPV },
      ...(isNewFirstPairCompleted ? { firstBinaryPairDone: true } : {}),
      rewardPointsRP: { increment: payablePV }, // RP accumulates for Awards & Rewards
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
        remarks: `Binary Matching ${matchingPercent}% on ${payablePV} PV (${pairDescription}) [Total L: ${totalLeft}, R: ${totalRight}]`,
      },
    });
  }

  return { matchedPV: payablePV, matchingIncome, leftCarry, rightCarry };
}
