'use client';

import React, { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WithdrawalActionFormProps {
  availableBalance: number;
  hasKYC: boolean;
  bankDetails?: any;
}

export default function WithdrawalActionForm({
  availableBalance,
  hasKYC,
  bankDetails,
}: WithdrawalActionFormProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const numAmount = parseFloat(amount) || 0;
  const adminFee = parseFloat((numAmount * 0.05).toFixed(2));
  const tdsFee = parseFloat((numAmount * 0.05).toFixed(2));
  const netPayable = parseFloat((numAmount - (adminFee + tdsFee)).toFixed(2));

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!hasKYC) {
      setError('कृपया पहले अपनी बैंक पासबुक व पैन कार्ड विवरण अपडेट करें।');
      return;
    }

    if (numAmount < 100) {
      setError('न्यूनतम विड्रॉल राशि ₹100 है।');
      return;
    }

    if (numAmount > availableBalance) {
      setError(`अपर्याप्त बैलेंस। आपके पास केवल ₹${availableBalance} उपलब्ध है।`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'विड्रॉल अनुरोध सबमिट करने में विफल');
      }

      setSuccess(`विड्रॉल अनुरोध सफलतापूर्वक सबमिट हुआ! नेट राशि ₹${data.netPayable} साप्ताहिक बैंक ट्रांसफर चक्र में ट्रांसफर कर दी जाएगी।`);
      setAmount('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleWithdraw} className="space-y-4">
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

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          विड्रॉल राशि दर्ज करें (Enter Amount in ₹) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="100"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Minimum ₹100"
            required
            className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-3 text-base font-black text-slate-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setAmount(Math.floor(availableBalance).toString())}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#144732] hover:underline"
          >
            Max All
          </button>
        </div>
      </div>

      {/* Live Calculation Box */}
      {numAmount >= 100 && (
        <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>अनुरोध राशि (Gross Amount):</span>
            <span className="font-bold text-slate-900">₹{numAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600 font-semibold">
            <span>5% एडमिन चार्ज (Admin Fee):</span>
            <span>- ₹{adminFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600 font-semibold">
            <span>5% आयकर TDS (Govt TDS):</span>
            <span>- ₹{tdsFee.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-emerald-700">
            <span>बैंक खाते में नेट ट्रांसफर (Net Payable):</span>
            <span>₹{netPayable.toFixed(2)}</span>
          </div>
        </div>
      )}

      {!hasKYC ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <p className="font-bold">⚠️ आपका बैंक विवरण अपडेट नहीं है।</p>
          <Link
            href="/kyc"
            className="inline-block px-4 py-2 rounded-xl bg-[#144732] text-white font-bold"
          >
            बैंक खाता और पैन कार्ड जोड़ें →
          </Link>
        </div>
      ) : (
        <button
          type="submit"
          disabled={loading || availableBalance < 100}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#144732]/25 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>विड्रॉल अनुरोध सबमिट करें (Request Withdrawal)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </form>
  );
}
