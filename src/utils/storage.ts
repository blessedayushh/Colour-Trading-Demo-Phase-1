import {
  RoundResult,
  Prediction,
  UserSettings,
  UserStats,
  AdminPreset,
  AllGamesPresets,
  BalancePoint,
  GameModeId
} from '../types/game';
import { calculateColour, calculateSize } from './gameLogic';

const STORAGE_KEYS = {
  BALANCE: 'colourwin_demo_balance',
  PREDICTIONS: 'colourwin_demo_predictions',
  RESULTS: 'colourwin_demo_results',
  STATS: 'colourwin_demo_stats',
  SETTINGS: 'colourwin_demo_settings',
  PRESET: 'colourwin_demo_preset',
  ALL_PRESETS: 'colourwin_demo_all_presets',
  ACCOUNT_ID: 'colourwin_demo_account_id',
  GAME_MODE: 'colourwin_demo_game_mode',
  BALANCE_HISTORY: 'colourwin_demo_balance_history',
};

export const INITIAL_BALANCE = 10000; // Starting ₹10,000 Virtual Credits

export const DEFAULT_PRESETS: AllGamesPresets = {
  wingo: null,
  aviatorCrashMultiplier: null,
  boomOutcome: null,
  cricketOutcome: null,
  fortuneGemsSymbol: null,
  fortuneGemsMultiplier: null,
  luckyWheelPrize: null,
  chickenRoadOutcome: null,
};

export function getOrCreateAccountId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.ACCOUNT_ID);
    if (existing) return existing;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newId = `CW-DEMO-${randomSuffix}`;
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_ID, newId);
    return newId;
  } catch {
    return 'CW-DEMO-10001';
  }
}

export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return {
    soundEnabled: true,
    animationsEnabled: true,
    theme: 'dark',
  };
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function loadBalance(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (val !== null) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_BALANCE;
}

export function saveBalance(balance: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
  } catch {}
}

export function loadBalanceHistory(): BalancePoint[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BALANCE_HISTORY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Default initial point
  return [
    {
      period: 'Initial',
      balance: INITIAL_BALANCE,
      timestamp: Date.now() - 3600000,
      delta: 0,
    },
  ];
}

export function saveBalanceHistory(history: BalancePoint[]): void {
  try {
    // Keep last 40 data points
    const trimmed = history.slice(-40);
    localStorage.setItem(STORAGE_KEYS.BALANCE_HISTORY, JSON.stringify(trimmed));
  } catch {}
}

export function loadAllPresets(): AllGamesPresets {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_PRESETS);
    if (data) {
      return { ...DEFAULT_PRESETS, ...JSON.parse(data) };
    }
  } catch {}
  return { ...DEFAULT_PRESETS };
}

export function saveAllPresets(presets: AllGamesPresets): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_PRESETS, JSON.stringify(presets));
  } catch {}
}

export function loadPreset(): AdminPreset | null {
  try {
    const all = loadAllPresets();
    if (all.wingo) return all.wingo;
    const data = localStorage.getItem(STORAGE_KEYS.PRESET);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return null;
}

export function savePreset(preset: AdminPreset | null): void {
  try {
    const all = loadAllPresets();
    all.wingo = preset;
    saveAllPresets(all);
    if (preset) {
      localStorage.setItem(STORAGE_KEYS.PRESET, JSON.stringify(preset));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PRESET);
    }
  } catch {}
}

export function loadGameMode(): GameModeId {
  try {
    const mode = localStorage.getItem(STORAGE_KEYS.GAME_MODE) as GameModeId;
    if (mode === 'wingo_1m') {
      return mode;
    }
  } catch {}
  return 'wingo_1m';
}

export function saveGameMode(mode: GameModeId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_MODE, mode);
  } catch {}
}

// Generate realistic initial seed results if user is starting fresh
function generateSeedResults(): RoundResult[] {
  const results: RoundResult[] = [];
  const now = Date.now();
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  for (let i = 25; i >= 1; i--) {
    const seq = 10000 + i;
    const period = `${dateStr}1${seq}`;
    const num = Math.floor(Math.random() * 10);
    const colour = calculateColour(num);
    const size = calculateSize(num);
    results.push({
      period,
      gameMode: 'wingo_1m',
      number: num,
      colour,
      size,
      timestamp: now - i * 60000,
      isPreset: i === 12, // Show one preset example in history
    });
  }
  return results;
}

export function loadResults(): RoundResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const seeds = generateSeedResults();
  saveResults(seeds);
  return seeds;
}

export function saveResults(results: RoundResult[]): void {
  try {
    // Keep up to 500 rounds
    const trimmed = results.slice(0, 500);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(trimmed));
  } catch {}
}

export function loadPredictions(): Prediction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function savePredictions(predictions: Prediction[]): void {
  try {
    const trimmed = predictions.slice(-100);
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(trimmed));
  } catch {}
}

export function loadStats(): UserStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return {
    totalRounds: 0,
    totalPredictions: 0,
    wins: 0,
    losses: 0,
    totalStake: 0,
    totalPayout: 0,
    netProfit: 0,
  };
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {}
}

export function resetAllDemoData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.BALANCE);
    localStorage.removeItem(STORAGE_KEYS.PREDICTIONS);
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.PRESET);
    localStorage.removeItem(STORAGE_KEYS.ALL_PRESETS);
    localStorage.removeItem(STORAGE_KEYS.BALANCE_HISTORY);
  } catch {}
}
