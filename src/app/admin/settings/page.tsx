import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { getSystemSettings } from '@/lib/settings';
import AdminSettingsView from './AdminSettingsView';

export default async function AdminSettingsPage() {
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

  const settings = await getSystemSettings();

  return (
    <div className={`min-h-screen font-sans flex flex-col ${
      isSuperAdmin ? 'bg-[#051810] text-[#e2e8f0]' : 'bg-[#f6f4ed] text-[#2d3748]'
    }`}>
      <AdminNavbar 
        title={isSuperAdmin ? 'MASTER SYSTEM SETTINGS' : 'SGM Mart Admin Control Center'}
        subtitle="Plan Modification • Backup • Announcements • Operations"
        role={role}
        username={username}
        isSuperAdmin={isSuperAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Suspense fallback={
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-16 text-center">
            <div className="w-8 h-8 border-3 border-[#144732] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs font-bold text-slate-500">सेटिंग्स लोड हो रही हैं...</div>
          </div>
        }>
          <AdminSettingsView 
            initialSettings={JSON.parse(JSON.stringify(settings))} 
            isSuperAdmin={isSuperAdmin} 
          />
        </Suspense>
      </main>
    </div>
  );
}
