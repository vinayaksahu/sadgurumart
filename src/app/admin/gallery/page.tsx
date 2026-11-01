import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import GalleryManager from './GalleryManager';

export default async function AdminGalleryPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const isAdmin = adminToken ? verifyAdminToken(adminToken) : null;
  const isSuper = superToken ? verifySuperToken(superToken)?.isStealthMaster : null;

  if (!isAdmin && !isSuper) {
    redirect('/adminlogin');
  }

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <AdminNavbar 
        title="Photo Gallery Desk"
        subtitle="Live Homepage Gallery Photos & Seminars"
        role="STAFF_ADMIN"
        username={isAdmin ? (isAdmin as any).username : 'Admin'}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Suspense fallback={
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-16 text-center">
            <div className="w-8 h-8 border-3 border-[#144732] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs font-bold text-slate-500">गैलरी डेटा लोड हो रहा है...</div>
          </div>
        }>
          <GalleryManager initialItems={items as any} />
        </Suspense>
      </main>
    </div>
  );
}
