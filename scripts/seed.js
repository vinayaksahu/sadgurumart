// Seed Script for SGM Mart Database Initialization
// Populates Stealth Superadmin, Operational Admin, 9 Product Categories, Products, and Root MLM Distributor

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting SGM Mart Database Seeding on Neon PostgreSQL...');

  // 1. Create Stealth Superadmin (Only in system_masters table)
  const superPassword = await bcrypt.hash('SuperSGM@2026!Secure', 10);
  const superAdmin = await prisma.systemMaster.upsert({
    where: { username: 'superroot' },
    update: {},
    create: {
      username: 'superroot',
      email: 'master@sadgurumart.com',
      passwordHash: superPassword,
      stealthRole: 'SUPER_ROOT',
    },
  });
  console.log('✅ Stealth Superadmin initialized in system_masters:', superAdmin.username);

  // 2. Create Operational Staff Admin (In admins table)
  const adminPassword = await bcrypt.hash('6267392508', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPassword,
      isActive: true,
      role: 'GENERAL_ADMIN',
    },
    create: {
      username: 'admin',
      email: 'admin@sadgurumart.com',
      fullName: 'Operations Administrator',
      passwordHash: adminPassword,
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
  console.log('✅ Operational Staff Admin initialized in admins:', admin.username);

  // 3. Create 9 Categories as per Business Plan PDF
  const categoriesData = [
    { name: 'किचन केयर (Kitchen Care)', slug: 'kitchen-care', icon: 'Utensils', description: 'Assam Elaichi Tea, Amrit Tulya Tea & Daily Kitchen Products' },
    { name: 'हेल्थ केयर (Health Care)', slug: 'health-care', icon: 'HeartPulse', description: 'Ayurvedic Wellness, Tulsi Drops, Immunity Booster' },
    { name: 'पर्सनल केयर (Personal Care)', slug: 'personal-care', icon: 'Sparkles', description: 'Face Wash, Toothpaste, Bathing Essentials' },
    { name: 'होम केयर (Home Care)', slug: 'home-care', icon: 'Home', description: 'Fragrant Agarbatti, Rose, Mogra, Chandan Incense' },
    { name: 'ब्यूटी केयर (Beauty Care)', slug: 'beauty-care', icon: 'Smile', description: 'Skin Nourishment Creams, Shampoos & Hair Oils' },
    { name: 'कपड़े (Clothing)', slug: 'clothing', icon: 'Shirt', description: 'Quality Daily Lifestyle & Ethnic Apparel' },
    { name: 'ज्वेलरी (Jewellery)', slug: 'jewellery', icon: 'Gem', description: 'Fashion Accessories & Elegant Jewellery' },
    { name: 'एग्रीकल्चर (Agriculture)', slug: 'agriculture', icon: 'Sprout', description: 'Bio-Fertilizers & Organic Crop Boosters' },
    { name: 'इलेक्ट्रॉनिक्स (Electronics)', slug: 'electronics', icon: 'Tv', description: 'Smart Gadgets & Domestic Electronics' },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = c.id;
  }
  console.log('✅ 9 Business Categories Seeded Successfully.');

  // 4. Create Initial Products & Activation Packages from PDF
  const productsData = [
    {
      title: 'SGM Shahi Elaichi Chai (इलायची चाय) - 500 gm',
      slug: 'sgm-shahi-elaichi-chai-500g',
      categoryId: categoryMap['kitchen-care'],
      mrp: 450,
      dpPrice: 349,
      pv: 150,
      bv: 120,
      stockQuantity: 1000,
      isActivation: true,
      description: 'Select Assam Tea Leaves Infused with Pure Cardamom. Rich Royal Aroma and Taste.',
      images: ['/products/tea_500g.jpeg'],
    },
    {
      title: 'SGM Shahi Elaichi Chai (इलायची चाय) - 1 kg',
      slug: 'sgm-shahi-elaichi-chai-1kg',
      categoryId: categoryMap['kitchen-care'],
      mrp: 850,
      dpPrice: 649,
      pv: 300,
      bv: 250,
      stockQuantity: 1000,
      isActivation: true,
      description: 'Economy Family Pack of Assam Cardamom Tea. Pure Natural Ingredients.',
      images: ['/products/tea_1kg.jpeg'],
    },
    {
      title: 'SGM Amrit Tulya Chai (अमृत तुल्य चाय) - 500 gm',
      slug: 'sgm-amrit-tulya-chai-500g',
      categoryId: categoryMap['kitchen-care'],
      mrp: 450,
      dpPrice: 349,
      pv: 150,
      bv: 120,
      stockQuantity: 1000,
      isActivation: true,
      description: 'Traditional Herbal Tea Blend with Ayurvedic Spices.',
      images: ['/products/amrit_tea_500g.jpeg'],
    },
    {
      title: 'SGM Amrit Tulya Chai (अमृत तुल्य चाय) - 1 kg',
      slug: 'sgm-amrit-tulya-chai-1kg',
      categoryId: categoryMap['kitchen-care'],
      mrp: 899,
      dpPrice: 699,
      pv: 300,
      bv: 250,
      stockQuantity: 1000,
      isActivation: true,
      description: '100% Pure Spiced Tea Pack for Refreshment and Energy.',
      images: ['/products/amrit_tea_1kg.jpeg'],
    },
    {
      title: 'SGM Panch Tulsi Drops (तुलसी ड्रॉप्स) - 30 ml',
      slug: 'sgm-panch-tulsi-drops-30ml',
      categoryId: categoryMap['health-care'],
      mrp: 220,
      dpPrice: 150,
      pv: 100,
      bv: 80,
      stockQuantity: 2500,
      isActivation: true,
      description: 'Extracted from 5 Types of Rare Tulsi. Natural Immunity Booster & Detoxifier.',
      images: ['/products/tulsi_30ml.jpeg'],
    },
    {
      title: 'SGM Super Mix Berries Juice (मिक्स बेरी जूस) - 500 ml',
      slug: 'sgm-mix-berries-juice-500ml',
      categoryId: categoryMap['health-care'],
      mrp: 999,
      dpPrice: 750,
      pv: 500,
      bv: 400,
      stockQuantity: 800,
      isActivation: true,
      description: 'Antioxidant Powerhouse with 14 Wild Berries & Acai Berry Extract.',
      images: ['/products/berries_500ml.jpeg'],
    },
    {
      title: 'SGM Kashmiri Saffron Face Wash - 200 ml',
      slug: 'sgm-kashmiri-saffron-face-wash-200ml',
      categoryId: categoryMap['personal-care'],
      mrp: 299,
      dpPrice: 220,
      pv: 100,
      bv: 90,
      stockQuantity: 1500,
      isActivation: false,
      description: 'Enriched with Neem, Aloe Vera, Turmeric & Pure Tea Tree Oil for Radiant Skin.',
      images: ['/products/facewash.jpeg'],
    },
    {
      title: 'SGM Premium Agarbatti (Rose, Mogra & Chandan) - Triple Pack',
      slug: 'sgm-premium-agarbatti-pack',
      categoryId: categoryMap['home-care'],
      mrp: 250,
      dpPrice: 180,
      pv: 80,
      bv: 70,
      stockQuantity: 3000,
      isActivation: false,
      description: 'Divine Long-Lasting Fragrance for Spiritual Peace and Home Cleansing.',
      images: ['/products/agarbatti.jpeg'],
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
  console.log('✅ Initial Products & Activation Packages Seeded.');

  // 5. Create Company Root MLM Distributor (SGM10001)
  const rootPassword = await bcrypt.hash('SgmRoot@2026', 10);
  const rootUser = await prisma.user.upsert({
    where: { userCode: 'SGM010001' },
    update: {},
    create: {
      userCode: 'SGM010001',
      name: 'SGM Mart Master Account',
      email: 'root@sadgurumart.com',
      mobile: '6267392508',
      passwordHash: rootPassword,
      isActive: true,
      activatedAt: new Date(),
      rank: 'CROWN_AMBASSADOR',
      wallet: {
        create: {
          mainBalance: 0,
          p2pBalance: 0,
          shoppingBalance: 0,
          holdBalance: 0,
          autoPoolReserve: 0,
        },
      },
    },
  });
  console.log('✅ Master Root Distributor Seeded:', rootUser.userCode);

  console.log('🎉 SGM Mart Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
