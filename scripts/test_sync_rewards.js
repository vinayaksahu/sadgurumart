const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Testing rank rewards sync...');
  // Dynamically import rankEngine compiled or use direct DB test
  const users = await prisma.user.findMany({
    where: {
      totalMatchingPaidPV: { gt: 0 }
    },
    select: {
      id: true,
      userCode: true,
      name: true,
      rank: true,
      totalMatchingPaidPV: true,
      rewardPointsRP: true,
      wallet: {
        select: {
          id: true,
          mainBalance: true,
          totalEarned: true,
          transactions: {
            where: { type: 'AWARD_REWARD' },
            select: { id: true, amount: true, referenceId: true, remarks: true }
          }
        }
      }
    }
  });

  console.log(`Found ${users.length} users with totalMatchingPaidPV > 0:`);
  for (const u of users) {
    const matchedRP = Math.floor((u.totalMatchingPaidPV || 0) / 100);
    console.log(`User: ${u.userCode} (${u.name}) | Rank: ${u.rank} | MatchingPV: ${u.totalMatchingPaidPV} | MatchedRP: ${matchedRP} | Wallet: ₹${u.wallet?.mainBalance} | Rewards: ${u.wallet?.transactions?.length || 0}`);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
