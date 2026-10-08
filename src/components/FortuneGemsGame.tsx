import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Trophy, RotateCcw, Play, ShieldAlert, Award, KeyRound } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { playSound } from '../utils/audio';
import { FortuneGemsPresetType } from '../types/game';

interface FortuneGemsGameProps {
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, description: string) => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  presetSymbol: FortuneGemsPresetType | null;
  presetMultiplier: number | null;
  onConsumePreset: () => void;
  onOpenAdmin: () => void;
}

interface SymbolConfig {
  id: string;
  name: string;
  emoji: string;
  payout: number; // 3 of a kind multiplier
  color: string;
  bg: string;
}

const SYMBOLS: SymbolConfig[] = [
  { id: 'garuda', name: 'Golden Garuda', emoji: '👑', payout: 20, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' },
  { id: 'ruby', name: 'Red Ruby', emoji: '💎', payout: 12, color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40' },
  { id: 'sapphire', name: 'Blue Sapphire', emoji: '🔷', payout: 8, color: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/40' },
  { id: 'emerald', name: 'Green Emerald', emoji: '🟢', payout: 6, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  { id: 'A', name: 'Aces High', emoji: '🅰️', payout: 4, color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/40' },
  { id: 'K', name: 'King', emoji: '🅺', payout: 3, color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40' },
  { id: 'Q', name: 'Queen', emoji: '🆀', payout: 2, color: 'text-slate-300', bg: 'bg-slate-700/20 border-slate-600' },
];

const MULTIPLIERS_4TH_REEL = [1, 2, 3, 5, 10, 15];

export const FortuneGemsGame: React.FC<FortuneGemsGameProps> = ({
  balance,
  onUpdateBalance,
  onBackToLobby,
  soundEnabled,
  presetSymbol,
  presetMultiplier,
  onConsumePreset,
  onOpenAdmin,
}) => {
  const [stake, setStake] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);

  // 3x3 reels grid state
  const [grid, setGrid] = useState<SymbolConfig[][]>([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[3], SYMBOLS[0], SYMBOLS[4]],
    [SYMBOLS[5], SYMBOLS[6], SYMBOLS[1]],
  ]);

  // 4th special multiplier reel
  const [bonusMultiplier, setBonusMultiplier] = useState<number>(2);

  // Win stats
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);

  // Spin logic
  const handleSpin = () => {
    if (balance < stake || isSpinning) return;
    if (stake < 10) return;

    onUpdateBalance(balance - stake, -stake, 'Fortune Gems Demo Spin');
    setIsSpinning(true);
    setLastWinAmount(0);
    setWinningLines([]);

    playSound.slotSpinTick(soundEnabled);

    // Randomize reels after spin animation
    setTimeout(() => {
      // Default random 3x3 symbols
      const newGrid: SymbolConfig[][] = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => {
          const rand = Math.floor(Math.random() * SYMBOLS.length);
          return SYMBOLS[rand];
        })
      );

      let luckyMult = MULTIPLIERS_4TH_REEL[Math.floor(Math.random() * MULTIPLIERS_4TH_REEL.length)];

      // Check if admin preset is armed
      if (presetSymbol) {
        if (presetSymbol === 'NO_WIN') {
          // Force staggered non-matching symbols
          newGrid[0] = [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]];
          newGrid[1] = [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]];
          newGrid[2] = [SYMBOLS[6], SYMBOLS[0], SYMBOLS[1]];
          luckyMult = presetMultiplier || 1;
        } else {
          const matchedSym = SYMBOLS.find(
            (s) => s.id.toLowerCase() === presetSymbol.toLowerCase()
          ) || SYMBOLS[0];
          newGrid[1] = [matchedSym, matchedSym, matchedSym]; // Guaranteed center win line!
          luckyMult = presetMultiplier || 10;
        }
        onConsumePreset();
      } else {
        // Natural random chance for matching row
        if (Math.random() < 0.42) {
          const luckySymbol = SYMBOLS[Math.floor(Math.random() * 4)]; // high tier
          newGrid[1] = [luckySymbol, luckySymbol, luckySymbol];
        }
      }

      setGrid(newGrid);
      setBonusMultiplier(luckyMult);

      playSound.slotStop(soundEnabled);

      // Evaluate 5 standard paylines: Row 0, Row 1, Row 2, Diag 1, Diag 2
      let totalLineMultiplier = 0;
      const wonLineIndices: number[] = [];

      // Check Row 0
      if (newGrid[0][0].id === newGrid[0][1].id && newGrid[0][1].id === newGrid[0][2].id) {
        totalLineMultiplier += newGrid[0][0].payout;
        wonLineIndices.push(0);
      }
      // Check Row 1 (Center)
      if (newGrid[1][0].id === newGrid[1][1].id && newGrid[1][1].id === newGrid[1][2].id) {
        totalLineMultiplier += newGrid[1][0].payout;
        wonLineIndices.push(1);
      }
      // Check Row 2
      if (newGrid[2][0].id === newGrid[2][1].id && newGrid[2][1].id === newGrid[2][2].id) {
        totalLineMultiplier += newGrid[2][0].payout;
        wonLineIndices.push(2);
      }
      // Check Diagonal 1
      if (newGrid[0][0].id === newGrid[1][1].id && newGrid[1][1].id === newGrid[2][2].id) {
        totalLineMultiplier += newGrid[1][1].payout;
        wonLineIndices.push(3);
      }
      // Check Diagonal 2
      if (newGrid[2][0].id === newGrid[1][1].id && newGrid[1][1].id === newGrid[0][2].id) {
        totalLineMultiplier += newGrid[1][1].payout;
        wonLineIndices.push(4);
      }

      setWinningLines(wonLineIndices);

      if (totalLineMultiplier > 0) {
        const finalPayout = Math.floor(stake * totalLineMultiplier * luckyMult);
        setLastWinAmount(finalPayout);
        onUpdateBalance(balance + finalPayout, finalPayout - stake, `Fortune Gems Big Win (${totalLineMultiplier}x * ${luckyMult}x)`);
        playSound.win(soundEnabled);
      }

      setIsSpinning(false);
    }, 900);
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
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wider text-amber-400">
            FORTUNE GEMS
          </span>
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
            DEMO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block leading-none">VC</span>
            <span className="font-mono text-xs font-bold text-emerald-400 leading-none">{formatVC(balance)}</span>
          </div>
        </div>
      </div>

      {/* Active Preset Notification Banner */}
      {presetSymbol && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-950 p-2.5 px-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base animate-bounce">⚡</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  GEMS PRESET ARMED
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-200 border border-amber-500/40 font-mono">
                  {presetSymbol === 'NO_WIN' ? 'NO MATCH' : `3x ${presetSymbol}`}
                </span>
                {presetMultiplier && (
                  <span className="rounded bg-yellow-500/20 px-1.5 py-0.2 text-[9px] font-bold text-yellow-300 font-mono">
                    {presetMultiplier}× Wheel
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {presetSymbol === 'NO_WIN'
                  ? 'Next spin will land non-matching symbols (loss test)'
                  : `Next spin guarantees center match for ${presetSymbol}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slot Machine Cabinet Display */}
      <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-slate-950 to-black p-4 shadow-2xl flex flex-col gap-3 overflow-hidden">
        {/* Golden Dragon Temple Header Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 rounded-2xl p-2.5 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <span className="text-xs font-black text-amber-200 tracking-wider block">
                SPECIAL MULTIPLIER REEL
              </span>
              <span className="text-[10px] text-amber-400/80">Match paylines to multiply wins up to 15×</span>
            </div>
          </div>
          <span className="font-mono text-xs font-extrabold text-amber-300 bg-black/40 px-2 py-1 rounded-lg border border-amber-500/30">
            5 Paylines
          </span>
        </div>

        {/* 3x3 Reels + 4th Multiplier Reel Cabinet */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/90 rounded-2xl p-3 border border-amber-500/20 shadow-inner">
          {/* Main 3 Reels (Columns 0, 1, 2) */}
          {[0, 1, 2].map((colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {[0, 1, 2].map((rowIdx) => {
                const sym = grid[rowIdx][colIdx];
                const isLineWon = winningLines.includes(rowIdx);
                return (
                  <div
                    key={rowIdx}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSpinning
                        ? 'blur-[1px] animate-pulse bg-slate-900 border-slate-800'
                        : isLineWon
                        ? `${sym.bg} ring-2 ring-amber-400 shadow-lg shadow-amber-500/30 scale-105`
                        : `${sym.bg}`
                    }`}
                  >
                    <span className="text-2xl filter drop-shadow">{sym.emoji}</span>
                    <span className={`text-[9px] font-black tracking-tight ${sym.color}`}>
                      {sym.name.slice(0, 6)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* 4th Column: Special Multiplier Reel */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-amber-500/20 via-amber-600/30 to-amber-500/20 border-2 border-amber-400/60 p-2 shadow-lg">
            <span className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">
              WHEEL
            </span>
            <div className="my-auto flex flex-col items-center">
              <span className="text-xl">✨</span>
              <span className="font-mono text-3xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                {bonusMultiplier}×
              </span>
              <span className="text-[9px] font-bold text-amber-200 uppercase tracking-widest mt-1">
                BONUS
              </span>
            </div>
          </div>
        </div>

        {/* Big Win Banner */}
        {lastWinAmount > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/40 p-3 text-center animate-in zoom-in-75">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest block">
              BIG SIMULATED WIN!
            </span>
            <span className="font-mono text-2xl font-black text-emerald-400">
              +{formatVC(lastWinAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Spin Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col gap-3">
        {/* Stake Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Demo Bet (Virtual Credits)
          </span>
          <span className="text-[11px] text-slate-500">Fixed 5 Paylines</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[10, 50, 100, 200, 500].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={isSpinning}
              onClick={() => setStake(amt)}
              className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                stake === amt
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Spin CTA Button */}
        <button
          type="button"
          disabled={isSpinning}
          onClick={handleSpin}
          className={`w-full py-4 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-2 ${
            isSpinning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-amber-500/30'
          }`}
        >
          <Sparkles className="h-5 w-5 fill-current" />
          <span>{isSpinning ? 'SPINNING REELS...' : `SPIN REELS (₹${stake} VC)`}</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-500">
        DEMO SIMULATION — Virtual credits only. No real money betting or prizes.
      </div>
    </div>
  );
};
