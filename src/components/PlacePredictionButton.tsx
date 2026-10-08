import React from 'react';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { BetSelection } from '../types/game';
import { formatVC } from '../utils/gameLogic';

interface PlacePredictionButtonProps {
  selectedBet: BetSelection | null;
  stake: number;
  balance: number;
  isLocked: boolean;
  onPlacePrediction: () => void;
}

export const PlacePredictionButton: React.FC<PlacePredictionButtonProps> = ({
  selectedBet,
  stake,
  balance,
  isLocked,
  onPlacePrediction,
}) => {
  const isStakeValid = stake >= 10 && stake <= balance;
  const canPlace = !!selectedBet && isStakeValid && !isLocked;

  const potentialWin = selectedBet ? stake * selectedBet.payoutMultiplier : 0;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={!canPlace}
        onClick={onPlacePrediction}
        className={`group relative flex min-h-[52px] w-full items-center justify-between rounded-2xl px-5 font-bold transition-all shadow-lg ${
          !canPlace
            ? 'cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700/50 shadow-none'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-emerald-950/40 hover:brightness-110 active:scale-[0.99]'
        }`}
      >
        {/* Left Side: Action or Lock state */}
        <div className="flex items-center gap-2.5">
          {isLocked ? (
            <Lock className="h-5 w-5 text-rose-400" />
          ) : (
            <Sparkles className="h-5 w-5 text-emerald-300 group-hover:rotate-12 transition-transform" />
          )}

          <div className="text-left">
            <div className="text-sm sm:text-base font-black tracking-wide">
              {isLocked
                ? 'PREDICTIONS LOCKED'
                : selectedBet
                ? `PREDICT: ${selectedBet.label}`
                : 'SELECT COLOUR, NUMBER OR SIZE'}
            </div>
            {selectedBet && !isLocked && (
              <div className="text-[11px] font-mono opacity-90">
                Stake: {formatVC(stake)}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Potential Return */}
        {selectedBet && !isLocked && (
          <div className="flex items-center gap-2 text-right">
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-semibold text-emerald-200">
                Potential Virtual Win
              </span>
              <div className="font-mono text-sm font-black text-white tabular-nums">
                {formatVC(potentialWin)}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </button>

      {/* Small informative sub-bar */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
        <span>No real money involved</span>
        <span>Deterministic simulated payout</span>
      </div>
    </div>
  );
};
