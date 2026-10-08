import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  BarChart2,
  Table,
  CheckCircle2,
  Radio,
  Clock,
  Filter,
} from 'lucide-react';
import { RoundResult } from '../types/game';

interface WingoHistorySectionProps {
  results: RoundResult[];
  isLoading?: boolean;
  lastSyncedAt?: number | null;
  onRefresh?: () => void;
}

export const WingoHistorySection: React.FC<WingoHistorySectionProps> = ({
  results,
  isLoading = false,
  lastSyncedAt,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'trend' | 'stats'>('record');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [colorFilter, setColorFilter] = useState<'ALL' | 'GREEN' | 'RED' | 'VIOLET'>('ALL');
  const [sizeFilter, setSizeFilter] = useState<'ALL' | 'BIG' | 'SMALL'>('ALL');

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (colorFilter !== 'ALL') {
        const isViolet = r.number === 0 || r.number === 5 || r.colour === 'VIOLET' || (r.rawColour && r.rawColour.includes('violet'));
        const isRed = r.colour === 'RED' || (r.rawColour && r.rawColour.includes('red'));
        const isGreen = r.colour === 'GREEN' || (r.rawColour && r.rawColour.includes('green'));

        if (colorFilter === 'VIOLET' && !isViolet) return false;
        if (colorFilter === 'RED' && !isRed) return false;
        if (colorFilter === 'GREEN' && !isGreen) return false;
      }
      if (sizeFilter !== 'ALL' && r.size !== sizeFilter) {
        return false;
      }
      return true;
    });
  }, [results, colorFilter, sizeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Sliced page data
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, safeCurrentPage, pageSize]);

  // Comprehensive statistics over the entire loaded dataset
  const stats = useMemo(() => {
    const total = results.length || 1;
    let bigCount = 0;
    let smallCount = 0;
    let redCount = 0;
    let greenCount = 0;
    let violetCount = 0;
    const numCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    results.forEach((r) => {
      if (r.size === 'BIG') bigCount++;
      else smallCount++;

      if (r.number === 0 || r.number === 5 || (r.rawColour && r.rawColour.includes('violet'))) {
        violetCount++;
      }
      if (r.colour === 'RED' || (r.rawColour && r.rawColour.includes('red'))) {
        redCount++;
      }
      if (r.colour === 'GREEN' || (r.rawColour && r.rawColour.includes('green'))) {
        greenCount++;
      }

      if (r.number >= 0 && r.number <= 9) {
        numCounts[r.number] = (numCounts[r.number] || 0) + 1;
      }
    });

    return {
      total: results.length,
      bigCount,
      bigPct: Math.round((bigCount / total) * 100),
      smallCount,
      smallPct: Math.round((smallCount / total) * 100),
      redCount,
      redPct: Math.round((redCount / total) * 100),
      greenCount,
      greenPct: Math.round((greenCount / total) * 100),
      violetCount,
      violetPct: Math.round((violetCount / total) * 100),
      numCounts,
    };
  }, [results]);

  // Helper for Ball Render with gradient support for 0 and 5
  const renderNumberBall = (num: number, rawColour?: string) => {
    const isZero = num === 0 || rawColour === 'red,violet';
    const isFive = num === 5 || rawColour === 'green,violet';

    if (isZero) {
      return (
        <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full font-mono text-xs sm:text-sm font-black text-white shadow-md overflow-hidden bg-gradient-to-r from-rose-500 via-purple-600 to-purple-700 border border-purple-400/40">
          <span className="relative z-10 drop-shadow">{num}</span>
          <div className="absolute inset-0 bg-rose-500/80 [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]" />
        </div>
      );
    }

    if (isFive) {
      return (
        <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full font-mono text-xs sm:text-sm font-black text-white shadow-md overflow-hidden bg-gradient-to-r from-emerald-500 via-purple-600 to-purple-700 border border-purple-400/40">
          <span className="relative z-10 drop-shadow">{num}</span>
          <div className="absolute inset-0 bg-emerald-500/80 [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]" />
        </div>
      );
    }

    const isRed = [2, 4, 6, 8].includes(num);
    const bgClass = isRed
      ? 'bg-gradient-to-b from-rose-500 to-red-600 border-rose-400/40 shadow-rose-500/20'
      : 'bg-gradient-to-b from-emerald-500 to-green-600 border-emerald-400/40 shadow-emerald-500/20';

    return (
      <div
        className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full font-mono text-xs sm:text-sm font-black text-white shadow-md border ${bgClass}`}
      >
        <span className="drop-shadow">{num}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-xl">
      {/* Live Sync Status Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Live 1M Game Record
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE API
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              {results.length} official rounds synced from live server
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95 ${
                isLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Refresh live results from API"
            >
              <RotateCcw className={`h-3 w-3 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="text-[11px]">{isLoading ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('record')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === 'record'
              ? 'bg-purple-600 text-white shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Table className="h-3.5 w-3.5" />
          <span>Game Record</span>
        </button>

        <button
          onClick={() => setActiveTab('trend')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === 'trend'
              ? 'bg-purple-600 text-white shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Trend Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>500-Round Stats</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: GAME RECORD TABLE */}
      {/* ======================================================== */}
      {activeTab === 'record' && (
        <div className="flex flex-col gap-2.5">
          {/* Quick Color & Size Filters */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
              <button
                onClick={() => setColorFilter('ALL')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'ALL'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setColorFilter('GREEN')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'GREEN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
                }`}
              >
                Green
              </button>
              <button
                onClick={() => setColorFilter('RED')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'RED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30'
                }`}
              >
                Red
              </button>
              <button
                onClick={() => setColorFilter('VIOLET')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'VIOLET'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 text-purple-400 hover:bg-purple-950/40 border border-purple-500/30'
                }`}
              >
                Violet
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSizeFilter(sizeFilter === 'BIG' ? 'ALL' : 'BIG')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  sizeFilter === 'BIG'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-amber-300 hover:bg-amber-950/40 border border-amber-500/30'
                }`}
              >
                Big
              </button>
              <button
                onClick={() => setSizeFilter(sizeFilter === 'SMALL' ? 'ALL' : 'SMALL')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  sizeFilter === 'SMALL'
                    ? 'bg-sky-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-sky-300 hover:bg-sky-950/40 border border-sky-500/30'
                }`}
              >
                Small
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 rounded-xl bg-slate-950 p-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            <span className="col-span-4 sm:col-span-5 text-left">Period Issue</span>
            <span className="col-span-2 text-center">Number</span>
            <span className="col-span-3 text-center">Big/Small</span>
            <span className="col-span-3 sm:col-span-2 text-right">Color</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-0.5">
            {paginatedData.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching results found for this filter.
              </div>
            ) : (
              paginatedData.map((item, idx) => {
                const isZero = item.number === 0 || item.rawColour === 'red,violet';
                const isFive = item.number === 5 || item.rawColour === 'green,violet';
                const isRed = [2, 4, 6, 8].includes(item.number);
                const isGreen = [1, 3, 7, 9].includes(item.number);

                return (
                  <div
                    key={item.period || idx}
                    className="grid grid-cols-12 gap-1 items-center rounded-2xl bg-slate-950/70 border border-slate-800/80 px-2.5 py-2 hover:border-slate-700 transition-colors"
                  >
                    {/* Period Number and Time */}
                    <div className="col-span-4 sm:col-span-5 flex flex-col justify-center">
                      <span className="font-mono text-xs font-bold text-white tracking-wide truncate">
                        {item.period}
                      </span>
                      {item.time && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="h-2.5 w-2.5 text-slate-500" />
                          <span>{item.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Number Ball */}
                    <div className="col-span-2 flex items-center justify-center">
                      {renderNumberBall(item.number, item.rawColour)}
                    </div>

                    {/* Big / Small Badge */}
                    <div className="col-span-3 flex items-center justify-center">
                      <span
                        className={`rounded-xl px-2 py-1 text-[11px] font-black uppercase tracking-wide border shadow-sm ${
                          item.size === 'BIG'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}
                      >
                        {item.size}
                      </span>
                    </div>

                    {/* Colour Badges */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
                      {isZero ? (
                        <div className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded-full bg-rose-500 border border-rose-400" title="Red" />
                          <span className="h-3 w-3 rounded-full bg-purple-600 border border-purple-400" title="Violet" />
                        </div>
                      ) : isFive ? (
                        <div className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-400" title="Green" />
                          <span className="h-3 w-3 rounded-full bg-purple-600 border border-purple-400" title="Violet" />
                        </div>
                      ) : isRed ? (
                        <span className="h-3 w-3 rounded-full bg-rose-500 border border-rose-400 shadow-sm shadow-rose-500/50" />
                      ) : (
                        <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-400 shadow-sm shadow-emerald-500/50" />
                      )}

                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 hidden sm:inline">
                        {item.colour}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Per page:</span>
              <div className="flex items-center gap-1">
                {[10, 20, 50].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-mono font-bold transition-all ${
                      pageSize === size
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="font-mono text-slate-500">
                ({filteredResults.length} total)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-white">
                <span className="text-purple-400">{safeCurrentPage}</span> / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Last Page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: TREND CHART MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'trend' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Winning Number Matrix (Last 25 Rounds)</span>
            <span className="font-mono text-[10px] text-purple-400">0–9 Trend Road</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-2.5">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                  <th className="py-1 px-1.5 text-left font-bold">Issue</th>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <th key={n} className="py-1 px-1 font-bold w-6">
                      {n}
                    </th>
                  ))}
                  <th className="py-1 px-1.5 font-bold">B/S</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {results.slice(0, 25).map((row) => (
                  <tr key={row.period} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-1.5 px-1.5 text-left font-mono text-[11px] font-bold text-slate-300 whitespace-nowrap">
                      {row.period.slice(-4)}
                    </td>

                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                      const isHit = row.number === digit;
                      return (
                        <td key={digit} className="py-1 px-0.5">
                          {isHit ? (
                            <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white shadow-sm ring-1 ring-white/30 bg-purple-600">
                              {digit}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-700 font-mono">·</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-1 px-1.5 font-bold text-[10px]">
                      <span
                        className={
                          row.size === 'BIG' ? 'text-amber-400' : 'text-sky-400'
                        }
                      >
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
      {/* VIEW 3: 500-ROUND STATISTICS */}
      {/* ======================================================== */}
      {activeTab === 'stats' && (
        <div className="flex flex-col gap-4">
          {/* Big vs Small Comparison */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Big / Small Ratio ({stats.total} Rounds)
            </span>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400">
                Big: {stats.bigCount} ({stats.bigPct}%)
              </span>
              <span className="text-sky-400">
                Small: {stats.smallCount} ({stats.smallPct}%)
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${stats.bigPct}%` }}
                className="bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
              />
              <div
                style={{ width: `${stats.smallPct}%` }}
                className="bg-gradient-to-r from-sky-500 to-sky-600 transition-all duration-500"
              />
            </div>
          </div>

          {/* Colour Frequencies */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Colour Frequency ({stats.total} Rounds)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <span className="text-[10px] text-emerald-300 uppercase block font-bold">Green</span>
                <span className="text-lg font-black text-emerald-400">{stats.greenCount}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{stats.greenPct}%</span>
              </div>
              <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10">
                <span className="text-[10px] text-rose-300 uppercase block font-bold">Red</span>
                <span className="text-lg font-black text-rose-400">{stats.redCount}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{stats.redPct}%</span>
              </div>
              <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <span className="text-[10px] text-purple-300 uppercase block font-bold">Violet (0,5)</span>
                <span className="text-lg font-black text-purple-400">{stats.violetCount}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{stats.violetPct}%</span>
              </div>
            </div>
          </div>

          {/* Numbers 0–9 Bar Frequency */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Number Occurrence (0–9)
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const count = stats.numCounts[num] || 0;
                const isMax = Math.max(...Object.values(stats.numCounts)) === count;
                return (
                  <div
                    key={num}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isMax
                        ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <span className="font-mono font-bold text-xs text-white block">#{num}</span>
                    <span className="font-mono text-sm font-black text-purple-300 block my-0.5">
                      {count}
                    </span>
                    <span className="text-[9px] text-slate-500 block">times</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
