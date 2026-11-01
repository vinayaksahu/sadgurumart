'use client';

import React, { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function UserLoginPage() {
  const [identifier, setIdentifier] = useState('');
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
      const res = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid Login Details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f0] via-[#ffffff] to-[#eae5d8] text-[#2d3748] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 border-2 border-[#144732]/20 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-[#144732]/10">
          {/* Brand Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#144732] text-white font-black text-xl mb-3 shadow-lg shadow-[#144732]/30 border-2 border-[#d4a359]">
              SGM
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#d4a359] font-black mb-1">
              SGM MART ONLINE SERVICE
            </div>
            <h1 className="text-2xl font-black text-[#144732] tracking-tight">
              Member Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              दैनिक उपयोगी उत्पाद • 16 प्रकार की महा इनकम
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Welcome to SGM Mart! Opening Dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Member ID or Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. SGM10001 or 6267392508"
                  required
                  className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#144732] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#144732] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your member password"
                  required
                  className="w-full bg-[#fdfaf3] border border-[#d8d0bf] focus:border-[#144732] rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#144732] transition-all"
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
              className="w-full mt-2 bg-gradient-to-r from-[#144732] to-[#0b2b1e] hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#144732]/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN TO MY ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-600">
              New to SGM Mart?{' '}
              <Link
                href="/register"
                className="font-bold text-[#144732] hover:underline"
              >
                Join as Distributor (रजिस्टर करें)
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
              <Link href="/" className="hover:text-[#144732] flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Visit Store</span>
              </Link>
              <span>•</span>
              <Link href="/adminlogin" className="hover:text-[#144732]">
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
