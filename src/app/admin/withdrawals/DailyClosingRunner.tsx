'use client';

import React, { useState } from 'react';
import { 
  Play, 
  RotateCw, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Award, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface DailyClosingRunnerProps {
  activeMemberCount: number;
}

export default function DailyClosingRunner({ activeMemberCount }: DailyClosingRunnerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isExecutedFromUrl = searchParams.get('executed') === 'true';
  const urlEvaluated = searchParams.get('evaluated');
  const urlMatchedPV = searchParams.get('matchedPV');
  const urlMatchingPaid = searchParams.get('matchingPaid');
  const urlRoyaltyPaid = searchParams.get('royaltyPaid');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<any>(
    isExecutedFromUrl
      ? {
          usersEvaluated: urlEvaluated || activeMemberCount,
          totalMatchedPV: Number(urlMatchedPV || 0),
          totalMatchingPaid: Number(urlMatchingPaid || 0),
          totalRoyaltyPaid: Number(urlRoyaltyPaid || 0),
          timestamp: new Date().toLocaleTimeString('hi-IN'),
        }
      : null
  );

  const handleRunClosing = async () => {
    const confirmed = confirm(
      'क्या आप दैनिक क्लोजिंग व पेआउट गणना अभी चलाना चाहते हैं?\n\nयह सभी सक्रिय मेंबर्स का 10% बाइनरी मैचिंग और 10% स्पॉन्सर रॉयल्टी इनकम कैलकुलेट करके उनके वॉलेट में क्रेडिट करेगा।'
    );
    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/cron/daily-closing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Daily closing failed');
      }

      setLastResult({
        ...data.summary,
        timestamp: new Date(data.summary.timestamp).toLocaleTimeString('hi-IN'),
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'क्लोजिंग निष्पादन में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Card */}
      <div className="bg-gradient-to-r from-[#144732] via-[#1a5b40] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-black uppercase tracking-wider border border-white/20">
              <Zap className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Automated 16-Income Payout Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              दैनिक मिडनाइट क्लोजिंग व पेआउट सिस्टम
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              यह मॉड्यूल 10% 1:1 बाइनरी मैचिंग, 10% स्पॉन्सर मैचिंग रॉयल्टी की गणना करता है और सभी डिस्ट्रीब्यूटर्स के संचयी रिवार्ड पॉइंट्स (RP) के आधार पर Star 1 से Crown Ambassador तक रैंक अपग्रेड करता है।
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <button
              onClick={handleRunClosing}
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#d4a359] hover:bg-[#c39248] active:scale-95 text-[#0b2b1e] font-black text-sm shadow-2xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>क्लोजिंग प्रोसेस हो रही है...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>तुरंत क्लोजिंग रन करें (Run Closing Now)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Execution Results Summary */}
      {lastResult && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-900 font-black text-base mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>दैनिक क्लोजिंग सफलतापूर्वक संपन्न हुई! ({lastResult.timestamp})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">मेंबर्स जिनका मूल्यांकन हुआ</div>
              <div className="text-2xl font-black text-[#144732] mt-0.5">
                {lastResult.usersEvaluated}
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">कुल मैच्ड PV वॉल्यूम</div>
              <div className="text-2xl font-black text-blue-700 mt-0.5">
                {lastResult.totalMatchedPV.toLocaleString('en-IN')} PV
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">कुल 10% बाइनरी इनकम क्रेडिट</div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                ₹{lastResult.totalMatchingPaid.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">10% स्पॉन्सर रॉयल्टी इनकम</div>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                ₹{lastResult.totalRoyaltyPaid.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules & Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#144732] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-800">सक्रिय डिस्ट्रीब्यूटर्स</h3>
          <p className="text-2xl font-black text-[#144732]">{activeMemberCount} सक्रिय मेंबर्स</p>
          <p className="text-xs text-slate-500">
            क्लोजिंग चक्र में इन सभी एक्टिव आईडी के लेफ्ट व राइट लेग PV वॉल्यूम का मूल्यांकन किया जाता है।
          </p>
        </div>

        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-800">10% 1:1 बाइनरी मैचिंग</h3>
          <p className="text-2xl font-black text-blue-700">10% फ्लैट पेआउट</p>
          <p className="text-xs text-slate-500">
            लेफ्ट व राइट लेग में न्यूनतम मैचिंग पर 10% राशि वॉलेट में ट्रांसफर होती है तथा अतिरिक्त PV कैरी फॉरवर्ड होता है।
          </p>
        </div>

        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#92580a] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-800">रैंक अपग्रेड व स्पॉन्सर रॉयल्टी</h3>
          <p className="text-2xl font-black text-[#92580a]">15 Ranks + 10% Royalty</p>
          <p className="text-xs text-slate-500">
            डायरेक्ट रेफरल की मैचिंग इनकम पर स्पॉन्सर को 10% अतिरिक्त रॉयल्टी व लाइफटाइम संचयी RP से स्वतः रैंक प्रमोशन।
          </p>
        </div>
      </div>
    </div>
  );
}
