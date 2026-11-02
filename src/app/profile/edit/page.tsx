'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberNavbar from '@/components/MemberNavbar';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Building,
  RefreshCw
} from 'lucide-react';

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setUser(data.user);
      setEmail(data.user?.email || '');
      setMobile(data.user?.mobile || '');
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword) {
      if (!currentPassword) {
        setError('पासवर्ड बदलने के लिए वर्तमान पासवर्ड दर्ज करना आवश्यक है।');
        return;
      }
      if (newPassword.length < 6) {
        setError('नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        email,
        mobile,
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setSuccess('प्रोफाइल एवं सुरक्षा विवरण सफलतापूर्वक अपडेट हुआ!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (data.user) {
        setUser((prev: any) => ({ ...prev, ...data.user }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MemberNavbar user={user} />

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
          <span className="text-[#144732] font-bold">Edit Profile</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-bold uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" />
                Member Account Settings
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Edit Profile (प्रोफाइल एडिट)
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                अपना ईमेल, मोबाइल नंबर एवं लॉगिन पासवर्ड सुरक्षित रूप से अपडेट करें।
              </p>
            </div>

            {/* Quick Profile Nav Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/kyc"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#fef08a]" />
                <span>KYC Status</span>
              </Link>
              <Link
                href="/profile/bank"
                className="px-3.5 py-2 rounded-xl bg-[#d4a359] hover:bg-[#c39248] text-[#0b2b1e] text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bank / UPI</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Member Account Summary Card */}
        {user && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#144732] text-[#fef08a] font-black text-lg flex items-center justify-center shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <div className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span>{user.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                      user.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {user.isActive ? 'Active Member' : 'Pending Activation'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Member ID: <span className="font-bold text-[#144732]">{user.userCode}</span>
                  {user.sponsor && (
                    <span className="ml-3 text-slate-400">
                      Sponsor: {user.sponsor.name} ({user.sponsor.userCode})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Joined:{' '}
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        )}

        {/* Edit Form */}
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
              <div className="text-xs font-bold text-slate-500">Loading Profile...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#144732] uppercase tracking-wider">
                  <User className="w-4 h-4 text-[#d4a359]" />
                  <span>1. Contact Details (संपर्क विवरण)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>ईमेल पता (Email Address)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. member@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* Phone / Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>मोबाइल नंबर (Phone / Mobile) *</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Password Change */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#144732] uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-[#d4a359]" />
                  <span>2. Change Password (लॉगिन पासवर्ड बदलें - यदि बदलना चाहें)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>वर्तमान पासवर्ड (Current)</span>
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>नया पासवर्ड (New)</span>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>पासवर्ड की पुष्टि (Confirm)</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732]"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  * पासवर्ड नहीं बदलना चाहते तो पासवर्ड फ़ील्ड्स को खाली छोड़ दें।
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
                  <span>{submitting ? 'Updating...' : 'Save Profile (अपडेट करें)'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
