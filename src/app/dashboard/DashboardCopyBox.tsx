'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

export default function DashboardCopyBox({ userCode }: { userCode: string }) {
  const [copiedPos, setCopiedPos] = useState<'LEFT' | 'RIGHT' | null>(null);

  const getLink = (pos: 'LEFT' | 'RIGHT') => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/register?ref=${userCode}&pos=${pos}`;
    }
    return `https://www.sadgurumart.com/register?ref=${userCode}&pos=${pos}`;
  };

  const handleCopy = (pos: 'LEFT' | 'RIGHT') => {
    const link = getLink(pos);
    navigator.clipboard.writeText(link);
    setCopiedPos(pos);
    setTimeout(() => setCopiedPos(null), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-200 min-w-0">
        <Share2 className="w-4 h-4 text-[#d4a359] shrink-0" />
        <span className="break-words">रेफरल लिंक (Share & Earn 10% Direct):</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Left Link Button */}
        <button
          onClick={() => handleCopy('LEFT')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
        >
          {copiedPos === 'LEFT' ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 text-[#d4a359] shrink-0" />}
          <span>{copiedPos === 'LEFT' ? 'Copied Left!' : 'Copy Left Team Link'}</span>
        </button>

        {/* Right Link Button */}
        <button
          onClick={() => handleCopy('RIGHT')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
        >
          {copiedPos === 'RIGHT' ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 text-[#d4a359] shrink-0" />}
          <span>{copiedPos === 'RIGHT' ? 'Copied Right!' : 'Copy Right Team Link'}</span>
        </button>
      </div>
    </div>
  );
}
