import React, { useState } from 'react';
import { Handshake, Users, Award, Copy, Check, TrendingUp, ShieldAlert } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';

export const PromotionView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText('https://colourwin.demo/invite?ref=CW99281');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full pb-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            DEMO PARTNER SYSTEM
          </span>
          <h2 className="text-base sm:text-lg font-black text-white">
            Agency Simulation
          </h2>
          <span className="text-xs text-slate-400">Track simulated sub-player commission</span>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
          🤝
        </div>
      </div>

      {/* Simulated Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] text-slate-400 block font-medium">Invited Players</span>
          <span className="font-mono text-lg font-black text-white block mt-0.5">
            18 Members
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">+3 today</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] text-slate-400 block font-medium">Demo Commission</span>
          <span className="font-mono text-lg font-black text-amber-400 block mt-0.5">
            ₹3,450 VC
          </span>
          <span className="text-[10px] text-slate-500">Virtual earnings</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 block font-medium">Partner Tier</span>
          <span className="font-mono text-lg font-black text-purple-400 block mt-0.5">
            Level 2 Silver
          </span>
          <span className="text-[10px] text-purple-300 font-bold">2.5% rebate</span>
        </div>
      </div>

      {/* Demo Invite Link */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-md flex flex-col gap-2.5">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Simulation Demo Share Link
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-300 truncate">
            https://colourwin.demo/invite?ref=CW99281
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">Simulation Note</span>
          This promotion dashboard is purely a demonstration interface. There is no real referral compensation, real money, or multi-level payment processing.
        </div>
      </div>
    </div>
  );
};
