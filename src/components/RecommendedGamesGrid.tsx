import React from 'react';
import { Crown, ChevronLeft, ChevronRight, Play, Rocket, Sparkles, Flame, Bomb, Disc, Gem } from 'lucide-react';
import { SelectedGameId } from '../types/game';

interface RecommendedGamesGridProps {
  onSelectGame: (gameId: SelectedGameId) => void;
  onOpenWheel: () => void;
}

export const RecommendedGamesGrid: React.FC<RecommendedGamesGridProps> = ({
  onSelectGame,
  onOpenWheel,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Recommended Games Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Crown className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
            Recommended Games
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer transition-colors">
            Detail
          </span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column / 2-Column Game Cards Matrix matching the screenshot */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* CARD 1: AVIATOR (Red card with airplane) */}
        <div
          onClick={() => onSelectGame('aviator')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-rose-600/40 bg-gradient-to-b from-rose-900 via-rose-950 to-slate-950 p-3 aspect-[3/4] shadow-xl cursor-pointer hover:border-rose-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {/* Subtle hot top glow */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-rose-500/30 blur-lg" />

          {/* Plane Graphic representation */}
          <div className="flex items-center justify-center my-auto">
            <svg
              viewBox="0 0 100 70"
              className="h-16 w-20 text-rose-300 filter drop-shadow-[0_4px_8px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              {/* Airplane outline matching the screenshot */}
              <path d="M 20 40 L 45 35 L 75 25 L 85 28 L 88 32 L 80 34 L 50 40 L 25 45 Z" fill="#ef4444" opacity="0.6" />
              <path d="M 40 37 L 30 15 L 42 15 L 56 34 Z" fill="#f87171" opacity="0.8" />
              <path d="M 38 42 L 32 60 L 44 60 L 52 44 Z" fill="#f87171" opacity="0.8" />
              <circle cx="86" cy="30" r="3" fill="#ffffff" />
            </svg>
          </div>

          {/* Title Banner */}
          <div className="text-center">
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow">
              AVIATOR
            </span>
            <span className="text-[9px] text-rose-300/80 block font-bold">Crash 99x</span>
          </div>
        </div>

        {/* CARD 2: BOOM (Blue card with explosive bomb) */}
        <div
          onClick={() => onSelectGame('boom')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-500/40 bg-gradient-to-b from-sky-800 via-sky-950 to-slate-950 p-3 aspect-[3/4] shadow-xl cursor-pointer hover:border-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-sky-500/30 blur-lg" />

          {/* Bomb Graphic representation */}
          <div className="flex items-center justify-center my-auto">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 border border-sky-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">💣</span>
              </div>
              <span className="absolute -top-1 -right-1 text-base animate-bounce">💥</span>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center">
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow">
              BOOM
            </span>
            <span className="text-[9px] text-sky-300/80 block font-bold">Mines Multiplier</span>
          </div>
        </div>

        {/* CARD 3: AVIATOR PRO / CRASH (Dark Red card with wheel overlay) */}
        <div
          onClick={() => onSelectGame('aviator')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-red-900/60 bg-gradient-to-b from-red-950/80 via-black to-slate-950 p-3 aspect-[3/4] shadow-xl cursor-pointer hover:border-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {/* Wheel badge in corner */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-[1px] shadow-sm animate-spin duration-3000">
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-[10px]">
                🎡
              </div>
            </div>
          </div>

          {/* Center Graphic */}
          <div className="flex items-center justify-center my-auto">
            <div className="h-14 w-14 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
              🚀
            </div>
          </div>

          <div className="text-center">
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow">
              AVIATOR PRO
            </span>
            <span className="text-[9px] text-rose-300/80 block font-bold">Auto Cashout</span>
          </div>
        </div>

        {/* CARD 4: WIN GO (Dark card with crowned 8-ball and colourful balls) */}
        <div
          onClick={() => onSelectGame('wingo')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950 p-3 aspect-[3/4] shadow-xl cursor-pointer hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-purple-500/20 blur-lg" />

          {/* Crowned 8-ball graphic */}
          <div className="relative flex items-center justify-center my-auto">
            {/* Crown on ball */}
            <span className="absolute -top-3 text-lg filter drop-shadow">👑</span>
            {/* 8 Ball */}
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-xl group-hover:scale-110 transition-transform border-2 border-white/20">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-950 font-black text-sm">
                8
              </div>
            </div>
            {/* Satellite 5 & 7 balls */}
            <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow">
              5
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white shadow">
              7
            </div>
          </div>

          <div className="text-center">
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow">
              WIN GO
            </span>
            <span className="text-[9px] text-emerald-400 block font-bold">Colour & 0-9</span>
          </div>
        </div>

        {/* CARD 5: CRICKET (Bright green card with fiery ball) */}
        <div
          onClick={() => onSelectGame('cricket')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-700 via-green-900 to-slate-950 p-3 aspect-[3/4] shadow-xl cursor-pointer hover:border-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/30 blur-lg" />

          {/* Cricket Ball with Flame */}
          <div className="flex items-center justify-center my-auto">
            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-green-900 via-emerald-800 to-green-600 border-2 border-emerald-300/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏏</span>
              </div>
              <Flame className="absolute -top-2 text-amber-300 h-6 w-6 animate-pulse" />
            </div>
          </div>

          <div className="text-center">
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow">
              CRICKET
            </span>
            <span className="text-[9px] text-emerald-200 block font-bold">Boundary 8×</span>
          </div>
        </div>

        {/* CARD 6: FORTUNE GEMS (Golden mythical lion slot machine) */}
        <div
          onClick={() => onSelectGame('fortunegems')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/50 bg-gradient-to-b from-amber-700 via-amber-950 to-slate-950 p-3 aspect-[3/4] shadow-xl cursor-pointer hover:border-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-400/30 blur-lg" />

          {/* Golden Garuda / Lion Graphic */}
          <div className="flex items-center justify-center my-auto">
            <div className="relative flex flex-col items-center group-hover:scale-110 transition-transform">
              <span className="text-3xl filter drop-shadow">👑</span>
              <div className="flex gap-1 -mt-1">
                <span className="text-xs">💎</span>
                <span className="text-xs">🔷</span>
                <span className="text-xs">🟢</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="font-mono text-[11px] sm:text-xs font-black tracking-wider text-amber-200 uppercase drop-shadow truncate block">
              FORTUNE GEMS
            </span>
            <span className="text-[9px] text-amber-400 block font-bold">5 Paylines + Wheel</span>
          </div>
        </div>
      </div>

      {/* "Mini games" Section matching bottom of screenshot */}
      <div className="flex items-center justify-between px-1 pt-2">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-amber-400" />
          <span className="font-extrabold text-sm text-white tracking-wide">
            Mini games
          </span>
        </div>
        <span className="text-xs font-bold text-slate-400 cursor-pointer hover:text-white">
          Detail
        </span>
      </div>

      {/* Mini games quick launch pills */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onSelectGame('chickenroad')}
          className="flex flex-col items-center p-2.5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-400 text-center transition-all group shadow-md"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🐔
          </div>
          <span className="text-xs font-black text-amber-300 block mt-1">Chicken Road</span>
          <span className="text-[9px] text-slate-400">4 Difficulty Modes</span>
        </button>

        <button
          onClick={() => onSelectGame('boom')}
          className="flex flex-col items-center p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 text-center transition-all group shadow-md"
        >
          <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            💣
          </div>
          <span className="text-xs font-extrabold text-white block mt-1">Boom Mines</span>
          <span className="text-[9px] text-slate-400">Pick Safe Gems</span>
        </button>

        <button
          onClick={() => onSelectGame('cricket')}
          className="flex flex-col items-center p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-center transition-all group shadow-md"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🏏
          </div>
          <span className="text-xs font-extrabold text-white block mt-1">Cricket T20</span>
          <span className="text-[9px] text-slate-400">Boundary 8×</span>
        </button>
      </div>

      {/* Floating Action Pill matching screenshot: "Add to Desktop" */}
      <div className="flex justify-center pt-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-950/90 py-2 px-5 shadow-xl text-xs font-bold text-amber-300">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-amber-500 to-emerald-500 text-[10px] font-black text-slate-950">
            TW
          </div>
          <span>Add to Desktop</span>
        </div>
      </div>
    </div>
  );
};
