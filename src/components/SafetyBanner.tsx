import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-amber-500/10 p-3 text-xs text-amber-200/90 shadow-sm">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-300">
            DEMO / SIMULATION — NO REAL MONEY
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            This platform uses virtual demo credits only (VC). There are no deposits, no withdrawals, and no cash prizes. All results are deterministic simulations for testing and educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="mt-8 mb-20 px-4 text-center">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>SIMULATION NOTICE</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          DEMO ONLY — Virtual credits have no monetary value. This simulation does not involve real-money betting, deposits, withdrawals, or cash prizes. Predictions carry zero guarantee.
        </p>
      </div>
    </footer>
  );
};
