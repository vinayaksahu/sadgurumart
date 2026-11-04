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
  Zap,
  Check,
  Calendar,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface DailyClosingRunnerProps {
  activeMemberCount: number;
  initialClosingMode?: string;
  autoClosingTime?: string;
  lastClosingAt?: string | null;
}

export default function DailyClosingRunner({ 
  activeMemberCount,
  initialClosingMode = 'INSTANT',
  autoClosingTime = '12:00 AM IST',
  lastClosingAt = null
}: DailyClosingRunnerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isExecutedFromUrl = searchParams.get('executed') === 'true';
  const urlEvaluated = searchParams.get('evaluated');
  const urlMatchedPV = searchParams.get('matchedPV');
  const urlMatchingPaid = searchParams.get('matchingPaid');
  const urlRoyaltyPaid = searchParams.get('royaltyPaid');

  const [closingMode, setClosingMode] = useState<'INSTANT' | 'MIDNIGHT_12AM'>(
    initialClosingMode === 'MIDNIGHT_12AM' ? 'MIDNIGHT_12AM' : 'INSTANT'
  );
  const [savingMode, setSavingMode] = useState(false);
  const [modeMessage, setModeMessage] = useState('');

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

  // Switch Closing Mode (Instant vs Auto 12 AM)
  const handleSelectMode = async (mode: 'INSTANT' | 'MIDNIGHT_12AM') => {
    if (mode === closingMode) return;
    setSavingMode(true);
    setModeMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closingMode: mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update closing mode');
      
      setClosingMode(mode);
      setModeMessage(
        mode === 'INSTANT'
          ? '✓ Instant Closing Mode सक्रिय हो गया है — सभी इनकम रियल-टाइम में वॉलेट में क्रेडिट होंगी।'
          : '✓ Auto Closing at 12:00 AM IST सक्रिय हो गया है — दैनिक संचित वॉल्यूम रात 12:00 बजे प्रोसेस होगा।'
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error updating closing mode');
    } finally {
      setSavingMode(false);
    }
  };

  // Run Manual Closing Now
  const handleRunClosing = async () => {
    const confirmed = confirm(
      'क्या आप क्लोजिंग व पेआउट गणना अभी चलाना चाहते हैं?\n\nयह सभी सक्रिय मेंबर्स का 10% बाइनरी मैचिंग और 10% स्पॉन्सर रॉयल्टी इनकम कैलकुलेट करके उनके वॉलेट में क्रेडिट करेगा।'
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
      {/* 2 Closing Mode Selection Cards */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#144732] text-[#fef08a]">
              Closing Strategy
            </span>
            <span className="text-xs text-slate-500 font-bold">
              • एडमिन क्लोजिंग मोड कॉन्फ़िगरेशन
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#144732] mt-2">
            क्लोजिंग एवं पेआउट मोड का चयन करें (Select Closing Mode)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            चुनें कि मेंबर्स की बाइनरी मैचिंग व अन्य इनकम तुरंत क्रेडिट होंगी या प्रतिदिन रात 12:00 AM IST पर ऑटोमेटिक क्लोजिंग होगी।
          </p>
        </div>

        {modeMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{modeMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Instant Closing Mode */}
          <div
            onClick={() => !savingMode && handleSelectMode('INSTANT')}
            className={`relative p-6 sm:p-7 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              closingMode === 'INSTANT'
                ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-[#faf8f4] border-slate-200 hover:border-emerald-300 hover:bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#144732] text-[#fef08a] flex items-center justify-center text-xl shadow-xs">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Option 1
                    </span>
                    <h3 className="font-black text-lg text-slate-900 leading-tight">
                      Instant Closing Mode
                    </h3>
                  </div>
                </div>

                {closingMode === 'INSTANT' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>सक्रिय (Active)</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 hover:text-emerald-700">
                    क्लिक कर चुनें
                  </span>
                )}
              </div>

              <div className="text-sm font-black text-[#144732] mb-2">
                ⚡ रियल-टाइम इंस्टेंट मैचिंग व तुरंत विड्रॉल
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                मेंबर का जैसे ही बाइनरी मैचिंग कंप्लीट होगा या अन्य कोई भी इनकम बनेगी, वह <strong>तुरंत (Real-Time) क्लोज होकर उसके वॉलेट में शो होने लगेगी</strong> और मेंबर उसे तुरंत बैंक खाते में विड्रॉल भी कर सकेगा।
              </p>

              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1.5 text-slate-700 mb-4">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>10% बाइनरी मैचिंग तुरंत वॉलेट में क्रेडिट</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>10% स्पॉन्सर मैचिंग रॉयल्टी तुरंत क्रेडिट</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>सदस्य कभी भी विड्रॉल अनुरोध भेज सकते हैं</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={savingMode || closingMode === 'INSTANT'}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                closingMode === 'INSTANT'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#144732] text-white hover:bg-[#0b2b1e]'
              }`}
            >
              {closingMode === 'INSTANT' ? '✓ वर्तमान में सक्रिय मोड' : 'इंस्टेंट क्लोजिंग सक्रिय करें'}
            </button>
          </div>

          {/* Option 2: Auto Closing at 12 AM IST */}
          <div
            onClick={() => !savingMode && handleSelectMode('MIDNIGHT_12AM')}
            className={`relative p-6 sm:p-7 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              closingMode === 'MIDNIGHT_12AM'
                ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                : 'bg-[#faf8f4] border-slate-200 hover:border-amber-300 hover:bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#92580a] text-[#fef08a] flex items-center justify-center text-xl shadow-xs">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Option 2
                    </span>
                    <h3 className="font-black text-lg text-slate-900 leading-tight">
                      Auto Closing at 12 AM IST
                    </h3>
                  </div>
                </div>

                {closingMode === 'MIDNIGHT_12AM' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-600 text-white flex items-center gap-1 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>सक्रिय (Active)</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 hover:text-amber-700">
                    क्लिक कर चुनें
                  </span>
                )}
              </div>

              <div className="text-sm font-black text-[#92580a] mb-2">
                ⏰ दैनिक मिडनाइट क्लोजिंग (प्रतिदिन रात 12:00 बजे IST)
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                दिन भर का लेफ्ट व राइट बिजनेस PV वॉल्यूम संचित (Accumulate) रहेगा। <strong>प्रतिदिन रात 12:00 AM IST पर स्वचालित क्लोजिंग</strong> होगी और सभी पात्र मेंबर्स के वॉलेट में पेआउट क्रेडिट होकर विड्रॉल योग्य बनेगा।
              </p>

              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1.5 text-slate-700 mb-4">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>दिन भर 1:1 / 2:1 PV वॉल्यूम सुरक्षित संचय</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>शेड्यूल्ड ऑटो-क्लोजिंग: 12:00 AM IST</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>एडमिन कभी भी 'तुरंत क्लोजिंग रन करें' चला सकते हैं</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={savingMode || closingMode === 'MIDNIGHT_12AM'}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                closingMode === 'MIDNIGHT_12AM'
                  ? 'bg-amber-600 text-white cursor-default'
                  : 'bg-[#92580a] text-white hover:bg-[#784605]'
              }`}
            >
              {closingMode === 'MIDNIGHT_12AM' ? '✓ वर्तमान में सक्रिय मोड' : '12 AM ऑटो क्लोजिंग सक्रिय करें'}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Execution Banner Card */}
      <div className="bg-gradient-to-r from-[#144732] via-[#1a5b40] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-black uppercase tracking-wider border border-white/20">
              <Zap className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>
                सक्रिय मोड: {closingMode === 'INSTANT' ? 'Instant Closing (रियल-टाइम)' : 'Auto Closing at 12:00 AM IST'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              मैन्युअल क्लोजिंग व पेआउट निष्पादन
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              आप किसी भी समय नीचे दिए गए बटन से सभी सक्रिय डिस्ट्रीब्यूटर्स के संचित PV वॉल्यूम का मूल्यांकन कर बाइनरी मैचिंग, स्पॉन्सर रॉयल्टी और 15 रैंक प्रमोशन को तुरंत प्रोसेस कर सकते हैं।
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
            <span>क्लोजिंग सफलतापूर्वक संपन्न हुई! ({lastResult.timestamp})</span>
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
          <h3 className="text-sm font-black text-slate-800">10% बाइनरी मैचिंग</h3>
          <p className="text-2xl font-black text-blue-700">1:2 / 2:1 फिर 1:1</p>
          <p className="text-xs text-slate-500">
            पहला पेयर 1:2 या 2:1 के अनुपात में 10% मैच होता है, उसके बाद आजीवन 1:1 के अनुपात में मैचिंग पेआउट।
          </p>
        </div>

        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#92580a] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-800">रैंक अपग्रेड व स्पॉन्सर रॉयल्टी</h3>
          <p className="text-2xl font-black text-[#92580a]">15 Ranks + 10% Royalty</p>
          <p className="text-xs text-slate-500">
            डायरेक्ट रेफरल की मैचिंग इनकम पर स्पॉन्सर को 10% अतिरिक्त रॉयल्टी व संचयी RP से स्वतः रैंक प्रमोशन।
          </p>
        </div>
      </div>
    </div>
  );
}
