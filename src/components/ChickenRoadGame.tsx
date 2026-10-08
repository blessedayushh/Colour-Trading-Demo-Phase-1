import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Flame,
  Trophy,
  ShieldAlert,
  Sparkles,
  KeyRound,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChickenDifficulty, ChickenRoadPresetType } from '../types/game';
import { formatVC } from '../utils/gameLogic';
import { playSound } from '../utils/audio';

const safeFormatMultiplier = (val: number | undefined | null): string => {
  if (val == null || typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return '1.00';
  }
  return val >= 100 ? val.toFixed(0) : val.toFixed(2);
};

interface ChickenRoadGameProps {
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, description: string) => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  presetOutcome: ChickenRoadPresetType | null;
  onConsumePreset: () => void;
  onOpenAdmin: () => void;
}

interface DifficultyConfig {
  id: ChickenDifficulty;
  name: string;
  badge: string;
  color: string;
  border: string;
  trapRate: number; // approximate probability of trap per step
  multipliers: number[];
  description: string;
}

const DIFFICULTY_CONFIGS: Record<ChickenDifficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    badge: '24 Steps · Max 40×',
    color: 'from-emerald-600 to-green-700 text-emerald-300',
    border: 'border-emerald-500/40 bg-emerald-500/10',
    trapRate: 0.04,
    multipliers: [
      1.04, 1.09, 1.15, 1.22, 1.30, 1.40, 1.52, 1.66, 1.82, 2.02,
      2.26, 2.55, 2.90, 3.35, 3.90, 4.60, 5.50, 6.70, 8.35, 10.60,
      13.80, 18.50, 26.00, 40.00,
    ],
    description: 'Smooth road, low roast hazard. Steady multipliers for safe walks.',
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    badge: '20 Steps · Max 4,500×',
    color: 'from-sky-600 to-blue-700 text-sky-300',
    border: 'border-sky-500/40 bg-sky-500/10',
    trapRate: 0.15,
    multipliers: [
      1.15, 1.35, 1.60, 1.95, 2.45, 3.15, 4.15, 5.60, 7.75, 11.00,
      16.00, 24.00, 38.00, 62.00, 105.00, 190.00, 360.00, 750.00, 1700.00, 4500.00,
    ],
    description: 'Balanced risk. Multipliers climb rapidly each step forward.',
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    badge: '15 Steps · Max 25,000×',
    color: 'from-purple-600 to-indigo-700 text-purple-300',
    border: 'border-purple-500/40 bg-purple-500/10',
    trapRate: 0.33,
    multipliers: [
      1.40, 2.10, 3.25, 5.20, 8.50, 14.50, 26.00, 48.00, 95.00, 200.00,
      450.00, 1100.00, 2900.00, 8500.00, 25000.00,
    ],
    description: 'Hot road with frequent ovens. Huge exponential multiplier rewards.',
  },
  hardcore: {
    id: 'hardcore',
    name: 'Hardcore',
    badge: '10 Steps · Max 200,000×',
    color: 'from-rose-600 to-red-800 text-rose-300',
    border: 'border-rose-500/40 bg-rose-500/10',
    trapRate: 0.60,
    multipliers: [
      2.50, 6.80, 19.50, 60.00, 195.00, 680.00, 2500.00, 10000.00, 45000.00, 200000.00,
    ],
    description: 'Brutal inferno path. Insane multiplier jump on every single hop!',
  },
};

