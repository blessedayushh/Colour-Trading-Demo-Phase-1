import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/game';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-16 right-3 left-3 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
          info: <Info className="h-4 w-4 text-sky-400 shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-500/30 bg-slate-900/95',
          error: 'border-rose-500/30 bg-slate-900/95',
          warning: 'border-amber-500/30 bg-slate-900/95',
          info: 'border-sky-500/30 bg-slate-900/95',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-2.5 rounded-2xl border p-3 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 ${borderColors[toast.type]}`}
          >
            <div className="flex items-start gap-2.5">
              {icons[toast.type]}
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white leading-tight">
                  {toast.title}
                </div>
                {toast.message && (
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {toast.message}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-white p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
