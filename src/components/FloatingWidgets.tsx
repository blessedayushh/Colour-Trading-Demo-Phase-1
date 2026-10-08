import React, { useState } from 'react';
import { Send, MessageCircle, X, HelpCircle, ShieldCheck } from 'lucide-react';

interface FloatingWidgetsProps {
  onOpenWheel: () => void;
}

export const FloatingWidgets: React.FC<FloatingWidgetsProps> = ({ onOpenWheel }) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);

  return (
    <>
      {/* Floating Buttons Stack on bottom right */}
      <div className="fixed right-3 bottom-20 z-40 flex flex-col items-center gap-2.5">
        {/* Floating Wheel Spinner Widget */}
        <button
          onClick={onOpenWheel}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/30 hover:scale-110 active:scale-95 transition-transform"
          title="Daily Lucky Wheel"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-base">
            🎡
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
        </button>

        {/* Floating Telegram Demo Channel */}
        <button
          onClick={() => setShowTelegramNotice(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:scale-110 active:scale-95 transition-transform"
          title="Demo Channel"
        >
          <Send className="h-5 w-5 ml-[-1px] mt-[1px]" />
        </button>

        {/* Floating Live Support */}
        <button
          onClick={() => setShowSupportModal(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/40 hover:scale-110 active:scale-95 transition-transform"
          title="Demo Support"
        >
          <span className="text-2xl">😃</span>
        </button>
      </div>

      {/* Demo Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">😃</span>
                <span className="font-extrabold text-sm text-white">24/7 Demo Support Guide</span>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>Welcome to <strong>Tashan Win / ColourWin Demo</strong>!</p>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 space-y-1">
                <p className="font-bold text-amber-300">How to Play:</p>
                <p>• Select any game from the Lobby (Aviator, Boom Mines, Cricket, Fortune Gems, Win Go, Chicken Road).</p>
                <p>• All bets use 100% Virtual Credits (VC).</p>
                <p>• No real money, deposits, or withdrawals exist.</p>
              </div>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Got it, continue playing
            </button>
          </div>
        </div>
      )}

      {/* Telegram Demo Notice */}
      {showTelegramNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-sky-500/30 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-white text-base">Simulation Demo Channel</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This is a virtual money simulation platform. External links and real-money Telegram betting channels are disabled in compliance with safety standards.
            </p>
            <button
              onClick={() => setShowTelegramNotice(false)}
              className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
