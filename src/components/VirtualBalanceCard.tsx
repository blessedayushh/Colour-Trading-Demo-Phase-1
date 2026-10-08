import React from 'react';
import { Wallet, PlusCircle, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { INITIAL_BALANCE } from '../utils/storage';

interface VirtualBalanceCardProps {
  balance: number;
  netProfit: number;
  onAddCredits: (amount: number) => void;
  onResetDemo: () => void;
}

export const VirtualBalanceCard: React.FC<VirtualBalanceCardProps> = ({
  balance,
  netProfit,
  onAddCredits,
  onResetDemo,
}) => {
  const isProfitable = netProfit >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-xl">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top row: Label & Starting reference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300">
                Virtual Balance
              </span>
              <div className="text-[10px] text-slate-500">
                Simulation Currency
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
              Starting Base
            </span>
            <div className="font-mono text-xs font-medium text-slate-400">
              {formatVC(INITIAL_BALANCE)}
            </div>
          </div>
        </div>

        {/* Middle: Big Balance Display */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {formatVC(balance)}
            </div>
            <div className="text-[11px] text-emerald-400/80 font-medium">
              Demo credits for simulation rounds
            </div>
          </div>

          {/* Net Profit indicator */}
          <div className="flex items-center gap-1.5 mt-1 sm:mt-0 text-xs">
            <span className="text-slate-400">Virtual P/L:</span>
            <div className={`flex items-center gap-1 font-mono font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfitable ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{formatVC(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Bottom row: Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => onAddCredits(5000)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>+₹5,000 Demo Credits</span>
          </button>

          <button
            onClick={onResetDemo}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 px-3 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 active:scale-[0.98] transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
