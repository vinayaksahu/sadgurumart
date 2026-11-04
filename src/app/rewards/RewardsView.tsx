'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Car,
  Home,
  Clock,
  Layers,
  ArrowRight,
  Gift
} from 'lucide-react';
import { UserRankStatus } from '@/lib/mlm/rankEngine';
import { LIFESTYLE_FUNDS } from '@/lib/mlm/rankData';

interface RewardsViewProps {
  rankStatus: UserRankStatus;
  userName: string;
  userCode: string;
}

export default function RewardsView({ rankStatus, userName, userCode }: RewardsViewProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'STAR' | 'LEADERSHIP' | 'CROREPATI' | 'FUNDS'>('ALL');

  const {
    currentRank,
    rankName,
    rankHindiName,
    leftRP,
    rightRP,
    matchedRP,
    nextRank,
    progressPercent,
    rpNeededForNext,
    allRanks,
  } = rankStatus;

  const filteredRanks = allRanks.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.club === activeTab;
  });

  const achievedCount = allRanks.filter((r) => r.status === 'ACHIEVED' || r.status === 'CURRENT').length;

  return (
    <div className="space-y-8">
      {/* Top Hero Performance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2b1e] via-[#144732] to-[#082016] text-white p-6 sm:p-8 shadow-xl border border-[#d4a359]/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Current Rank & User Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d4a359] text-slate-900 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                <span>3% Lifestyle Reward Pool</span>
              </span>
              <span className="text-xs text-[#fef08a] font-bold">
                • 1:1 Matching RP Basis
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-[#d4a359] flex items-center justify-center text-3xl shadow-md">
                {currentRank ? currentRank.iconEmoji : '🎖️'}
              </div>
              <div>
                <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                  वर्तमान रैंक पदनाम (Current Rank)
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <span>{rankHindiName}</span>
                  <span className="text-sm sm:text-base font-semibold text-[#fef08a]">
                    ({rankName})
                  </span>
                </h1>
                <div className="text-xs text-slate-300 font-medium">
                  {userName} ({userCode}) • <strong className="text-emerald-300">{achievedCount} / 15 Ranks Achieved</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right: RP Performance Quick Counters */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Left Team RP
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {leftRP.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400">लेफ्ट टीम पॉइंट्स</div>
            </div>

            <div className="text-center px-2 border-x border-white/10">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Right Team RP
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {rightRP.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400">राइट टीम पॉइंट्स</div>
            </div>

            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-[#fef08a] uppercase tracking-wider">
                Matched RP
              </div>
              <div className="text-lg sm:text-2xl font-black text-[#fef08a] mt-0.5">
                {matchedRP.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-300 font-bold">1:1 मैचिंग RP</div>
            </div>
          </div>
        </div>

        {/* Milestone Progress to Next Rank */}
        {nextRank && (
          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 bg-black/20 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#fef08a]" />
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  अगला लक्ष्य (Next Rank Target): <strong className="text-white">{nextRank.hindiName} ({nextRank.name})</strong>
                </span>
              </div>
              <div className="text-xs font-bold text-[#fef08a]">
                रिवार्ड: {nextRank.rewardHindi}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
              <div
                className="bg-gradient-to-r from-[#d4a359] via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mt-2">
              <span>वर्तमान: {matchedRP.toLocaleString('en-IN')} RP ({progressPercent}% पूर्ण)</span>
              <span>
                लक्ष्य: {nextRank.requiredRP.toLocaleString('en-IN')} RP (मात्र {rpNeededForNext.toLocaleString('en-IN')} RP शेष)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs matching the 3 Clubs from plan + 4 Lifestyle Funds */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          समस्त 15 रैंक (All 15 Ranks)
        </button>

        <button
          onClick={() => setActiveTab('STAR')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'STAR'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>⭐ स्टार क्लब (Ranks 1-5)</span>
        </button>

        <button
          onClick={() => setActiveTab('LEADERSHIP')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'LEADERSHIP'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🏆 लीडरशिप क्लब (Ranks 6-10)</span>
        </button>

        <button
          onClick={() => setActiveTab('CROREPATI')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'CROREPATI'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>👑 करोड़पति क्लब (Ranks 11-15)</span>
        </button>

        <button
          onClick={() => setActiveTab('FUNDS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'FUNDS'
              ? 'bg-[#92580a] text-white shadow-md'
              : 'bg-white text-[#92580a] hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span>💎 4 लाइफस्टाइल फंड्स (2% CTO)</span>
        </button>
      </div>

      {/* 4 Lifestyle Royalty Funds View */}
      {activeTab === 'FUNDS' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#92580a] to-[#d4a359] text-white p-6 rounded-3xl shadow-sm">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span>4 प्रकार के समर्पित लाइफस्टाइल रॉयल्टी फंड्स</span>
            </h2>
            <p className="text-xs text-amber-100 mt-1">
              कंपनी टर्नओवर (CTO) से हर महीने योग्य लीडर्स में 2% रॉयल्टी फंड का समान वितरण किया जाता है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIFESTYLE_FUNDS.map((fund) => (
              <div
                key={fund.id}
                className={`p-6 sm:p-8 rounded-3xl border-2 shadow-sm transition-all hover:shadow-md ${fund.colorClass}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-3xl">
                      {fund.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">
                        {fund.hindiName}
                      </h3>
                      <div className="text-xs font-bold text-slate-500">
                        {fund.name}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-[#144732] text-[#fef08a] font-black text-xs shadow-xs">
                    {fund.percentageCTO}% CTO
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-4">
                  {fund.descriptionHindi}
                </p>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>मासिक वितरण (Monthly CTO Payout)</span>
                  <span className="font-bold text-[#144732]">लाइफटाइम रॉयल्टी</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 text-xs text-slate-600 space-y-2">
            <div className="font-black text-[#144732] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#92580a]" />
              <span>लाइफस्टाइल फंड्स नियम व शर्तें</span>
            </div>
            <p>
              1. चारों लाइफस्टाइल फंड्स कंपनी के कुल मासिक बिजनेस टर्नओवर (CTO) से सीधे निकाले जाते हैं।
            </p>
            <p>
              2. फंड्स का मासिक समानुपातिक वितरण योग्य डायरेक्ट सेलर्स के वॉलेट में प्रत्येक माह की निश्चित क्लोजिंग पर किया जाता है।
            </p>
          </div>
        </div>
      ) : (
        /* Ranks Grid View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRanks.map((rank) => {
              const isAchieved = rank.status === 'ACHIEVED' || rank.status === 'CURRENT';
              const isNext = rank.status === 'NEXT';

              return (
                <div
                  key={rank.id}
                  className={`relative rounded-3xl border-2 p-6 transition-all flex flex-col justify-between ${
                    rank.status === 'CURRENT'
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : isAchieved
                      ? 'bg-white border-emerald-300 shadow-sm'
                      : isNext
                      ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                      : 'bg-white border-slate-200/90 opacity-90'
                  }`}
                >
                  {/* Top Status & Rank Level */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                          {String(rank.level).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {rank.clubNameHindi}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {rank.status === 'CURRENT' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>वर्तमान रैंक</span>
                        </span>
                      ) : rank.status === 'ACHIEVED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>✓ प्राप्त (Achieved)</span>
                        </span>
                      ) : rank.status === 'NEXT' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-900 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>अगला लक्ष्य ({rank.progressPercent}%)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>आगामी लक्ष्य</span>
                        </span>
                      )}
                    </div>

                    {/* Rank Name & Emoji */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {rank.iconEmoji}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-lg text-slate-900 truncate">
                          {rank.hindiName}
                        </h3>
                        <div className="text-xs font-semibold text-slate-500">
                          {rank.name}
                        </div>
                      </div>
                    </div>

                    {/* Matching RP Requirement */}
                    <div className="bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl p-3.5 mb-4 text-xs">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        आवश्यक मैचिंग पॉइंट्स (1:1 Left & Right)
                      </div>
                      <div className="flex items-center justify-between font-black text-slate-900">
                        <span>लेफ्ट: {rank.requiredRP.toLocaleString('en-IN')} RP</span>
                        <span className="text-[#92580a]">•</span>
                        <span>राइट: {rank.requiredRP.toLocaleString('en-IN')} RP</span>
                      </div>
                    </div>

                    {/* Reward Details Box */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 mb-4">
                      <div className="text-[10px] font-black text-[#92580a] uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Gift className="w-3 h-3" />
                        <span>शानदार रिवॉर्ड / नकद पुरस्कार</span>
                      </div>
                      <div className="font-black text-base text-[#144732] leading-snug">
                        {rank.rewardHindi}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                        {rank.rewardTitle}
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator for Next / Locked */}
                  <div className="pt-3 border-t border-slate-100">
                    {isAchieved ? (
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                        <span>योग्यता पूर्ण</span>
                        <span>100% Qualified</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>प्रगति: {rank.progressPercent}%</span>
                          <span>{rank.rpNeeded.toLocaleString('en-IN')} RP शेष</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-[#144732] h-full rounded-full transition-all"
                            style={{ width: `${rank.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statutory Explanatory Note matching slide 19, 20, 21 */}
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 text-xs text-slate-600 space-y-2.5">
            <div className="font-black text-[#144732] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#92580a]" />
              <span>रैंक एवं लाइफस्टाइल रिवार्ड्स महत्वपूर्ण नियम</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed font-medium">
              <li>
                <strong>1:1 RP गणना:</strong> RP (रिवार्ड पॉइंट्स) की गणना 1:1 लेफ्ट एवं राइट बिजनेस मैचिंग पर की जाती है।
              </li>
              <li>
                <strong>लाइफटाइम एक्युमुलेटेड:</strong> सभी पुरस्कार लाइफटाइम जुड़ते हुए (Accumulated) बिजनेस आधार पर प्रदान किए जाते हैं।
              </li>
              <li>
                <strong>3% डेडिकेटेड पूल:</strong> कंपनी के डेडिकेटेड 3% लाइफस्टाइल रिवार्ड पूल से पुरस्कारों की व्यवस्था की जाती है।
              </li>
              <li>
                नकद पुरस्कार बैंक ट्रांसफर / वॉलेट लेजर में विधिवत क्रेडिट किए जाते हैं, जबकि वस्तु व टूर रिवार्ड्स कंपनी के सम्मान समारोह में प्रदान किए जाते हैं।
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
