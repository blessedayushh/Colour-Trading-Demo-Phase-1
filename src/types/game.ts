export type GameModeId = 'wingo_1m';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  durationSeconds: number;
  label: string;
}

export type ColourType = 'GREEN' | 'RED' | 'VIOLET';
export type SizeType = 'BIG' | 'SMALL';

export type BetCategory = 'COLOUR' | 'NUMBER' | 'SIZE';

export interface BetSelection {
  category: BetCategory;
  value: ColourType | SizeType | number;
  label: string;
  payoutMultiplier: number;
}

export interface Prediction {
  id: string;
  period: string;
  gameMode: GameModeId;
  category: BetCategory;
  value: ColourType | SizeType | number;
  label: string;
  stake: number; // in Virtual Credits (VC)
  timestamp: number;
  multiplier: number;
}

export interface Settlement {
  predictionId: string;
  period: string;
  category: BetCategory;
  value: ColourType | SizeType | number;
  label: string;
  stake: number;
  won: boolean;
  payout: number; // in VC
  netProfit: number; // in VC (+ or -)
}

export interface RoundResult {
  period: string;
  gameMode: GameModeId;
  number: number;
  colour: ColourType;
  rawColour?: string;
  size: SizeType;
  timestamp: number;
  time?: string;
  isPreset: boolean;
  settlements?: Settlement[];
  totalPayout?: number;
}

export interface AdminPreset {
  period: string;
  number: number;
  colour: ColourType;
  size: SizeType;
  createdAt: number;
}

export type CricketOutcomeType = 'DOT' | '1_RUN' | '2_RUNS' | '4_FOUR' | '6_SIX' | 'WICKET';
export type FortuneGemsPresetType = 'GARUDA' | 'RUBY' | 'SAPPHIRE' | 'EMERALD' | 'NO_WIN';

export type ChickenDifficulty = 'easy' | 'medium' | 'hard' | 'hardcore';
export type ChickenRoadPresetType = 'SAFE_5' | 'SAFE_10' | 'INSTANT_ROAST' | 'JACKPOT_WIN';

export interface AllGamesPresets {
  wingo: AdminPreset | null;
  aviatorCrashMultiplier: number | null;
  boomOutcome: 'FIRST_BOMB' | 'EASY_GEMS' | null;
  cricketOutcome: CricketOutcomeType | null;
  fortuneGemsSymbol: FortuneGemsPresetType | null;
  fortuneGemsMultiplier: number | null;
  luckyWheelPrize: number | null;
  chickenRoadOutcome: ChickenRoadPresetType | null;
}

export interface UserStats {
  totalRounds: number;
  totalPredictions: number;
  wins: number;
  losses: number;
  totalStake: number;
  totalPayout: number;
  netProfit: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark' | 'dim';
}

export interface BalancePoint {
  period: string;
  balance: number;
  timestamp: number;
  delta: number;
}

export type SelectedGameId = 'wingo' | 'aviator' | 'boom' | 'cricket' | 'fortunegems' | 'chickenroad';

export type LobbyCategory = 'lobby' | 'popular' | 'minigame' | 'lottery' | 'slots' | 'fishing';

export type ActiveTab = 'home' | 'activity' | 'promotion' | 'account' | 'history' | 'stats';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}
