import React from 'react';
import { Gamepad2, Gift, Handshake, User, KeyRound } from 'lucide-react';
import { ActiveTab } from '../types/game';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenWheel: () => void;
  onOpenAdmin: () => void;
  isPresetActive: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenWheel,
  onOpenAdmin,
  isPresetActive,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-3">
        {/* 1. Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Gamepad2 className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* 2. Activity (with red unread badge from screenshot) */}
        <button
          onClick={() => onSelectTab('activity')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all relative ${
            activeTab === 'activity'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Gift className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Activity</span>
        </button>

        {/* 3. Center Elevated: "Get ₹500" Wheel matching screenshot */}
        <div className="relative -top-4 flex flex-1 flex-col items-center justify-center">
          <button
            onClick={onOpenWheel}
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-950 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 p-1 shadow-2xl shadow-amber-500/50 hover:scale-110 active:scale-95 transition-transform"
            title="Get ₹500 Virtual Credits"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 border border-amber-400/50">
              <span className="font-mono text-xs font-black text-amber-300">
                GO
              </span>
            </div>
          </button>
          <span className="text-[10px] font-black tracking-tight text-amber-400 mt-0.5">
            Get ₹500
          </span>
        </div>

        {/* 4. Promotion (Handshake) */}
        <button
          onClick={() => onSelectTab('promotion')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'promotion'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Handshake className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Promotion</span>
        </button>

        {/* 5. Account (User silhouette) */}
        <button
          onClick={() => onSelectTab('account')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'account'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Account</span>
        </button>
      </div>
    </nav>
  );
};
