import React, { useState } from 'react';
import { Gift, Calendar, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';

interface ActivityViewProps {
  balance: number;
  onAddCredits: (amount: number) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ balance, onAddCredits }) => {
  const [claimedDays, setClaimedDays] = useState<number[]>([1]);

  const days = [
    { day: 1, reward: 100 },
    { day: 2, reward: 200 },
    { day: 3, reward: 300 },
    { day: 4, reward: 400 },
    { day: 5, reward: 500 },
    { day: 6, reward: 800 },
    { day: 7, reward: 1500 },
  ];

  const handleClaim = (day: number, reward: number) => {
    if (claimedDays.includes(day)) return;
    setClaimedDays([...claimedDays, day]);
    onAddCredits(reward);
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full pb-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            DEMO REWARDS HUB
          </span>
          <h2 className="text-base sm:text-lg font-black text-white">
            Daily Activity Bonus
          </h2>
          <span className="text-xs text-slate-400">Collect free virtual credits every 24 hours</span>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
          🎁
        </div>
      </div>

      {/* 7-Day Check-in Grid */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span>7-Day Attendance Demo Gifts</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">Free VC</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {days.map((d) => {
            const isClaimed = claimedDays.includes(d.day);
            const isToday = d.day === claimedDays.length + 1;

            return (
              <div
                key={d.day}
                className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all ${
                  isClaimed
                    ? 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-80'
                    : isToday
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold">Day {d.day}</span>
                <span className="text-lg my-1">{isClaimed ? '✅' : '🪙'}</span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  +{d.reward}
                </span>

                {isToday ? (
                  <button
                    onClick={() => handleClaim(d.day, d.reward)}
                    className="mt-1.5 w-full py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    Claim
                  </button>
                ) : isClaimed ? (
                  <span className="mt-1.5 text-[9px] text-slate-500 font-bold uppercase">
                    Done
                  </span>
                ) : (
                  <span className="mt-1.5 text-[9px] text-slate-600 font-bold uppercase">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Center */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Award className="h-4 w-4 text-purple-400" />
          <span>Demo Quests & Badges</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Try Win Go 1 Min</span>
              <span className="text-[11px] text-slate-400">Predict any colour or number in Win Go</span>
            </div>
            <button
              onClick={() => onAddCredits(200)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-purple-600/40"
            >
              +₹200 VC
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Play Aviator Crash</span>
              <span className="text-[11px] text-slate-400">Cash out before the plane flies away</span>
            </div>
            <button
              onClick={() => onAddCredits(300)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-600/40"
            >
              +₹300 VC
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Uncover 3 Boom Gems</span>
              <span className="text-[11px] text-slate-400">Reveal 3 safe diamonds without hitting bombs</span>
            </div>
            <button
              onClick={() => onAddCredits(500)}
              className="px-3 py-1.5 rounded-xl bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-bold hover:bg-sky-600/40"
            >
              +₹500 VC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
