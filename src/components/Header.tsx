import React from 'react';
import { ShieldCheck, Settings, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { ActiveTab } from '../types/game';

interface HeaderProps {
  balance: number;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  isPresetActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  setActiveTab,
  onOpenSettings,
  isPresetActive,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top micro banner for safety */}
      <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 px-3 py-1 text-center border-b border-amber-500/10">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] font-medium text-amber-300 tracking-wide">
          DEMO / SIMULATION — NO REAL MONEY
        </span>
      </div>

      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-3 sm:px-4">
        {/* Brand logo matching Tashan Win from screenshot */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex cursor-pointer items-center gap-2 select-none group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-emerald-500 to-green-600 p-[1.5px] shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-black text-amber-400 text-sm">
              TW
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-base font-black tracking-tight text-amber-400">
                TASHAN<span className="text-emerald-400 ml-1">WIN</span>
              </span>
              <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-rose-300 border border-rose-500/30">
                DEMO
              </span>
            </div>
            <span className="text-[8px] text-slate-400 tracking-wider font-semibold">
              COLOURWIN SIMULATION
            </span>
          </div>
        </div>

        {/* Balance & Actions matching screenshot */}
        <div className="flex items-center gap-2">
          {/* Preset indicator pill if active */}
          {isPresetActive && (
            <div
              className="hidden sm:flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300"
              title="A simulated result is preset for the next round"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Preset Ready</span>
            </div>
          )}

          {/* Download App Icon matching screenshot */}
          <button
            onClick={() => onOpenSettings()}
            aria-label="Download App Demo"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
            title="Add to Desktop / App"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
            </svg>
          </button>

          {/* Language Flag Badge matching screenshot (US Flag + EN) */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-bold text-slate-300">
            <span>🇺🇸</span>
            <span className="text-[10px]">EN</span>
          </div>

          {/* Virtual Balance Chip */}
          <div 
            onClick={() => setActiveTab('account')}
            className="flex cursor-pointer flex-col items-end rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-0.5 transition-colors hover:border-slate-700"
            title="Click to view account"
          >
            <span className="text-[9px] font-medium text-slate-400">
              Virtual Credits
            </span>
            <span className="font-mono text-xs sm:text-sm font-black text-emerald-400 tabular-nums">
              {formatVC(balance)}
            </span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Demo Settings"
            title="Settings & Reset"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
