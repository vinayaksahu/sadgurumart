import { prisma } from '@/lib/prisma';
import { creditIncomeWithAutoPoolCheck } from './incomeDistributor';

/**
 * Credits Direct Referral Bonus (10% of activation PV) to the direct sponsor
 */
export async function creditDirectReferralBonus(
  newUserId: string,
  activationPV: number
): Promise<number> {
  if (activationPV <= 0) return 0;

  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    include: {
      sponsor: {
        include: { wallet: true },
      },
    },
  });

  if (!newUser || !newUser.sponsor || !newUser.sponsor.wallet) {
    return 0;
  }

  const sponsor = newUser.sponsor;
  const wallet = sponsor.wallet;
  if (!wallet) return 0;

  const directBonus = activationPV * 0.10; // 10% PV Direct Bonus as per PDF

  // Track sponsor direct business volume for Leadership (3000 PV) & CTO (5000 PV) qualification
  await prisma.user.update({
    where: { id: sponsor.id },
    data: {
      directBusinessPV: { increment: activationPV },
    },
  });

  // Credit sponsor wallet with 1st income AutoPool check
  await creditIncomeWithAutoPoolCheck({
    userId: sponsor.id,
    amount: directBonus,
    type: 'DIRECT_REFERRAL',
    referenceId: newUser.id,
    remarks: `Direct Referral Bonus 10% on ${activationPV} PV from ${newUser.name} (${newUser.userCode})`,
  });

  return directBonus;
}

/**
 * Credits Sponsor Matching Royalty (10% of direct downline binary matching income)
 */
export async function creditSponsorMatchingRoyalty(
  downlineUserId: string,
  matchingIncomeEarned: number
): Promise<number> {
  if (matchingIncomeEarned <= 0) return 0;

  const user = await prisma.user.findUnique({
    where: { id: downlineUserId },
    include: {
      sponsor: {
        include: { wallet: true },
      },
    },
  });

  if (!user || !user.sponsor || !user.sponsor.wallet || !user.sponsor.isActive) {
    return 0;
  }

  const sponsor = user.sponsor;
  const wallet = sponsor.wallet;
  if (!wallet) return 0;

  const royalty = matchingIncomeEarned * 0.10; // 10% Royalty on direct's matching

  await creditIncomeWithAutoPoolCheck({
    userId: sponsor.id,
    amount: royalty,
    type: 'SPONSOR_ROYALTY',
    referenceId: user.id,
    remarks: `Sponsor Matching Royalty 10% on ₹${matchingIncomeEarned} earned by direct ${user.name} (${user.userCode})`,
  });

  return royalty;
}
