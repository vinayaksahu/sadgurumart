'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberNavbar from '@/components/MemberNavbar';
import ImageUploader from '@/components/ImageUploader';
import {
  Building,
  CreditCard,
  QrCode,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  RefreshCw,
  User,
  Info
} from 'lucide-react';

export default function BankUpiPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [passbookChequeUrl, setPassbookChequeUrl] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const fetchBankDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profile/bank');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load bank details');

      if (data.bankDetails) {
        setBankName(data.bankDetails.bankName || '');
        setBankAccountNumber(data.bankDetails.bankAccountNumber || '');
        setConfirmAccountNumber(data.bankDetails.bankAccountNumber || '');
        setIfscCode(data.bankDetails.ifscCode || '');
        setAccountHolderName(data.bankDetails.accountHolderName || data.userName || '');
        setUpiId(data.bankDetails.upiId || '');
        setPassbookChequeUrl(data.bankDetails.passbookChequeUrl || '');
        setStatus(data.bankDetails.status || null);
        setRejectionReason(data.bankDetails.rejectionReason || null);
      } else if (data.userName) {
        setAccountHolderName(data.userName);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching bank info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (bankAccountNumber !== confirmAccountNumber) {
      setError('खाता संख्या और पुष्टि खाता संख्या मेल नहीं खाते (Account numbers do not match)');
      return;
    }

    if (ifscCode.trim().length !== 11) {
      setError('IFSC कोड 11 अक्षरों का होना चाहिए (e.g. SBIN0001234)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/profile/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName,
          bankAccountNumber,
          ifscCode: ifscCode.toUpperCase().trim(),
          accountHolderName,
          upiId: upiId.trim(),
          passbookChequeUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update bank details');

      setSuccess('बैंक व UPI विवरण सफलतापूर्वक सबमिट हुआ। एडमिन सत्यापन के उपरांत यह सक्रिय हो जाएगा।');
      setStatus('PENDING');
    } catch (err: any) {
      setError(err.message || 'Error saving details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MemberNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard" className="hover:text-[#144732] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Profile</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#144732] font-bold">Bank & UPI Details</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-bold uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5" />
                Settlement & Payout Account
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Bank & UPI Details (बैंक व UPI विवरण)
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                पेआउट और विड्रॉल ट्रांसफर हेतु अपना बैंक खाता व UPI आईडी दर्ज करें।
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/profile/edit"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all"
              >
                <User className="w-3.5 h-3.5 text-[#fef08a]" />
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/kyc"
                className="px-3.5 py-2 rounded-xl bg-[#d4a359] hover:bg-[#c39248] text-[#0b2b1e] text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KYC Identity</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Status Alert Banner */}
        {status && (
          <div
            className={`p-5 rounded-2xl border-2 flex items-center justify-between ${
              status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : status === 'REJECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {status === 'APPROVED' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              ) : status === 'REJECTED' ? (
                <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-7 h-7 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="font-black text-sm uppercase tracking-wider">
                  Bank Settlement Status: {status}
                </div>
                <div className="text-xs mt-0.5 font-medium">
                  {status === 'APPROVED'
                    ? 'आपका बैंक विवरण सत्यापित है। सभी विड्रॉल इसी खाते में प्रेषित किए जाएंगे।'
                    : status === 'REJECTED'
                    ? `रिजेक्शन का कारण: ${rejectionReason || 'त्रुटिपूर्ण जानकारी'}. कृपया सही विवरण पुनः दर्ज करें।`
                    : 'आपका बैंक/UPI विवरण वेरिफिकेशन टीम के पास विचाराधीन (Pending) है।'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto mb-3" />
              <div className="text-xs font-bold text-slate-500">Loading Bank & UPI Details...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Bank Account Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#144732] uppercase tracking-wider">
                  <Building className="w-4 h-4 text-[#d4a359]" />
                  <span>1. बैंक खाता विवरण (Bank Settlement Account)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      खाताधारक का नाम (Account Holder Name) *
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="As per bank passbook"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      बैंक का नाम (Bank Name) *
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India, HDFC Bank"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      बैंक खाता संख्या (Account Number) *
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      खाता संख्या की पुष्टि (Confirm Account Number) *
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="Re-enter account number"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      IFSC कोड (11-Character IFSC Code) *
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. UPI Details */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#144732] uppercase tracking-wider">
                  <QrCode className="w-4 h-4 text-[#d4a359]" />
                  <span>2. UPI विवरण (UPI ID For Instant Payouts)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UPI आईडी (GPay / PhonePe / Paytm / BHIM UPI)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@paytm या yourname@oksbi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    * यदि बैंक ट्रांसफर के स्थान पर त्वरित UPI भुगतान चाहते हैं तो अपनी मान्य UPI ID दर्ज करें।
                  </span>
                </div>
              </div>

              {/* 3. Passbook / Cheque Upload */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#144732] uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-[#d4a359]" />
                  <span>3. बैंक पासबुक / कैंसल चेक फोटो (Bank Proof Document)</span>
                </div>

                <div className="max-w-md">
                  <ImageUploader
                    label="पासबुक / कैंसल चेक फोटो अपलोड करें"
                    value={passbookChequeUrl}
                    onChange={(url: string) => setPassbookChequeUrl(url)}
                    folder="kyc"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    खाता संख्या और IFSC कोड स्पष्ट दिखने वाली पासबुक या कैंसल चेक की फोटो अपलोड करें।
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0b2b1e] to-[#144732] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-[#fef08a]" />
                  )}
                  <span>{submitting ? 'Submitting...' : 'Save Bank & UPI (सुरक्षित करें)'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
