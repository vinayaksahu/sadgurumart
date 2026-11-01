'use client';

import React, { useState } from 'react';
import { Check, X, Eye, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';

interface KYCData {
  id: string;
  panNumber: string;
  aadhaarNumber: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  panPhotoUrl?: string | null;
  aadhaarFrontUrl?: string | null;
  aadhaarBackUrl?: string | null;
  passbookChequeUrl?: string | null;
  user: {
    userCode: string;
    name: string;
    mobile: string;
  };
}

export default function AdminKYCActions({ 
  kyc, 
  currentStatus 
}: { 
  kyc: KYCData; 
  currentStatus: string 
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ title: string; url: string } | null>(null);
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
        body: JSON.stringify({ kycId: kyc.id, action, rejectionReason }),
      });
      if (!res.ok) throw new Error('Action failed');
      setShowModal(false);
      router.refresh();
    } catch (e) {
      alert('Error updating KYC status');
    } finally {
      setLoading(false);
    }
  };

  const hasPhotos = !!(kyc.panPhotoUrl || kyc.aadhaarFrontUrl || kyc.aadhaarBackUrl || kyc.passbookChequeUrl);

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {hasPhotos && (
          <button
            onClick={() => setShowModal(true)}
            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
            title="दस्तावेज़ देखें (View Documents)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>दस्तावेज़</span>
          </button>
        )}

        {currentStatus === 'APPROVED' ? (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ✓ Verified
          </span>
        ) : (
          <>
            <button
              onClick={() => handleAction('APPROVE')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Approve KYC"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>

            <button
              onClick={() => handleAction('REJECT')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Reject KYC"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </>
        )}
      </div>

      {/* KYC Documents Inspection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-[#144732] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#92580a]" />
                  <span>केवाईसी दस्तावेज़ सत्यापन: {kyc.user.name} ({kyc.user.userCode})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  पैन: <strong className="font-mono text-slate-800">{kyc.panNumber}</strong> • आधार: <strong className="font-mono text-slate-800">{kyc.aadhaarNumber}</strong> • खाता: <strong className="font-mono text-slate-800">{kyc.bankAccountNumber}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PAN Photo */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-[#faf8f4]">
                <div className="text-xs font-black text-[#144732] mb-2 flex items-center justify-between">
                  <span>पैन कार्ड (PAN Card)</span>
                  {kyc.panPhotoUrl && (
                    <a
                      href={formatGoogleDriveUrl(kyc.panPhotoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>ओरिजिनल देखें</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {kyc.panPhotoUrl ? (
                  <div
                    onClick={() => setSelectedPhoto({ title: 'पैन कार्ड', url: formatGoogleDriveUrl(kyc.panPhotoUrl!) })}
                    className="h-44 rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 flex items-center justify-center group relative"
                  >
                    <img
                      src={formatGoogleDriveUrl(kyc.panPhotoUrl)}
                      alt="PAN Photo"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      🔍 बड़ा करें (Click to Zoom)
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                    फोटो उपलब्ध नहीं
                  </div>
                )}
              </div>

              {/* Passbook / Cheque Photo */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-[#faf8f4]">
                <div className="text-xs font-black text-[#144732] mb-2 flex items-center justify-between">
                  <span>बैंक पासबुक / चेक (Passbook / Cheque)</span>
                  {kyc.passbookChequeUrl && (
                    <a
                      href={formatGoogleDriveUrl(kyc.passbookChequeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>ओरिजिनल देखें</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {kyc.passbookChequeUrl ? (
                  <div
                    onClick={() => setSelectedPhoto({ title: 'बैंक पासबुक / चेक', url: formatGoogleDriveUrl(kyc.passbookChequeUrl!) })}
                    className="h-44 rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 flex items-center justify-center group relative"
                  >
                    <img
                      src={formatGoogleDriveUrl(kyc.passbookChequeUrl)}
                      alt="Bank Passbook"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      🔍 बड़ा करें (Click to Zoom)
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                    फोटो उपलब्ध नहीं
                  </div>
                )}
              </div>

              {/* Aadhaar Front */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-[#faf8f4]">
                <div className="text-xs font-black text-[#144732] mb-2 flex items-center justify-between">
                  <span>आधार - सामने (Aadhaar Front)</span>
                  {kyc.aadhaarFrontUrl && (
                    <a
                      href={formatGoogleDriveUrl(kyc.aadhaarFrontUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>ओरिजिनल देखें</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {kyc.aadhaarFrontUrl ? (
                  <div
                    onClick={() => setSelectedPhoto({ title: 'आधार कार्ड (सामने)', url: formatGoogleDriveUrl(kyc.aadhaarFrontUrl!) })}
                    className="h-44 rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 flex items-center justify-center group relative"
                  >
                    <img
                      src={formatGoogleDriveUrl(kyc.aadhaarFrontUrl)}
                      alt="Aadhaar Front"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      🔍 बड़ा करें (Click to Zoom)
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                    फोटो उपलब्ध नहीं
                  </div>
                )}
              </div>

              {/* Aadhaar Back */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-[#faf8f4]">
                <div className="text-xs font-black text-[#144732] mb-2 flex items-center justify-between">
                  <span>आधार - पीछे (Aadhaar Back)</span>
                  {kyc.aadhaarBackUrl && (
                    <a
                      href={formatGoogleDriveUrl(kyc.aadhaarBackUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>ओरिजिनल देखें</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {kyc.aadhaarBackUrl ? (
                  <div
                    onClick={() => setSelectedPhoto({ title: 'आधार कार्ड (पीछे)', url: formatGoogleDriveUrl(kyc.aadhaarBackUrl!) })}
                    className="h-44 rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 flex items-center justify-center group relative"
                  >
                    <img
                      src={formatGoogleDriveUrl(kyc.aadhaarBackUrl)}
                      alt="Aadhaar Back"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      🔍 बड़ा करें (Click to Zoom)
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                    फोटो उपलब्ध नहीं
                  </div>
                )}
              </div>
            </div>

            {/* Actions Inside Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                बंद करें (Close)
              </button>

              {currentStatus !== 'APPROVED' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction('REJECT')}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>अस्वीकार करें (Reject)</span>
                  </button>

                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>सत्यापित करें (Approve KYC)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 text-white text-sm font-bold bg-black/60 px-4 py-1.5 rounded-full">
              {selectedPhoto.title} • (कहीं भी क्लिक करके बंद करें)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
