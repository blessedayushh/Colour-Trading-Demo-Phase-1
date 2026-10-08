import React from 'react';
import { X, Volume2, VolumeX, Sparkles, PlusCircle, RotateCcw, Trash2, KeyRound, ShieldAlert, Info } from 'lucide-react';
import { UserSettings } from '../types/game';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onAddCredits: (amount: number) => void;
  onResetDemo: () => void;
  onClearHistory: () => void;
  onOpenAdmin: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onAddCredits,
  onResetDemo,
  onClearHistory,
  onOpenAdmin,
  onClose,
}) => {
  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleAnimations = () => {
    onUpdateSettings({ ...settings, animationsEnabled: !settings.animationsEnabled });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="my-auto w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white">
              SETTINGS & DEMO CONTROLS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audio & Animation Toggles */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Preferences
          </span>

          <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <VolumeX className="h-5 w-5 text-slate-500" />
              )}
              <div>
                <div className="text-xs font-bold text-white">Sound Effects</div>
                <div className="text-[10px] text-slate-400">Web Audio countdown ticks & win sounds</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Visual Animations</div>
                <div className="text-[10px] text-slate-400">Smooth pulses and card transitions</div>
              </div>
            </div>
            <button
              onClick={toggleAnimations}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.animationsEnabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Demo Credits Top-up */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Demo Credits Quick Inject
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[5000, 10000, 50000].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  onAddCredits(amt);
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-bold text-white hover:bg-slate-700 active:scale-95 transition-all"
              >
                <PlusCircle className="h-3 w-3 text-emerald-400" />
                <span>+₹{(amt / 1000).toFixed(0)}k VC</span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Demo Panel Shortcut */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-purple-400" />
            <div>
              <div className="text-xs font-bold text-white">Admin Controls</div>
              <div className="text-[10px] text-purple-300">Preset simulation results (Authorized only)</div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Open Admin
          </button>
        </div>

        {/* Data Resets */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Demo Data Maintenance
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClearHistory}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onResetDemo();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 px-3 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Demo Data</span>
            </button>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-3 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1 font-bold text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>COLOURWIN DEMO SAFETY NOTICE</span>
          </div>
          <p className="leading-relaxed">
            ColourWin Demo is an educational simulation. Virtual credits have zero real-world value. There is no real-money gambling, deposits, withdrawals, or prizes. Results are generated via deterministic browser algorithms.
          </p>
        </div>
      </div>
    </div>
  );
};
