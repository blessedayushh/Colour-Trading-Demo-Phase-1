import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  KeyRound,
  BookOpen,
  Volume1,
  Sparkles,
  Clock,
  ChevronRight,
  TrendingUp,
  Table,
  Lightbulb,
  Check,
  X,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Layers,
  ListFilter,
  CheckCircle,
} from 'lucide-react';
import {
  RoundResult,
  Prediction,
  BetSelection,
  ColourType,
  SizeType,
  AdminPreset,
} from '../types/game';
import { formatVC, getMultiplier } from '../utils/gameLogic';
import { playSound } from '../utils/audio';

interface WingoGameViewProps {
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, description: string) => void;
  onAddCredits: (amount: number) => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  currentPeriod: string;
  timeLeft: number;
  results: RoundResult[];
  predictions: Prediction[];
  onPlacePrediction: (bet: BetSelection, stake: number) => void;
  preset: AdminPreset | null;
  onOpenAdmin: () => void;
  isLoadingHistory?: boolean;
  onRefreshHistory?: () => void;
}

type BottomTab = 'history' | 'chart' | 'myHistory';
type SpeedTab = '1m' | '30s';

export const WingoGameView: React.FC<WingoGameViewProps> = ({
  balance,
  onUpdateBalance,
  onAddCredits,
  onBackToLobby,
  soundEnabled,
  currentPeriod,
  timeLeft,
  results,
  predictions,
  onPlacePrediction,
  preset,
  onOpenAdmin,
  isLoadingHistory = false,
  onRefreshHistory,
}) => {
  // Speed tabs in top bar (WinGo 1 Min is the live mode, 3m and 5m removed)
  const [activeSpeed, setActiveSpeed] = useState<SpeedTab>('1m');

  // Bottom tabs: Game history / Chart / My history
  const [bottomTab, setBottomTab] = useState<BottomTab>('history');

  // Pagination & Filtering for Game history (supports all 500 rounds)
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyPageSize, setHistoryPageSize] = useState<number>(10);
  const [showContinuousList, setShowContinuousList] = useState<boolean>(false);
  const [filterSize, setFilterSize] = useState<'ALL' | 'BIG' | 'SMALL'>('ALL');
  const [filterColour, setFilterColour] = useState<'ALL' | 'RED' | 'GREEN' | 'VIOLET'>('ALL');
  const [filterNumber, setFilterNumber] = useState<number | 'ALL'>('ALL');
  const [searchIssue, setSearchIssue] = useState<string>('');
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // Chart view options
  const [chartRoundLimit, setChartRoundLimit] = useState<number>(30);

  // Active Multiplier chip on main screen: X1, X5, X10, X20, X50, X100
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);

  // Bet Sheet / Drawer state
  const [pendingBet, setPendingBet] = useState<BetSelection | null>(null);
  const [betBaseStake, setBetBaseStake] = useState<number>(10);
  const [betMultiplier, setBetMultiplier] = useState<number>(1);
  const [betQuantity, setBetQuantity] = useState<number>(1);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');

  const isLocked = timeLeft <= 5;

  // Extract digital clock digits: MM:SS
  const mins = Math.floor(Math.max(0, timeLeft) / 60);
  const secs = Math.floor(Math.max(0, timeLeft) % 60);
  const m1 = Math.floor(mins / 10);
  const m2 = mins % 10;
  const s1 = Math.floor(secs / 10);
  const s2 = secs % 10;

  // 5 most recent finished round results for the yellow ticket header
  const recentFiveResults = useMemo(() => {
    return results.slice(0, 5);
  }, [results]);

  // Filtered results for Game History
  const filteredHistory = useMemo(() => {
    return results.filter((r) => {
      if (searchIssue.trim() && !r.period.includes(searchIssue.trim())) {
        return false;
      }
      if (filterSize !== 'ALL' && r.size !== filterSize) {
        return false;
      }
      if (filterColour !== 'ALL') {
        const raw = (r.rawColour || '').toLowerCase();
        if (filterColour === 'VIOLET') {
          if (r.number !== 0 && r.number !== 5 && !raw.includes('violet')) return false;
        } else if (filterColour === 'RED') {
          if (!raw.includes('red') && ![2, 4, 6, 8, 0].includes(r.number)) return false;
        } else if (filterColour === 'GREEN') {
          if (!raw.includes('green') && ![1, 3, 5, 7, 9].includes(r.number)) return false;
        }
      }
      if (filterNumber !== 'ALL' && r.number !== filterNumber) {
        return false;
      }
      return true;
    });
  }, [results, searchIssue, filterSize, filterColour, filterNumber]);

  // Paginated results for bottom Game History table
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize));
  const safeHistoryPage = Math.min(Math.max(1, historyPage), totalPages);

  const paginatedHistory = useMemo(() => {
    if (showContinuousList) {
      return filteredHistory;
    }
    const start = (safeHistoryPage - 1) * historyPageSize;
    return filteredHistory.slice(start, start + historyPageSize);
  }, [filteredHistory, showContinuousList, safeHistoryPage, historyPageSize]);

  // Win Go predictions for My History tab
  const wingoPredictions = useMemo(() => {
    return predictions.filter((p) => p.gameMode === 'wingo_1m');
  }, [predictions]);

  // Statistical aggregates across all 500 rounds for Chart tab
  const statsSummary = useMemo(() => {
    const total = results.length || 1;
    let bigCount = 0;
    let smallCount = 0;
    let redCount = 0;
    let greenCount = 0;
    let violetCount = 0;
    const numFreq: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) numFreq[i] = 0;

    for (const r of results) {
      if (r.size === 'BIG') bigCount++;
      else smallCount++;

      const raw = (r.rawColour || '').toLowerCase();
      if (r.number === 0 || r.number === 5 || raw.includes('violet')) violetCount++;
      if (raw.includes('red') || [2, 4, 6, 8].includes(r.number)) redCount++;
      if (raw.includes('green') || [1, 3, 7, 9].includes(r.number)) greenCount++;

      if (r.number >= 0 && r.number <= 9) {
        numFreq[r.number] = (numFreq[r.number] || 0) + 1;
      }
    }

    return {
      total: results.length,
      bigCount,
      smallCount,
      bigPct: Math.round((bigCount / total) * 100),
      smallPct: Math.round((smallCount / total) * 100),
      redCount,
      redPct: Math.round((redCount / total) * 100),
      greenCount,
      greenPct: Math.round((greenCount / total) * 100),
      violetCount,
      violetPct: Math.round((violetCount / total) * 100),
      numFreq,
    };
  }, [results]);

  // Handle opening betting sheet
  const handleOpenBetSheet = (bet: BetSelection) => {
    if (isLocked) return;
    setPendingBet(bet);
    setBetMultiplier(activeMultiplier);
    setBetQuantity(1);
    playSound.placeBet(soundEnabled);
  };

  // Confirm bet placement
  const handleConfirmBet = () => {
    if (!pendingBet || isLocked) return;
    const totalStake = betBaseStake * betMultiplier * betQuantity;
    if (balance < totalStake) {
      setShowDepositModal(true);
      return;
    }
    onPlacePrediction(pendingBet, totalStake);
    setPendingBet(null);
  };

  // Quick Random Bet Generator
  const handleRandomBet = () => {
    if (isLocked) return;
    const randomNum = Math.floor(Math.random() * 10);
    handleOpenBetSheet({
      category: 'NUMBER',
      value: randomNum,
      label: `Number ${randomNum}`,
      payoutMultiplier: getMultiplier('NUMBER'),
    });
  };

  // Render 3D glossy number ball
  const render3DBall = (num: number, rawColour?: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const isZero = num === 0 || rawColour === 'red,violet';
    const isFive = num === 5 || rawColour === 'green,violet';
    const isRed = [2, 4, 6, 8].includes(num);

    const sizeClasses = {
      sm: 'h-6 w-6 text-[10px]',
      md: 'h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base',
      lg: 'h-13 w-13 text-lg',
    }[size];

    const innerCircleSize = {
      sm: 'h-4 w-4 text-[9px]',
      md: 'h-7 w-7 sm:h-8 sm:w-8 text-xs sm:text-sm',
      lg: 'h-8 w-8 text-sm',
    }[size];

    if (isZero) {
      return (
        <div
          className={`relative flex ${sizeClasses} items-center justify-center rounded-full font-black shadow-lg overflow-hidden border-2 border-white/30 bg-gradient-to-tr from-rose-600 via-purple-600 to-purple-800 transition-transform active:scale-95`}
        >
          {/* Half split visual */}
          <div className="absolute inset-0 bg-rose-600 [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]" />
          <div className="relative z-10 flex ${innerCircleSize} items-center justify-center rounded-full bg-white/95 text-purple-700 font-extrabold shadow-sm border border-purple-300/40">
            {num}
          </div>
        </div>
      );
    }

    if (isFive) {
      return (
        <div
          className={`relative flex ${sizeClasses} items-center justify-center rounded-full font-black shadow-lg overflow-hidden border-2 border-white/30 bg-gradient-to-tr from-emerald-600 via-purple-600 to-purple-800 transition-transform active:scale-95`}
        >
          <div className="absolute inset-0 bg-emerald-600 [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]" />
          <div className="relative z-10 flex ${innerCircleSize} items-center justify-center rounded-full bg-white/95 text-purple-700 font-extrabold shadow-sm border border-purple-300/40">
            {num}
          </div>
        </div>
      );
    }

    const outerBg = isRed
      ? 'from-rose-500 via-rose-600 to-red-700 border-rose-300/40 shadow-rose-900/40'
      : 'from-emerald-500 via-emerald-600 to-green-700 border-emerald-300/40 shadow-emerald-900/40';
    const innerText = isRed ? 'text-rose-600' : 'text-emerald-700';

    return (
      <div
        className={`relative flex ${sizeClasses} items-center justify-center rounded-full font-black shadow-lg bg-gradient-to-b ${outerBg} border-2 transition-transform active:scale-95`}
      >
        {/* Glossy top reflection */}
        <div className="pointer-events-none absolute inset-x-1 top-0.5 h-1.5 sm:h-2 rounded-full bg-white/30 blur-[0.5px]" />
        <div
          className={`flex ${innerCircleSize} items-center justify-center rounded-full bg-white/95 ${innerText} font-extrabold shadow-sm border border-white/60`}
        >
          {num}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto w-full pb-8">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & WALLET BALANCE CARD (Matching Screenshot) */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#2a2b34] via-[#21222a] to-[#1a1b22] border border-slate-700/50 p-4 shadow-2xl flex flex-col gap-3">
        {/* Subtle curved background overlay */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-700/20 blur-xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-slate-800/20 blur-xl" />

        {/* Top bar with back to lobby */}
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            {preset && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Simulation Preset Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex flex-col items-center justify-center text-center relative z-10 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button
              onClick={onRefreshHistory}
              disabled={isLoadingHistory}
              className="text-slate-400 hover:text-white transition-colors active:rotate-180 duration-300"
              title="Refresh Balance & Live Results"
            >
              <RotateCcw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-1">
            <span className="text-amber-400 text-sm">👛</span>
            <span>Wallet balance</span>
          </div>
        </div>

        {/* Action Buttons: Withdraw & Deposit */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full py-2.5 px-4 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-[#f05c44] to-[#e03b22] hover:opacity-95 active:scale-98 shadow-lg shadow-rose-950/40 transition-all text-center tracking-wide"
          >
            Withdraw
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="w-full py-2.5 px-4 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-[#20c068] to-[#12a050] hover:opacity-95 active:scale-98 shadow-lg shadow-emerald-950/40 transition-all text-center tracking-wide"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PLATFORM NOTICE TICKER (Matching Screenshot) */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#382618] via-[#2d1e13] to-[#22160d] border border-[#5c3e1e] px-3 py-2 text-xs shadow-md">
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
          <span className="text-amber-400 text-sm shrink-0 animate-bounce">📢</span>
          <span className="text-[#e2b77a] font-medium text-[11px] truncate">
            Welcome to TASHANWIN game platform, we will serve you wholeheartedly!
          </span>
        </div>
        <button
          onClick={() => setShowHowToPlay(true)}
          className="shrink-0 rounded-full bg-gradient-to-r from-[#ffc83b] to-[#f5a623] px-3 py-1 text-[11px] font-black text-[#4d2800] shadow-sm hover:opacity-95 transition-all"
        >
          Detail
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. WINGO SPEED MODES STRIP (3M & 5M Removed) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#1b1c23] rounded-3xl border border-slate-800 text-center shadow-lg">
        {/* WinGo 1 Min (Standard live official mode) */}
        <button
          onClick={() => setActiveSpeed('1m')}
          className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all ${
            activeSpeed === '1m'
              ? 'bg-gradient-to-r from-[#ffd358] via-[#ffc83b] to-[#ffb826] text-[#4d2800] font-black shadow-md scale-[1.01]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Clock className={`h-5 w-5 ${activeSpeed === '1m' ? 'text-[#4d2800]' : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black leading-tight">WinGo 1 Min</span>
            <span className={`text-[10px] font-bold ${activeSpeed === '1m' ? 'text-[#704200]' : 'text-emerald-400'}`}>
              🟢 Official Live API
            </span>
          </div>
        </button>

        {/* WinGo 30sec */}
        <button
          onClick={() => setActiveSpeed('30s')}
          className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all ${
            activeSpeed === '30s'
              ? 'bg-gradient-to-r from-[#ffd358] via-[#ffc83b] to-[#ffb826] text-[#4d2800] font-black shadow-md scale-[1.01]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className={`h-5 w-5 ${activeSpeed === '30s' ? 'text-[#4d2800]' : 'text-slate-400'}`} />
          <div className="flex flex-col text-left">
            <span className="text-xs font-black leading-tight">WinGo 30sec</span>
            <span className="text-[10px] font-bold text-slate-400">Turbo Mode</span>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 4. YELLOW TICKET CARD (Matching Screenshot) */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ffd358] via-[#ffc83b] to-[#ffb826] text-slate-950 p-4 shadow-xl">
        {/* Ticket Top & Bottom Scalloped Cutout Notches */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-950 shadow-inner" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-5 w-5 rounded-full bg-slate-950 shadow-inner" />

        <div className="grid grid-cols-2 divide-x-2 divide-dashed divide-[#d4a024] relative z-10">
          {/* Left half: How to play & 5 previous balls */}
          <div className="pr-3 flex flex-col justify-between gap-2.5">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/40 bg-white/30 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-white/50 transition-colors w-fit"
            >
              <BookOpen className="h-3 w-3" />
              <span>How to play</span>
            </button>

            <div>
              <span className="font-extrabold text-xs text-slate-900 block tracking-tight">
                WinGo {activeSpeed === '30s' ? '30sec' : '1 Min'}
              </span>

              {/* Row of 5 small recent balls */}
              <div className="flex items-center gap-1 mt-1.5">
                {recentFiveResults.map((r, i) => (
                  <div key={r.period || i}>
                    {render3DBall(r.number, r.rawColour, 'sm')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right half: Time remaining & digital clock flip boxes */}
          <div className="pl-3 flex flex-col justify-between items-end text-right">
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                Time remaining
              </span>

              {/* Digital flip clock boxes: [0] [0] : [1] [7] */}
              <div className="flex items-center gap-1 mt-1 justify-end font-mono">
                <span className="flex h-7 w-6 items-center justify-center rounded-md bg-[#18191f] text-white text-base font-black shadow">
                  {m1}
                </span>
                <span className="flex h-7 w-6 items-center justify-center rounded-md bg-[#18191f] text-white text-base font-black shadow">
                  {m2}
                </span>
                <span className="font-black text-slate-900 text-sm mx-0.5">:</span>
                <span className="flex h-7 w-6 items-center justify-center rounded-md bg-[#18191f] text-white text-base font-black shadow">
                  {s1}
                </span>
                <span className="flex h-7 w-6 items-center justify-center rounded-md bg-[#18191f] text-white text-base font-black shadow">
                  {s2}
                </span>
              </div>
            </div>

            {/* Current Period Number */}
            <div className="font-mono text-xs font-black text-slate-950 tracking-wide mt-2">
              {currentPeriod}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. BIG 3 COLOUR BUTTONS (Green, Violet, Red) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          disabled={isLocked}
          onClick={() =>
            handleOpenBetSheet({
              category: 'COLOUR',
              value: 'GREEN',
              label: 'Green',
              payoutMultiplier: 2,
            })
          }
          className="py-3 px-2 rounded-xl font-black text-sm text-white bg-gradient-to-r from-[#20c068] to-[#149f50] shadow-lg shadow-emerald-950/40 hover:opacity-95 active:scale-95 transition-all text-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Green
        </button>

        <button
          disabled={isLocked}
          onClick={() =>
            handleOpenBetSheet({
              category: 'COLOUR',
              value: 'VIOLET',
              label: 'Violet',
              payoutMultiplier: 4.5,
            })
          }
          className="py-3 px-2 rounded-xl font-black text-sm text-white bg-gradient-to-r from-[#9d52f6] to-[#7f32e2] shadow-lg shadow-purple-950/40 hover:opacity-95 active:scale-95 transition-all text-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Violet
        </button>

        <button
          disabled={isLocked}
          onClick={() =>
            handleOpenBetSheet({
              category: 'COLOUR',
              value: 'RED',
              label: 'Red',
              payoutMultiplier: 2,
            })
          }
          className="py-3 px-2 rounded-xl font-black text-sm text-white bg-gradient-to-r from-[#f05c44] to-[#e03b22] shadow-lg shadow-rose-950/40 hover:opacity-95 active:scale-95 transition-all text-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Red
        </button>
      </div>

      {/* ======================================================== */}
      {/* 6. 0-9 NUMBER BALLS MATRIX (Matching Screenshot) */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-[#191a20] border border-slate-800/80 p-3.5 sm:p-4 shadow-xl flex flex-col gap-3">
        {/* Row 1: 0, 1, 2, 3, 4 */}
        <div className="flex items-center justify-between">
          {[0, 1, 2, 3, 4].map((num) => (
            <button
              key={num}
              disabled={isLocked}
              onClick={() =>
                handleOpenBetSheet({
                  category: 'NUMBER',
                  value: num,
                  label: `Number ${num}`,
                  payoutMultiplier: 9,
                })
              }
              className="p-1 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {render3DBall(num, num === 0 ? 'red,violet' : undefined, 'md')}
            </button>
          ))}
        </div>

        {/* Row 2: 5, 6, 7, 8, 9 */}
        <div className="flex items-center justify-between">
          {[5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              disabled={isLocked}
              onClick={() =>
                handleOpenBetSheet({
                  category: 'NUMBER',
                  value: num,
                  label: `Number ${num}`,
                  payoutMultiplier: 9,
                })
              }
              className="p-1 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {render3DBall(num, num === 5 ? 'green,violet' : undefined, 'md')}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. MULTIPLIERS BAR (Random, X1, X5, X10, X20, X50, X100) */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        <button
          disabled={isLocked}
          onClick={handleRandomBet}
          className="shrink-0 px-3 py-2 rounded-xl bg-[#281c1f] text-[#f05c44] border border-[#f05c44]/40 hover:bg-[#342226] transition-all font-black"
        >
          Random
        </button>

        {[1, 5, 10, 20, 50, 100].map((m) => {
          const isSelected = activeMultiplier === m;
          return (
            <button
              key={m}
              onClick={() => setActiveMultiplier(m)}
              className={`shrink-0 px-3 py-2 rounded-xl font-mono font-black transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#20c068] to-[#12a050] text-white shadow-md shadow-emerald-950/40 scale-105'
                  : 'bg-[#181920] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              X{m}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 8. BIG / SMALL SPLIT BAR (Matching Screenshot) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 rounded-full overflow-hidden shadow-xl border border-slate-700/40">
        <button
          disabled={isLocked}
          onClick={() =>
            handleOpenBetSheet({
              category: 'SIZE',
              value: 'BIG',
              label: 'Big (5-9)',
              payoutMultiplier: 2,
            })
          }
          className="py-3 px-4 text-center font-black text-sm text-white bg-gradient-to-r from-[#f5a623] to-[#e69512] hover:opacity-95 active:scale-98 transition-all tracking-wide disabled:opacity-50"
        >
          Big
        </button>

        <button
          disabled={isLocked}
          onClick={() =>
            handleOpenBetSheet({
              category: 'SIZE',
              value: 'SMALL',
              label: 'Small (0-4)',
              payoutMultiplier: 2,
            })
          }
          className="py-3 px-4 text-center font-black text-sm text-white bg-gradient-to-r from-[#4a8bf5] to-[#3b7ae6] hover:opacity-95 active:scale-98 transition-all tracking-wide disabled:opacity-50"
        >
          Small
        </button>
      </div>

      {/* ======================================================== */}
      {/* 9. BOTTOM TABS: Game history / Chart / My history */}
      {/* ======================================================== */}
      <div className="grid grid-cols-3 p-1 bg-[#191a20] rounded-2xl border border-slate-800 text-xs font-bold mt-2 gap-1">
        <button
          onClick={() => setBottomTab('history')}
          className={`py-2.5 rounded-xl transition-all text-center ${
            bottomTab === 'history'
              ? 'bg-gradient-to-r from-[#ffd358] to-[#ffb826] text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Game history
        </button>

        <button
          onClick={() => setBottomTab('chart')}
          className={`py-2.5 rounded-xl transition-all text-center ${
            bottomTab === 'chart'
              ? 'bg-gradient-to-r from-[#ffd358] to-[#ffb826] text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Chart
        </button>

        <button
          onClick={() => setBottomTab('myHistory')}
          className={`py-2.5 rounded-xl transition-all text-center relative ${
            bottomTab === 'myHistory'
              ? 'bg-gradient-to-r from-[#ffd358] to-[#ffb826] text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>My history</span>
          {wingoPredictions.length > 0 && (
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                bottomTab === 'myHistory'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {wingoPredictions.length}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 10. TAB CONTENT: GAME HISTORY TABLE (Live API 500 rounds) */}
      {/* ======================================================== */}
      {bottomTab === 'history' && (
        <div className="flex flex-col gap-3 rounded-3xl bg-[#191a20] border border-slate-800 p-3.5 shadow-xl">
          {/* Header & Live Status */}
          <div className="flex flex-col gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-extrabold text-white text-xs sm:text-sm">
                  Live API Rounds ({results.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onRefreshHistory}
                  disabled={isLoadingHistory}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Re-sync 500 rounds from live API"
                >
                  <RotateCcw className={`h-3 w-3 ${isLoadingHistory ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Sync</span>
                </button>
                <button
                  onClick={() => setShowContinuousList(!showContinuousList)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                    showContinuousList
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Toggle continuous scroll to view all past results"
                >
                  {showContinuousList ? 'View Pages' : 'View All 500'}
                </button>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Search Issue */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search period issue (e.g. 10702)..."
                  value={searchIssue}
                  onChange={(e) => {
                    setSearchIssue(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                {searchIssue && (
                  <button
                    onClick={() => setSearchIssue('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Chips: Size & Colour */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
                {/* Size Filter */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mr-0.5">Size:</span>
                  {(['ALL', 'BIG', 'SMALL'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilterSize(s);
                        setHistoryPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                        filterSize === s
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Colour Filter */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mr-0.5">Colour:</span>
                  {(['ALL', 'GREEN', 'RED', 'VIOLET'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFilterColour(c);
                        setHistoryPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                        filterColour === c
                          ? c === 'GREEN'
                            ? 'bg-emerald-600 text-white'
                            : c === 'RED'
                            ? 'bg-rose-600 text-white'
                            : c === 'VIOLET'
                            ? 'bg-purple-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows Per Page (when in paginated mode) */}
              {!showContinuousList && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Showing {paginatedHistory.length} of {filteredHistory.length} results</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-[10px] text-slate-500 mr-1">Per page:</span>
                    {[10, 25, 50, 100].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => {
                          setHistoryPageSize(sz);
                          setHistoryPage(1);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          historyPageSize === sz
                            ? 'bg-slate-700 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 rounded-xl bg-slate-950/80 p-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            <span className="col-span-5 text-left">Period Issue</span>
            <span className="col-span-2 text-center">Number</span>
            <span className="col-span-3 text-center">Big/Small</span>
            <span className="col-span-2 text-right">Color</span>
          </div>

          {/* Rows List */}
          <div
            className={`divide-y divide-slate-800/50 ${
              showContinuousList ? 'max-h-[500px] overflow-y-auto pr-1' : ''
            }`}
          >
            {paginatedHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No rounds match the selected filter.
              </div>
            ) : (
              paginatedHistory.map((row) => (
                <div
                  key={row.period}
                  className="grid grid-cols-12 gap-1 items-center py-2 px-1 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="col-span-5 flex flex-col">
                    <span className="font-mono text-xs font-bold text-white truncate">
                      {row.period}
                    </span>
                    {row.time && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {row.time}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    {render3DBall(row.number, row.rawColour, 'sm')}
                  </div>

                  <div className="col-span-3 flex items-center justify-center">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${
                        row.size === 'BIG'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {row.size}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {row.number === 0 ? (
                      <div className="flex gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm" title="Red" />
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-600 shadow-sm" title="Violet" />
                      </div>
                    ) : row.number === 5 ? (
                      <div className="flex gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" title="Green" />
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-600 shadow-sm" title="Violet" />
                      </div>
                    ) : [2, 4, 6, 8].includes(row.number) ? (
                      <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" title="Red" />
                    ) : (
                      <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" title="Green" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Navigation Controls */}
          {!showContinuousList && (
            <div className="flex flex-col gap-2 border-t border-slate-800 pt-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryPage(1)}
                    disabled={safeHistoryPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
                    title="First Page"
                  >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={safeHistoryPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:text-white text-xs flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                </div>

                <span className="font-mono text-xs text-white">
                  Page <span className="font-bold text-amber-400">{safeHistoryPage}</span> of {totalPages}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeHistoryPage >= totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:text-white text-xs flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setHistoryPage(totalPages)}
                    disabled={safeHistoryPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
                    title="Last Page"
                  >
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Jump to Page Box */}
              <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400">
                <span>Jump to page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const p = parseInt(jumpPageInput, 10);
                      if (p >= 1 && p <= totalPages) {
                        setHistoryPage(p);
                        setJumpPageInput('');
                      }
                    }
                  }}
                  placeholder={String(safeHistoryPage)}
                  className="w-14 py-1 px-2 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    const p = parseInt(jumpPageInput, 10);
                    if (p >= 1 && p <= totalPages) {
                      setHistoryPage(p);
                      setJumpPageInput('');
                    }
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 text-xs"
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. TAB CONTENT: TREND CHART & 500-ROUND STATISTICS */}
      {/* ======================================================== */}
      {bottomTab === 'chart' && (
        <div className="flex flex-col gap-3 rounded-3xl bg-[#191a20] border border-slate-800 p-3.5 shadow-xl">
          {/* Chart Header & Round Limit Selector */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="font-extrabold text-white">0–9 Trend Matrix</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="text-slate-500">Rounds:</span>
              {[25, 50, 100].map((lim) => (
                <button
                  key={lim}
                  onClick={() => setChartRoundLimit(lim)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    chartRoundLimit === lim
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {lim}
                </button>
              ))}
            </div>
          </div>

          {/* 500-Round Statistical Distribution Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Big vs Small Distribution */}
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>Big vs Small</span>
                <span className="text-[10px] text-slate-500">500 Rounds</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs font-black">
                <span className="text-amber-400">Big: {statsSummary.bigCount} ({statsSummary.bigPct}%)</span>
                <span className="text-sky-400">Small: {statsSummary.smallCount} ({statsSummary.smallPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${statsSummary.bigPct}%` }}
                />
                <div
                  className="h-full bg-sky-400 transition-all"
                  style={{ width: `${statsSummary.smallPct}%` }}
                />
              </div>
            </div>

            {/* Colors Breakdown */}
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>Color Ratio</span>
                <span className="text-[10px] text-slate-500">500 Rounds</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                <span className="text-emerald-400">G: {statsSummary.greenPct}%</span>
                <span className="text-rose-400">R: {statsSummary.redPct}%</span>
                <span className="text-purple-400">V: {statsSummary.violetPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${statsSummary.greenPct}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${statsSummary.redPct}%` }}
                />
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${statsSummary.violetPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* 0-9 Highway Matrix Table */}
          <div className="overflow-x-auto rounded-xl bg-slate-950 p-2 border border-slate-800">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                  <th className="py-1 px-1 text-left font-bold">Issue</th>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <th key={n} className="py-1 px-1 font-bold">
                      {n}
                    </th>
                  ))}
                  <th className="py-1 px-1 font-bold">B/S</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {results.slice(0, chartRoundLimit).map((row) => (
                  <tr key={row.period} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-1.5 px-1 text-left font-mono text-[11px] font-bold text-slate-300 whitespace-nowrap">
                      {row.period.slice(-4)}
                    </td>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                      const isHit = row.number === digit;
                      return (
                        <td key={digit} className="py-1 px-0.5">
                          {isHit ? (
                            <div className="mx-auto flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white bg-purple-600 shadow ring-1 ring-purple-400">
                              {digit}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-700">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-1 px-1 font-bold text-[10px]">
                      <span className={row.size === 'BIG' ? 'text-amber-400' : 'text-sky-400'}>
                        {row.size === 'BIG' ? 'B' : 'S'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 12. TAB CONTENT: MY PREDICTIONS HISTORY */}
      {/* ======================================================== */}
      {bottomTab === 'myHistory' && (
        <div className="flex flex-col gap-3 rounded-3xl bg-[#191a20] border border-slate-800 p-3.5 shadow-xl">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="font-extrabold text-white text-sm">My Win Go Predictions</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Total bets: {wingoPredictions.length}
            </span>
          </div>

          {wingoPredictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-slate-400">
              <span className="text-3xl">🎫</span>
              <span className="font-bold text-white text-sm">No predictions yet</span>
              <p className="text-xs text-slate-500 max-w-xs">
                Pick a color, number (0–9), or Big/Small above to place your first Win Go prediction!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 divide-y divide-slate-800/60">
              {wingoPredictions.map((pred) => {
                // Check if this round has resolved in results
                const resolvedRound = results.find((r) => r.period === pred.period);
                const isCurrent = pred.period === currentPeriod;

                let isWon = false;
                let isLost = false;
                let drawnNumber: number | null = null;
                let drawnSize: SizeType | null = null;
                let drawnColour: ColourType | null = null;

                if (resolvedRound) {
                  drawnNumber = resolvedRound.number;
                  drawnSize = resolvedRound.size;
                  drawnColour = resolvedRound.colour;

                  if (pred.category === 'NUMBER') {
                    isWon = drawnNumber === pred.value;
                  } else if (pred.category === 'SIZE') {
                    isWon = drawnSize === pred.value;
                  } else if (pred.category === 'COLOUR') {
                    if (pred.value === 'VIOLET') {
                      isWon = drawnNumber === 0 || drawnNumber === 5 || drawnColour === 'VIOLET';
                    } else if (pred.value === 'RED') {
                      isWon = [2, 4, 6, 8, 0].includes(drawnNumber);
                    } else if (pred.value === 'GREEN') {
                      isWon = [1, 3, 5, 7, 9].includes(drawnNumber);
                    }
                  }
                  isLost = !isWon;
                }

                const payout = isWon ? Math.round(pred.stake * pred.multiplier) : 0;
                const net = isWon ? payout - pred.stake : -pred.stake;

                return (
                  <div
                    key={pred.id}
                    className="flex flex-col gap-1.5 py-2.5 px-1 hover:bg-slate-900/40 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white">
                          #{pred.period.slice(-5)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({pred.period})
                        </span>
                      </div>

                      {/* Status Tag */}
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          ⏳ Drawing soon
                        </span>
                      ) : isWon ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ Won +₹{payout.toLocaleString('en-IN')}
                        </span>
                      ) : isLost ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          ✗ Lost -₹{pred.stake.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-amber-300">
                          {pred.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({pred.multiplier}×)
                        </span>
                        <span className="text-[11px] text-slate-500">·</span>
                        <span className="font-mono text-slate-300">
                          Stake: ₹{pred.stake.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {resolvedRound && drawnNumber !== null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Drawn:</span>
                          {render3DBall(drawnNumber, resolvedRound.rawColour, 'sm')}
                          <span className="text-[10px] font-bold text-slate-300 uppercase">
                            {drawnSize}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* BET SELECTION POPUP / BOTTOM SHEET */}
      {/* ======================================================== */}
      {pendingBet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#1e2029] border border-slate-700/60 p-5 shadow-2xl flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  WinGo 1 Min · Confirm Bet
                </span>
                <span className="text-base font-black text-white">
                  Select: {pendingBet.label} ({pendingBet.payoutMultiplier}×)
                </span>
              </div>
              <button
                onClick={() => setPendingBet(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stake Amount Selectors */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-300">Base Stake</span>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetBaseStake(amt)}
                    className={`py-2 rounded-xl font-mono text-xs font-black transition-all ${
                      betBaseStake === amt
                        ? 'bg-gradient-to-r from-[#ffd358] to-[#ffb826] text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Selectors */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-300">Multiplier</span>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 5, 10, 20, 50, 100].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setBetMultiplier(mult)}
                    className={`py-1.5 rounded-xl font-mono text-xs font-black transition-all ${
                      betMultiplier === mult
                        ? 'bg-gradient-to-r from-[#20c068] to-[#12a050] text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    X{mult}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBetQuantity((q) => Math.max(1, q - 1))}
                  className="h-7 w-7 rounded-lg bg-slate-800 text-white font-black text-sm flex items-center justify-center active:scale-95"
                >
                  -
                </button>
                <span className="font-mono text-sm font-black text-white px-1">
                  {betQuantity}
                </span>
                <button
                  onClick={() => setBetQuantity((q) => q + 1)}
                  className="h-7 w-7 rounded-lg bg-slate-800 text-white font-black text-sm flex items-center justify-center active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Stake and Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400">Total Amount</span>
                <span className="font-mono text-lg font-black text-amber-400">
                  ₹{(betBaseStake * betMultiplier * betQuantity).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPendingBet(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBet}
                  className="py-2.5 px-5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#ffd358] to-[#ffb826] shadow-lg hover:opacity-95 active:scale-95 transition-all"
                >
                  Confirm Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* HOW TO PLAY MODAL */}
      {/* ======================================================== */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2029] border border-slate-700 p-5 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span className="font-extrabold text-white text-sm">WinGo Rules & Multipliers</span>
              </div>
              <button onClick={() => setShowHowToPlay(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-slate-300 text-[11px] leading-relaxed">
              <p>
                <strong>1. 1-Minute Round:</strong> Each round lasts exactly 60 seconds. Betting closes in the final 5 seconds.
              </p>
              <p>
                <strong>2. Green Payout (2×):</strong> If numbers 1, 3, 7, 9 appear. If 5 appears, pays 1.5×.
              </p>
              <p>
                <strong>3. Red Payout (2×):</strong> If numbers 2, 4, 6, 8 appear. If 0 appears, pays 1.5×.
              </p>
              <p>
                <strong>4. Violet Payout (4.5×):</strong> If number 0 or 5 appears.
              </p>
              <p>
                <strong>5. Exact Number Payout (9×):</strong> Bet on any single number 0–9.
              </p>
              <p>
                <strong>6. Big / Small (2×):</strong> Big covers 5–9; Small covers 0–4.
              </p>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 mt-1"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEPOSIT DEMO CREDITS MODAL */}
      {/* ======================================================== */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2029] border border-slate-700 p-5 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-base">👛</span>
                <span className="font-extrabold text-white text-sm">Deposit Virtual Demo Credits</span>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Add free demo credits to your virtual wallet to continue testing WinGo strategies.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    onAddCredits(amt);
                    setDepositSuccessMsg(`Added ₹${amt.toLocaleString('en-IN')} demo credits!`);
                    setTimeout(() => {
                      setDepositSuccessMsg('');
                      setShowDepositModal(false);
                    }, 1200);
                  }}
                  className="py-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-black text-center hover:bg-emerald-950/40 transition-colors"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            {depositSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold">
                {depositSuccessMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WITHDRAW DEMO MODAL */}
      {/* ======================================================== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2029] border border-slate-700 p-5 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-base">💳</span>
                <span className="font-extrabold text-white text-sm">Virtual Wallet Withdrawal</span>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">Available Balance</span>
              <span className="font-mono text-lg font-black text-emerald-400">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              This application is an educational and testing simulation using virtual credits. Virtual credits cannot be converted into real currency.
            </p>

            <button
              onClick={() => setShowWithdrawModal(false)}
              className="w-full py-2.5 rounded-xl font-bold bg-slate-800 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
