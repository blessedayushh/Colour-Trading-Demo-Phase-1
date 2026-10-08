import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';

interface WinnerItem {
  id: string;
  user: string;
  game: string;
  amount: number;
  badge: string;
  avatarColor: string;
  emoji: string;
}

const RECENT_WINNERS: WinnerItem[] = [
  { id: '1', user: 'Mem***BZS', game: 'SABA', amount: 370.0, badge: 'SABA', avatarColor: 'from-amber-600 to-orange-700', emoji: '⚽' },
  { id: '2', user: 'Mem***VWS', game: 'SABA', amount: 501.35, badge: 'SABA', avatarColor: 'from-amber-600 to-orange-700', emoji: '⚽' },
  { id: '3', user: 'Mem***AKG', game: 'SABA', amount: 592.0, badge: 'SABA', avatarColor: 'from-amber-600 to-orange-700', emoji: '⚽' },
  { id: '4', user: 'Mem***DDK', game: 'Win Go', amount: 1960.0, badge: 'Win Go', avatarColor: 'from-purple-600 to-pink-700', emoji: '🎱' },
  { id: '5', user: 'Mem***PLQ', game: 'Aviator', amount: 3250.0, badge: 'Aviator', avatarColor: 'from-rose-600 to-red-800', emoji: '✈️' },
  { id: '6', user: 'Mem***RST', game: 'Boom', amount: 1850.0, badge: 'Boom', avatarColor: 'from-sky-600 to-blue-800', emoji: '💣' },
  { id: '7', user: 'Mem***XYZ', game: 'Fortune Gems', amount: 4100.0, badge: 'Fortune Gems', avatarColor: 'from-amber-500 to-yellow-600', emoji: '👑' },
  { id: '8', user: 'Mem***W7X', game: 'Cricket', amount: 2450.0, badge: 'Cricket', avatarColor: 'from-emerald-600 to-teal-800', emoji: '🏏' },
];

export const WinningTicker: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-3 sm:p-3.5 shadow-xl">
      {/* Background golden coins watermark */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl" />

      {/* Header title */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-black tracking-wide text-amber-300">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span className="uppercase tracking-wider">Winning information</span>
        </div>
        <span className="text-[10px] text-amber-400/80 font-mono">
          Live Demo Payouts
        </span>
      </div>

      {/* Horizontal scrolling winner cards */}
      <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {RECENT_WINNERS.map((w) => (
          <div
            key={w.id}
            className="flex flex-col items-center justify-between rounded-2xl border border-amber-500/20 bg-slate-950/80 p-2 min-w-[100px] sm:min-w-[110px] shrink-0 shadow-md group hover:border-amber-400/40 transition-colors"
          >
            {/* Avatar & Game Badge */}
            <div className={`relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-b ${w.avatarColor} p-1 text-2xl shadow-inner mb-1`}>
              <span>{w.emoji}</span>
              <span className="absolute bottom-1 rounded bg-black/60 px-1.5 py-0.2 text-[8px] font-bold text-amber-200 border border-amber-400/30">
                {w.badge}
              </span>
            </div>

            {/* Member and Payout */}
            <div className="text-center w-full">
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {w.user}
              </span>
              <span className="font-mono text-xs font-black text-amber-400 tracking-tight block">
                ₹{w.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
