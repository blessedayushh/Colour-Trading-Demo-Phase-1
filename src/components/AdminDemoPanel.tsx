import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  Cpu,
  Plane,
  Bomb,
  Flame,
  Trophy,
  Gift,
  X,
  Trash2,
} from 'lucide-react';
import {
  AdminPreset,
  AllGamesPresets,
  CricketOutcomeType,
  FortuneGemsPresetType,
  ChickenRoadPresetType,
  GameModeId,
} from '../types/game';
import {
  calculateColour,
  calculateSize,
  formatTimeMMSS,
  formatVC,
  getColourTailwind,
} from '../utils/gameLogic';

type AdminGameTab = 'wingo' | 'aviator' | 'boom' | 'cricket' | 'fortunegems' | 'chickenroad' | 'wheel';

interface AdminDemoPanelProps {
  currentPeriod: string;
  currentMode: GameModeId;
  timeLeft: number;
  activePredictionsCount: number;
  activeStakeTotal: number;
  balance: number;
  allPresets: AllGamesPresets;
  onUpdatePresets: (presets: AllGamesPresets) => void;
  onClose: () => void;
  initialGameTab?: AdminGameTab;
}

export const AdminDemoPanel: React.FC<AdminDemoPanelProps> = ({
  currentPeriod,
  currentMode,
  timeLeft,
  activePredictionsCount,
  activeStakeTotal,
  balance,
  allPresets,
  onUpdatePresets,
  onClose,
  initialGameTab = 'wingo',
}) => {
  // Admin PIN Gate
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  // Selected game sub-tab
  const [activeTab, setActiveTab] = useState<AdminGameTab>(initialGameTab);

  useEffect(() => {
    if (initialGameTab) {
      setActiveTab(initialGameTab);
    }
  }, [initialGameTab]);

  // Win Go local selection
  const [selectedNum, setSelectedNum] = useState<number | null>(
    allPresets.wingo?.number ?? null
  );

  // Aviator local selection
  const [aviatorInput, setAviatorInput] = useState<string>(
    allPresets.aviatorCrashMultiplier ? allPresets.aviatorCrashMultiplier.toString() : '5.00'
  );

  // Boom local selection
  const [boomOutcome, setBoomOutcome] = useState<'FIRST_BOMB' | 'EASY_GEMS' | null>(
    allPresets.boomOutcome
  );

  // Cricket local selection
  const [cricketOutcome, setCricketOutcome] = useState<CricketOutcomeType>(
    allPresets.cricketOutcome || '6_SIX'
  );

  // Fortune Gems local selection
  const [gemSymbol, setGemSymbol] = useState<FortuneGemsPresetType>(
    allPresets.fortuneGemsSymbol || 'GARUDA'
  );
  const [gemMultiplier, setGemMultiplier] = useState<number>(
    allPresets.fortuneGemsMultiplier || 10
  );

  // Lucky Wheel local selection
  const [wheelPrize, setWheelPrize] = useState<number>(
    allPresets.luckyWheelPrize || 1000
  );

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1176') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect security PIN. Access denied.');
    }
  };

  const handleQuickKey = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin === '1176') {
        setIsAuthenticated(true);
        setPinError('');
      } else if (nextPin.length === 4) {
        setPinError('Incorrect security PIN. Access denied.');
      }
    }
  };

  // --- ACTIONS FOR WIN GO ---
  const handleApplyWinGoPreset = () => {
    if (selectedNum === null) return;
    const colour = calculateColour(selectedNum);
    const size = calculateSize(selectedNum);

    const preset: AdminPreset = {
      period: currentPeriod,
      number: selectedNum,
      colour,
      size,
      createdAt: Date.now(),
    };

    onUpdatePresets({ ...allPresets, wingo: preset });
  };

  const handleClearWinGoPreset = () => {
    setSelectedNum(null);
    onUpdatePresets({ ...allPresets, wingo: null });
  };

  // --- ACTIONS FOR AVIATOR ---
  const handleApplyAviatorPreset = (val?: number) => {
    const mult = val !== undefined ? val : parseFloat(aviatorInput);
    if (isNaN(mult) || mult < 1.0) return;
    const rounded = Number(mult.toFixed(2));
    onUpdatePresets({ ...allPresets, aviatorCrashMultiplier: rounded });
  };

  const handleClearAviatorPreset = () => {
    onUpdatePresets({ ...allPresets, aviatorCrashMultiplier: null });
  };

  // --- ACTIONS FOR BOOM ---
  const handleApplyBoomPreset = (outcome: 'FIRST_BOMB' | 'EASY_GEMS') => {
    setBoomOutcome(outcome);
    onUpdatePresets({ ...allPresets, boomOutcome: outcome });
  };

  const handleClearBoomPreset = () => {
    setBoomOutcome(null);
    onUpdatePresets({ ...allPresets, boomOutcome: null });
  };

  // --- ACTIONS FOR CRICKET ---
  const handleApplyCricketPreset = () => {
    onUpdatePresets({ ...allPresets, cricketOutcome });
  };

  const handleClearCricketPreset = () => {
    onUpdatePresets({ ...allPresets, cricketOutcome: null });
  };

  // --- ACTIONS FOR FORTUNE GEMS ---
  const handleApplyFortuneGemsPreset = () => {
    onUpdatePresets({
      ...allPresets,
      fortuneGemsSymbol: gemSymbol,
      fortuneGemsMultiplier: gemMultiplier,
    });
  };

  const handleClearFortuneGemsPreset = () => {
    onUpdatePresets({
      ...allPresets,
      fortuneGemsSymbol: null,
      fortuneGemsMultiplier: null,
    });
  };

  // --- ACTIONS FOR LUCKY WHEEL ---
  const handleApplyWheelPreset = () => {
    onUpdatePresets({ ...allPresets, luckyWheelPrize: wheelPrize });
  };

  const handleClearWheelPreset = () => {
    onUpdatePresets({ ...allPresets, luckyWheelPrize: null });
  };

  // --- ACTIONS FOR CHICKEN ROAD ---
  const handleApplyChickenPreset = (outcome: ChickenRoadPresetType) => {
    onUpdatePresets({ ...allPresets, chickenRoadOutcome: outcome });
  };

  const handleClearChickenPreset = () => {
    onUpdatePresets({ ...allPresets, chickenRoadOutcome: null });
  };

  // --- GLOBAL RESET ALL PRESETS ---
  const handleClearAllPresets = () => {
    onUpdatePresets({
      wingo: null,
      aviatorCrashMultiplier: null,
      boomOutcome: null,
      cricketOutcome: null,
      fortuneGemsSymbol: null,
      fortuneGemsMultiplier: null,
      luckyWheelPrize: null,
      chickenRoadOutcome: null,
    });
    setSelectedNum(null);
    setBoomOutcome(null);
  };

  const activePresetCount = [
    allPresets.wingo,
    allPresets.aviatorCrashMultiplier,
    allPresets.boomOutcome,
    allPresets.cricketOutcome,
    allPresets.fortuneGemsSymbol,
    allPresets.luckyWheelPrize,
    allPresets.chickenRoadOutcome,
  ].filter(Boolean).length;

  // If not authenticated, render PIN entry gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-3xl border border-purple-500/30 bg-slate-900 p-6 shadow-2xl flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                ALL GAMES DEMO ADMIN
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulation Preset Controls for Every Game
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
            <div className="flex items-center justify-center gap-1.5 font-bold mb-1 text-slate-200">
              <KeyRound className="h-4 w-4 text-purple-400" />
              <span>SECURITY PIN REQUIRED</span>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Enter 4-digit PIN to access simulation control panel
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl font-mono font-bold transition-all ${
                    pin[idx]
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-600'
                  }`}
                >
                  {pin[idx] ? '•' : ''}
                </div>
              ))}
            </div>

            {pinError && (
              <p className="text-xs font-medium text-rose-400">{pinError}</p>
            )}

            {/* Quick keypad */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(
                (btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') {
                        setPin('');
                        setPinError('');
                      } else if (btn === '⌫') {
                        setPin((p) => p.slice(0, -1));
                        setPinError('');
                      } else {
                        handleQuickKey(btn);
                      }
                    }}
                    className="flex h-11 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm font-bold text-slate-200 hover:bg-slate-750 active:scale-95 transition-all"
                  >
                    {btn}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="w-1/2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
              >
                Unlock Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Previews for Win Go
  const previewColour = selectedNum !== null ? calculateColour(selectedNum) : null;
  const previewSize = selectedNum !== null ? calculateSize(selectedNum) : null;
  const previewColourStyle = previewColour ? getColourTailwind(previewColour) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="my-auto w-full max-w-lg rounded-3xl border border-purple-500/30 bg-slate-900 p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  ALL GAMES ADMIN — PRESET CONTROLS
                </h2>
                {activePresetCount > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/40 animate-pulse">
                    {activePresetCount} ARMED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-purple-400 font-medium">
                Preset simulation results for testing and demonstration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Game Tabs Selector */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('wingo')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'wingo'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎱</span>
            <span className="truncate">Win Go</span>
            {allPresets.wingo && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('aviator')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'aviator'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✈️</span>
            <span className="truncate">Aviator</span>
            {allPresets.aviatorCrashMultiplier && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chickenroad')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'chickenroad'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🐔</span>
            <span className="truncate">Chicken</span>
            {allPresets.chickenRoadOutcome && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('boom')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'boom'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💣</span>
            <span className="truncate">Boom</span>
            {allPresets.boomOutcome && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cricket')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'cricket'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏏</span>
            <span className="truncate">Cricket</span>
            {allPresets.cricketOutcome && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('fortunegems')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'fortunegems'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑</span>
            <span className="truncate">Gems</span>
            {allPresets.fortuneGemsSymbol && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('wheel')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'wheel'
                ? 'bg-yellow-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎡</span>
            <span className="truncate">Wheel</span>
            {allPresets.luckyWheelPrize && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: WIN GO PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'wingo' && (
          <div className="flex flex-col gap-3">
            {/* Monitor Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Period</span>
                <span className="font-mono font-bold text-white block truncate">
                  {currentPeriod}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Timer</span>
                <span className="font-mono font-bold text-amber-400 block">
                  {formatTimeMMSS(timeLeft)}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Active Status</span>
                <span className={`font-bold block text-[11px] ${
                  allPresets.wingo ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {allPresets.wingo ? 'PRESET ARMED' : 'RANDOM SIM'}
                </span>
              </div>
            </div>

            {/* Armed Box */}
            {allPresets.wingo ? (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl font-mono text-xl font-black text-white ${
                      getColourTailwind(allPresets.wingo.colour).bg
                    }`}
                  >
                    {allPresets.wingo.number}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      ARMED FOR PERIOD #{allPresets.wingo.period}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {allPresets.wingo.colour} · {allPresets.wingo.size} (One-round only)
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClearWinGoPreset}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                >
                  Clear
                </button>
              </div>
            ) : null}

            {/* Number Selector 0-9 */}
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Simulated Result (0–9)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const colour = calculateColour(num);
                  const isSelected = selectedNum === num;
                  const colourStyle = getColourTailwind(colour);

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedNum(num)}
                      className={`flex h-12 flex-col items-center justify-center rounded-xl border font-bold transition-all ${
                        isSelected
                          ? 'border-purple-400 bg-purple-600 text-white shadow-lg ring-2 ring-purple-300 scale-105'
                          : 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${colourStyle.bg}`} />
                        <span className="font-mono text-base font-black">{num}</span>
                      </div>
                      <span className="text-[9px] uppercase opacity-75">{colour.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>

              {selectedNum !== null && previewColour && previewSize && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                  <div className="text-xs">
                    <span className="text-slate-400">Preview: </span>
                    <strong className="text-white">#{selectedNum}</strong> · {previewColour} · {previewSize}
                  </div>
                  <button
                    onClick={handleApplyWinGoPreset}
                    className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 active:scale-95 transition-all shadow-md"
                  >
                    Set Win Go Preset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AVIATOR PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'aviator' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-300 block">
                  AVIATOR CRASH MULTIPLIER PRESET
                </span>
                <span className="text-[11px] text-slate-400">
                  {allPresets.aviatorCrashMultiplier
                    ? `Next flight will crash exactly at ${allPresets.aviatorCrashMultiplier.toFixed(2)}x`
                    : 'Currently in pure random simulation mode'}
                </span>
              </div>
              {allPresets.aviatorCrashMultiplier ? (
                <button
                  onClick={handleClearAviatorPreset}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300"
                >
                  Clear
                </button>
              ) : null}
            </div>

            {/* Quick Multiplier Buttons */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Preset Multipliers
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[1.05, 1.45, 2.00, 3.50, 5.00, 10.00, 25.00, 50.00].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => {
                      setAviatorInput(mult.toString());
                      handleApplyAviatorPreset(mult);
                    }}
                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all border ${
                      allPresets.aviatorCrashMultiplier === mult
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-2 ring-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {mult.toFixed(2)}x
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-2 pt-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    max="1000"
                    value={aviatorInput}
                    onChange={(e) => setAviatorInput(e.target.value)}
                    placeholder="Custom (e.g. 7.77)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs font-mono font-bold text-white focus:border-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                    X
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyAviatorPreset()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-md"
                >
                  Set Custom
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: CHICKEN ROAD PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'chickenroad' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  CHICKEN ROAD CROSSING SIMULATION PRESET
                </span>
                <span className="text-[11px] text-slate-400">
                  {allPresets.chickenRoadOutcome === 'SAFE_5'
                    ? 'Armed: 5 Guaranteed Safe Hops (Immune to ovens)'
                    : allPresets.chickenRoadOutcome === 'SAFE_10'
                    ? 'Armed: 10 Guaranteed Safe Hops (High Multiplier Demo)'
                    : allPresets.chickenRoadOutcome === 'JACKPOT_WIN'
                    ? 'Armed: Complete Full Crossing (Grand Jackpot Win)'
                    : allPresets.chickenRoadOutcome === 'INSTANT_ROAST'
                    ? 'Armed: Instant First-Hop Roast (Loss test)'
                    : 'Currently in pure transparent random road simulation'}
                </span>
              </div>
              {allPresets.chickenRoadOutcome ? (
                <button
                  onClick={handleClearChickenPreset}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Road Outcome Preset
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyChickenPreset('SAFE_5')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    allPresets.chickenRoadOutcome === 'SAFE_5'
                      ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🥚</span>
                    <span className="text-xs font-bold text-white">5 Guaranteed Safe Hops</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Chicken hops across first 5 road lanes without hitting any trap ovens.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyChickenPreset('SAFE_10')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    allPresets.chickenRoadOutcome === 'SAFE_10'
                      ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">👑</span>
                    <span className="text-xs font-bold text-white">10 Safe Hops Demo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Perfect for demonstrating massive multiplier scaling on Hard & Hardcore!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyChickenPreset('JACKPOT_WIN')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    allPresets.chickenRoadOutcome === 'JACKPOT_WIN'
                      ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🏆</span>
                    <span className="text-xs font-bold text-white">Complete Road Jackpot</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Chicken clears every single step to the finish line for maximum multiplier.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyChickenPreset('INSTANT_ROAST')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    allPresets.chickenRoadOutcome === 'INSTANT_ROAST'
                      ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🍗</span>
                    <span className="text-xs font-bold text-white">Instant Step 1 Roast</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    First step triggers an immediate trap for demo loss simulation testing.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BOOM MINES PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'boom' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 block">
                  BOOM MINES BOARD SIMULATION PRESET
                </span>
                <span className="text-[11px] text-slate-400">
                  {allPresets.boomOutcome === 'EASY_GEMS'
                    ? 'Armed: Guaranteed Safe Gems on next game'
                    : allPresets.boomOutcome === 'FIRST_BOMB'
                    ? 'Armed: Instant First Click Detonation (Loss test)'
                    : 'Currently in pure random simulation mode'}
                </span>
              </div>
              {allPresets.boomOutcome ? (
                <button
                  onClick={handleClearBoomPreset}
                  className="rounded-xl border border-sky-500/40 bg-sky-500/20 px-3 py-1.5 text-xs font-bold text-sky-300"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleApplyBoomPreset('EASY_GEMS')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  allPresets.boomOutcome === 'EASY_GEMS'
                    ? 'bg-sky-600/30 border-sky-400 ring-2 ring-sky-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💎</span>
                  <span className="text-xs font-bold text-white">Guaranteed Safe Gems</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Player clicks are guaranteed safe for the first 5 picks. Great for demonstrating high multiplier cashout.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyBoomPreset('FIRST_BOMB')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  allPresets.boomOutcome === 'FIRST_BOMB'
                    ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💣</span>
                  <span className="text-xs font-bold text-white">Instant Explosion (Loss)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  First tile clicked immediately detonates a bomb for demonstration of loss outcome.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CRICKET PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'cricket' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  CRICKET NEXT DELIVERY PRESET
                </span>
                <span className="text-[11px] text-slate-400">
                  {allPresets.cricketOutcome
                    ? `Next ball outcome preset to: ${allPresets.cricketOutcome}`
                    : 'Currently in pure random simulation mode'}
                </span>
              </div>
              {allPresets.cricketOutcome ? (
                <button
                  onClick={handleClearCricketPreset}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Next Delivery Outcome
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '6_SIX' as CricketOutcomeType, label: '6 Maximum', mult: '8.0×' },
                  { id: '4_FOUR' as CricketOutcomeType, label: '4 Boundary', mult: '4.5×' },
                  { id: '2_RUNS' as CricketOutcomeType, label: '2 Double', mult: '3.5×' },
                  { id: '1_RUN' as CricketOutcomeType, label: '1 Single', mult: '1.8×' },
                  { id: 'WICKET' as CricketOutcomeType, label: 'Wicket Out', mult: '6.0×' },
                  { id: 'DOT' as CricketOutcomeType, label: '0 Dot Ball', mult: '2.1×' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCricketOutcome(item.id);
                      onUpdatePresets({ ...allPresets, cricketOutcome: item.id });
                    }}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      allPresets.cricketOutcome === item.id
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-emerald-300/80 font-mono">{item.mult}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: FORTUNE GEMS PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'fortunegems' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  FORTUNE GEMS REEL SPIN PRESET
                </span>
                <span className="text-[11px] text-slate-400">
                  {allPresets.fortuneGemsSymbol
                    ? `Next spin: 3x ${allPresets.fortuneGemsSymbol} + ${allPresets.fortuneGemsMultiplier || 2}× Wheel`
                    : 'Currently in pure random simulation mode'}
                </span>
              </div>
              {allPresets.fortuneGemsSymbol ? (
                <button
                  onClick={handleClearFortuneGemsPreset}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300"
                >
                  Clear
                </button>
              ) : null}
            </div>

            {/* Symbol Selection */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Winning Payline Match
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'GARUDA' as FortuneGemsPresetType, label: '👑 Garuda', pay: '20×' },
                  { id: 'RUBY' as FortuneGemsPresetType, label: '💎 Ruby', pay: '12×' },
                  { id: 'SAPPHIRE' as FortuneGemsPresetType, label: '🔷 Sapphire', pay: '8×' },
                  { id: 'EMERALD' as FortuneGemsPresetType, label: '🟢 Emerald', pay: '6×' },
                  { id: 'NO_WIN' as FortuneGemsPresetType, label: '❌ No Match', pay: '0×' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setGemSymbol(s.id);
                      onUpdatePresets({
                        ...allPresets,
                        fortuneGemsSymbol: s.id,
                        fortuneGemsMultiplier: gemMultiplier,
                      });
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      allPresets.fortuneGemsSymbol === s.id
                        ? 'bg-amber-600 text-slate-950 font-black border-amber-400 ring-2 ring-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{s.label}</span>
                    <span className="text-[10px] text-amber-300/80 font-mono">{s.pay}</span>
                  </button>
                ))}
              </div>

              {/* 4th Reel Multiplier */}
              <span className="text-xs font-bold text-white uppercase tracking-wider mt-2">
                4th Special Multiplier Wheel Reel
              </span>
              <div className="grid grid-cols-6 gap-1">
                {[1, 2, 3, 5, 10, 15].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setGemMultiplier(m);
                      if (allPresets.fortuneGemsSymbol) {
                        onUpdatePresets({
                          ...allPresets,
                          fortuneGemsMultiplier: m,
                        });
                      }
                    }}
                    className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                      gemMultiplier === m
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {m}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LUCKY WHEEL PRESET CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'wheel' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-yellow-300 block">
                  LUCKY WHEEL PRESET PRIZE
                </span>
                <span className="text-[11px] text-slate-400">
                  {allPresets.luckyWheelPrize
                    ? `Next wheel spin will land on: ₹${allPresets.luckyWheelPrize} VC`
                    : 'Currently in pure random simulation mode'}
                </span>
              </div>
              {allPresets.luckyWheelPrize ? (
                <button
                  onClick={handleClearWheelPreset}
                  className="rounded-xl border border-yellow-500/40 bg-yellow-500/20 px-3 py-1.5 text-xs font-bold text-yellow-300"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Forced Wheel Prize Segment
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setWheelPrize(amt);
                      onUpdatePresets({ ...allPresets, luckyWheelPrize: amt });
                    }}
                    className={`py-3 rounded-xl font-mono font-black text-xs border transition-all ${
                      allPresets.luckyWheelPrize === amt
                        ? 'bg-yellow-500 text-slate-950 border-yellow-300 shadow-md ring-2 ring-yellow-300'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    ₹{amt} VC
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* One-Round-Only Safety Notice */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>ONE-ROUND DEMO SIMULATION PRESET GUARANTEE</span>
          </div>
          Every preset applies exclusively to the immediate upcoming simulated round or spin. Once that round concludes, the preset automatically purges itself, and pure random generation resumes instantly.
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClearAllPresets}
            disabled={activePresetCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All Presets</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
