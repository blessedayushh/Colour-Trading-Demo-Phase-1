# ColourWin / Tashan Win Demo — Multi-Game Casino Simulation Platform

> ⚠️ **DEMO / SIMULATION — NO REAL MONEY**
> This website is strictly a client-side virtual-money demonstration and game simulation.
> - **Virtual credits only (VC).** Starting balance is ₹10,000 VC.
> - **Zero real-world monetary value.**
> - **No deposits, no withdrawals, no UPI or payment gateways.**
> - **No cryptocurrency, no cash prizes, and no real-money betting.**
> - Predictions carry no guarantee and do not use AI certainty.
> - The Admin Result Control is explicitly a manual preset simulation tool for demonstration and testing purposes.

---

## Overview

**ColourWin / Tashan Win Demo** is a responsive, mobile-first gaming simulation dashboard inspired by modern online game lobbies (as shown in the reference design). It features a dark casino gaming aesthetic, live winning tickers, golden category navigation, and 5 fully playable virtual-credit games:

1. **Aviator (Crash Game)**: Realistic climbing curve multiplier, real-time Canvas radar, auto cashout, and crash simulation.
2. **Boom (Mines Game)**: 5x5 grid with configurable hidden bombs (1, 3, 5, 10). Tapping safe diamonds increases multiplier with early cashout!
3. **Cricket (Predictor Game)**: Predict delivery outcome (1 Run, 2 Runs, 4 Boundary, 6 Maximum, Wicket, Dot ball) with bat crack sound and score tracking.
4. **Fortune Gems (Slot Machine)**: 3x3 slot reels + 4th special multiplier bonus reel (up to 15×), 5 paylines, and animated symbol spins.
5. **Win Go (Colour & Number Lottery)**: 1 Min, 3 Min, and 5 Min colour prediction (Red, Green, Violet, Numbers 0-9, Big/Small) with Admin Preset controls!
6. **Lucky Wheel ("Get ₹500")**: Center elevated spinning wheel with physics deceleration awarding daily demo credits.

---

## Tech Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with dark gaming palette and mobile thumb-zone layout
- **Icons**: Lucide React
- **Audio**: Web Audio API oscillator synthesis (pure client-side, zero external audio asset dependencies)
- **Data Persistence**: Browser `localStorage` with safe JSON fallbacks and self-healing defaults
- **Charts**: Custom HTML5 Canvas API for high-DPI retina Profit/Loss and virtual balance progression

---

## How to Run the Project

