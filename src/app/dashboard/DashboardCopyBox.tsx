'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

export default function DashboardCopyBox({ userCode }: { userCode: string }) {
  const [copiedPos, setCopiedPos] = useState<'LEFT' | 'RIGHT' | null>(null);

  const getLink = (pos: 'LEFT' | 'RIGHT') => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/register?ref=${userCode}&pos=${pos}`;
    }
    return `https://sadgurumart.online/register?ref=${userCode}&pos=${pos}`;
  };

  const handleCopy = (pos: 'LEFT' | 'RIGHT') => {
    const link = getLink(pos);
    navigator.clipboard.writeText(link);
    setCopiedPos(pos);
    setTimeout(() => setCopiedPos(null), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
        <Share2 className="w-4 h-4 text-[#d4a359]" />
        <span>आपका रेफरल लिंक (Share & Earn 10% Direct):</span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Left Link Button */}
        <button
          onClick={() => handleCopy('LEFT')}
          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedPos === 'LEFT' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#d4a359]" />}
          <span>{copiedPos === 'LEFT' ? 'Copied Left!' : 'Copy Left Team Link'}</span>
        </button>

        {/* Right Link Button */}
        <button
          onClick={() => handleCopy('RIGHT')}
          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedPos === 'RIGHT' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#d4a359]" />}
          <span>{copiedPos === 'RIGHT' ? 'Copied Right!' : 'Copy Right Team Link'}</span>
        </button>
      </div>
    </div>
  );
}
