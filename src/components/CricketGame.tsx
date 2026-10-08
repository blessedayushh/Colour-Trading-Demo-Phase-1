import React, { useState } from 'react';
import { ArrowLeft, Flame, Trophy, History, Play, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { playSound } from '../utils/audio';

interface CricketGameProps {
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, description: string) => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  presetOutcome: CricketOutcome | null;
  onConsumePreset: () => void;
  onOpenAdmin: () => void;
}

type CricketOutcome = 'DOT' | '1_RUN' | '2_RUNS' | '4_FOUR' | '6_SIX' | 'WICKET';

interface OutcomeOption {
  id: CricketOutcome;
  label: string;
  sublabel: string;
  multiplier: number;
  badgeColor: string;
}

const OUTCOMES: OutcomeOption[] = [
  { id: '1_RUN', label: '1 Single', sublabel: '1 Run', multiplier: 1.8, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: '2_RUNS', label: '2 Double', sublabel: '2 Runs', multiplier: 3.5, badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { id: '4_FOUR', label: '4 Boundary', sublabel: 'Four!', multiplier: 4.5, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: '6_SIX', label: '6 Maximum', sublabel: 'Sixer!', multiplier: 8.0, badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'WICKET', label: 'Wicket Out', sublabel: 'Wicket!', multiplier: 6.0, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { id: 'DOT', label: '0 Dot Ball', sublabel: 'No Run', multiplier: 2.1, badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600' },
];

export const CricketGame: React.FC<CricketGameProps> = ({
  balance,
  onUpdateBalance,
  onBackToLobby,
  soundEnabled,
  presetOutcome,
  onConsumePreset,
  onOpenAdmin,
}) => {
  const [stake, setStake] = useState<number>(100);
  const [selectedOutcome, setSelectedOutcome] = useState<CricketOutcome>('4_FOUR');
  const [isBowling, setIsBowling] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<CricketOutcome | null>(null);
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const [overHistory, setOverHistory] = useState<CricketOutcome[]>(['4_FOUR', '1_RUN', 'DOT', '6_SIX', '2_RUNS']);
  const [runsScore, setRunsScore] = useState<number>(84);
  const [wicketsScore, setWicketsScore] = useState<number>(2);

  const handleBowl = () => {
    if (balance < stake || isBowling) return;
    if (stake < 10) return;

    onUpdateBalance(balance - stake, -stake, 'Cricket Demo Stake');
    setIsBowling(true);
    setLastResult(null);
    setLastWon(null);

    playSound.placeBet(soundEnabled);

    // Simulate bowling delay
    setTimeout(() => {
      let outcome: CricketOutcome = '1_RUN';

      if (presetOutcome) {
        outcome = presetOutcome;
        onConsumePreset();
      } else {
        // Deterministic realistic cricket probability distribution
        // 1 Run: 32%, Dot: 25%, 2 Runs: 15%, 4: 12%, 6: 8%, Wicket: 8%
        const rand = Math.random();
        if (rand < 0.25) outcome = 'DOT';
        else if (rand < 0.57) outcome = '1_RUN';
        else if (rand < 0.72) outcome = '2_RUNS';
        else if (rand < 0.84) outcome = '4_FOUR';
        else if (rand < 0.92) outcome = '6_SIX';
        else outcome = 'WICKET';
      }

      setLastResult(outcome);
      setOverHistory((prev) => [outcome, ...prev.slice(0, 9)]);

      // Update match score
      if (outcome === '1_RUN') setRunsScore((r) => r + 1);
      else if (outcome === '2_RUNS') setRunsScore((r) => r + 2);
      else if (outcome === '4_FOUR') setRunsScore((r) => r + 4);
      else if (outcome === '6_SIX') setRunsScore((r) => r + 6);
      else if (outcome === 'WICKET') setWicketsScore((w) => Math.min(10, w + 1));

      // Audio bat strike
      playSound.batCrack(soundEnabled);

      const didWin = outcome === selectedOutcome;
      setLastWon(didWin);

      if (didWin) {
        const selectedOpt = OUTCOMES.find((o) => o.id === selectedOutcome);
        const mult = selectedOpt ? selectedOpt.multiplier : 2.0;
        const payout = Math.floor(stake * mult);
        onUpdateBalance(balance + payout, payout - stake, `Cricket Win (${selectedOpt?.label})`);
        playSound.win(soundEnabled);
      } else {
        playSound.loss(soundEnabled);
      }

      setIsBowling(false);
    }, 1200);
  };

  const selectedOpt = OUTCOMES.find((o) => o.id === selectedOutcome);
  const potentialWin = selectedOpt ? Math.floor(stake * selectedOpt.multiplier) : 0;

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
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wider text-emerald-400">
            CRICKET PREDICTOR
          </span>
          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
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
      {presetOutcome && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-slate-950 p-2.5 px-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base animate-bounce">⚡</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  CRICKET PRESET ARMED
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-200 border border-amber-500/40 font-mono">
                  {presetOutcome}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Next delivery bowled will 100% resolve into {presetOutcome}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cricket Pitch Stadium Canvas Card */}
      <div className="relative rounded-3xl border border-emerald-900/40 bg-gradient-to-b from-slate-950 via-emerald-950/20 to-black p-4 shadow-2xl flex flex-col gap-3 overflow-hidden">
        {/* Live Scorecard Header */}
        <div className="flex items-center justify-between bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              IND vs AUS (SIMULATED T20)
            </span>
            <div className="font-mono text-base font-black text-white">
              {runsScore}/{wicketsScore} <span className="text-xs font-normal text-slate-400">(14.2 ov)</span>
            </div>
          </div>

          {/* Recent balls history */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[190px]">
            {overHistory.slice(0, 6).map((out, idx) => {
              const opt = OUTCOMES.find((o) => o.id === out);
              const text = out === 'WICKET' ? 'W' : out === 'DOT' ? '•' : out.replace('_RUN', '').replace('_RUNS', '').replace('_FOUR', '4').replace('_SIX', '6');
              const isHighlight = out === '6_SIX' || out === '4_FOUR' || out === 'WICKET';
              return (
                <span
                  key={idx}
                  className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold border ${
                    out === 'WICKET'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : isHighlight
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {text}
                </span>
              );
            })}
          </div>
        </div>

        {/* Pitch Graphic & Delivery Visualizer */}
        <div className="relative h-44 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-green-900/30 to-emerald-950/40 border border-emerald-800/30 flex items-center justify-center overflow-hidden">
          {/* Pitch 22 yards turf */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-20 bg-amber-900/20 border-y border-amber-700/20 rounded-lg flex items-center justify-between px-4">
            {/* Bowling crease */}
            <div className="h-12 w-1 bg-white/40" />
            {/* Wickets */}
            <div className="flex gap-1 items-end">
              <div className="h-10 w-1 bg-amber-400 rounded-t" />
              <div className="h-10 w-1 bg-amber-400 rounded-t" />
              <div className="h-10 w-1 bg-amber-400 rounded-t" />
            </div>
          </div>

          {/* Bowling Animation */}
          {isBowling ? (
            <div className="relative flex flex-col items-center gap-2 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/50 animate-bounce">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300">
                BOWLER RUNNING IN...
              </span>
            </div>
          ) : lastResult ? (
            <div className="relative flex flex-col items-center animate-in zoom-in-75">
              <div className={`px-4 py-2 rounded-2xl font-black text-xl shadow-xl border ${
                lastWon
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}>
                {OUTCOMES.find((o) => o.id === lastResult)?.label.toUpperCase()}
              </div>
              <span className={`text-xs font-bold mt-1.5 ${lastWon ? 'text-emerald-400' : 'text-slate-400'}`}>
                {lastWon ? `WIN! +${formatVC(potentialWin)}` : 'Better luck next ball'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-300">Predict the next delivery</span>
              <span className="text-[10px] text-slate-500">Pick outcome below & hit BOWL</span>
            </div>
          )}
        </div>
      </div>

      {/* Outcome Selection Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Choose Delivery Outcome
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            Multiplier up to 8×
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {OUTCOMES.map((opt) => {
            const isSelected = selectedOutcome === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOutcome(opt.id)}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center border font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40 scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                  {opt.label}
                </span>
                <span className="text-[10px] font-mono text-emerald-300/90 mt-0.5">
                  {opt.multiplier}× VC
                </span>
              </button>
            );
          })}
        </div>

        {/* Stake Selector */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-xs font-bold text-slate-300 uppercase">Demo Stake</span>
          <div className="grid grid-cols-5 gap-1.5">
            {[10, 50, 100, 200, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setStake(amt)}
                className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                  stake === amt
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Bowl Button */}
        <button
          type="button"
          disabled={isBowling}
          onClick={handleBowl}
          className={`w-full py-3.5 rounded-2xl font-black text-base shadow-xl transition-all flex items-center justify-center gap-2 ${
            isBowling
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white hover:brightness-110 active:scale-[0.98]'
          }`}
        >
          <Play className="h-5 w-5 fill-current" />
          <span>{isBowling ? 'BOWLING IN PROGRESS...' : `BOWL DELIVERY (₹${stake} VC)`}</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-500">
        DEMO SIMULATION — Virtual credits only. No real money betting or prizes.
      </div>
    </div>
  );
};
