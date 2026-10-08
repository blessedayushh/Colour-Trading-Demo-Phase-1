import React from 'react';
import { X, Trophy, AlertCircle, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { RoundResult } from '../types/game';
import { formatVC, getColourTailwind } from '../utils/gameLogic';

interface ResultModalProps {
  result: RoundResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const colourStyle = getColourTailwind(result.colour);
  const settlements = result.settlements || [];
  const hadBets = settlements.length > 0;
  const totalPayout = result.totalPayout || 0;
  const totalStake = settlements.reduce((acc, s) => acc + s.stake, 0);
  const netProfit = totalPayout - totalStake;
  const didWinAny = settlements.some((s) => s.won);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            <span>DEMO ROUND RESULT</span>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Period: #{result.period}
          </span>
          {result.isPreset && (
            <span className="mt-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
              PRESET DEMO OUTCOME
            </span>
          )}
        </div>

        {/* Big Number & Colour Reveal */}
        <div className="flex flex-col items-center justify-center py-2">
          {/* Number Ball */}
          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl border-2 ${colourStyle.border} ${colourStyle.bg} text-white`}
          >
            <span className="font-mono text-4xl font-black drop-shadow-md">
              {result.number}
            </span>
          </div>

          {/* Colour and Size Badges */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span
              className={`rounded-lg px-3 py-1 text-xs font-black tracking-wider uppercase border ${colourStyle.badge}`}
            >
              {result.colour}
            </span>
            <span className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-black tracking-wider uppercase text-slate-200">
              {result.size}
            </span>
          </div>
        </div>

        {/* Settlement Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-left">
          {hadBets ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {didWinAny ? (
                    <>
                      <Trophy className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">WINNING SETTLEMENT</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                      <span className="text-rose-400">ROUND COMPLETE</span>
                    </>
                  )}
                </div>
                <div
                  className={`font-mono text-xs font-black ${
                    netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatVC(netProfit)}
                </div>
              </div>

              {/* Individual Prediction Breakdown */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {settlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] rounded-lg bg-slate-900/60 px-2.5 py-1.5"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">
                        {s.label}
                      </span>
                      <span className="text-slate-400 ml-1">
                        (Stake: {formatVC(s.stake)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono font-bold">
                      {s.won ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">
                            +{formatVC(s.payout)}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-rose-400" />
                          <span className="text-rose-400">
                            -{formatVC(s.stake)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-xs text-slate-400">
              No demo predictions were placed for this round.
            </div>
          )}
        </div>

        {/* Safety Disclaimer in Modal */}
        <p className="text-[11px] text-slate-500 leading-tight">
          This is a simulated demo result. Virtual credits have no monetary value.
        </p>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 active:scale-[0.98] transition-all"
        >
          Continue Demo
        </button>
      </div>
    </div>
  );
};
