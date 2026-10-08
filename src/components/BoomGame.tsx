import React, { useState, useCallback } from 'react';
import { ArrowLeft, Bomb, Diamond, Sparkles, RotateCcw, ShieldCheck, Flame, KeyRound, Eye, EyeOff } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { playSound } from '../utils/audio';

interface BoomGameProps {
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, description: string) => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  presetOutcome: 'FIRST_BOMB' | 'EASY_GEMS' | null;
  onConsumePreset: () => void;
  onOpenAdmin: () => void;
}

interface Tile {
  id: number;
  isBomb: boolean;
  revealed: boolean;
}

export const BoomGame: React.FC<BoomGameProps> = ({
  balance,
  onUpdateBalance,
  onBackToLobby,
  soundEnabled,
  presetOutcome,
  onConsumePreset,
  onOpenAdmin,
}) => {
  const [stake, setStake] = useState<number>(100);
  const [bombCount, setBombCount] = useState<number>(3);
  const [inGame, setInGame] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [exploded, setExploded] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [xrayMode, setXrayMode] = useState<boolean>(false);

  // Multiplier table calculation based on probability:
  // mult = (1 - houseEdge) / Probability(revealing N safe tiles)
  const calculateMultiplier = (gems: number, bombs: number) => {
    if (gems === 0) return 1.0;
    let prob = 1.0;
    const totalTiles = 25;
    const safeTiles = totalTiles - bombs;

    for (let i = 0; i < gems; i++) {
      prob *= (safeTiles - i) / (totalTiles - i);
    }
    const houseEdge = 0.04; // 4% virtual demo house edge
    const mult = (1 - houseEdge) / prob;
    return Number(mult.toFixed(2));
  };

  const currentMultiplier = calculateMultiplier(gemsFound, bombCount);
  const nextMultiplier = calculateMultiplier(gemsFound + 1, bombCount);
  const currentPayout = Math.floor(stake * currentMultiplier);

  // Start new Boom game
  const startGame = () => {
    if (balance < stake) return;
    if (stake < 10) return;

    onUpdateBalance(balance - stake, -stake, 'Boom Mines Demo Stake');

    // Create 25 tiles
    const initialTiles: Tile[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      isBomb: false,
      revealed: false,
    }));

    // Randomly place bombs
    const bombIndices = new Set<number>();
    while (bombIndices.size < bombCount) {
      const idx = Math.floor(Math.random() * 25);
      bombIndices.add(idx);
    }

    bombIndices.forEach((idx) => {
      initialTiles[idx].isBomb = true;
    });

    setTiles(initialTiles);
    setGemsFound(0);
    setGameOver(false);
    setExploded(false);
    setCashedOut(false);
    setInGame(true);

    playSound.placeBet(soundEnabled);
  };

  // Click a tile
  const handleTileClick = (index: number) => {
    if (!inGame || gameOver || tiles[index].revealed) return;

    let currentBoard = [...tiles];
    let isCurrentBomb = currentBoard[index].isBomb;

    // Apply Admin preset logic
    if (presetOutcome === 'FIRST_BOMB') {
      // Force instant explosion on first clicked tile
      isCurrentBomb = true;
      currentBoard[index].isBomb = true;
      onConsumePreset();
    } else if (presetOutcome === 'EASY_GEMS') {
      // Guarantee safe diamond for first 5 picks
      if (isCurrentBomb) {
        // Relocate bomb to another unrevealed tile that isn't a bomb
        const availableIdx = currentBoard.findIndex(
          (t, i) => i !== index && !t.revealed && !t.isBomb
        );
        if (availableIdx !== -1) {
          currentBoard[availableIdx].isBomb = true;
          currentBoard[index].isBomb = false;
          isCurrentBomb = false;
        }
      }
      if (gemsFound >= 4) {
        onConsumePreset();
      }
    }

    if (isCurrentBomb) {
      // BOOM! Explosion
      const updated = currentBoard.map((t) => ({ ...t, revealed: true }));
      setTiles(updated);
      setGameOver(true);
      setExploded(true);
      setInGame(false);
      playSound.explosion(soundEnabled);
      if (presetOutcome) onConsumePreset();
    } else {
      // Safe diamond found!
      const updated = currentBoard.map((t, idx) => (idx === index ? { ...t, revealed: true } : t));
      setTiles(updated);
      const nextGems = gemsFound + 1;
      setGemsFound(nextGems);
      playSound.gemDing(soundEnabled);

      // Check if all safe tiles cleared
      if (nextGems === 25 - bombCount) {
        // Clear all board
        const mult = calculateMultiplier(nextGems, bombCount);
        const winAmt = Math.floor(stake * mult);
        onUpdateBalance(balance + winAmt, winAmt - stake, `Boom Mines Cleared (${mult}x)`);
        setGameOver(true);
        setCashedOut(true);
        setInGame(false);
        playSound.win(soundEnabled);
        if (presetOutcome) onConsumePreset();
      }
    }
  };

  // Cash out early
  const handleCashout = () => {
    if (!inGame || gameOver || gemsFound === 0) return;

    onUpdateBalance(balance + currentPayout, currentPayout - stake, `Boom Cashout (${currentMultiplier}x)`);
    // Reveal all remaining
    setTiles((prev) => prev.map((t) => ({ ...t, revealed: true })));
    setGameOver(true);
    setCashedOut(true);
    setInGame(false);
    playSound.win(soundEnabled);
    if (presetOutcome) onConsumePreset();
  };

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto w-full pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 shadow-md">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Bomb className="h-3.5 w-3.5" />
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wider text-sky-400">
            BOOM MINES
          </span>
          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 border border-sky-500/30">
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

      {/* Active Preset Notification Banner & X-Ray Control */}
      <div className="flex items-center justify-between gap-2">
        {presetOutcome ? (
          <div className="flex-1 flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-sky-950/30 to-slate-950 p-2.5 px-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base animate-bounce">⚡</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    {presetOutcome === 'EASY_GEMS' ? 'GUARANTEED GEMS' : 'FIRST-CLICK DETONATION'}
                  </span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-200 border border-amber-500/40">
                    ARMED
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {presetOutcome === 'EASY_GEMS'
                    ? 'First 5 picks guaranteed safe diamonds'
                    : 'Next clicked tile will instantly explode'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Admin X-Ray God Mode Toggle */}
        <button
          onClick={() => setXrayMode((prev) => !prev)}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
            xrayMode
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Admin X-Ray to reveal hidden mines"
        >
          {xrayMode ? <Eye className="h-3.5 w-3.5 text-rose-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>X-Ray {xrayMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Game Board Card */}
      <div className="rounded-3xl border border-sky-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 shadow-2xl flex flex-col gap-3">
        {/* Game Stats Ribbon */}
        <div className="flex items-center justify-between bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Bombs:</span>
            <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {bombCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Gems:</span>
            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {gemsFound} / {25 - bombCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Multiplier:</span>
            <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {currentMultiplier.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* 5x5 Tiles Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 p-2 bg-slate-950/80 rounded-2xl border border-slate-850 aspect-square">
          {Array.from({ length: 25 }, (_, i) => {
            const tile = tiles[i];
            const isRevealed = tile?.revealed;
            const isBomb = tile?.isBomb;

            return (
              <button
                key={i}
                type="button"
                disabled={!inGame || isRevealed}
                onClick={() => handleTileClick(i)}
                className={`relative rounded-xl font-bold flex items-center justify-center transition-all aspect-square ${
                  !inGame && !isRevealed
                    ? 'bg-slate-800/90 border border-slate-700/80 hover:border-sky-500/50 hover:bg-slate-750'
                    : isRevealed
                    ? isBomb
                      ? 'bg-rose-600/30 border border-rose-500 text-rose-400 animate-in zoom-in-75'
                      : 'bg-sky-500/30 border border-sky-400 text-sky-300 shadow-md shadow-sky-500/20 animate-in zoom-in-75'
                    : 'bg-gradient-to-b from-slate-800 to-slate-850 border border-slate-700 hover:border-sky-400 active:scale-95 shadow-md'
                }`}
              >
                {/* Admin X-Ray subtle indicator on unrevealed tiles */}
                {inGame && !isRevealed && xrayMode && isBomb && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-rose-500/20 border-2 border-rose-500/60 pointer-events-none animate-pulse">
                    <span className="text-[10px] text-rose-300 font-bold opacity-80">💣</span>
                  </div>
                )}
                {isRevealed ? (
                  isBomb ? (
                    <Bomb className="h-6 w-6 text-rose-500 animate-bounce" />
                  ) : (
                    <Diamond className="h-6 w-6 text-sky-400 animate-pulse" />
                  )
                ) : inGame ? (
                  <div className="h-3 w-3 rounded-full bg-slate-600/60" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-700/60" />
                )}
              </button>
            );
          })}
        </div>

        {/* Outcome banner */}
        {exploded && (
          <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 text-center text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5 animate-in zoom-in">
            <Flame className="h-4 w-4 text-rose-400" />
            <span>BOOM! Bomb detonated. Stake ₹{stake} VC lost.</span>
          </div>
        )}

        {cashedOut && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 animate-in zoom-in">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Cashed out: +{formatVC(currentPayout)} ({currentMultiplier.toFixed(2)}x)</span>
          </div>
        )}
      </div>

      {/* Controls & Betting Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col gap-3">
        {/* Mines count selector */}
        {!inGame && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase">Hidden Bombs Count</span>
              <span className="text-[11px] text-slate-500">More bombs = Higher multipliers</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setBombCount(count)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    bombCount === count
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md ring-2 ring-sky-400/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {count} Bombs
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stake Selector */}
        {!inGame && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-300 uppercase">Demo Stake</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStake(amt)}
                  className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                    stake === amt
                      ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Start or Cash Out */}
        {inGame ? (
          <button
            type="button"
            disabled={gemsFound === 0}
            onClick={handleCashout}
            className={`w-full py-3.5 rounded-2xl font-black text-base shadow-xl transition-all flex flex-col items-center justify-center leading-tight ${
              gemsFound === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-slate-950 hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            <span>CASH OUT {gemsFound > 0 ? formatVC(currentPayout) : ''}</span>
            <span className="text-xs font-mono font-bold">
              {gemsFound > 0 ? `Multiplier: ${currentMultiplier.toFixed(2)}x` : 'Pick at least 1 safe gem'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-sky-950/40 active:scale-[0.98] transition-all"
          >
            START BOOM MINES (₹{stake} VC)
          </button>
        )}
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-500">
        DEMO SIMULATION — Virtual credits only. No real money betting or prizes.
      </div>
    </div>
  );
};
