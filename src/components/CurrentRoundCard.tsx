import React from 'react';
import { Lock, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { formatTimeMMSS } from '../utils/gameLogic';
import { GameModeConfig } from '../types/game';

interface CurrentRoundCardProps {
  gameConfig: GameModeConfig;
  period: string;
  timeLeft: number;
  totalDuration: number;
  isPreset: boolean;
}

export const CurrentRoundCard: React.FC<CurrentRoundCardProps> = ({
  gameConfig,
  period,
  timeLeft,
  totalDuration,
  isPreset,
}) => {
  const isUrgent = timeLeft <= 10;
  const isLocked = timeLeft <= 5;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

  // Circular progress math
  const strokeWidth = 5;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-4 sm:p-5 ${
      isUrgent
        ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-950 shadow-lg shadow-rose-950/20'
        : 'border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-md'
    }`}>
      {/* Background status accent */}
      {isUrgent && (
        <div className="pointer-events-none absolute inset-0 bg-rose-500/5 animate-pulse" />
      )}

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Header row: Game title & Mode info */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase">
              {gameConfig.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isPreset && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3 w-3" />
                PRESET ARMED
              </span>
            )}
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
              DEMO ROUND
            </span>
          </div>
        </div>

        {/* Middle row: Period & Countdown Clock */}
        <div className="flex items-center justify-between gap-4">
          {/* Period Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Period Issue</span>
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-white tracking-wider tabular-nums">
              {period}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Deterministic simulated draw
            </div>
          </div>

          {/* Circular Countdown Progress */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 80 80">
                {/* Background Track */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Animated Fill Circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    isUrgent ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                  fill="transparent"
                />
              </svg>

              {/* Time display in center of circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`font-mono text-lg font-black tracking-tight tabular-nums ${
                  isUrgent ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}>
                  {formatTimeMMSS(timeLeft)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  {isLocked ? 'Locked' : 'Left'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lock warning bar */}
        {isLocked ? (
          <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-semibold">Predictions Locked</span>
            </div>
            <span className="text-[11px] font-mono text-rose-400/90">
              Revealing simulated result...
            </span>
          </div>
        ) : isUrgent ? (
          <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
              <span className="font-semibold">Closing soon</span>
            </div>
            <span className="text-[11px] font-mono text-amber-400/90">
              Locking at 00:05
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
