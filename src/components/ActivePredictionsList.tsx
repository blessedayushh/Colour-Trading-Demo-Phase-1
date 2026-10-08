import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { Prediction } from '../types/game';
import { formatVC } from '../utils/gameLogic';

interface ActivePredictionsListProps {
  predictions: Prediction[];
  currentPeriod: string;
}

export const ActivePredictionsList: React.FC<ActivePredictionsListProps> = ({
  predictions,
  currentPeriod,
}) => {
  const currentRoundBets = predictions.filter((p) => p.period === currentPeriod);

  if (currentRoundBets.length === 0) {
    return null;
  }

  const totalCurrentStake = currentRoundBets.reduce((sum, b) => sum + b.stake, 0);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span>MY ACTIVE DEMO PREDICTIONS ({currentRoundBets.length})</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Total: <span className="font-bold text-white">{formatVC(totalCurrentStake)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
        {currentRoundBets.map((bet) => {
          const potentialWin = bet.stake * bet.multiplier;
          return (
            <div
              key={bet.id}
              className="flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-850 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white tracking-wide">
                    {bet.label}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    Stake: <span className="font-mono font-medium text-slate-300">{formatVC(bet.stake)}</span> ({bet.multiplier}×)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400">Potential Return</span>
                <div className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatVC(potentialWin)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
