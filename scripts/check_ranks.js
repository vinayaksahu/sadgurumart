const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      userCode: true,
      name: true,
      rank: true,
      leftVolumePV: true,
      rightVolumePV: true,
      leftCarryForwardPV: true,
      rightCarryForwardPV: true,
      totalMatchingPaidPV: true,
      rewardPointsRP: true,
    }
  });

  console.log('Total users:', users.length);
  for (const u of users) {
    const leftVolPV = (u.leftVolumePV || 0) + (u.leftCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);
    const rightVolPV = (u.rightVolumePV || 0) + (u.rightCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);
    const matchedRP = Math.floor((u.totalMatchingPaidPV || 0) / 100);
    if (matchedRP > 0 || u.rewardPointsRP > 0 || leftVolPV > 0 || rightVolPV > 0) {
      console.log(`${u.userCode} (${u.name}): totalMatchingPaidPV=${u.totalMatchingPaidPV}, matchedRP=${matchedRP}, rewardPointsRP=${u.rewardPointsRP}, rank=${u.rank}, leftVol=${leftVolPV}, rightVol=${rightVolPV}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