export const ChickenRoadGame: React.FC<ChickenRoadGameProps> = ({
  balance,
  onUpdateBalance,
  onBackToLobby,
  soundEnabled,
  presetOutcome,
  onConsumePreset,
  onOpenAdmin,
}) => {
  const [difficulty, setDifficulty] = useState<ChickenDifficulty>('medium');
  const [stake, setStake] = useState<number>(100);

  // Game active state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = at starting line, 1 = first step done
  const [isRoasted, setIsRoasted] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [trapsMap, setTrapsMap] = useState<boolean[]>([]);
  const [xrayRadar, setXrayRadar] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeConfig = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
  const totalSteps = activeConfig?.multipliers?.length || 20;

  const currentMultiplier: number =
    currentStep > 0 && activeConfig?.multipliers && (currentStep - 1) < activeConfig.multipliers.length
      ? (activeConfig.multipliers[currentStep - 1] ?? 1.0)
      : 1.0;

  const nextMultiplier: number =
    currentStep < totalSteps && activeConfig?.multipliers && currentStep < activeConfig.multipliers.length
      ? (activeConfig.multipliers[currentStep] ?? currentMultiplier)
      : currentMultiplier;

  const currentPayout = Math.floor(stake * (currentMultiplier || 1.0));

  const handleSelectDifficulty = (mode: ChickenDifficulty) => {
    if (isPlaying) return;
    setDifficulty(mode);
    setCurrentStep(0);
    setIsRoasted(false);
    setHasCashedOut(false);
    setTrapsMap([]);
  };

  // Auto scroll road towards active step
  useEffect(() => {
    if (scrollRef.current && isPlaying) {
      const activeEl = scrollRef.current.querySelector(`[data-step="${currentStep}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep, isPlaying]);

  // Start new crossing round
  const handleStartGame = () => {
    if (balance < stake || isPlaying) return;
    if (stake < 10) return;

    onUpdateBalance(balance - stake, -stake, 'Chicken Road Demo Stake');

    // Generate traps map for each step
    const newTraps: boolean[] = [];
    for (let i = 0; i < totalSteps; i++) {
      // Natural chance of trap based on difficulty trapRate
      const isTrap = Math.random() < activeConfig.trapRate;
      newTraps.push(isTrap);
    }

    // Apply Admin preset configuration
    if (presetOutcome === 'SAFE_5') {
      for (let i = 0; i < Math.min(5, totalSteps); i++) {
        newTraps[i] = false;
      }
    } else if (presetOutcome === 'SAFE_10') {
      for (let i = 0; i < Math.min(10, totalSteps); i++) {
        newTraps[i] = false;
      }
    } else if (presetOutcome === 'JACKPOT_WIN') {
      for (let i = 0; i < totalSteps; i++) {
        newTraps[i] = false;
      }
    } else if (presetOutcome === 'INSTANT_ROAST') {
      newTraps[0] = true;
    }

    setTrapsMap(newTraps);
    setCurrentStep(0);
    setIsRoasted(false);
    setHasCashedOut(false);
    setIsPlaying(true);

    playSound.placeBet(soundEnabled);
  };

  // Hop to next step
  const handleHopNext = () => {
    if (!isPlaying || isRoasted || hasCashedOut) return;
    if (currentStep >= totalSteps) return;

    const targetStepIdx = currentStep; // 0-indexed step being attempted
    let isTrap = trapsMap[targetStepIdx] || false;

    // Preset runtime checks
    if (presetOutcome === 'SAFE_5' && targetStepIdx < 5) {
      isTrap = false;
    } else if (presetOutcome === 'SAFE_10' && targetStepIdx < 10) {
      isTrap = false;
    } else if (presetOutcome === 'JACKPOT_WIN') {
      isTrap = false;
    } else if (presetOutcome === 'INSTANT_ROAST' && targetStepIdx === 0) {
      isTrap = true;
    }

    if (isTrap) {
      // 🍗 SIZZLE! Roasted chicken
      setIsRoasted(true);
      setIsPlaying(false);
      playSound.chickenRoast(soundEnabled);
      if (presetOutcome) onConsumePreset();
    } else {
      // Safe step! 🐔 Golden Egg / Grain
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      playSound.chickenHop(soundEnabled);

      // Check if finished entire road (Jackpot Clear!)
      if (nextStepNum === totalSteps) {
        const finalMult = activeConfig.multipliers[totalSteps - 1];
        const jackpotWin = Math.floor(stake * finalMult);
        onUpdateBalance(
          balance + jackpotWin,
          jackpotWin - stake,
          `Chicken Road Complete! (${finalMult}× ${activeConfig.name})`
        );
        setIsPlaying(false);
        setHasCashedOut(true);
        playSound.win(soundEnabled);
        if (presetOutcome) onConsumePreset();
      }
    }
  };

  // Cash out safe earnings
  const handleCashout = () => {
    if (!isPlaying || isRoasted || currentStep === 0) return;

    onUpdateBalance(
      balance + currentPayout,
      currentPayout - stake,
      `Chicken Road Cashout (${currentMultiplier}×)`
    );
    setIsPlaying(false);
    setHasCashedOut(true);
    playSound.win(soundEnabled);
    if (presetOutcome) onConsumePreset();
  };

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto w-full pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 shadow-md">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg">🐔</span>
          <span className="font-black text-xs sm:text-sm tracking-wider text-amber-400">
            CHICKEN ROAD
          </span>
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
            DEMO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block leading-none">VC</span>
            <span className="font-mono text-xs font-bold text-emerald-400 leading-none">
              {formatVC(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Preset Notification Banner & Admin Radar */}
      <div className="flex items-center justify-between gap-2">
        {presetOutcome ? (
          <div className="flex-1 flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-950 p-2.5 px-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base animate-bounce">⚡</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    CHICKEN ROAD PRESET ARMED
                  </span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-200 border border-amber-500/40">
                    {presetOutcome === 'SAFE_5'
                      ? '5 SAFE HOPS'
                      : presetOutcome === 'SAFE_10'
                      ? '10 SAFE HOPS'
                      : presetOutcome === 'JACKPOT_WIN'
                      ? 'JACKPOT WIN'
                      : 'INSTANT ROAST'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {presetOutcome === 'INSTANT_ROAST'
                    ? 'First hop will immediately trigger oven trap'
                    : 'Chicken is immune to road hazard traps for preset steps'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Admin Trap Radar Toggle */}
        <button
          onClick={() => setXrayRadar((prev) => !prev)}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
            xrayRadar
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Admin Trap Radar to see danger steps"
        >
          {xrayRadar ? <Eye className="h-3.5 w-3.5 text-amber-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>Radar {xrayRadar ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* 4 Difficulty Modes Selector (User requested all 4 modes) */}
      <div className="flex flex-col gap-1.5 rounded-3xl border border-slate-800 bg-slate-900/90 p-3 shadow-xl">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Choose Difficulty Mode
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              (Higher difficulty = Bigger multipliers)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(['easy', 'medium', 'hard', 'hardcore'] as ChickenDifficulty[]).map((mode) => {
            const cfg = DIFFICULTY_CONFIGS[mode];
            const isSelected = difficulty === mode;

            return (
              <button
                key={mode}
                disabled={isPlaying}
                onClick={() => handleSelectDifficulty(mode)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                  isSelected
                    ? `bg-gradient-to-b ${cfg.color} border-white/40 shadow-lg scale-[1.02] ring-2 ring-amber-400`
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-xs font-black tracking-wide uppercase">
                  {cfg.name}
                </span>
                <span className="text-[9px] font-mono opacity-80 font-bold truncate max-w-full">
                  {mode === 'easy'
                    ? '40× max'
                    : mode === 'medium'
                    ? '4,500× max'
                    : mode === 'hard'
                    ? '25,000× max'
                    : '200,000× max'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Road Crossing Arena */}
      <div className="relative rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 shadow-2xl flex flex-col gap-3 overflow-hidden">
        {/* Arena Top Status Bar */}
        <div className="flex items-center justify-between bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Current Step</span>
            <span className="font-mono text-xs sm:text-sm font-black text-white">
              {currentStep} / {totalSteps}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 block font-semibold">Active Multiplier</span>
            <span className="font-mono text-sm sm:text-base font-black text-amber-400">
              {safeFormatMultiplier(currentMultiplier)}×
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Current Value</span>
            <span className="font-mono text-xs sm:text-sm font-black text-emerald-400">
              {formatVC(currentPayout)}
            </span>
          </div>
        </div>

        {/* Visual Chicken Crossing Track (Horizontal Scrollable Strip) */}
        <div
          ref={scrollRef}
          className="relative flex items-center gap-2 overflow-x-auto py-5 px-3 bg-slate-950/90 rounded-2xl border border-slate-800 no-scrollbar min-h-[140px]"
        >
          {/* Start Line */}
          <div className="flex flex-col items-center justify-center shrink-0 w-16 h-24 rounded-2xl bg-slate-900 border border-slate-800 text-center p-1">
            <span className="text-[10px] font-black text-slate-500 uppercase">START</span>
            {currentStep === 0 && !isRoasted && (
              <div className="my-auto flex flex-col items-center animate-bounce">
                <span className="text-2xl">🐔</span>
                <span className="text-[9px] font-bold text-amber-300">Ready</span>
              </div>
            )}
            <span className="text-[10px] font-mono text-slate-600 mt-auto">1.00×</span>
          </div>

          {/* Road Steps */}
          {activeConfig.multipliers.map((mult, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep >= stepNum;
            const isCurrent = currentStep === stepNum;
            const isUpcoming = currentStep < stepNum;
            const isDangerStep = trapsMap[idx] === true;

            return (
              <div
                key={idx}
                data-step={stepNum}
                onClick={() => {
                  if (isPlaying && currentStep === idx) {
                    handleHopNext();
                  }
                }}
                className={`relative flex flex-col items-center justify-between shrink-0 w-18 sm:w-20 h-24 rounded-2xl border p-2 transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-b from-emerald-950 via-emerald-900/60 to-slate-950 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/20'
                    : isCurrent && isRoasted
                    ? 'bg-gradient-to-b from-rose-950 via-red-900 to-black border-rose-500 text-rose-300 shadow-lg shadow-rose-500/30 ring-2 ring-rose-500'
                    : isCurrent
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400 animate-pulse cursor-pointer'
                    : isUpcoming && currentStep === idx
                    ? 'bg-slate-900 border-amber-500/50 hover:border-amber-400 hover:bg-slate-850 cursor-pointer'
                    : 'bg-slate-900/70 border-slate-800/80 text-slate-400'
                }`}
              >
                {/* Step Index Badge */}
                <span className="text-[9px] font-bold text-slate-500">#{stepNum}</span>

                {/* Center Content: Chicken, Roasted Drumstick, Golden Grain, or X-Ray trap */}
                <div className="my-auto flex flex-col items-center justify-center">
                  {isCurrent && isRoasted ? (
                    <div className="flex flex-col items-center animate-bounce">
                      <span className="text-2xl">🍗</span>
                      <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">
                        ROASTED!
                      </span>
                    </div>
                  ) : isCurrent ? (
                    <div className="flex flex-col items-center animate-bounce">
                      <span className="text-2xl filter drop-shadow">🐔</span>
                      <span className="text-[8px] font-bold text-amber-300">Here!</span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xl">🥚</span>
                      <span className="text-[8px] font-bold text-emerald-400">Safe</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-lg opacity-40">🌾</span>
                      {/* Admin Radar Hint on upcoming step */}
                      {xrayRadar && isDangerStep && (
                        <span className="text-[8px] font-black text-rose-400 animate-pulse">
                          🔥 TRAP
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Multiplier Badge */}
                <span
                  className={`font-mono text-[10px] sm:text-xs font-black ${
                    isCompleted
                      ? 'text-emerald-300'
                      : (mult ?? 0) >= 100
                      ? 'text-rose-400'
                      : (mult ?? 0) >= 10
                      ? 'text-purple-400'
                      : 'text-amber-400'
                  }`}
                >
                  {safeFormatMultiplier(mult)}×
                </span>
              </div>
            );
          })}
        </div>

        {/* Game State Banners */}
        {isRoasted && (
          <div className="rounded-2xl border border-rose-500/50 bg-rose-950/40 p-3 text-center animate-in zoom-in-95">
            <span className="text-lg block">🔥 🍗 🔥</span>
            <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider">
              CHICKEN ROASTED ON STEP #{currentStep + 1}!
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The road was too hot! Stake of {formatVC(stake)} burned in demo simulation.
            </p>
          </div>
        )}

        {hasCashedOut && (
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-3 text-center animate-in zoom-in-95">
            <span className="text-lg block">🏆 🐔 💰</span>
            <h3 className="text-sm font-black text-emerald-300 uppercase tracking-wider">
              SAFE CASHOUT: {formatVC(currentPayout)} ({safeFormatMultiplier(currentMultiplier)}×)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The chicken safely fled with virtual credits profit of +
              {formatVC(currentPayout - stake)}!
            </p>
          </div>
        )}

        {/* Stake Selector & Action Controls */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Stake Quick Chips */}
          <div className="flex items-center justify-between gap-1.5">
            {[10, 50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                disabled={isPlaying}
                onClick={() => setStake(amt)}
                className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                  stake === amt
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          {!isPlaying ? (
            <button
              onClick={handleStartGame}
              disabled={balance < stake}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                balance < stake
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <span>🐔</span>
              <span>START CROSSING (STAKE ₹{stake} VC)</span>
            </button>
          ) : (
            <div className="flex gap-2">
              {/* Cashout Button */}
              <button
                onClick={handleCashout}
                disabled={currentStep === 0}
                className={`flex-1 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all flex flex-col items-center justify-center leading-tight ${
                  currentStep === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-110 text-slate-950 shadow-emerald-500/20 active:scale-[0.98]'
                }`}
              >
                <span>CASH OUT</span>
                <span className="text-[10px] font-mono font-bold">
                  {formatVC(currentPayout)} ({safeFormatMultiplier(currentMultiplier)}×)
                </span>
              </button>

              {/* Hop Next Button */}
              <button
                onClick={handleHopNext}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex flex-col items-center justify-center leading-tight animate-pulse"
              >
                <span>HOP NEXT STEP 👟</span>
                <span className="text-[10px] font-mono font-bold">
                  Next: {safeFormatMultiplier(nextMultiplier)}×
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-500">
        DEMO SIMULATION — Virtual credits only. No real money or gambling involved.
      </div>
    </div>
  );
};
