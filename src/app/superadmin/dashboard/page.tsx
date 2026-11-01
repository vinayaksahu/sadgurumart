import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNavbar from '@/components/AdminNavbar';
import { 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Database, 
  Key, 
  Layers, 
  LogOut, 
  Activity,
  UserCheck,
  Sliders
} from 'lucide-react';

export default async function SuperAdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_super_token')?.value;

  if (!token) {
    redirect('/superadminlogin');
  }

  const decoded = verifySuperToken(token);
  if (!decoded || !decoded.isStealthMaster) {
    redirect('/superadminlogin');
  }

  const [staffAdmins, userCount, orderCount, totalTurnover] = await Promise.all([
    prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalDp: true },
    }),
  ]);

  const turnoverAmount = totalTurnover._sum.totalDp || 0;

  return (
    <div className="min-h-screen bg-[#051810] text-[#e2e8f0] font-sans flex flex-col">
      <AdminNavbar 
        title="MASTER STEALTH TERMINAL"
        subtitle="LEVEL-0 SYSTEM GOVERNANCE • ROOT"
        role="SYSTEM_MASTER"
        username={decoded.username}
        isSuperAdmin={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#d4a359] font-mono font-bold mb-1">
            CORE PLATFORM RECONCILIATION
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Root Authority Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Invisible Layer: Operational staff admins have zero visibility of this terminal.
          </p>
        </div>

        {/* Master System Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0b2b1e]/90 border border-[#144732] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>TOTAL GROSS TURNOVER</span>
              <Activity className="w-4 h-4 text-[#d4a359]" />
            </div>
            <div className="text-3xl font-black text-[#fef08a]">
              ₹{turnoverAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              5% Leadership & 5% CTO Base
            </div>
          </div>

          <div className="bg-[#0b2b1e]/90 border border-[#144732] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>TOTAL NETWORK SELLERS</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{userCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              All registered direct distributors
            </div>
          </div>

          <div className="bg-[#0b2b1e]/90 border border-[#144732] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>OPERATIONAL ADMINS</span>
              <Key className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">{staffAdmins.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Staff accounts in admins table
            </div>
          </div>

          <div className="bg-[#0b2b1e]/90 border border-[#144732] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>SECURITY STATUS</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">ISOLATED</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Separate system_masters entity
            </div>
          </div>
        </div>

        {/* Root Settings Shortcut */}
        <div className="bg-[#0b2b1e]/90 border-2 border-[#d4a359] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#144732] text-[#fef08a] text-[10px] font-mono uppercase tracking-wider border border-[#d4a359]/30">
              <Sliders className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>CORE SYSTEM GOVERNANCE</span>
            </div>
            <h3 className="text-xl font-black text-white">
              System Settings, Plan Modifiers, Database Backup & Announcements
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Modify MLM percentages, daily capping, trigger 1-click full JSON & CSV backups, and post broadcast notices and modal popups.
            </p>
          </div>

          <Link
            href="/admin/settings"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>Open System Settings →</span>
          </Link>
        </div>

        {/* Staff Admins Management by Superadmin */}
        <div className="bg-[#0b2b1e]/80 border border-[#144732] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#144732]">
            <h2 className="text-lg font-black text-white">
              Staff Administrators Governance (ऑपरेशनल स्टाफ सूची)
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Only Root Superadmin can view & configure staff
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#051810] text-[#d4a359] uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Username</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Staff Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#144732]/40">
                {staffAdmins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-[#144732]/20">
                    <td className="py-3.5 px-4 font-bold text-white">{adm.username}</td>
                    <td className="py-3.5 px-4 text-slate-300">{adm.fullName}</td>
                    <td className="py-3.5 px-4 text-[#fef08a]">{adm.role}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                        {adm.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {adm.lastLoginAt ? new Date(adm.lastLoginAt).toLocaleString('hi-IN') : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
