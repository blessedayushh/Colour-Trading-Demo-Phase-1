import React from 'react';
import { Coins, AlertTriangle } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';

interface StakeSelectorProps {
  stake: number;
  onStakeChange: (newStake: number) => void;
  balance: number;
  disabled: boolean;
}

const CHIP_AMOUNTS = [10, 20, 50, 100, 500];
const MULTIPLIERS = [1, 2, 5, 10];

export const StakeSelector: React.FC<StakeSelectorProps> = ({
  stake,
  onStakeChange,
  balance,
  disabled,
}) => {
  const isInsufficient = stake > balance;
  const isBelowMin = stake < 10;

  const handleChipClick = (amount: number) => {
    if (disabled) return;
    onStakeChange(amount);
  };

  const handleMultiplierClick = (mult: number) => {
    if (disabled) return;
    onStakeChange(stake * mult);
  };

  const handleMaxClick = () => {
    if (disabled) return;
    // Cap max at balance or 25,000
    const maxAllowed = Math.min(balance, 25000);
    onStakeChange(Math.max(10, Math.floor(maxAllowed)));
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (isNaN(val)) {
      onStakeChange(0);
    } else {
      onStakeChange(val);
    }
  };

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Coins className="h-3.5 w-3.5 text-amber-400" />
          <span>Demo Stake (Virtual Credits)</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400">Available: </span>
          <span className="font-mono text-xs font-bold text-emerald-400">
            {formatVC(balance)}
          </span>
        </div>
      </div>

      {/* Chip Quick Selector */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {CHIP_AMOUNTS.map((amount) => {
          const isSelected = stake === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handleChipClick(amount)}
              className={`flex h-10 flex-col items-center justify-center rounded-xl font-bold transition-all text-xs font-mono ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              ₹{amount}
            </button>
          );
        })}
      </div>

      {/* Custom Input & Multipliers */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        {/* Custom Input Box */}
        <div className="relative w-full sm:w-1/2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
            ₹
          </span>
          <input
            type="number"
            min="10"
            max="50000"
            value={stake || ''}
            onChange={handleCustomInput}
            placeholder="Custom VC"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-8 pr-12 text-sm font-mono font-bold text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500">
            VC
          </span>
        </div>

        {/* Multiplier buttons */}
        <div className="flex w-full sm:w-1/2 items-center gap-1.5">
          {MULTIPLIERS.map((mult) => (
            <button
              key={mult}
              type="button"
              onClick={() => handleMultiplierClick(mult)}
              className="flex-1 rounded-lg border border-slate-700/80 bg-slate-800/80 py-2 text-center text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {mult}×
            </button>
          ))}
          <button
            type="button"
            onClick={handleMaxClick}
            className="flex-1 rounded-lg border border-amber-500/40 bg-amber-500/10 py-2 text-center text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Stake Warnings */}
      {isInsufficient && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Insufficient virtual balance for this stake. Top up in profile.</span>
        </div>
      )}
      {isBelowMin && (
        <div className="text-[11px] text-amber-400/90 font-medium">
          Minimum demo prediction stake is ₹10 VC.
        </div>
      )}
    </div>
  );
};
