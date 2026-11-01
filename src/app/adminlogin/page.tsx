'use client';

import React, { useState } from 'react';
import { UserCog, Lock, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-[#2d3748] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-2 border-[#144732]/15 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/80">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20 mb-4">
              <UserCog className="w-8 h-8 text-[#144732]" />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#92580a] font-bold mb-1">
              OPERATIONS PORTAL
            </div>
            <h1 className="text-2xl font-black text-[#144732] tracking-tight">
              Staff Administration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              SGM Mart Catalog, KYC, Orders & Support Desk
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Authenticated. Redirecting to Admin Desk...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Staff Username / ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. opsadmin"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#144732] rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#144732] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your staff password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#144732] rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#144732] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 bg-[#144732] hover:bg-[#0b2b1e] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#144732]/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN TO ADMIN CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#144732] hover:underline"
            >
              ← Return to Member / User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
