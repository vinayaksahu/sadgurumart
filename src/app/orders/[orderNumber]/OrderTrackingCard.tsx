'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  Navigation, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Box
} from 'lucide-react';

interface Props {
  orderNumber: string;
  orderStatus: string;
  awbCode?: string | null;
  courierName?: string | null;
  shiprocketStatus?: string | null;
}

export default function OrderTrackingCard({
  orderNumber,
  orderStatus,
  awbCode,
  courierName,
  shiprocketStatus,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  const fetchLiveTracking = async () => {
    if (liveData) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch(`/api/shiprocket/track?orderNumber=${encodeURIComponent(orderNumber)}`);
      const data = await res.json();
      setLiveData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAwb = () => {
    if (!awbCode) return;
    navigator.clipboard.writeText(awbCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine stage (1 to 5)
  // 1: Order Confirmed
  // 2: Packed & Dispatched
  // 3: In Transit
  // 4: Out for Delivery
  // 5: Delivered
  const currentSt = (shiprocketStatus || orderStatus || '').toUpperCase();
  let currentStage = 1;

  if (currentSt.includes('DELIVERED')) {
    currentStage = 5;
  } else if (currentSt.includes('OUT FOR DELIVERY')) {
    currentStage = 4;
  } else if (currentSt.includes('IN TRANSIT') || currentSt.includes('SHIPPED') || currentSt.includes('PICKED UP')) {
    currentStage = 3;
  } else if (awbCode || currentSt.includes('AWB') || currentSt.includes('PROCESSING') || currentSt.includes('CONFIRMED')) {
    currentStage = 2;
  }

  const stages = [
    { label: 'ऑर्डर कन्फर्म', desc: 'Order Placed' },
    { label: 'पैकिंग व कूरियर असाइन', desc: 'Packed & AWB' },
    { label: 'इन-ट्रांजिट', desc: 'In Transit' },
    { label: 'आउट फॉर डिलीवरी', desc: 'Out for Delivery' },
    { label: 'सफल डिलीवरी', desc: 'Delivered' },
  ];

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 sm:p-7 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                Shiprocket Delivery
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">
                #{orderNumber}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#144732] mt-0.5">
              {courierName ? `${courierName} द्वारा शिपिंग` : 'ऑर्डर शिपमेंट व ट्रैकिंग'}
            </h3>
          </div>
        </div>

        {awbCode ? (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-[10px] text-slate-400 font-sans font-bold">AWB:</span>
            <span className="font-black text-slate-800">{awbCode}</span>
            <button
              onClick={handleCopyAwb}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Copy AWB"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            कूरियर असाइन किया जा रहा है
          </span>
        )}
      </div>

      {/* 5-Step Delivery Stepper */}
      <div className="pt-2">
        <div className="grid grid-cols-5 gap-2 relative">
          {stages.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum <= currentStage;
            const isCurrent = stepNum === currentStage;

            return (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <div className={`mt-2 font-bold text-[11px] leading-tight ${
                  isCurrent ? 'text-emerald-700 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {st.label}
                </div>
                <div className="text-[9px] text-slate-400 hidden sm:block mt-0.5">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Status Button & Timeline Toggle */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
        <div className="text-xs text-slate-600">
          स्थिति:{' '}
          <strong className="text-indigo-900 font-bold">
            {liveData?.currentStatus || shiprocketStatus || orderStatus}
          </strong>
          {liveData?.estimatedDeliveryDate && (
            <span className="text-[#92580a] ml-2 font-bold">
              • अनुमानित डिलीवरी: {liveData.estimatedDeliveryDate}
            </span>
          )}
        </div>

        <button
          onClick={fetchLiveTracking}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>{expanded ? 'ट्रैकिंग छुपाएँ' : 'लाइव ट्रैकिंग विवरण देखें'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Live Milestones List */}
      {expanded && (
        <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
            शिपमेंट स्कैन विवरण (Courier Activity Log)
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Shiprocket सर्वर से स्थिति लोड हो रही है...</span>
            </div>
          ) : liveData?.activities && liveData.activities.length > 0 ? (
            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
              {liveData.activities.map((act: any, idx: number) => (
                <div key={idx} className="relative text-xs">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                    idx === 0
                      ? 'bg-emerald-500 border-white ring-2 ring-emerald-300'
                      : 'bg-indigo-300 border-white'
                  }`} />
                  <div className="font-bold text-slate-800">{act.activity || act.status}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{act.date}</span>
                    {act.location && (
                      <span className="flex items-center gap-0.5 text-indigo-700 font-semibold">
                        <MapPin className="w-2.5 h-2.5" />
                        {act.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
              कूरियर पार्टनर द्वारा अभी पार्सल स्कैन किया जा रहा है। गतिविधि जल्द अपडेट होगी।
            </div>
          )}

          {liveData?.trackingUrl && (
            <div className="pt-2 text-center">
              <a
                href={liveData.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
              >
                <span>Shiprocket ट्रैकिंग पोर्टल पर खोलें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
