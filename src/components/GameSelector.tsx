import React from 'react';
import { Timer, Clock } from 'lucide-react';
import { GameModeId } from '../types/game';
import { GAME_MODES } from '../utils/gameLogic';

interface GameSelectorProps {
  currentMode: GameModeId;
  onSelectMode: (mode: GameModeId) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>SIMULATION MODE</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Virtual Rounds
        </span>
      </div>

      <div className="p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        {GAME_MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`w-full flex items-center justify-between py-2.5 px-3 sm:px-4 rounded-xl text-center transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-slate-800 to-slate-850 text-white shadow-md border border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Timer className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="font-bold text-xs sm:text-sm tracking-tight whitespace-nowrap">
                  {mode.name}
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <span className={`text-[11px] font-mono ${isActive ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                {mode.durationSeconds}s / round
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
