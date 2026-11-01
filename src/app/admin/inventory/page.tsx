import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import InventoryManager from './InventoryManager';

export default async function AdminInventoryPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const isAdmin = adminToken ? verifyAdminToken(adminToken) : null;
  const isSuper = superToken ? verifySuperToken(superToken)?.isStealthMaster : null;

  if (!isAdmin && !isSuper) {
    redirect('/adminlogin');
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <AdminNavbar 
        title="Inventory & Catalog Desk"
        subtitle="Live Product Pricing & Stock Management"
        role="STAFF_ADMIN"
        username={isAdmin ? (isAdmin as any).username : 'Admin'}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <InventoryManager initialProducts={products as any} categories={categories} />
      </main>
    </div>
  );
}
