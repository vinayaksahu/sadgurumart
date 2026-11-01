'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Terminal, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SuperAdminLoginPage() {
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
      const res = await fetch('/api/auth/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/superadmin/dashboard';
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051810] text-[#e2e8f0] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Stealth Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#144732]/25 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0b2b1e]/90 border border-[#d4a359]/30 backdrop-blur-2xl rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#051810] border border-[#d4a359]/40 mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-[#d4a359]" />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#d4a359] font-semibold mb-1">
              SYSTEM ROOT CONSOLE
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Master Terminal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted Level-0 Governance • Stealth Architecture
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 text-xs font-medium text-center flex items-center justify-center gap-2">
              <Terminal className="w-4 h-4 animate-pulse" />
              Credentials Verified. Initializing Master Session...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Root Identity
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter stealth username"
                  required
                  className="w-full bg-[#051810]/90 border border-[#144732] focus:border-[#d4a359] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4a359] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Security Keyphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter root passphrase"
                  required
                  className="w-full bg-[#051810]/90 border border-[#144732] focus:border-[#d4a359] rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4a359] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 bg-gradient-to-r from-[#d4a359] via-[#fef08a] to-[#bc853c] hover:opacity-95 text-[#051810] font-black py-3.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#d4a359]/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#051810] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>AUTHENTICATE MASTER ROOT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#d4a359]/80" />
              <span>Zero-Trace Protected • SGM Core Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
