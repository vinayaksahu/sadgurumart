'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
    >
      <Printer className="w-4 h-4 text-slate-600" />
      <span>Print Invoice (प्रिंट रसीद)</span>
    </button>
  );
}
