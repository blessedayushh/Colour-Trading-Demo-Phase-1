import React from 'react';
import { BetSelection, ColourType, SizeType } from '../types/game';
import { calculateColour, getMultiplier } from '../utils/gameLogic';

interface PredictionOptionsProps {
  selectedBet: BetSelection | null;
  onSelectBet: (bet: BetSelection | null) => void;
  disabled: boolean;
}

export const PredictionOptions: React.FC<PredictionOptionsProps> = ({
  selectedBet,
  onSelectBet,
  disabled,
}) => {
  const isSelected = (category: string, value: string | number) => {
    return selectedBet?.category === category && selectedBet?.value === value;
  };

  const handleColourClick = (colour: ColourType) => {
    if (disabled) return;
    if (isSelected('COLOUR', colour)) {
      onSelectBet(null);
    } else {
      onSelectBet({
        category: 'COLOUR',
        value: colour,
        label: colour,
        payoutMultiplier: getMultiplier('COLOUR'),
      });
    }
  };

  const handleSizeClick = (size: SizeType) => {
    if (disabled) return;
    if (isSelected('SIZE', size)) {
      onSelectBet(null);
    } else {
      onSelectBet({
        category: 'SIZE',
        value: size,
        label: `${size} (${size === 'BIG' ? '5-9' : '0-4'})`,
        payoutMultiplier: getMultiplier('SIZE'),
      });
    }
  };

  const handleNumberClick = (num: number) => {
    if (disabled) return;
    if (isSelected('NUMBER', num)) {
      onSelectBet(null);
    } else {
      onSelectBet({
        category: 'NUMBER',
        value: num,
        label: `Number ${num}`,
        payoutMultiplier: getMultiplier('NUMBER'),
      });
    }
  };

  return (
    <div className={`flex flex-col gap-4 transition-opacity ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* 1. Colours Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Predict Colour
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            Payout 2×
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Green Button */}
          <button
            type="button"
            onClick={() => handleColourClick('GREEN')}
            className={`group relative flex h-13 flex-col items-center justify-center rounded-xl font-bold transition-all ${
              isSelected('COLOUR', 'GREEN')
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-[1.02]'
                : 'bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:shadow-md'
            }`}
          >
            <span className="text-sm font-extrabold tracking-wide">GREEN</span>
            <span className="text-[10px] font-mono opacity-80">2× VC</span>
          </button>

          {/* Violet Button */}
          <button
            type="button"
            onClick={() => handleColourClick('VIOLET')}
            className={`group relative flex h-13 flex-col items-center justify-center rounded-xl font-bold transition-all ${
              isSelected('COLOUR', 'VIOLET')
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-[1.02]'
                : 'bg-purple-700/80 hover:bg-purple-600 text-purple-100 hover:shadow-md'
            }`}
          >
            <span className="text-sm font-extrabold tracking-wide">VIOLET</span>
            <span className="text-[10px] font-mono opacity-80">2× VC</span>
          </button>

          {/* Red Button */}
          <button
            type="button"
            onClick={() => handleColourClick('RED')}
            className={`group relative flex h-13 flex-col items-center justify-center rounded-xl font-bold transition-all ${
              isSelected('COLOUR', 'RED')
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-[1.02]'
                : 'bg-rose-700/80 hover:bg-rose-600 text-rose-100 hover:shadow-md'
            }`}
          >
            <span className="text-sm font-extrabold tracking-wide">RED</span>
            <span className="text-[10px] font-mono opacity-80">2× VC</span>
          </button>
        </div>
      </div>

      {/* 2. Numbers Grid (0 to 9) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Predict Number (0-9)
          </span>
          <span className="text-[11px] font-mono text-purple-400 font-bold">
            High Payout 9×
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const colour = calculateColour(num);
            const selected = isSelected('NUMBER', num);

            // Dot color based on exact rule mapping
            const dotClass =
              colour === 'GREEN'
                ? 'bg-emerald-400'
                : colour === 'RED'
                ? 'bg-rose-400'
                : 'bg-purple-400';

            return (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                className={`relative flex h-13 flex-col items-center justify-center rounded-xl border font-bold transition-all ${
                  selected
                    ? 'border-purple-400 bg-purple-500/20 text-white shadow-md ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-950 scale-[1.03]'
                    : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                  <span className="font-mono text-base sm:text-lg font-black">{num}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">9×</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Size Section (Big / Small) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Predict Size
          </span>
          <span className="text-[11px] font-mono text-amber-400 font-semibold">
            Payout 2×
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Big Button */}
          <button
            type="button"
            onClick={() => handleSizeClick('BIG')}
            className={`group relative flex h-12 items-center justify-between px-4 rounded-xl font-bold transition-all ${
              isSelected('SIZE', 'BIG')
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-[1.02]'
                : 'bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wide">BIG</span>
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300">
                [5, 6, 7, 8, 9]
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">2× VC</span>
          </button>

          {/* Small Button */}
          <button
            type="button"
            onClick={() => handleSizeClick('SMALL')}
            className={`group relative flex h-12 items-center justify-between px-4 rounded-xl font-bold transition-all ${
              isSelected('SIZE', 'SMALL')
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-[1.02]'
                : 'bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-200 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wide">SMALL</span>
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300">
                [0, 1, 2, 3, 4]
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">2× VC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
