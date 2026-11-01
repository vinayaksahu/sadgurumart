'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminWithdrawalActions({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'PAID' | 'REJECT') => {
    let paymentTxId = '';
    let rejectionReason = '';

    if (action === 'PAID') {
      const utr = prompt('बैंक UTR / NEFT ट्रांजेक्शन नंबर दर्ज करें (Enter Bank UTR):');
      if (!utr) return;
      paymentTxId = utr;
    } else {
      const reason = prompt('अस्वीकृति व रिफंड का कारण दर्ज करें (Rejection reason):');
      if (!reason) return;
      rejectionReason = reason;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, paymentTxId, rejectionReason }),
      });
      if (!res.ok) throw new Error('Action failed');
      router.refresh();
    } catch (e) {
      alert('Error updating withdrawal status');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'PAID') {
    return <span className="text-[10px] font-bold text-emerald-700">✓ Transferred</span>;
  }

  if (currentStatus === 'REJECTED') {
    return <span className="text-[10px] font-bold text-red-600">✕ Refunded</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleAction('PAID')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Confirm Bank Payment"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Mark Paid</span>
      </button>

      <button
        onClick={() => handleAction('REJECT')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Reject and Refund"
      >
        <X className="w-3.5 h-3.5" />
        <span>Reject</span>
      </button>
    </div>
  );
}
