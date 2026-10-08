import { RoundResult, ColourType, SizeType } from '../types/game';

export const WINGO_LIVE_API_URL =
  'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-1m-500';

export interface WingoApiItem {
  issueNumber: string;
  number: number;
  size: 'big' | 'small' | string;
  colour: 'red' | 'green' | 'red,violet' | 'green,violet' | string;
  time: string;
}

export interface WingoApiResponse {
  code: number;
  msg: string;
  data: {
    list: WingoApiItem[];
  };
}

/**
 * Parses timestamp from issueNumber (e.g. 20261007100010678) and time (e.g. 11:17:00)
 */
function parseTimestamp(issueNumber: string, timeStr?: string): number {
  try {
    if (issueNumber.length >= 8 && timeStr) {
      const year = parseInt(issueNumber.substring(0, 4), 10);
      const month = parseInt(issueNumber.substring(4, 6), 10) - 1;
      const day = parseInt(issueNumber.substring(6, 8), 10);

      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
        const d = new Date(year, month, day, hours, minutes, seconds);
        const ts = d.getTime();
        if (!isNaN(ts)) return ts;
      }
    }
  } catch {}
  return Date.now();
}

/**
 * Transforms an API result item into our internal RoundResult
 */
export function normalizeApiItem(item: WingoApiItem): RoundResult {
  const num = typeof item.number === 'number' ? item.number : parseInt(String(item.number), 10) || 0;
  const rawColour = (item.colour || '').toLowerCase();
  
  let colour: ColourType = 'GREEN';
  if (num === 0 || num === 5 || rawColour.includes('violet')) {
    colour = 'VIOLET';
  } else if (rawColour.includes('red') || [2, 4, 6, 8].includes(num)) {
    colour = 'RED';
  } else {
    colour = 'GREEN';
  }

  const rawSize = (item.size || '').toLowerCase();
  const size: SizeType = rawSize === 'big' || num >= 5 ? 'BIG' : 'SMALL';
  const timestamp = parseTimestamp(item.issueNumber, item.time);

  return {
    period: item.issueNumber,
    gameMode: 'wingo_1m',
    number: num,
    colour,
    rawColour: item.colour,
    size,
    time: item.time,
    timestamp,
    isPreset: false,
  };
}

/**
 * Calculates the next sequential round issue number from the latest finished round
 */
export function calculateNextPeriodFromLatest(latestIssue: string): string {
  try {
    if (latestIssue && /^\d+$/.test(latestIssue)) {
      const nextBig = BigInt(latestIssue) + 1n;
      return nextBig.toString();
    }
  } catch {}
  
  // Fallback pattern
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}100010001`;
}

/**
 * Fetches the live Win Go 1-Minute history (up to 500 real rounds)
 */
export async function fetchLiveWingoHistory(): Promise<RoundResult[]> {
  try {
    const res = await fetch(WINGO_LIVE_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data: WingoApiResponse = await res.json();
    if (data && data.data && Array.isArray(data.data.list)) {
      // API list is already ordered newest first
      return data.data.list.map(normalizeApiItem);
    }
    return [];
  } catch (err) {
    console.warn('Failed to fetch live Win Go history from API:', err);
    throw err;
  }
}
