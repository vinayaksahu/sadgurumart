import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateUserBinaryMatching } from '@/lib/mlm/binaryEngine';
import { creditSponsorMatchingRoyalty } from '@/lib/mlm/royaltyEngine';
import { verifySuperToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // Security check: either authorized via CRON_SECRET header or Superadmin cookie
    const cronSecret = req.headers.get('x-cron-secret');
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const isAuthorizedBySecret = cronSecret && cronSecret === (process.env.CRON_SECRET || 'sgm_daily_cron_secret_2026');
    const isAuthorizedBySuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;

    if (!isAuthorizedBySecret && !isAuthorizedBySuper) {
      return NextResponse.json(
        { error: 'Unauthorized daily closing execution' },
        { status: 401 }
      );
    }

    console.log('⏰ Starting SGM Mart Daily Midnight Closing Calculation...');

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, userCode: true, name: true, sponsorId: true },
    });

    let totalMatchedPV = 0;
    let totalMatchingPaid = 0;
    let totalRoyaltyPaid = 0;
    let processedCount = 0;

    for (const user of activeUsers) {
      const matchResult = await calculateUserBinaryMatching(user.id);
      if (matchResult.matchingIncome > 0) {
        totalMatchedPV += matchResult.matchedPV;
        totalMatchingPaid += matchResult.matchingIncome;

        // Credit 10% Sponsor Matching Royalty to direct sponsor
        if (user.sponsorId) {
          const royalty = await creditSponsorMatchingRoyalty(user.id, matchResult.matchingIncome);
          totalRoyaltyPaid += royalty;
        }
      }
      processedCount++;
    }

    // Rank Promotion Check based on cumulative reward points (RP)
    // Star 1 (30 RP), Star 2 (150 RP), Star 3 (500 RP), Silver (3,000 RP), Gold (5,000 RP)...
    for (const user of activeUsers) {
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, rewardPointsRP: true, rank: true },
      });

      if (updatedUser) {
        const rp = updatedUser.rewardPointsRP;
        let newRank = updatedUser.rank;

        if (rp >= 20000000) newRank = 'CROWN_AMBASSADOR';
        else if (rp >= 8000000) newRank = 'ROYAL_AMBASSADOR';
        else if (rp >= 4000000) newRank = 'AMBASSADOR';
        else if (rp >= 2000000) newRank = 'KOHINOOR';
        else if (rp >= 1000000) newRank = 'TRIPLE_DIAMOND';
        else if (rp >= 500000) newRank = 'DOUBLE_DIAMOND';
        else if (rp >= 100000) newRank = 'DIAMOND';
        else if (rp >= 40000) newRank = 'EMERALD';
        else if (rp >= 20000) newRank = 'PLATINUM';
        else if (rp >= 10000) newRank = 'RUBY';
        else if (rp >= 5000) newRank = 'GOLD';
        else if (rp >= 3000) newRank = 'SILVER';
        else if (rp >= 500) newRank = 'STAR_3';
        else if (rp >= 150) newRank = 'STAR_2';
        else if (rp >= 30) newRank = 'STAR_1';

        if (newRank !== updatedUser.rank) {
          await prisma.user.update({
            where: { id: user.id },
            data: { rank: newRank },
          });
        }
      }
    }

    console.log(`✅ Daily Closing Finished. Evaluated: ${processedCount}, Total Matching: ₹${totalMatchingPaid}, Royalty: ₹${totalRoyaltyPaid}`);

    return NextResponse.json({
      success: true,
      message: 'Daily Midnight Closing completed successfully',
      summary: {
        usersEvaluated: processedCount,
        totalMatchedPV,
        totalMatchingPaid,
        totalRoyaltyPaid,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Daily closing error:', error);
    return NextResponse.json(
      { error: error.message || 'Daily closing failed' },
      { status: 500 }
    );
  }
}
