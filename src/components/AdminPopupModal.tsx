'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Megaphone } from 'lucide-react';

interface PopupProps {
  enabled?: boolean;
  title?: string;
  content?: string;
  imageUrl?: string | null;
  buttonText?: string;
  buttonLink?: string;
  updatedAt?: string | Date;
}

export default function AdminPopupModal({
  enabled = false,
  title = 'विशेष सूचना एवं बंपर ऑफर',
  content = '',
  imageUrl = '',
  buttonText = 'अभी देखें (Explore Now)',
  buttonLink = '/store',
  updatedAt,
}: PopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled || !content) return;

    // Check if dismissed in this session or for this specific update timestamp
    const storageKey = `sgm_popup_seen_${updatedAt ? new Date(updatedAt).getTime() : 'default'}`;
    const isSeen = sessionStorage.getItem(storageKey);

    if (!isSeen) {
      // Delay slightly for smooth appearance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [enabled, content, updatedAt]);

  const handleClose = () => {
    const storageKey = `sgm_popup_seen_${updatedAt ? new Date(updatedAt).getTime() : 'default'}`;
    sessionStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  if (!isOpen || !enabled) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={handleClose} 
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#d4a359] overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#144732] via-[#1a5b40] to-[#0b2b1e] text-white p-5 flex items-center justify-between relative border-b border-[#d4a359]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4a359]/20 border border-[#d4a359] flex items-center justify-center text-[#fef08a] shadow-inner shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#d4a359]">
                आधिकारिक एडमिन सूचना (Admin Announcement)
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                {title || 'विशेष घोषणा'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="बंद करें (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
          {imageUrl && (
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-56 flex items-center justify-center shadow-xs">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover max-h-56"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-[#e8e3d5] text-slate-800 font-medium whitespace-pre-line leading-relaxed">
            {content}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            बंद करें (Dismiss)
          </button>

          {buttonLink && (
            <a
              href={buttonLink}
              onClick={handleClose}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] hover:from-[#1b5e43] hover:to-[#144732] text-[#fef08a] text-xs font-black shadow-md border border-[#d4a359] transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>{buttonText || 'अभी देखें (Explore)'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#d4a359]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
