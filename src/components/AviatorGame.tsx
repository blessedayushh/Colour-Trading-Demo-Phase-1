import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, ShieldAlert, Sparkles, History, Volume2, VolumeX, RotateCcw, KeyRound } from 'lucide-react';
import { formatVC } from '../utils/gameLogic';
import { playSound } from '../utils/audio';

export type CrashAnimationType = 'flyaway' | 'spinout' | 'nosedive' | 'explosion';

const CRASH_LABELS: Record<CrashAnimationType, { title: string; subtitle: string; icon: string }> = {
  flyaway: { title: 'FLEW AWAY!', subtitle: 'Warp speed escape', icon: '⚡' },
  spinout: { title: 'FATAL SPINOUT!', subtitle: 'Loss of aerodynamic lift', icon: '🌪️' },
  nosedive: { title: 'NOSE DIVED!', subtitle: 'Engine stall plunge', icon: '🔥' },
  explosion: { title: 'MID-AIR EXPLOSION!', subtitle: 'Combustion detonation', icon: '💥' },
};

/**
 * Aerodynamic flight curve coordinate calculator.
 * Returns the position and pitch angle of the aircraft based on current multiplier.
 */
function calculateFlightCoords(multiplier: number, width: number, height: number) {
  const safeMult = (typeof multiplier === 'number' && Number.isFinite(multiplier) && multiplier >= 1.0)
    ? multiplier
    : 1.0;
  const safeWidth = (typeof width === 'number' && Number.isFinite(width) && width > 0)
    ? Math.max(300, width)
    : 450;
  const safeHeight = (typeof height === 'number' && Number.isFinite(height) && height > 0)
    ? Math.max(200, height)
    : 270;

  const startX = 35;
  const startY = safeHeight - 38;

  // Multiplier progression curve: climbs steadily, saturating smoothly
  const progress = Math.min(1, Math.max(0, (safeMult - 1.0) / 6.5));
  const rawEndX = startX + (safeWidth - 105) * progress;
  const rawEndY = startY - (safeHeight - 88) * Math.min(1, Math.pow(progress, 0.72));

  // Dynamic aircraft pitch angle: starts climbing, banks upwards, levels at cruising altitude
  const rawPitch = -16 - Math.sin(progress * Math.PI) * 18;

  const endX = Number.isFinite(rawEndX) ? rawEndX : startX;
  const endY = Number.isFinite(rawEndY) ? rawEndY : startY;
  const pitch = Number.isFinite(rawPitch) ? rawPitch : -16;

  return { startX, startY, endX, endY, pitch, progress };
}

interface AviatorGameProps {
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, description: string) => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  presetMultiplier: number | null;
  onConsumePreset: () => void;
  onOpenAdmin: () => void;
}

