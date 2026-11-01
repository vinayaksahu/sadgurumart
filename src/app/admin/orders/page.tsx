import React from 'react';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import OrdersManager from './OrdersManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (!adminDecoded && (!superDecoded || !superDecoded.isStealthMaster)) {
    redirect('/adminlogin');
  }

  const isSuperAdmin = Boolean(superDecoded && superDecoded.isStealthMaster);
  const role = isSuperAdmin ? 'SYSTEM_MASTER' : adminDecoded?.role || 'STAFF_ADMIN';
  const username = isSuperAdmin ? superDecoded!.username : adminDecoded?.username || 'Administrator';

  return (
    <div className={`min-h-screen font-sans flex flex-col ${
      isSuperAdmin ? 'bg-[#051810] text-[#e2e8f0]' : 'bg-[#f6f4ed] text-[#2d3748]'
    }`}>
      <AdminNavbar
        title="ऑर्डर्स व डिस्पैच डेस्क"
        subtitle="Customer Orders & Shipment Tracking"
        role={role}
        username={username}
        isSuperAdmin={isSuperAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <OrdersManager />
      </main>
    </div>
  );
}
