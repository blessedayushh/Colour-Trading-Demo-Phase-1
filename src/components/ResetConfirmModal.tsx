import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { INITIAL_BALANCE } from '../utils/storage';
import { formatVC } from '../utils/gameLogic';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl flex flex-col gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-lg font-black text-white">Reset Demo?</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            This will erase virtual balance, predictions, results and statistics.
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300">
          Reset to: <strong className="font-mono text-emerald-400 font-bold">{formatVC(INITIAL_BALANCE)}</strong>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-750 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>RESET DEMO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
