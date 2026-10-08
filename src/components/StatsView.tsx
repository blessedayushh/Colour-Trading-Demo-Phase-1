import React, { useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Wallet, Percent, CircleDot } from 'lucide-react';
import { UserStats, BalancePoint } from '../types/game';
import { formatVC } from '../utils/gameLogic';
import { INITIAL_BALANCE } from '../utils/storage';

interface StatsViewProps {
  stats: UserStats;
  balance: number;
  balanceHistory: BalancePoint[];
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  balance,
  balanceHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const winRate =
    stats.totalPredictions > 0
      ? ((stats.wins / stats.totalPredictions) * 100).toFixed(1)
      : '0.0';

  const isProfitable = stats.netProfit >= 0;

  // Render high-DPI custom Canvas Chart for Profit/Loss & Balance Trend
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Prepare data
    // Ensure at least 2 points
    const points = balanceHistory.length >= 2
      ? balanceHistory
      : [
          { period: 'Start', balance: INITIAL_BALANCE, timestamp: Date.now() - 3600000, delta: 0 },
          { period: 'Now', balance, timestamp: Date.now(), delta: balance - INITIAL_BALANCE },
        ];

    const balances = points.map((p) => p.balance);
    const minVal = Math.min(...balances, INITIAL_BALANCE * 0.8);
    const maxVal = Math.max(...balances, INITIAL_BALANCE * 1.2);
    const range = maxVal - minVal || 1;

    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 30;

    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    // Draw grid horizontal lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const numTicks = 4;
    for (let i = 0; i <= numTicks; i++) {
      const y = padTop + (plotHeight / numTicks) * i;
      const val = maxVal - (range / numTicks) * i;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`₹${Math.round(val).toLocaleString()}`, padLeft - 6, y);
    }

    ctx.setLineDash([]); // Reset dash

    // Initial baseline line (₹10,000)
    const baselineY = padTop + plotHeight - ((INITIAL_BALANCE - minVal) / range) * plotHeight;
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, baselineY);
    ctx.lineTo(width - padRight, baselineY);
    ctx.stroke();

    // Compute coordinate points
    const coords = points.map((pt, idx) => {
      const x = padLeft + (idx / (points.length - 1)) * plotWidth;
      const y = padTop + plotHeight - ((pt.balance - minVal) / range) * plotHeight;
      return { x, y, pt };
    });

    if (coords.length > 1) {
      // Create Gradient under curve
      const gradient = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
      if (balance >= INITIAL_BALANCE) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      } else {
        gradient.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
        gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
      }

      // Draw filled area
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        // Smooth curve
        const prev = coords[i - 1];
        const curr = coords[i];
        const midX = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(midX, prev.y, midX, curr.y, curr.x, curr.y);
      }
      ctx.lineTo(coords[coords.length - 1].x, padTop + plotHeight);
      ctx.lineTo(coords[0].x, padTop + plotHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Main Stroke
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const midX = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(midX, prev.y, midX, curr.y, curr.x, curr.y);
      }
      ctx.strokeStyle = balance >= INITIAL_BALANCE ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw Points
      coords.forEach((c, idx) => {
        if (idx === coords.length - 1 || idx % 4 === 0) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = balance >= INITIAL_BALANCE ? '#10b981' : '#f43f5e';
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  }, [balance, balanceHistory]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          <span>SIMULATION ANALYTICS & STATS</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Virtual Demo Performance
        </span>
      </div>

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Balance</span>
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="font-mono text-base sm:text-lg font-black text-white tabular-nums">
            {formatVC(balance)}
          </div>
          <span className="text-[10px] text-slate-500">Virtual Credits</span>
        </div>

        {/* Win Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Win Rate</span>
            <Percent className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="font-mono text-base sm:text-lg font-black text-purple-400 tabular-nums">
            {winRate}%
          </div>
          <span className="text-[10px] text-slate-500">
            {stats.wins}W · {stats.losses}L
          </span>
        </div>

        {/* Predictions Count */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Bets</span>
            <Target className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="font-mono text-base sm:text-lg font-black text-white tabular-nums">
            {stats.totalPredictions}
          </div>
          <span className="text-[10px] text-slate-500">{stats.totalRounds} simulated rounds</span>
        </div>

        {/* Net Virtual P/L */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Net P/L</span>
            {isProfitable ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            )}
          </div>
          <div
            className={`font-mono text-base sm:text-lg font-black tabular-nums ${
              isProfitable ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatVC(stats.netProfit)}
          </div>
          <span className="text-[10px] text-slate-500">From ₹10,000 base</span>
        </div>
      </div>

      {/* Canvas Trend Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Virtual Demo Statistics
            </h3>
            <p className="text-[11px] text-slate-400">
              Virtual balance & simulation performance trajectory
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Trend
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Base (₹10k)
            </span>
          </div>
        </div>

        {/* HTML5 Canvas container */}
        <div className="relative w-full h-48 sm:h-56 mt-2">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* Detailed Volume Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
            <Award className="h-4 w-4 text-emerald-400" />
            <span>FINANCIAL SUMMARY (VIRTUAL CREDITS)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Virtual Stake Placed:</span>
              <span className="font-mono font-bold text-white">
                {formatVC(stats.totalStake)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Virtual Payout Returned:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatVC(stats.totalPayout)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800">
              <span>Virtual Profit/Loss:</span>
              <span
                className={`font-mono font-bold ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatVC(stats.netProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <CircleDot className="h-4 w-4 text-purple-400" />
              <span>TRANSPARENCY ASSURANCE</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Random rounds use an unbiased pseudo-random generator across outcomes 0–9. Payouts follow standard fixed multipliers (9× for numbers, 2× for colours and sizes). No algorithm adjusts odds based on previous wins.
            </p>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            Demo RNG: 0-9 uniform distribution
          </div>
        </div>
      </div>
    </div>
  );
};
