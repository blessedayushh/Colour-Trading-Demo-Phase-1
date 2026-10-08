import { ColourType, SizeType, GameModeConfig, GameModeId, BetCategory, Prediction, Settlement } from '../types/game';

export const GAME_MODES: GameModeConfig[] = [
  { id: 'wingo_1m', name: 'WinGo 1 Min', durationSeconds: 60, label: '1M' },
];

/**
 * Deterministic Colour Mapping as specified:
 * 0 → Violet
 * 1 → Green
 * 2 → Red
 * 3 → Green
 * 4 → Red
 * 5 → Violet
 * 6 → Red
 * 7 → Green
 * 8 → Red
 * 9 → Green
 */
export function calculateColour(number: number): ColourType {
  switch (number) {
    case 0:
    case 5:
      return 'VIOLET';
    case 1:
    case 3:
    case 7:
    case 9:
      return 'GREEN';
    case 2:
    case 4:
    case 6:
    case 8:
      return 'RED';
    default:
      return 'GREEN';
  }
}

/**
 * Size calculation:
 * 0 - 4: SMALL
 * 5 - 9: BIG
 */
export function calculateSize(number: number): SizeType {
  return number >= 5 ? 'BIG' : 'SMALL';
}

/**
 * Transparent random simulated number generation: 0 to 9
 */
export function generateRandomResultNumber(): number {
  return Math.floor(Math.random() * 10);
}

/**
 * Multiplier definition:
 * Number = 9x
 * Colour = 2x
 * Size = 2x
 */
export function getMultiplier(category: BetCategory): number {
  switch (category) {
    case 'NUMBER':
      return 9;
    case 'COLOUR':
      return 2;
    case 'SIZE':
      return 2;
  }
}

/**
 * Sequential Period Number generator
 * Formats as YYYYMMDD + ModeCode (1, 3, 5) + 5-digit sequential counter
 */
export function generateNextPeriod(lastPeriod?: string, mode: GameModeId = 'wingo_1m'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const modeChar = '1';

  if (lastPeriod && lastPeriod.startsWith(datePrefix)) {
    // Extract the numeric sequence at the end
    const lastSeq = parseInt(lastPeriod.slice(-5), 10);
    const nextSeq = isNaN(lastSeq) ? 10001 : lastSeq + 1;
    return `${datePrefix}${modeChar}${String(nextSeq).padStart(5, '0')}`;
  }

  // Fallback or fresh day start
  return `${datePrefix}${modeChar}10001`;
}

/**
 * Settle user predictions against the simulated result
 */
export function settlePredictions(
  predictions: Prediction[],
  resultNumber: number,
  resultColour: ColourType,
  resultSize: SizeType
): Settlement[] {
  return predictions.map((pred) => {
    let won = false;

    if (pred.category === 'NUMBER') {
      won = Number(pred.value) === resultNumber;
    } else if (pred.category === 'COLOUR') {
      const betColour = String(pred.value).toUpperCase();
      if (resultNumber === 0) {
        won = betColour === 'RED' || betColour === 'VIOLET';
      } else if (resultNumber === 5) {
        won = betColour === 'GREEN' || betColour === 'VIOLET';
      } else {
        won = betColour === resultColour;
      }
    } else if (pred.category === 'SIZE') {
      won = String(pred.value).toUpperCase() === resultSize;
    }

    const payout = won ? pred.stake * pred.multiplier : 0;
    const netProfit = won ? payout - pred.stake : -pred.stake;

    return {
      predictionId: pred.id,
      period: pred.period,
      category: pred.category,
      value: pred.value,
      label: pred.label,
      stake: pred.stake,
      won,
      payout,
      netProfit,
    };
  });
}

/**
 * Format VC currency amounts
 */
export function formatVC(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN');
  return isNegative ? `-₹${formatted} VC` : `₹${formatted} VC`;
}

export function formatTimeMMSS(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getColourTailwind(colour: ColourType): {
  bg: string;
  text: string;
  border: string;
  glow: string;
  badge: string;
} {
  switch (colour) {
    case 'GREEN':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      };
    case 'RED':
      return {
        bg: 'bg-rose-500',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-rose-500/20',
        badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      };
    case 'VIOLET':
      return {
        bg: 'bg-purple-600',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20',
        badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      };
  }
}