export const AviatorGame: React.FC<AviatorGameProps> = ({
  balance,
  onUpdateBalance,
  onBackToLobby,
  soundEnabled,
  presetMultiplier,
  onConsumePreset,
  onOpenAdmin,
}) => {
  const [stake, setStake] = useState<number>(100);
  const [autoCashout, setAutoCashout] = useState<boolean>(false);
  const [autoMultiplier, setAutoMultiplier] = useState<number>(2.0);

  // Game state: 'WAITING' | 'FLYING' | 'CRASHED'
  const [gameState, setGameState] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashedOutAt, setCashedOutAt] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([1.42, 2.85, 1.15, 7.30, 1.82, 3.12, 1.05, 14.50]);
  const [waitingCountdown, setWaitingCountdown] = useState<number>(3);

  // Flight CSS transform & randomized crash states
  const [crashType, setCrashType] = useState<CrashAnimationType>('flyaway');
  const [crashCoords, setCrashCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const screenRef = useRef<HTMLDivElement | null>(null);
  const [screenDimensions, setScreenDimensions] = useState<{ width: number; height: number }>({
    width: 450,
    height: 270,
  });

  // Track flight arena size dynamically for accurate CSS transform positioning
  useEffect(() => {
    const updateSize = () => {
      if (screenRef.current) {
        const rect = screenRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setScreenDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crashPointRef = useRef<number>(2.0);
  const animationFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Generate random realistic crash multiplier
  const generateCrashPoint = useCallback(() => {
    // 5% instant crash < 1.1x
    // 50% between 1.1x and 2.5x
    // 35% between 2.5x and 10x
    // 10% > 10x up to 50x
    const rand = Math.random();
    if (rand < 0.05) {
      return Number((1.01 + Math.random() * 0.1).toFixed(2));
    } else if (rand < 0.55) {
      return Number((1.11 + Math.random() * 1.4).toFixed(2));
    } else if (rand < 0.9) {
      return Number((2.51 + Math.random() * 7.5).toFixed(2));
    } else {
      return Number((10.1 + Math.random() * 35.0).toFixed(2));
    }
  }, []);

  // Handle Cashout
  const handleCashout = useCallback(() => {
    if (gameState !== 'FLYING' || !hasBet || hasCashedOut) return;

    const payout = Math.floor(stake * currentMultiplier);
    const profit = payout - stake;
    setCashedOutAt(currentMultiplier);
    setHasCashedOut(true);
    onUpdateBalance(balance + payout, profit, `Aviator Win (${currentMultiplier.toFixed(2)}x)`);
    playSound.win(soundEnabled);
  }, [balance, currentMultiplier, gameState, hasBet, hasCashedOut, onUpdateBalance, soundEnabled, stake]);

  // Start new flight
  const startFlightRef = useRef<() => void>(() => {});

  const startFlight = useCallback(() => {
    if (presetMultiplier && presetMultiplier >= 1.0) {
      crashPointRef.current = presetMultiplier;
      onConsumePreset();
    } else {
      crashPointRef.current = generateCrashPoint();
    }
    flightStartTimeRef.current = performance.now();
    setCurrentMultiplier(1.0);
    setCrashType('flyaway');
    setGameState('FLYING');
    setHasCashedOut(false);
    setCashedOutAt(0);

    if (soundEnabled) {
      playSound.planeClimb(true);
    }
  }, [generateCrashPoint, onConsumePreset, presetMultiplier, soundEnabled]);

  useEffect(() => {
    startFlightRef.current = startFlight;
  }, [startFlight]);

  // Main animation loop
  useEffect(() => {
    if (gameState !== 'FLYING') return;

    let localAnimationFrame: number;

    const tick = (now: number) => {
      if (!flightStartTimeRef.current || !Number.isFinite(flightStartTimeRef.current)) {
        flightStartTimeRef.current = performance.now();
      }
      const validNow = typeof now === 'number' && Number.isFinite(now) ? now : performance.now();
      const elapsedSec = Math.max(0, (validNow - flightStartTimeRef.current) / 1000);
      // Exponential curve: multiplier = 1 + elapsed^1.65 * 0.42
      const calculatedMult = 1 + Math.pow(elapsedSec, 1.65) * 0.42;
      const nextMultiplier = Number.isFinite(calculatedMult) ? Number(calculatedMult.toFixed(2)) : 1.0;

      // Auto cashout check
      if (hasBet && !hasCashedOut && autoCashout && nextMultiplier >= autoMultiplier) {
        handleCashout();
      }

      // Check for crash (respects preset multiplier if armed, otherwise random)
      const targetCrash = (typeof crashPointRef.current === 'number' && Number.isFinite(crashPointRef.current) && crashPointRef.current >= 1.0)
        ? crashPointRef.current
        : 2.0;

      if (nextMultiplier >= targetCrash) {
        const finalCrash = targetCrash;
        setCurrentMultiplier(finalCrash);

        // Select a randomized crash animation style
        const crashVariants: CrashAnimationType[] = ['flyaway', 'spinout', 'nosedive', 'explosion'];
        const chosenCrash = crashVariants[Math.floor(Math.random() * crashVariants.length)];
        setCrashType(chosenCrash);

        const coords = calculateFlightCoords(finalCrash, screenDimensions.width, screenDimensions.height);
        setCrashCoords({
          x: Number.isFinite(coords.endX) ? coords.endX : 35,
          y: Number.isFinite(coords.endY) ? coords.endY : 180,
        });

        setGameState('CRASHED');
        setHistory((prev) => [finalCrash, ...prev.slice(0, 11)]);
        if (soundEnabled) {
          playSound.planeCrash(true);
        }
        return;
      }

      setCurrentMultiplier(nextMultiplier);
      localAnimationFrame = requestAnimationFrame(tick);
    };

    localAnimationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(localAnimationFrame);
  }, [autoCashout, autoMultiplier, gameState, handleCashout, hasBet, hasCashedOut, screenDimensions.height, screenDimensions.width, soundEnabled]);

  // Post-crash delay before starting next countdown (2.5 seconds to show crashed state)
  useEffect(() => {
    if (gameState !== 'CRASHED') return;

    const timer = setTimeout(() => {
      setHasBet(false);
      setHasCashedOut(false);
      setGameState('WAITING');
    }, 2500);

    return () => clearTimeout(timer);
  }, [gameState]);

  // Waiting countdown between rounds (guaranteed 3 seconds, unaffected by parent re-renders)
  useEffect(() => {
    if (gameState !== 'WAITING') return;

    let remaining = 3;
    setWaitingCountdown(3);

    const interval = setInterval(() => {
      remaining -= 1;
      setWaitingCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        startFlightRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Canvas drawing for glowing flight trajectory curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(10, Math.floor(rect.width));
    const height = Math.max(10, Math.floor(rect.height));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    // Background grid
    ctx.clearRect(0, 0, width, height);

    // Draw subtle radar arcs and grid lines
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (gameState === 'FLYING' || gameState === 'CRASHED') {
      const coords = calculateFlightCoords(currentMultiplier, width, height);
      const startX = Number.isFinite(coords.startX) ? coords.startX : 35;
      const startY = Number.isFinite(coords.startY) ? coords.startY : height - 38;
      const endX = Number.isFinite(coords.endX) ? coords.endX : startX;
      const endY = Number.isFinite(coords.endY) ? coords.endY : startY;

      // Draw red gradient area under flight curve with strictly verified finite bounds
      const gradStartY = Number.isFinite(endY) ? Math.max(0, Math.min(height - 1, endY)) : 0;
      const gradEndY = Number.isFinite(height) ? Math.max(1, height) : 270;

      if (Number.isFinite(gradStartY) && Number.isFinite(gradEndY) && gradEndY > gradStartY) {
        try {
          const areaGradient = ctx.createLinearGradient(0, gradStartY, 0, gradEndY);
          areaGradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
          areaGradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(startX + (endX - startX) * 0.4, startY, endX, endY);
          ctx.lineTo(endX, Math.max(0, height - 30));
          ctx.lineTo(startX, Math.max(0, height - 30));
          ctx.closePath();
          ctx.fillStyle = areaGradient;
          ctx.fill();
        } catch {
          // Gracefully suppress any canvas gradient edge exceptions
        }
      }

      // Draw glowing red flight line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.4, startY, endX, endY);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [currentMultiplier, gameState]);

  // Place Bet
  const handlePlaceBet = () => {
    if (balance < stake) return;
    if (stake < 10) return;

    onUpdateBalance(balance - stake, -stake, 'Aviator Demo Stake');
    setHasBet(true);
    setHasCashedOut(false);
    playSound.placeBet(soundEnabled);
  };

  // Dynamic CSS transforms for the aircraft
  const getPlaneStyle = (): React.CSSProperties => {
    const coords = calculateFlightCoords(
      currentMultiplier,
      screenDimensions.width,
      screenDimensions.height
    );
    const startX = Number.isFinite(coords.startX) ? coords.startX : 35;
    const startY = Number.isFinite(coords.startY) ? coords.startY : 232;
    const endX = Number.isFinite(coords.endX) ? coords.endX : 35;
    const endY = Number.isFinite(coords.endY) ? coords.endY : 232;
    const pitch = Number.isFinite(coords.pitch) ? coords.pitch : -16;

    if (gameState === 'WAITING') {
      return {
        transform: `translate3d(${startX - 22}px, ${startY - 17}px, 0) rotate(-4deg) scale(0.92)`,
        transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
        opacity: 0.9,
      };
    }

    if (gameState === 'FLYING') {
      return {
        transform: `translate3d(${endX - 22}px, ${endY - 17}px, 0) rotate(${pitch}deg) scale(1.0)`,
        transition: 'none',
        opacity: 1,
      };
    }

    // gameState === 'CRASHED'
    const targetX = (Number.isFinite(crashCoords.x) && crashCoords.x > 0 ? crashCoords.x : endX) - 22;
    const targetY = (Number.isFinite(crashCoords.y) && crashCoords.y > 0 ? crashCoords.y : endY) - 17;

    switch (crashType) {
      case 'flyaway':
        return {
          transform: `translate3d(${targetX + 380}px, ${targetY - 240}px, 0) rotate(-65deg) scale(0.2)`,
          transition: 'transform 0.75s cubic-bezier(0.15, 0.85, 0.35, 1.2), opacity 0.75s ease-out',
          opacity: 0,
        };
      case 'spinout':
        return {
          transform: `translate3d(${targetX + 80}px, ${targetY + 130}px, 0) rotate(720deg) scale(0.3)`,
          transition: 'transform 1.1s cubic-bezier(0.2, 0, 0.8, 0.8), opacity 1.1s ease-in',
          opacity: 0,
        };
      case 'nosedive':
        return {
          transform: `translate3d(${targetX + 90}px, ${targetY + 230}px, 0) rotate(105deg) scale(0.4)`,
          transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.9, 0.8), opacity 0.9s ease-in',
          opacity: 0,
        };
      case 'explosion':
      default:
        return {
          transform: `translate3d(${targetX}px, ${targetY}px, 0) rotate(${pitch}deg) scale(1.65)`,
          transition: 'transform 0.45s ease-out, opacity 0.45s ease-out, filter 0.45s ease-out',
          filter: 'brightness(3) contrast(1.5)',
          opacity: 0,
        };
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto w-full pb-8">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 shadow-md">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-extrabold text-xs sm:text-sm tracking-wider text-rose-400">
            AVIATOR CRASH
          </span>
          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
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
      {presetMultiplier && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950 p-2.5 px-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base animate-bounce">⚡</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  AVIATOR PRESET ARMED
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-200 border border-amber-500/40 font-mono">
                  {(presetMultiplier || 1.0).toFixed(2)}x
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Next flight will crash exactly at {(presetMultiplier || 1.0).toFixed(2)}x (1 round)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Multiplier History Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
        <History className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        {history.map((mult, idx) => {
          const isHigh = mult >= 10;
          const isMid = mult >= 2;
          return (
            <span
              key={idx}
              className={`rounded-lg px-2 py-0.5 text-[11px] font-mono font-bold shrink-0 border ${
                isHigh
                  ? 'bg-purple-950/70 border-purple-500/40 text-purple-300'
                  : isMid
                  ? 'bg-blue-950/70 border-blue-500/40 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {mult.toFixed(2)}x
            </span>
          );
        })}
      </div>

      {/* Aviator Screen Display */}
      <div
        ref={screenRef}
        className={`relative h-64 sm:h-72 w-full rounded-3xl border bg-gradient-to-b from-slate-950 via-slate-900 to-black overflow-hidden shadow-2xl flex flex-col justify-center items-center transition-all ${
          gameState === 'CRASHED'
            ? 'border-rose-600/70 shadow-rose-950/50'
            : 'border-rose-900/40'
        }`}
      >
        {/* Radar Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* CSS Transform-Driven Red Aviator Aircraft */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
          style={getPlaneStyle()}
        >
          <div className="relative flex items-center justify-center">
            {/* Jet Afterburner Thruster Flame (active during FLYING) */}
            {gameState === 'FLYING' && (
              <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <div className="h-2.5 w-7 bg-gradient-to-l from-amber-400 via-orange-500 to-transparent rounded-l-full blur-[1px] animate-pulse" />
                <div className="absolute -left-1.5 h-1.5 w-3.5 bg-gradient-to-l from-yellow-100 to-amber-400 rounded-l-full" />
              </div>
            )}

            {/* High-Fidelity SVG Red Aviator Aircraft */}
            <svg
              width="54"
              height="34"
              viewBox="0 0 54 34"
              fill="none"
              className="filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.65)]"
            >
              {/* Swept Wings */}
              <path d="M16 17 L22 2 L32 2 L26 17 Z" fill="#dc2626" />
              <path d="M16 17 L22 32 L32 32 L26 17 Z" fill="#b91c1c" />
              <line x1="22" y1="2" x2="32" y2="2" stroke="#fca5a5" strokeWidth="1" />
              <line x1="22" y1="32" x2="32" y2="32" stroke="#fca5a5" strokeWidth="1" />

              {/* Main Fuselage */}
              <path
                d="M4 17 C4 13, 20 12, 46 14 C49 14.5, 51 16, 51 17 C51 18, 49 19.5, 46 20 C20 22, 4 21, 4 17 Z"
                fill="url(#fuselageGrad)"
              />

              {/* Cockpit Canopy Glass */}
              <path d="M30 14 C33 14, 40 15, 42 17 C40 19, 33 20, 30 20 Z" fill="#38bdf8" opacity="0.9" />
              <path d="M33 15 L39 16.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

              {/* White Racing Stripe */}
              <path d="M18 13.5 L24 14 L22 20 L16 19.5 Z" fill="#ffffff" opacity="0.85" />

              {/* Tail Fin */}
              <path d="M6 17 L2 7 L9 7 L12 17 Z" fill="#991b1b" />
              <line x1="2" y1="7" x2="9" y2="7" stroke="#fca5a5" strokeWidth="1" />

              {/* Nose Propeller Spinner Hub */}
              <ellipse cx="50" cy="17" rx="2.5" ry="3.5" fill="#fef08a" />

              {/* Propeller Disk Blur when flying */}
              {gameState === 'FLYING' ? (
                <ellipse cx="50" cy="17" rx="1.5" ry="12" fill="#ffffff" opacity="0.45" className="animate-pulse" />
              ) : (
                <line x1="50" y1="7" x2="50" y2="27" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              )}

              <defs>
                <linearGradient id="fuselageGrad" x1="4" y1="12" x2="51" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ef4444" />
                  <stop offset="0.6" stopColor="#dc2626" />
                  <stop offset="1" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Randomized Crash Detonation FX Overlay */}
        {gameState === 'CRASHED' && (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: crashCoords.x || (screenDimensions.width * 0.7),
              top: crashCoords.y || (screenDimensions.height * 0.35),
            }}
          >
            {/* Shockwave Blast Ring */}
            <div className="absolute -left-12 -top-12 h-24 w-24 rounded-full border-2 border-rose-500/80 bg-rose-500/20 animate-ping" />
            <div className="absolute -left-8 -top-8 h-16 w-16 rounded-full border border-amber-400 bg-amber-500/30 blur-sm animate-pulse" />
            {/* Core Flash */}
            <div className="absolute -left-5 -top-5 h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-yellow-200 blur-[2px] animate-out zoom-out fade-out duration-700" />
            {/* Sparks Burst in Radial Angles */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <div
                key={idx}
                className="absolute h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-out fade-out duration-700"
                style={{
                  transform: `rotate(${angle}deg) translate(32px) scale(0.6)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Big Multiplier Center Display */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {gameState === 'FLYING' && (
            <div className="animate-in zoom-in-95 duration-100">
              <span className="font-mono text-5xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                {currentMultiplier.toFixed(2)}x
              </span>
              <p className="text-xs text-rose-400/90 font-medium tracking-wide mt-1">
                Plane in flight...
              </p>
            </div>
          )}

          {gameState === 'CRASHED' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-150">
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-rose-300 uppercase tracking-widest bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30 mb-1.5 shadow-lg shadow-rose-950/50">
                <span>{CRASH_LABELS[crashType]?.icon || '✈️'}</span>
                <span>{CRASH_LABELS[crashType]?.title || 'FLEW AWAY!'}</span>
              </div>
              <span className="font-mono text-4xl sm:text-5xl font-black text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                {currentMultiplier.toFixed(2)}x
              </span>
              <span className="text-[10px] text-rose-400/80 font-medium mt-0.5">
                {CRASH_LABELS[crashType]?.subtitle || 'Flight terminated'}
              </span>
            </div>
          )}

          {gameState === 'WAITING' && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                NEXT ROUND IN
              </span>
              <span className="font-mono text-4xl font-black text-emerald-400 animate-pulse">
                00:0{waitingCountdown}
              </span>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${(waitingCountdown / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Cashout Notification pill */}
        {hasCashedOut && (
          <div className="absolute top-4 z-20 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-lg animate-in slide-in-from-top">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Cashed out at {cashedOutAt.toFixed(2)}x (+{formatVC(Math.floor(stake * cashedOutAt) - stake)})</span>
          </div>
        )}
      </div>

      {/* Betting & Cashout Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col gap-3.5">
        {/* Stake Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Demo Bet Amount
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoCashout(!autoCashout)}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                autoCashout
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Auto Cashout {autoCashout ? `(${autoMultiplier.toFixed(1)}x)` : 'OFF'}
            </button>
          </div>
        </div>

        {/* Chip Quick Selector */}
        <div className="grid grid-cols-5 gap-1.5">
          {[10, 50, 100, 200, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setStake(amt)}
              className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                stake === amt
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Auto cashout multiplier adjuster if enabled */}
        {autoCashout && (
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Auto Cashout Multiplier:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoMultiplier((m) => Math.max(1.1, Number((m - 0.5).toFixed(1))))}
                className="h-7 w-7 rounded bg-slate-800 text-white font-bold"
              >
                -
              </button>
              <span className="font-mono font-bold text-rose-400 text-sm">{autoMultiplier.toFixed(1)}x</span>
              <button
                onClick={() => setAutoMultiplier((m) => Number((m + 0.5).toFixed(1)))}
                className="h-7 w-7 rounded bg-slate-800 text-white font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Big Action Button */}
        {gameState === 'FLYING' && hasBet && !hasCashedOut ? (
          <button
            onClick={handleCashout}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/20 transition-all flex flex-col items-center justify-center leading-tight animate-pulse"
          >
            <span>CASH OUT</span>
            <span className="text-xs font-mono font-bold">
              {formatVC(Math.floor(stake * currentMultiplier))} ({currentMultiplier.toFixed(2)}x)
            </span>
          </button>
        ) : (
          <button
            disabled={hasBet && gameState === 'FLYING'}
            onClick={handlePlaceBet}
            className={`w-full py-3.5 rounded-2xl font-black text-base shadow-lg transition-all ${
              hasBet && gameState === 'FLYING'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/40 active:scale-[0.98]'
            }`}
          >
            {hasBet && gameState === 'WAITING'
              ? `BET PLACED (₹${stake} VC)`
              : `BET ₹${stake} VC`}
          </button>
        )}
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-500">
        DEMO SIMULATION — Virtual credits only. No real money betting or prizes.
      </div>
    </div>
  );
};
