const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const targetUsername = 'admin';
  const targetPassword = '6267392508';
  const targetEmail = 'admin@sadgurumart.com';

  console.log(`Setting up Admin account:`);
  console.log(`Username: ${targetUsername}`);
  console.log(`Password: ${targetPassword}`);

  const hashedPassword = await bcrypt.hash(targetPassword, 10);

  // Check if admin with username exists
  const existingByUsername = await prisma.admin.findUnique({
    where: { username: targetUsername },
  });

  let adminUser;
  if (existingByUsername) {
    adminUser = await prisma.admin.update({
      where: { username: targetUsername },
      data: {
        passwordHash: hashedPassword,
        isActive: true,
        role: 'GENERAL_ADMIN',
        permissions: {
          canManageOrders: true,
          canVerifyKYC: true,
          canManageProducts: true,
          canApproveWithdrawals: true,
          canManageInventory: true,
          canManageGallery: true,
        },
      },
    });
    console.log(`✅ Existing admin account '${targetUsername}' updated successfully.`);
  } else {
    // Check if email is already taken
    const existingByEmail = await prisma.admin.findUnique({
      where: { email: targetEmail },
    });

    const emailToUse = existingByEmail ? `admin_${Date.now()}@sadgurumart.com` : targetEmail;

    adminUser = await prisma.admin.create({
      data: {
        username: targetUsername,
        email: emailToUse,
        fullName: 'SGM Mart Admin',
        passwordHash: hashedPassword,
        role: 'GENERAL_ADMIN',
        isActive: true,
        permissions: {
          canManageOrders: true,
          canVerifyKYC: true,
          canManageProducts: true,
          canApproveWithdrawals: true,
          canManageInventory: true,
          canManageGallery: true,
        },
      },
    });
    console.log(`✅ Admin account '${targetUsername}' created successfully.`);
  }

  console.log('Admin details:', {
    id: adminUser.id,
    username: adminUser.username,
    email: adminUser.email,
    role: adminUser.role,
    isActive: adminUser.isActive,
  });

  // Also check if login works
  const verifyMatch = await bcrypt.compare(targetPassword, adminUser.passwordHash);
  console.log(`Password verification test: ${verifyMatch ? 'SUCCESS (Password matches hash)' : 'FAILED'}`);
}

main()
  .catch((e) => {
    console.error('Error setting admin credentials:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
