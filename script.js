/**
 * ColourWin Demo — Vanilla JavaScript Simulation Engine
 * Strictly a virtual money demo with deterministic results & preset control.
 */

const CONFIG = {
  INITIAL_BALANCE: 10000,
  DEMO_PIN: '2468',
  COLOUR_MAP: {
    0: 'VIOLET',
    1: 'GREEN',
    2: 'RED',
    3: 'GREEN',
    4: 'RED',
    5: 'VIOLET',
    6: 'RED',
    7: 'GREEN',
    8: 'RED',
    9: 'GREEN',
  },
  MULTIPLIERS: {
    NUMBER: 9,
    COLOUR: 2,
    SIZE: 2,
  },
};

class ColourWinEngine {
  constructor() {
    this.state = this.loadState();
    this.timer = null;
    this.onTickCallbacks = [];
    this.onRoundEndCallbacks = [];
  }

  loadState() {
    try {
      const balance = parseFloat(localStorage.getItem('cw_balance')) || CONFIG.INITIAL_BALANCE;
      const predictions = JSON.parse(localStorage.getItem('cw_predictions')) || [];
      const results = JSON.parse(localStorage.getItem('cw_results')) || [];
      const preset = JSON.parse(localStorage.getItem('cw_preset')) || null;
      const period = localStorage.getItem('cw_period') || this.generatePeriod();

      return {
        balance,
        predictions,
        results,
        preset,
        period,
        timeLeft: 60,
      };
    } catch {
      return {
        balance: CONFIG.INITIAL_BALANCE,
        predictions: [],
        results: [],
        preset: null,
        period: this.generatePeriod(),
        timeLeft: 60,
      };
    }
  }

  saveState() {
    try {
      localStorage.setItem('cw_balance', this.state.balance.toString());
      localStorage.setItem('cw_predictions', JSON.stringify(this.state.predictions.slice(-100)));
      localStorage.setItem('cw_results', JSON.stringify(this.state.results.slice(-60)));
      if (this.state.preset) {
        localStorage.setItem('cw_preset', JSON.stringify(this.state.preset));
      } else {
        localStorage.removeItem('cw_preset');
      }
      localStorage.setItem('cw_period', this.state.period);
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  generatePeriod() {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const seq = Math.floor(10000 + Math.random() * 89999);
    return `${dateStr}1${seq}`;
  }

  calculateColour(num) {
    return CONFIG.COLOUR_MAP[num] || 'GREEN';
  }

  calculateSize(num) {
    return num >= 5 ? 'BIG' : 'SMALL';
  }

  generateRandomResult() {
    return Math.floor(Math.random() * 10);
  }

  setNextPreset(number) {
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 0 || num > 9) return false;

    this.state.preset = {
      period: this.state.period,
      number: num,
      colour: this.calculateColour(num),
      size: this.calculateSize(num),
      timestamp: Date.now(),
    };
    this.saveState();
    return true;
  }

  clearPreset() {
    this.state.preset = null;
    this.saveState();
  }

  placePrediction(category, value, stake) {
    const amt = parseFloat(stake);
    if (isNaN(amt) || amt < 10) throw new Error('Minimum prediction stake is ₹10 VC.');
    if (amt > this.state.balance) throw new Error('Insufficient virtual credits.');
    if (this.state.timeLeft <= 5) throw new Error('Round is locked for settlement.');

    // Deduct stake
    this.state.balance -= amt;

    const multiplier = category === 'NUMBER' ? 9 : 2;
    const prediction = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      period: this.state.period,
      category,
      value,
      stake: amt,
      multiplier,
      timestamp: Date.now(),
    };

    this.state.predictions.unshift(prediction);
    this.saveState();
    return prediction;
  }

  settlePredictions(resultNumber, resultColour, resultSize) {
    const currentRoundBets = this.state.predictions.filter((p) => p.period === this.state.period);
    const settlements = [];

    currentRoundBets.forEach((p) => {
      let won = false;
      if (p.category === 'NUMBER') won = Number(p.value) === resultNumber;
      if (p.category === 'COLOUR') won = String(p.value).toUpperCase() === resultColour;
      if (p.category === 'SIZE') won = String(p.value).toUpperCase() === resultSize;

      const payout = won ? p.stake * p.multiplier : 0;
      if (payout > 0) {
        this.state.balance += payout;
      }

      settlements.push({
        predictionId: p.id,
        category: p.category,
        value: p.value,
        stake: p.stake,
        won,
        payout,
        netProfit: won ? payout - p.stake : -p.stake,
      });
    });

    return settlements;
  }

  startRound() {
    this.state.timeLeft = 60;
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.state.timeLeft--;
      this.onTickCallbacks.forEach((cb) => cb(this.state.timeLeft));

      if (this.state.timeLeft <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  endRound() {
    let resultNumber;
    let isPreset = false;

    // Admin preset takes precedence if armed
    if (this.state.preset) {
      resultNumber = this.state.preset.number;
      isPreset = true;
    } else {
      resultNumber = this.generateRandomResult();
    }

    const colour = this.calculateColour(resultNumber);
    const size = this.calculateSize(resultNumber);
    const settlements = this.settlePredictions(resultNumber, colour, size);

    const roundResult = {
      period: this.state.period,
      number: resultNumber,
      colour,
      size,
      isPreset,
      settlements,
      timestamp: Date.now(),
    };

    this.state.results.unshift(roundResult);

    // One-round-only preset guarantee: clear preset immediately after use
    if (isPreset) {
      this.clearPreset();
    }

    // Advance period and reset
    this.state.period = this.generatePeriod();
    this.saveState();

    this.onRoundEndCallbacks.forEach((cb) => cb(roundResult));
    this.startRound();
  }

  resetDemo() {
    this.state.balance = CONFIG.INITIAL_BALANCE;
    this.state.predictions = [];
    this.state.results = [];
    this.state.preset = null;
    this.saveState();
  }
}

// Export for module or global use
if (typeof window !== 'undefined') {
  window.ColourWinEngine = ColourWinEngine;
}
