import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdminViewBannerProps {
  userCode: string;
  userName: string;
}

export default function AdminViewBanner({ userCode, userName }: AdminViewBannerProps) {
  return (
    <div className="bg-[#18181b] text-white border-b-2 border-[#d4a359] px-3 sm:px-6 py-2.5 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[#fef08a] font-black uppercase tracking-wider">👑 एडमिन मोड (Admin Session Active):</span>
          <span>
            आप <strong className="text-white">{userName}</strong> (<span className="text-[#d4a359] font-mono">{userCode}</span>) का मेंबर पोर्टल देख रहे हैं
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/members"
            className="px-3 py-1.5 rounded-lg bg-[#d4a359] hover:bg-[#b8863b] text-slate-900 font-black transition-colors flex items-center gap-1 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>एडमिन मेंबर्स सूची</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            एडमिन डैशबोर्ड
          </Link>
        </div>
      </div>
    </div>
  );
}
