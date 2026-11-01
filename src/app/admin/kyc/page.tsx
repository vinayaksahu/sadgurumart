import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import AdminKYCActions from './AdminKYCActions';

export default async function AdminKYCPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const isAdmin = adminToken && verifyAdminToken(adminToken);
  const isSuper = superToken && verifySuperToken(superToken)?.isStealthMaster;

  if (!isAdmin && !isSuper) redirect('/adminlogin');

  const kycList = await prisma.kYCDetail.findMany({
    include: {
      user: { select: { userCode: true, name: true, mobile: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] font-sans flex flex-col">
      <AdminNavbar 
        title="KYC Verification Desk"
        subtitle="Direct Seller PAN & Bank Approvals"
        role="STAFF_ADMIN"
        username={isAdmin ? (isAdmin as any).username : 'Admin'}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-[#144732]">
              प्राप्त केवाईसी आवेदन ({kycList.length} कुल रिकॉर्ड)
            </h2>
          </div>

          {kycList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              कोई लंबित केवाईसी आवेदन नहीं है।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3">Member ID</th>
                    <th className="py-3 px-3">नाम व मोबाइल</th>
                    <th className="py-3 px-3">पैन कार्ड</th>
                    <th className="py-3 px-3">बैंक खाता विवरण</th>
                    <th className="py-3 px-3">स्थिति</th>
                    <th className="py-3 px-3 text-right">कार्रवाई (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kycList.map((kyc) => (
                    <tr key={kyc.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-black text-[#144732]">
                        {kyc.user.userCode}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        <div>{kyc.user.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{kyc.user.mobile}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {kyc.panNumber}
                        <div className="text-[10px] text-slate-500 font-normal">Aadhaar: {kyc.aadhaarNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{kyc.bankName}</div>
                        <div className="font-mono text-slate-600">A/C: {kyc.bankAccountNumber}</div>
                        <div className="font-mono text-[10px] text-slate-500">IFSC: {kyc.ifscCode}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          kyc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          kyc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {kyc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <AdminKYCActions kyc={kyc as any} currentStatus={kyc.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
