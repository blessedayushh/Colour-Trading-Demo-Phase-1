import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Gift, Award, RotateCcw, KeyRound } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { playSound } from '../utils/audio';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (amount: number) => void;
  soundEnabled: boolean;
  presetPrize: number | null;
  onConsumePreset: () => void;
  onOpenAdmin: () => void;
}

const SEGMENTS = [
  { label: '₹50 VC', amount: 50, color: '#f59e0b' },
  { label: '₹500 VC', amount: 500, color: '#ef4444' },
  { label: '₹100 VC', amount: 100, color: '#10b981' },
  { label: '₹1,000 VC', amount: 1000, color: '#a855f7' },
  { label: '₹200 VC', amount: 200, color: '#0ea5e9' },
  { label: '₹2,000 VC', amount: 2000, color: '#eab308' },
  { label: '₹150 VC', amount: 150, color: '#ec4899' },
  { label: '₹300 VC', amount: 300, color: '#6366f1' },
];

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  onReward,
  soundEnabled,
  presetPrize,
  onConsumePreset,
  onOpenAdmin,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick target segment (either from admin preset or random)
    let targetIdx: number;
    if (presetPrize) {
      const foundIdx = SEGMENTS.findIndex((s) => s.amount === presetPrize);
      targetIdx = foundIdx !== -1 ? foundIdx : 1;
      onConsumePreset();
    } else {
      targetIdx = Math.floor(Math.random() * SEGMENTS.length);
    }

    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final rotation (5 full revolutions + segment offset)
    const extraTurns = 5 * 360;
    // Needle is at top (270 deg or 0 deg depending on canvas orientation)
    const targetAngle = extraTurns + (360 - targetIdx * segmentAngle - segmentAngle / 2);

    setRotation((prev) => prev + targetAngle);

    // Play spinning ticks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playSound.wheelTick(soundEnabled);
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      const prize = SEGMENTS[targetIdx];
      setWonPrize(prize.amount);
      onReward(prize.amount);
      setIsSpinning(false);
      playSound.win(soundEnabled);
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-5 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest">
            <Gift className="h-4 w-4" />
            <span>GET UP TO ₹2,000 VC</span>
          </div>
          <h2 className="text-lg font-black text-white">
            Daily Demo Lucky Wheel
          </h2>
          <span className="text-[11px] text-slate-400">
            Spin to collect free simulation credits
          </span>
        </div>

        {/* Active Preset Notification Banner */}
        {presetPrize && (
          <div className="w-full mt-2 flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-2 px-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-bold text-amber-300">
                Preset landing on: <strong>₹{presetPrize} VC</strong>
              </span>
            </div>
          </div>
        )}

        {/* Interactive Spinning Wheel */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Top Pointer Needle */}
          <div className="absolute -top-3 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-md" />
          </div>

          {/* Wheel Circle SVG */}
          <div
            className="h-64 w-64 rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-transform duration-[3800ms] ease-out relative overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {SEGMENTS.map((seg, i) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = (i * angle * Math.PI) / 180;
                const endAngle = (((i + 1) * angle) * Math.PI) / 180;
                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);

                return (
                  <path
                    key={i}
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    opacity="0.9"
                    stroke="#1e293b"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>

            {/* Labels on wheel segments */}
            {SEGMENTS.map((seg, i) => {
              const angle = (360 / SEGMENTS.length) * i + 360 / SEGMENTS.length / 2;
              return (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span
                    className="font-mono text-[11px] font-black text-slate-950 tracking-tight"
                    style={{ transform: 'translateY(-80px)' }}
                  >
                    {seg.label.replace(' VC', '')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center "GO" Button */}
          <button
            disabled={isSpinning}
            onClick={handleSpin}
            className={`absolute z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 font-black text-slate-950 shadow-2xl transition-transform active:scale-95 ${
              isSpinning ? 'cursor-not-allowed opacity-90' : 'hover:scale-105'
            }`}
          >
            <span className="font-extrabold text-base tracking-wider drop-shadow">
              {isSpinning ? '...' : 'GO'}
            </span>
          </button>
        </div>

        {/* Won Prize Celebration */}
        {wonPrize !== null && (
          <div className="w-full rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-3 mb-2 animate-in zoom-in-75">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              REWARD ADDED!
            </span>
            <span className="font-mono text-xl font-black text-emerald-400">
              +{formatVC(wonPrize)}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          disabled={isSpinning}
          onClick={handleSpin}
          className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all ${
            isSpinning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-[0.98]'
          }`}
        >
          {isSpinning ? 'SPINNING WHEEL...' : 'SPIN FREE DEMO WHEEL'}
        </button>

        <p className="mt-2 text-[10px] text-slate-500">
          Virtual simulation credits only. Zero monetary value.
        </p>
      </div>
    </div>
  );
};
