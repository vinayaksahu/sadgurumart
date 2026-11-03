'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  UserPlus, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Unlock,
  RefreshCw,
  Copy,
  CheckCircle2,
  Share2,
  Eye,
  EyeOff,
  User,
  KeyRound
} from 'lucide-react';
import Link from 'next/link';

function RegisterForm() {
  const searchParams = useSearchParams();

  // URL parameters from referral link (?ref=SGM10001&pos=RIGHT)
  const queryRef = searchParams.get('ref') || searchParams.get('sponsor') || searchParams.get('sponsorCode') || '';
  const queryPos = searchParams.get('pos') || searchParams.get('position') || searchParams.get('side') || '';

  const normalizedPos = queryPos.toUpperCase() === 'RIGHT' ? 'RIGHT' : queryPos.toUpperCase() === 'LEFT' ? 'LEFT' : null;

  const [formData, setFormData] = useState({
    sponsorId: queryRef ? queryRef.toUpperCase() : 'SGM010001',
    placementPosition: normalizedPos || 'LEFT',
    name: '',
    mobile: '',
    email: '',
    password: '',
  });

  // Lock status: locked if came through a link with explicit position
  const [isPlacementLocked, setIsPlacementLocked] = useState<boolean>(Boolean(normalizedPos));
  const [sponsorName, setSponsorName] = useState<string>('');
  const [isCheckingSponsor, setIsCheckingSponsor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Successful Registration Data
  const [registeredData, setRegisteredData] = useState<{
    userCode: string;
    name: string;
    password: string;
    mobile: string;
    sponsorId: string;
    sponsorName: string;
    placementPosition: string;
  } | null>(null);

  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch sponsor name on mount and when sponsorId changes
  useEffect(() => {
    const code = formData.sponsorId?.trim();
    if (!code) {
      setSponsorName('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSponsor(true);
      try {
        const res = await fetch(`/api/auth/register?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (res.ok && data.sponsor) {
          setSponsorName(data.sponsor.name);
        } else {
          setSponsorName('');
        }
      } catch {
        setSponsorName('');
      } finally {
        setIsCheckingSponsor(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.sponsorId]);

  // Handle manual input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'sponsorId') {
      setIsPlacementLocked(false);
      setFormData((prev) => ({ ...prev, sponsorId: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!registeredData) return;
    const msg = `🎉 *SGM Mart Registration Successful!*\n\n` +
      `👤 *Name:* ${registeredData.name}\n` +
      `🆔 *Member ID:* ${registeredData.userCode}\n` +
      `🔑 *Password:* ${registeredData.password}\n` +
      `👥 *Sponsor:* ${registeredData.sponsorName} (${registeredData.sponsorId})\n` +
      `📍 *Team Position:* ${registeredData.placementPosition === 'RIGHT' ? 'Right Team' : 'Left Team'}\n\n` +
      `🌐 *Login Link:* https://www.sadgurumart.com/login\n\n` +
      `कृपया अपनी आईडी और पासवर्ड सुरक्षित रखें।`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegisteredData({
        userCode: data.userCode,
        name: formData.name,
        password: formData.password,
        mobile: formData.mobile,
        sponsorId: formData.sponsorId,
        sponsorName: sponsorName || 'SGM Master',
        placementPosition: formData.placementPosition,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f0] via-[#ffffff] to-[#eae5d8] text-[#2d3748] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/95 border-2 border-[#144732]/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#144732]/10">
          
          {/* SUCCESS SCREEN: Displays ID & Password prominently */}
          {registeredData ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Header Badge */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-500 shadow-md">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>पंजीकरण सफल (Registration Complete)</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight">
                  Welcome to SGM Mart!
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  आपका अकाउंट सफलतापूर्वक बन गया है। कृपया अपनी <strong>लॉगिन आईडी व पासवर्ड</strong> सुरक्षित नोट कर लें।
                </p>
              </div>

              {/* Credentials Highlight Card */}
              <div className="bg-gradient-to-br from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-2xl p-5 border-2 border-[#d4a359] shadow-xl space-y-4">
                <div className="flex items-center justify-between text-[11px] text-[#fef08a] font-bold uppercase tracking-wider pb-2 border-b border-white/15">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#d4a359]" />
                    <span>Member Credentials (लॉगिन विवरण)</span>
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-emerald-300 font-mono">
                    CONFIDENTIAL
                  </span>
                </div>

                {/* Member ID Field */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center justify-between border border-white/15">
                  <div>
                    <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                      Member Login ID (मेंबर आईडी)
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono text-[#fef08a] tracking-wider mt-0.5">
                      {registeredData.userCode}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(registeredData.userCode, 'id')}
                    className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                    title="Copy Member ID"
                  >
                    {copiedField === 'id' ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Password Field */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center justify-between border border-white/15">
                  <div>
                    <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-[#d4a359]" />
                      <span>Password (लॉगिन पासवर्ड)</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider mt-0.5">
                      {showPassword ? registeredData.password : '••••••••'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(registeredData.password, 'password')}
                      className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                      title="Copy Password"
                    >
                      {copiedField === 'password' ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Member Details Summary */}
                <div className="pt-2 text-xs text-slate-300 space-y-1.5 font-medium border-t border-white/15">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-bold text-white">{registeredData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-mono text-white">{registeredData.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sponsor:</span>
                    <span className="font-semibold text-[#fef08a]">
                      {registeredData.sponsorName} ({registeredData.sponsorId})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Placement:</span>
                    <span className="font-bold text-emerald-300">
                      {registeredData.placementPosition === 'RIGHT' ? 'Right Team' : 'Left Team'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* Login Button */}
                <Link
                  href={`/login?id=${registeredData.userCode}`}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#144732]/25 hover:opacity-95 transition-all"
                >
                  <span>LOGIN TO DASHBOARD (लॉगिन करें)</span>
                  <ArrowRight className="w-4 h-4 text-[#fef08a]" />
                </Link>

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>व्हाट्सएप पर शेयर करें (Share on WhatsApp)</span>
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <>
              {/* Header */}
              <div className="text-center mb-7">
                <div className="inline-flex p-3 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20 mb-3">
                  <UserPlus className="w-8 h-8 text-[#144732]" />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#d4a359] font-black mb-1">
                  JOIN DIRECT SELLING NETWORK
                </div>
                <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                  New Distributor Registration
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  निःशुल्क रजिस्ट्रेशन • तुरंत अपनी बाइनरी पोजीशन सुरक्षित करें
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sponsor Code & Placement Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Sponsor Code *
                      </label>
                      {isCheckingSponsor && (
                        <RefreshCw className="w-3 h-3 text-[#144732] animate-spin" />
                      )}
                    </div>
                    <input
                      type="text"
                      name="sponsorId"
                      value={formData.sponsorId}
                      onChange={handleChange}
                      required
                      placeholder="SGM010001"
                      className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#144732]"
                    />
                    {sponsorName ? (
                      <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                        ✓ Sponsor: {sponsorName}
                      </span>
                    ) : formData.sponsorId ? (
                      <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                        स्पॉन्सर कोड टाइप करने पर नाम दिखेगा
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Binary Placement *
                      </label>
                      {isPlacementLocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>लिंक से लॉक्ड</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Unlock className="w-3 h-3 text-slate-400" />
                          <span>स्वतंत्र चयन</span>
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <select
                        name="placementPosition"
                        value={formData.placementPosition}
                        onChange={handleChange}
                        disabled={isPlacementLocked}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 transition-all ${
                          isPlacementLocked
                            ? 'bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed opacity-90'
                            : 'bg-[#fdfaf3] border-[#d8d0bf] focus:border-[#144732] text-slate-900 focus:ring-[#144732]'
                        }`}
                      >
                        <option value="LEFT">Left Team (लेफ्ट)</option>
                        <option value="RIGHT">Right Team (राइट)</option>
                      </select>
                    </div>

                    {isPlacementLocked ? (
                      <p className="text-[10px] text-amber-800 font-bold mt-1 flex items-center gap-1">
                        🔒 रेफ़रल लिंक द्वारा {formData.placementPosition === 'RIGHT' ? 'राइट' : 'लेफ्ट'} टीम लॉक है (स्पॉन्सर कोड बदलने पर अनलॉक होगा)
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        अपनी इच्छानुसार लेफ्ट या राइट टीम का चयन करें
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name (पूरा नाम) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="As per Aadhaar / PAN"
                    required
                    className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#144732]"
                  />
                </div>

                {/* Mobile & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      required
                      className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#144732]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#144732]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#144732]"
                  />
                </div>

                {/* Policy note: 1 Email, 1 Mobile, 1 PAN = Max 3 IDs */}
                <div className="p-3 bg-[#eaf5ed] border border-[#144732]/20 rounded-xl text-[11px] text-[#144732] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#144732] mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-[#144732]">आईडी रजिस्ट्रेशन नियम:</span> 1 ईमेल आईडी, 1 मोबाइल नंबर और 1 पैन कार्ड से अधिकतम <strong>3 आईडी (Tri-pod ID)</strong> का रजिस्ट्रेशन अनुमत है।
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#144732] to-[#0b2b1e] hover:opacity-95 text-white font-black py-3.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#144732]/25 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>COMPLETE REGISTRATION (सबमिट करें)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-[#144732] hover:underline">
                    Sign In here
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f6f0] flex items-center justify-center p-6">
        <div className="w-8 h-8 border-3 border-[#144732] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}