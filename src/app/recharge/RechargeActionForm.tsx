'use client';

import React, { useState } from 'react';
import { Smartphone, Tv, ArrowRight, Zap, CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RechargeActionForm() {
  const [serviceType, setServiceType] = useState<'MOBILE_RECHARGE' | 'DTH_RECHARGE'>('MOBILE_RECHARGE');
  const [operatorName, setOperatorName] = useState('Jio');
  const [targetNumber, setTargetNumber] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('299');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const mobileOperators = ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL'];
  const dthOperators = ['Tata Play', 'Dish TV', 'Airtel Digital TV', 'Sun Direct', 'D2H'];

  const numAmount = parseFloat(rechargeAmount) || 0;
  const cashback = parseFloat((numAmount * 0.025).toFixed(2));

  const handleTabChange = (type: 'MOBILE_RECHARGE' | 'DTH_RECHARGE') => {
    setServiceType(type);
    setOperatorName(type === 'MOBILE_RECHARGE' ? 'Jio' : 'Tata Play');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          operatorName,
          targetNumber,
          rechargeAmount: numAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'रिचार्ज विफल रहा');

      setSuccess(`रिचार्ज सफल! ₹${data.cashback} कैशबैक आपके शॉपिंग वॉलेट में क्रेडिट कर दिया गया है।`);
      setTargetNumber('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error executing recharge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5]">
        <button
          type="button"
          onClick={() => handleTabChange('MOBILE_RECHARGE')}
          className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            serviceType === 'MOBILE_RECHARGE'
              ? 'bg-[#144732] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#144732]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile Recharge (मोबाइल)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('DTH_RECHARGE')}
          className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            serviceType === 'DTH_RECHARGE'
              ? 'bg-[#144732] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#144732]'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>DTH TV Recharge (डीटीएच)</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Operator Select */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          ऑपरेटर चुनें (Select Operator) *
        </label>
        <select
          value={operatorName}
          onChange={(e) => setOperatorName(e.target.value)}
          className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none"
        >
          {(serviceType === 'MOBILE_RECHARGE' ? mobileOperators : dthOperators).map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Number or DTH Subscriber ID */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {serviceType === 'MOBILE_RECHARGE' ? 'मोबाइल नंबर (10-Digit Mobile)' : 'डीटीएच ग्राहक आईडी (Subscriber ID)'} *
        </label>
        <input
          type="text"
          value={targetNumber}
          onChange={(e) => setTargetNumber(e.target.value)}
          placeholder={serviceType === 'MOBILE_RECHARGE' ? 'e.g. 9876543210' : 'e.g. 1023456789'}
          required
          className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none"
        />
      </div>

      {/* Recharge Amount */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          रिचार्ज राशि (Recharge Amount in ₹) *
        </label>
        <input
          type="number"
          min="10"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
          placeholder="Enter plan amount"
          required
          className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-base font-black text-slate-900 focus:outline-none"
        />

        {/* Quick Amount Pills */}
        <div className="flex flex-wrap gap-2 mt-2">
          {['199', '299', '666', '719', '859', '999'].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setRechargeAmount(amt)}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#eaf5ed] hover:text-[#144732] text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Instant 2.5% Cashback Summary Banner */}
      {numAmount > 0 && (
        <div className="p-4 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#144732]">2.50% इंस्टेंट कैशबैक अर्न:</div>
            <div className="text-[11px] text-slate-500">तुरंत आपके शॉपिंग वॉलेट में क्रेडिट होगा</div>
          </div>
          <div className="text-xl font-black text-[#144732]">
            +₹{cashback}
          </div>
        </div>
      )}

      {/* Coming Soon Notice and Disabled Button */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
          <span>यह सेवा शीघ्र उपलब्ध होगी (Recharge Gateway Integration in progress)</span>
        </div>

        <button
          type="button"
          disabled
          className="w-full py-4 px-6 rounded-2xl bg-slate-200 border border-slate-300 text-slate-500 font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
        >
          <Lock className="w-4 h-4 text-slate-400" />
          <span>🔒 सेवा शीघ्र उपलब्ध होगी (Coming Soon)</span>
        </button>
      </div>
    </form>
  );
}
