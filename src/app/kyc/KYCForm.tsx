'use client';

import React, { useState } from 'react';
import { ShieldCheck, Building, CheckCircle2, AlertCircle, ArrowRight, FileText, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

export default function KYCForm({ initialData }: { initialData?: any }) {
  const [formData, setFormData] = useState({
    panNumber: initialData?.panNumber || '',
    aadhaarNumber: initialData?.aadhaarNumber || '',
    bankName: initialData?.bankName || '',
    bankAccountNumber: initialData?.bankAccountNumber || '',
    ifscCode: initialData?.ifscCode || '',
    accountHolderName: initialData?.accountHolderName || '',
    panPhotoUrl: initialData?.panPhotoUrl || '',
    aadhaarFrontUrl: initialData?.aadhaarFrontUrl || '',
    aadhaarBackUrl: initialData?.aadhaarBackUrl || '',
    passbookChequeUrl: initialData?.passbookChequeUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (field: string, url: string) => {
    setFormData((prev) => ({ ...prev, [field]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC submission failed');

      setSuccess('केवाईसी व बैंक विवरण सफलतापूर्वक सबमिट हुआ। एडमिन वेरिफिकेशन के उपरांत विड्रॉल एक्टिवेट हो जाएगा।');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error submitting KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* PAN & Aadhaar Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-[#144732] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#92580a]" />
          <span>1. पहचान एवं पैन विवरण (Identity & PAN Card)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              पैन कार्ड नंबर (PAN Number) *
            </label>
            <input
              type="text"
              name="panNumber"
              maxLength={10}
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="e.g. ABCDE1234F"
              required
              className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono font-bold uppercase text-slate-900 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              * 1 पैन कार्ड पर अधिकतम 3 आईडी मान्य हैं (Max 3 IDs per PAN Policy).
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              आधार कार्ड नंबर (Aadhaar Number) *
            </label>
            <input
              type="text"
              name="aadhaarNumber"
              maxLength={12}
              value={formData.aadhaarNumber}
              onChange={handleChange}
              placeholder="12-digit Aadhaar"
              required
              className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-black text-[#144732] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#92580a]" />
          <span>2. बैंक खाता विवरण (Bank Settlement Account)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              खाताधारक का नाम (Account Holder Name) *
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="As per bank passbook"
              required
              className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              बैंक का नाम (Bank Name) *
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g. State Bank of India"
              required
              className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              बैंक खाता संख्या (Account Number) *
            </label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              placeholder="Enter bank account number"
              required
              className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              IFSC कोड (Bank IFSC Code) *
            </label>
            <input
              type="text"
              name="ifscCode"
              maxLength={11}
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="e.g. SBIN0001234"
              required
              className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono font-bold uppercase text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Document Photos (PAN, Aadhaar, Bank Cheque/Passbook) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-black text-[#144732] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#92580a]" />
          <span>3. केवाईसी दस्तावेज़ फोटो (Upload Documents)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploader
            label="पैन कार्ड की फोटो (PAN Card Photo)"
            value={formData.panPhotoUrl}
            onChange={(url) => handleImageChange('panPhotoUrl', url)}
            folder="kyc"
          />

          <ImageUploader
            label="बैंक पासबुक / कैंसिल्ड चेक (Passbook / Cheque)"
            value={formData.passbookChequeUrl}
            onChange={(url) => handleImageChange('passbookChequeUrl', url)}
            folder="kyc"
          />

          <ImageUploader
            label="आधार कार्ड - सामने की फोटो (Aadhaar Front)"
            value={formData.aadhaarFrontUrl}
            onChange={(url) => handleImageChange('aadhaarFrontUrl', url)}
            folder="kyc"
          />

          <ImageUploader
            label="आधार कार्ड - पीछे की फोटो (Aadhaar Back)"
            value={formData.aadhaarBackUrl}
            onChange={(url) => handleImageChange('aadhaarBackUrl', url)}
            folder="kyc"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#144732]/25 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>विवरण व फोटो सबमिट करें (Save & Submit KYC)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