### 1. In AI Studio / Vite Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
npm run build
npm run preview
```

---

## Playable Games Breakdown

### 1. Aviator (Crash Game)
- Plane takes off from (0,0) and accelerates up an exponential curve on an HTML5 canvas.
- Multiplier starts at `1.00x` and climbs higher.
- Tap **CASH OUT** before the plane flies away to secure winnings.
- Past flight multiplier ribbon at the top.
- Auto cashout multiplier setting supported.

### 2. Boom (Mines Game)
- 25 mysterious tiles on a 5x5 board.
- Choose between 1, 3, 5, or 10 hidden bombs.
- Tap tiles to uncover sparkling blue diamonds and increase your payout multiplier.
- Cash out at any time or risk exploding the bomb!

### 3. Cricket Predictor
- Realistic T20 match delivery simulator (IND vs AUS).
- Predict: Single Run (1.8x), Double (3.5x), Boundary 4 (4.5x), Maximum 6 (8.0x), Wicket (6.0x), or Dot Ball (2.1x).
- Live ball delivery animation, bat crack sound, and over scorecard tracking.

### 4. Fortune Gems (Reel Spinner)
- Golden Garuda, Ruby, Sapphire, Emerald, A, K, Q symbols across 5 paylines.
- 4th Special Multiplier Reel spins alongside the 3x3 grid (1x, 2x, 3x, 5x, 10x, 15x bonus multiplier!).
- Realistic reel spinning ticks and triumphant winning coin fanfares.

### 5. Win Go (Colour Prediction with Admin Presets)
- 1 Min / 3 Min / 5 Min countdown timers.
- Predict Colours (Green, Violet, Red), Numbers (0-9), and Size (Big 5-9 / Small 0-4).
- Protected Demo Admin Panel (PIN: `2468`) allowing preset simulation results for test demonstration.

### 6. "Get ₹500" Lucky Wheel
- Accessible via the center bottom navigation button and floating spinner widget.
- 8-segment fortune wheel with prizes ranging from ₹50 to ₹2,000 virtual credits.

---

## Demo Admin Panel & Preset Simulation Result Control

The Demo Admin Panel enables testing specific winning and losing outcomes.

### How to Access:
1. Tap the **Admin (Key icon)** in the top header or navigate to **Settings → Demo Admin Controls**.
2. Enter the demo test PIN:
   ```
   2468
   ```
| **2** | **RED** | SMALL (0–4) |
| **3** | **GREEN** | SMALL (0–4) |
| **4** | **RED** | SMALL (0–4) |
| **5** | **VIOLET** | BIG (5–9) |
| **6** | **RED** | BIG (5–9) |
| **7** | **GREEN** | BIG (5–9) |
| **8** | **RED** | BIG (5–9) |
| **9** | **GREEN** | BIG (5–9) |

### 3. Payout Multipliers (Virtual Credits Only)
- **Correct Number (0–9)**: **9×** stake
- **Correct Colour (Green / Red / Violet)**: **2×** stake
- **Correct Size (Big / Small)**: **2×** stake

### 4. Countdown & Betting Lock
- Each round counts down in `MM:SS` format.
- Warning animation and audio ticks fire below 10 seconds.
- **Predictions lock at 00:05** to calculate simulated outcome.
- At `00:00`, the round settles, balance updates, result modal opens, and the next sequential period begins automatically.

---

## Demo Admin Panel & Preset Simulation Result Control

The Demo Admin Panel enables testing specific winning and losing outcomes.

### How to Access:
1. Tap the **Admin (Key icon)** in the header or bottom navigation, or navigate to **Settings → Demo Admin Controls**.
2. Enter the demo test PIN:
   ```
   2468
   ```

### Next Result Control:
1. Select any number from `0` to `9`.
2. The panel shows a live preview of the calculated Colour and Size (e.g., Number `7` → `GREEN`, `BIG`).
3. Click **[ SET NEXT DEMO RESULT ]**.
4. The system arms the preset for the upcoming period.

### One-Round-Only Guarantee:
- The preset strictly applies to **only the immediate upcoming round**.
- Once that round finishes at `00:00`, the preset is **automatically purged** from state and localStorage.
- Subsequent rounds instantly resume unbiased, uniform random simulation (0–9) unless manually reconfigured.
- You can clear the preset anytime before round completion via **[ CLEAR PRESET ]**.

---

## LocalStorage Persistence

The application preserves data locally in browser memory:
- `colourwin_demo_balance`: Current virtual credit balance
- `colourwin_demo_predictions`: Active and recent user predictions
- `colourwin_demo_results`: History of completed simulated rounds
- `colourwin_demo_stats`: Lifetime predictions, wins, losses, win rate, and virtual P/L
- `colourwin_demo_settings`: Sound and animation preferences
- `colourwin_demo_preset`: Active one-round preset (if armed)
- `colourwin_demo_account_id`: Simulated demo player ID (e.g., `CW-DEMO-XXXXX`)

### Resetting the Demo:
- Click **Reset Demo** on the Virtual Balance Card, Profile page, or Settings modal.
- Confirms before restoring balance to ₹10,000 VC and clearing all history.

---

## License & Safety Declaration

This software is for demonstration, testing, and algorithmic visualization purposes only. No actual currency, deposits, or monetary gaming operations are supported.
