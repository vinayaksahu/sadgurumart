import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Building, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import KYCForm from './KYCForm';

export default async function KYCPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_user_token')?.value;

  if (!token) redirect('/login');
  const decoded = verifyUserToken(token);
  if (!decoded) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { kycDetail: true },
  });

  if (!user) redirect('/login');

  const kyc = user.kycDetail;

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <MemberNavbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#144732] tracking-tight">
              बैंक एवं केवाईसी सत्यापन (KYC & Bank Details)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्यक्ष बिक्री नियम 2021 के तहत सुरक्षित बैंक ट्रांसफर एवं पैन सत्यापन अनिवार्य है।
            </p>
          </div>
        </div>

        {/* Current Status Banner */}
        {kyc && (
          <div className={`p-5 rounded-3xl border-2 flex items-center justify-between ${
            kyc.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
            kyc.status === 'REJECTED' ? 'bg-red-50 border-red-300 text-red-900' :
            'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {kyc.status === 'APPROVED' ? <CheckCircle2 className="w-7 h-7 text-emerald-600" /> :
               kyc.status === 'REJECTED' ? <AlertCircle className="w-7 h-7 text-red-600" /> :
               <Clock className="w-7 h-7 text-amber-600" />}
              <div>
                <div className="font-black text-sm uppercase tracking-wider">
                  KYC Status: {kyc.status}
                </div>
                <div className="text-xs mt-0.5">
                  {kyc.status === 'APPROVED' ? 'आपका बैंक खाता और पैन कार्ड पूरी तरह सत्यापित है। विड्रॉल सक्रिय है।' :
                   kyc.status === 'REJECTED' ? `कारण: ${kyc.rejectionReason || 'त्रुटिपूर्ण जानकारी'}. कृपया सही विवरण पुनः दर्ज करें।` :
                   'आपका विवरण सबमिट हो चुका है और वेरिफिकेशन टीम द्वारा रिव्यू किया जा रहा है।'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <KYCForm initialData={kyc ? kyc : (user.pan ? { panNumber: user.pan } : undefined)} />
        </div>
      </main>
    </div>
  );
}
