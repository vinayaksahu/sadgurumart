'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Link as LinkIcon, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Smartphone,
  ExternalLink,
  FolderCheck
} from 'lucide-react';
import { formatGoogleDriveUrl, compressImageFile } from '@/lib/imageUtils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  folder?: 'products' | 'kyc' | 'gallery' | 'general';
}

export default function ImageUploader({
  value,
  onChange,
  label = 'फोटो (Photo / Image)',
  required = false,
  folder = 'general',
}: ImageUploaderProps) {
  const isBase64 = value?.startsWith('data:image/');
  const isGoogleDrive = value?.includes('googleusercontent.com') || value?.includes('drive.google.com');

  const [activeTab, setActiveTab] = useState<'upload' | 'link'>(isBase64 || isGoogleDrive || !value ? 'upload' : 'link');
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [driveInfo, setDriveInfo] = useState<{ isDrive: boolean; driveUrl?: string } | null>(
    isGoogleDrive ? { isDrive: true } : null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = value ? formatGoogleDriveUrl(value) : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setCompressing(true);
    setStatusMessage('फोटो कंप्रेस व ऑप्टिमाइज़ हो रही है...');

    try {
      const originalSizeKb = Math.round(file.size / 1024);
      const { dataUrl, sizeKb } = await compressImageFile(file, 1000, 0.75);
      
      setCompressing(false);
      setUploading(true);
      setStatusMessage('Google Drive फोल्डर में ऑटो-अपलोड हो रहा है...');

      // Call central upload API which forwards to Google Drive folder
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: dataUrl,
          filename: `${folder}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          mimeType: 'image/jpeg',
          folder,
        }),
      });

      const uploadResult = await res.json();

      if (uploadResult?.url) {
        onChange(uploadResult.url);

        if (uploadResult.provider === 'google_drive') {
          setDriveInfo({
            isDrive: true,
            driveUrl: uploadResult.driveUrl,
          });
          setStatusMessage(`Google Drive में सुरक्षित सेव! (${sizeKb} KB)`);
        } else {
          setDriveInfo(null);
          setStatusMessage(`फोटो तैयार! (${sizeKb} KB, ओरिजिनल ${originalSizeKb} KB)`);
        }
      } else {
        // Fallback to local dataUrl
        onChange(dataUrl);
        setStatusMessage(`फोटो कंप्रेस की गई (${sizeKb} KB)`);
      }
    } catch (err: any) {
      setError(err.message || 'फोटो प्रोसेस करने में समस्या आई।');
    } finally {
      setCompressing(false);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
    setStatusMessage(null);
    setDriveInfo(null);
    setError(null);
  };

  return (
    <div className="bg-[#faf8f4] border border-[#d4a359]/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e3d5] pb-3">
        <label className="block text-xs font-black text-[#144732]">
          📷 {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`px-3 py-1 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>फ़ोन / गैलरी से ऑटो-अपलोड</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('link'); setError(null); }}
            className={`px-3 py-1 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Drive लिंक पेस्ट करें</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* TAB 1: Mobile / Device Gallery Upload with Auto Drive Sync */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id={`uploader-${label.replace(/[^a-zA-Z0-9]/g, '-')}`}
          />

          {!value ? (
            <div
              onClick={() => {
                if (!compressing && !uploading) {
                  fileInputRef.current?.click();
                }
              }}
              className="border-2 border-dashed border-[#144732]/30 hover:border-[#144732] bg-white rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-[#144732]/5 group"
            >
              {compressing || uploading ? (
                <div className="space-y-2 py-2">
                  <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto" />
                  <div className="text-xs font-black text-[#144732]">
                    {statusMessage || 'फ़ोटो प्रोसेस व ड्राइव पर अपलोड हो रही है...'}
                  </div>
                  <p className="text-[10px] text-slate-400">कृपया प्रतीक्षा करें...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#144732]/10 text-[#144732] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-black text-[#144732]">
                    📱 मोबाइल गैलरी से फोटो चुनें (या कैमरा से खींचें)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    JPG, PNG, WebP — सिस्टम ऑटो-कंप्रेस करके सीधे Google Drive में अपलोड कर देगा
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = '/sgm_logo.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {driveInfo?.isDrive || isGoogleDrive ? 'Google Drive में सुरक्षित' : 'फोटो तैयार'}
                    </span>
                  </div>
                  {statusMessage && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {statusMessage}
                    </div>
                  )}
                  {driveInfo?.driveUrl && (
                    <a
                      href={driveInfo.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-bold mt-0.5"
                    >
                      <FolderCheck className="w-3 h-3 text-blue-500" />
                      <span>Google Drive में देखें</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="दूसरी फोटो चुनें"
                >
                  बदलें
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="हटाएं"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Google Drive / Web Link */}
      {activeTab === 'link' && (
        <div className="space-y-3">
          <div>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
              value={isBase64 ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-[#144732]"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              💡 <strong>Google Drive टिप:</strong> फोटो पर Right-Click करके <em>"Anyone with link can view"</em> सेट करें और लिंक यहाँ पेस्ट करें।
            </p>
          </div>

          {previewUrl && !isBase64 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = '/sgm_logo.png';
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google Drive लिंक पहचानी गई</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    लाइव प्रिव्यू तैयार
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="हटाएं"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
