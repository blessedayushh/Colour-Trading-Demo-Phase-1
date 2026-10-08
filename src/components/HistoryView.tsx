import React, { useState } from 'react';
import { History, ListFilter, Sparkles, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { RoundResult, Prediction, Settlement } from '../types/game';
import { formatVC, getColourTailwind } from '../utils/gameLogic';

interface HistoryViewProps {
  results: RoundResult[];
  predictions: Prediction[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ results, predictions }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'predictions'>('results');
  const [predictionFilter, setPredictionFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [resultsPage, setResultsPage] = useState<number>(1);
  const resultsPageSize = 20;

  // Flatten all settlements from result history to show complete prediction outcomes
  const allSettlements: Settlement[] = [];
  results.forEach((r) => {
    if (r.settlements && r.settlements.length > 0) {
      allSettlements.push(...r.settlements);
    }
  });

  const filteredSettlements = allSettlements.filter((s) => {
    if (predictionFilter === 'won') return s.won;
    if (predictionFilter === 'lost') return !s.won;
    return true;
  });

  const totalResultPages = Math.max(1, Math.ceil(results.length / resultsPageSize));
  const safeResultsPage = Math.min(resultsPage, totalResultPages);
  const paginatedResults = results.slice(
    (safeResultsPage - 1) * resultsPageSize,
    safeResultsPage * resultsPageSize
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top Segmented Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <History className="h-4 w-4 text-emerald-400" />
          <span>SIMULATION ARCHIVE</span>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'results'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Round Results
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'predictions'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Predictions ({allSettlements.length})
          </button>
        </div>
      </div>

      {/* 1. Round Results Table/Cards */}
      {activeTab === 'results' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
          <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Latest Simulated Rounds ({results.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Transparent log
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[520px] overflow-y-auto">
            {paginatedResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No simulated round history yet.
              </div>
            ) : (
              paginatedResults.map((round) => {
                const colourStyle = getColourTailwind(round.colour);
                const timeStr = new Date(round.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={round.period}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-850/40 transition-colors"
                  >
                    {/* Period and Time */}
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {round.period}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{round.time || timeStr}</span>
                      </div>
                    </div>

                    {/* Result details */}
                    <div className="flex items-center gap-2">
                      {/* Number Ball */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-sm font-black text-white shadow-sm ${colourStyle.bg}`}
                      >
                        {round.number}
                      </div>

                      {/* Colour */}
                      <span
                        className={`hidden sm:inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${colourStyle.badge}`}
                      >
                        {round.colour}
                      </span>

                      {/* Size */}
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                        {round.size}
                      </span>

                      {/* Preset / Random Badge */}
                      {round.isPreset ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                          <Sparkles className="h-2.5 w-2.5" />
                          PRESET DEMO
                        </span>
                      ) : (
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 border border-slate-750">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Results Pagination */}
          {results.length > resultsPageSize && (
            <div className="border-t border-slate-800 px-4 py-2.5 flex items-center justify-between bg-slate-900/80 text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Showing {((safeResultsPage - 1) * resultsPageSize) + 1}–{Math.min(safeResultsPage * resultsPageSize, results.length)} of {results.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setResultsPage((p) => Math.max(1, p - 1))}
                  disabled={safeResultsPage <= 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                >
                  Prev
                </button>
                <span className="font-mono text-xs px-2 text-purple-300 font-bold">
                  {safeResultsPage} / {totalResultPages}
                </span>
                <button
                  onClick={() => setResultsPage((p) => Math.min(totalResultPages, p + 1))}
                  disabled={safeResultsPage >= totalResultPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. My Predictions History */}
      {activeTab === 'predictions' && (
        <div className="flex flex-col gap-3">
          {/* Subfilter */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ListFilter className="h-3.5 w-3.5" />
              <span>Filter Predictions:</span>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setPredictionFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  predictionFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPredictionFilter('won')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  predictionFilter === 'won'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Won
              </button>
              <button
                onClick={() => setPredictionFilter('lost')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  predictionFilter === 'lost'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lost
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
            <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
              {filteredSettlements.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No prediction settlements match this filter. Place predictions on the Game tab!
                </div>
              ) : (
                filteredSettlements.map((s, idx) => (
                  <div
                    key={`${s.predictionId}-${idx}`}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-850/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">
                          {s.label}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                          #{s.period.slice(-6)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Stake: <span className="font-mono text-slate-300">{formatVC(s.stake)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold">
                        {s.won ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">
                              +{formatVC(s.payout)}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-rose-400" />
                            <span className="text-rose-400">
                              -{formatVC(s.stake)}
                            </span>
                          </>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          s.won ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {s.won ? 'SIMULATED WIN' : 'SIMULATED LOSS'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
