'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminKYCActions({ kycId, currentStatus }: { kycId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    let rejectionReason = '';
    if (action === 'REJECT') {
      const reason = prompt('अस्वीकृति का कारण दर्ज करें (Reason for rejection):');
      if (!reason) return;
      rejectionReason = reason;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, action, rejectionReason }),
      });
      if (!res.ok) throw new Error('Action failed');
      router.refresh();
    } catch (e) {
      alert('Error updating KYC status');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'APPROVED') {
    return <span className="text-[10px] font-bold text-emerald-700">✓ Verified</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleAction('APPROVE')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Approve KYC"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Approve</span>
      </button>

      <button
        onClick={() => handleAction('REJECT')}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Reject KYC"
      >
        <X className="w-3.5 h-3.5" />
        <span>Reject</span>
      </button>
    </div>
  );
}
