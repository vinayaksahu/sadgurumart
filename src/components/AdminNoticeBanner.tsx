'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, ExternalLink } from 'lucide-react';

interface NoticeProps {
  enabled?: boolean;
  type?: string; // INFO, WARNING, SUCCESS, DANGER
  title?: string;
  text?: string;
  link?: string | null;
}

export default function AdminNoticeBanner({
  enabled = true,
  type = 'INFO',
  title = 'महत्वपूर्ण सूचना (Important Notice)',
  text = '',
  link = '',
}: NoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || !text || dismissed) return null;

  const styleConfig = {
    INFO: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badgeBg: 'bg-emerald-700 text-white',
      icon: Info,
      iconColor: 'text-emerald-700',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
    WARNING: {
      bg: 'bg-amber-50 border-amber-300 text-amber-900',
      badgeBg: 'bg-amber-600 text-white',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    DANGER: {
      bg: 'bg-red-50 border-red-300 text-red-900',
      badgeBg: 'bg-red-700 text-white',
      icon: Bell,
      iconColor: 'text-red-700',
      btnBg: 'bg-red-700 hover:bg-red-800 text-white',
    },
    SUCCESS: {
      bg: 'bg-teal-50 border-teal-300 text-teal-900',
      badgeBg: 'bg-teal-700 text-white',
      icon: CheckCircle,
      iconColor: 'text-teal-700',
      btnBg: 'bg-teal-700 hover:bg-teal-800 text-white',
    },
  }[type as 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS'] || {
    bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    badgeBg: 'bg-emerald-700 text-white',
    icon: Info,
    iconColor: 'text-emerald-700',
    btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  };

  const Icon = styleConfig.icon;

  return (
    <div className={`w-full border-2 rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${styleConfig.bg} relative`}>
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 shadow-xs border border-black/5 shrink-0 mt-0.5">
            <Icon className={`w-5 h-5 ${styleConfig.iconColor}`} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${styleConfig.badgeBg}`}>
                एडमिन सूचना (Admin Notice)
              </span>
              {title && (
                <h4 className="font-black text-sm sm:text-base leading-tight">
                  {title}
                </h4>
              )}
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95">
              {text}
            </p>

            {link && (
              <div className="pt-1.5">
                <a
                  href={link}
                  target={link.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black shadow-sm transition-transform active:scale-95 ${styleConfig.btnBg}`}
                >
                  <span>अधिक विवरण देखें (View Details)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          title="बंद करें (Dismiss)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
