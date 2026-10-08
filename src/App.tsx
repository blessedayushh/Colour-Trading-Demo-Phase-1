import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameModeId,
  BetSelection,
  Prediction,
  RoundResult,
  AdminPreset,
  AllGamesPresets,
  ActiveTab,
  SelectedGameId,
  LobbyCategory,
  ToastMessage,
  BalancePoint,
} from './types/game';
import {
  GAME_MODES,
  calculateColour,
  calculateSize,
  generateRandomResultNumber,
  generateNextPeriod,
  settlePredictions,
  formatVC,
} from './utils/gameLogic';
import {
  INITIAL_BALANCE,
  getOrCreateAccountId,
  loadBalance,
  saveBalance,
  loadBalanceHistory,
  saveBalanceHistory,
  loadGameMode,
  saveGameMode,
  loadPredictions,
  savePredictions,
  loadResults,
  saveResults,
  loadStats,
  saveStats,
  loadSettings,
  saveSettings,
  loadPreset,
  savePreset,
  loadAllPresets,
  saveAllPresets,
  DEFAULT_PRESETS,
  resetAllDemoData,
} from './utils/storage';
import { playSound } from './utils/audio';

// Components
import { Header } from './components/Header';
import { SafetyBanner, FooterDisclaimer } from './components/SafetyBanner';
import { WinningTicker } from './components/WinningTicker';
import { CategoryNav } from './components/CategoryNav';
import { RecommendedGamesGrid } from './components/RecommendedGamesGrid';
import { FloatingWidgets } from './components/FloatingWidgets';
import { VirtualBalanceCard } from './components/VirtualBalanceCard';
import { GameSelector } from './components/GameSelector';
import { CurrentRoundCard } from './components/CurrentRoundCard';
import { PredictionOptions } from './components/PredictionOptions';
import { StakeSelector } from './components/StakeSelector';
import { PlacePredictionButton } from './components/PlacePredictionButton';
import { ActivePredictionsList } from './components/ActivePredictionsList';
import { ResultModal } from './components/ResultModal';
import { AdminDemoPanel } from './components/AdminDemoPanel';
import { HistoryView } from './components/HistoryView';
import { StatsView } from './components/StatsView';
import { ProfileView } from './components/ProfileView';
import { SettingsModal } from './components/SettingsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/ToastContainer';

// Playable Games
import { AviatorGame } from './components/AviatorGame';
import { BoomGame } from './components/BoomGame';
import { CricketGame } from './components/CricketGame';
import { FortuneGemsGame } from './components/FortuneGemsGame';
import { ChickenRoadGame } from './components/ChickenRoadGame';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { ActivityView } from './components/ActivityView';
import { PromotionView } from './components/PromotionView';
import { WingoHistorySection } from './components/WingoHistorySection';
import { fetchLiveWingoHistory, calculateNextPeriodFromLatest } from './utils/wingoApi';

// Icons
import { ArrowLeft, History, BarChart3, RotateCcw, KeyRound } from 'lucide-react';

export default function App() {
  // Account & Preferences
  const [accountId] = useState<string>(() => getOrCreateAccountId());
  const [settings, setSettings] = useState(() => loadSettings());
  const [balance, setBalance] = useState<number>(() => loadBalance());
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>(() => loadBalanceHistory());
  const [gameMode, setGameMode] = useState<GameModeId>(() => loadGameMode());
  const [predictions, setPredictions] = useState<Prediction[]>(() => loadPredictions());
  const [results, setResults] = useState<RoundResult[]>(() => loadResults());
  const [stats, setStats] = useState(() => loadStats());
  const [allPresets, setAllPresets] = useState<AllGamesPresets>(() => loadAllPresets());
  const [preset, setPreset] = useState<AdminPreset | null>(() => loadAllPresets().wingo);

  // Navigation, Selected Game & Category
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedGame, setSelectedGame] = useState<SelectedGameId | null>(null);
  const [activeCategory, setActiveCategory] = useState<LobbyCategory>('lobby');

  // Modals & Admin Tab
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'wingo' | 'aviator' | 'chickenroad' | 'boom' | 'cricket' | 'fortunegems' | 'wheel'>('wingo');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [currentResultModal, setCurrentResultModal] = useState<RoundResult | null>(null);

  // Active Round State for Win Go
  const currentGameConfig = GAME_MODES.find((m) => m.id === gameMode) || GAME_MODES[0];
  const [currentPeriod, setCurrentPeriod] = useState<string>(() => {
    const lastResult = loadResults()[0];
    if (lastResult?.period) {
      return calculateNextPeriodFromLatest(lastResult.period);
    }
    return generateNextPeriod(lastResult?.period, gameMode);
  });
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const currentSec = new Date().getSeconds();
    return Math.max(1, 60 - currentSec);
  });
  const roundTargetEndTime = useRef<number>(Date.now() + 60 * 1000);

  // Live Win Go 1M API State
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const latestKnownIssueRef = useRef<string>(loadResults()[0]?.period || '');

  // Betting Controls for Win Go
  const [selectedBet, setSelectedBet] = useState<BetSelection | null>(null);
  const [stake, setStake] = useState<number>(100);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'info' | 'success' | 'warning' | 'error', title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Generic Balance Updater for all playable mini games (Aviator, Boom, Cricket, Fortune Gems, Wheel)
  const handleUpdateBalance = useCallback(
    (nextBalance: number, delta: number, description: string) => {
      setBalance(nextBalance);
      saveBalance(nextBalance);

      const historyPoint: BalancePoint = {
        period: currentPeriod.slice(-5),
        balance: nextBalance,
        timestamp: Date.now(),
        delta,
      };

      setBalanceHistory((h) => {
        const updated = [...h, historyPoint];
        saveBalanceHistory(updated);
        return updated;
      });

      // Update lifetime stats
      if (delta > 0) {
        setStats((prev) => {
          const updated = {
            ...prev,
            totalPredictions: prev.totalPredictions + 1,
            wins: prev.wins + 1,
            totalPayout: prev.totalPayout + delta,
            netProfit: prev.netProfit + delta,
          };
          saveStats(updated);
          return updated;
        });
        addToast('success', description, `Virtual balance: ${formatVC(nextBalance)}`);
      } else if (delta < 0) {
        setStats((prev) => {
          const updated = {
            ...prev,
            totalPredictions: prev.totalPredictions + 1,
            totalStake: prev.totalStake + Math.abs(delta),
            losses: prev.losses + 1,
            netProfit: prev.netProfit + delta,
          };
          saveStats(updated);
          return updated;
        });
      }
    },
    [addToast, currentPeriod]
  );

  // Update Settings
  const handleUpdateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    addToast('success', 'Settings updated');
  };

  // Add Demo Credits
  const handleAddCredits = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const next = prev + amount;
        saveBalance(next);
        const newPt: BalancePoint = {
          period: currentPeriod,
          balance: next,
          timestamp: Date.now(),
          delta: amount,
        };
        setBalanceHistory((h) => {
          const updated = [...h, newPt];
          saveBalanceHistory(updated);
          return updated;
        });
        return next;
      });
      addToast('success', `Added ${formatVC(amount)}`, 'Virtual demo credits added to account');
    },
    [currentPeriod, addToast]
  );

  // Reset Demo Data
  const handleConfirmReset = () => {
    resetAllDemoData();
    setBalance(INITIAL_BALANCE);
    saveBalance(INITIAL_BALANCE);
    setPredictions([]);
    setResults(loadResults());
    const newStats = {
      totalRounds: 0,
      totalPredictions: 0,
      wins: 0,
      losses: 0,
      totalStake: 0,
      totalPayout: 0,
      netProfit: 0,
    };
    setStats(newStats);
    saveStats(newStats);
    setPreset(null);
    savePreset(null);
    setAllPresets(DEFAULT_PRESETS);
    saveAllPresets(DEFAULT_PRESETS);
    const initialHistory: BalancePoint[] = [
      {
        period: 'Reset',
        balance: INITIAL_BALANCE,
        timestamp: Date.now(),
        delta: 0,
      },
    ];
    setBalanceHistory(initialHistory);
    saveBalanceHistory(initialHistory);
    setIsResetConfirmOpen(false);
    addToast('info', 'Demo Reset Complete', 'Virtual balance reset to ₹10,000 VC');
  };

  // Switch Game Mode for Win Go
  const handleSelectGameMode = (newMode: GameModeId) => {
    if (newMode === gameMode) return;
    setGameMode(newMode);
    saveGameMode(newMode);
    const modeConfig = GAME_MODES.find((m) => m.id === newMode) || GAME_MODES[0];
    setTimeLeft(modeConfig.durationSeconds);
    roundTargetEndTime.current = Date.now() + modeConfig.durationSeconds * 1000;
    const nextP = generateNextPeriod(undefined, newMode);
    setCurrentPeriod(nextP);
    setSelectedBet(null);
    addToast('info', `Switched to ${modeConfig.name}`, `${modeConfig.durationSeconds}s simulation round`);
  };

  // Place Demo Prediction in Win Go
  const handlePlacePrediction = () => {
    if (!selectedBet) {
      addToast('warning', 'Selection Required', 'Please pick a colour, number, or size.');
      return;
    }

    if (timeLeft <= 5) {
      addToast('error', 'Round Locked', 'Predictions are locked for the current period.');
      return;
    }

    if (stake < 10) {
      addToast('error', 'Minimum Stake', 'Minimum prediction is ₹10 Virtual Credits.');
      return;
    }

    if (stake > balance) {
      addToast('error', 'Insufficient Credits', 'You do not have enough virtual credits for this stake.');
      return;
    }

    const nextBalance = balance - stake;
    setBalance(nextBalance);
    saveBalance(nextBalance);

    const newPrediction: Prediction = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      period: currentPeriod,
      gameMode,
      category: selectedBet.category,
      value: selectedBet.value,
      label: selectedBet.label,
      stake,
      timestamp: Date.now(),
      multiplier: selectedBet.payoutMultiplier,
    };

    const updatedPredictions = [newPrediction, ...predictions];
    setPredictions(updatedPredictions);
    savePredictions(updatedPredictions);

    playSound.placeBet(settings.soundEnabled);

    addToast(
      'success',
      'Prediction Placed!',
      `Staked ${formatVC(stake)} on ${selectedBet.label} for Period #${currentPeriod.slice(-5)}`
    );

    setSelectedBet(null);
  };

  // Open Admin for a specific game
  const handleOpenAdminForGame = (
    tab: 'wingo' | 'aviator' | 'chickenroad' | 'boom' | 'cricket' | 'fortunegems' | 'wheel' = 'wingo'
  ) => {
    setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  // Update All Games Presets from Admin Panel
  const handleUpdateAllPresets = (newPresets: AllGamesPresets) => {
    setAllPresets(newPresets);
    saveAllPresets(newPresets);
    setPreset(newPresets.wingo);
    savePreset(newPresets.wingo);
    playSound.presetAction(settings.soundEnabled);
    addToast('success', 'Demo Presets Updated', 'Simulation outcome armed for next round');
  };

  // Set / Clear Win Go Admin Preset
  const handleSetPreset = (newPreset: AdminPreset) => {
    const updated = { ...allPresets, wingo: newPreset };
    setAllPresets(updated);
    saveAllPresets(updated);
    setPreset(newPreset);
    savePreset(newPreset);
    playSound.presetAction(settings.soundEnabled);
    addToast(
      'success',
      'Demo Result Preset Successfully',
      `Armed Number: ${newPreset.number} (${newPreset.colour}) for Period #${newPreset.period}`
    );
  };

  const handleClearPreset = () => {
    const updated = { ...allPresets, wingo: null };
    setAllPresets(updated);
    saveAllPresets(updated);
    setPreset(null);
    savePreset(null);
    playSound.presetAction(settings.soundEnabled);
    addToast('info', 'Preset Cleared', 'Simulation will generate a transparent random outcome');
  };

  // Individual Game Preset Consumers
  const handleConsumeAviatorPreset = useCallback(() => {
    setAllPresets((prev) => {
      const updated = { ...prev, aviatorCrashMultiplier: null };
      saveAllPresets(updated);
      return updated;
    });
  }, []);

  const handleConsumeBoomPreset = useCallback(() => {
    setAllPresets((prev) => {
      const updated = { ...prev, boomOutcome: null };
      saveAllPresets(updated);
      return updated;
    });
  }, []);

  const handleConsumeCricketPreset = useCallback(() => {
    setAllPresets((prev) => {
      const updated = { ...prev, cricketOutcome: null };
      saveAllPresets(updated);
      return updated;
    });
  }, []);

  const handleConsumeFortuneGemsPreset = useCallback(() => {
    setAllPresets((prev) => {
      const updated = { ...prev, fortuneGemsSymbol: null, fortuneGemsMultiplier: null };
      saveAllPresets(updated);
      return updated;
    });
  }, []);

  const handleConsumeWheelPreset = useCallback(() => {
    setAllPresets((prev) => {
      const updated = { ...prev, luckyWheelPrize: null };
      saveAllPresets(updated);
      return updated;
    });
  }, []);

  const handleConsumeChickenPreset = useCallback(() => {
    setAllPresets((prev) => {
      const updated = { ...prev, chickenRoadOutcome: null };
      saveAllPresets(updated);
      return updated;
    });
  }, []);

  // End of Round Execution for Win Go
  const completeCurrentRound = useCallback(() => {
    const currentConfig = GAME_MODES.find((m) => m.id === gameMode) || GAME_MODES[0];
    const periodToSettle = currentPeriod;

    let resultNumber: number;
    let wasPreset = false;

    if (preset && (preset.period === periodToSettle || !preset.period)) {
      resultNumber = preset.number;
      wasPreset = true;
    } else {
      resultNumber = generateRandomResultNumber();
    }

    const resultColour = calculateColour(resultNumber);
    const resultSize = calculateSize(resultNumber);

    const roundPredictions = predictions.filter((p) => p.period === periodToSettle);
    const settlements = settlePredictions(
      roundPredictions,
      resultNumber,
      resultColour,
      resultSize
    );

    const totalPayout = settlements.reduce((sum, s) => sum + s.payout, 0);
    const totalStakeInRound = settlements.reduce((sum, s) => sum + s.stake, 0);
    const netRoundProfit = totalPayout - totalStakeInRound;

    let nextBalance = balance;
    if (totalPayout > 0) {
      nextBalance = balance + totalPayout;
      setBalance(nextBalance);
      saveBalance(nextBalance);
    }

    const newStats = {
      totalRounds: stats.totalRounds + 1,
      totalPredictions: stats.totalPredictions + roundPredictions.length,
      wins: stats.wins + settlements.filter((s) => s.won).length,
      losses: stats.losses + settlements.filter((s) => !s.won).length,
      totalStake: stats.totalStake + totalStakeInRound,
      totalPayout: stats.totalPayout + totalPayout,
      netProfit: stats.netProfit + netRoundProfit,
    };
    setStats(newStats);
    saveStats(newStats);

    const historyPoint: BalancePoint = {
      period: periodToSettle.slice(-5),
      balance: nextBalance,
      timestamp: Date.now(),
      delta: netRoundProfit,
    };
    setBalanceHistory((h) => {
      const updated = [...h, historyPoint];
      saveBalanceHistory(updated);
      return updated;
    });

    const newResult: RoundResult = {
      period: periodToSettle,
      gameMode,
      number: resultNumber,
      colour: resultColour,
      size: resultSize,
      timestamp: Date.now(),
      isPreset: wasPreset,
      settlements,
      totalPayout,
    };

    setResults((prev) => {
      const updated = [newResult, ...prev];
      saveResults(updated);
      return updated;
    });

    if (wasPreset) {
      setPreset(null);
      savePreset(null);
      setAllPresets((prev) => {
        const updated = { ...prev, wingo: null };
        saveAllPresets(updated);
        return updated;
      });
    }

    if (settlements.some((s) => s.won)) {
      playSound.win(settings.soundEnabled);
    } else if (roundPredictions.length > 0) {
      playSound.loss(settings.soundEnabled);
    }

    // Only popup result modal if user is actively on Win Go or Home
    if (selectedGame === 'wingo' || activeTab === 'home') {
      setCurrentResultModal(newResult);
    }

    const nextPeriodNumber = generateNextPeriod(periodToSettle, gameMode);
    setCurrentPeriod(nextPeriodNumber);

    setTimeLeft(currentConfig.durationSeconds);
    roundTargetEndTime.current = Date.now() + currentConfig.durationSeconds * 1000;
  }, [
    activeTab,
    balance,
    currentPeriod,
    gameMode,
    predictions,
    preset,
    selectedGame,
    settings.soundEnabled,
    stats,
  ]);

  // Live Win Go 1-Minute API Sync Function
  const syncLiveWingoResults = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsLiveLoading(true);
      const liveResults = await fetchLiveWingoHistory();
      if (liveResults && liveResults.length > 0) {
        const latestFinished = liveResults[0];
        setResults(liveResults);
        saveResults(liveResults);
        setLastSyncedAt(Date.now());

        // Check if a new live round has resolved
        if (latestKnownIssueRef.current && latestKnownIssueRef.current !== latestFinished.period) {
          const finishedPeriod = latestFinished.period;
          const userBetsOnRound = predictions.filter((p) => p.period === finishedPeriod);

          if (userBetsOnRound.length > 0) {
            let resNum = latestFinished.number;
            let resColour = latestFinished.colour;
            let resSize = latestFinished.size;
            let wasPreset = false;

            if (preset && (preset.period === finishedPeriod || !preset.period)) {
              resNum = preset.number;
              resColour = calculateColour(resNum);
              resSize = calculateSize(resNum);
              wasPreset = true;
            }

            const settlements = settlePredictions(userBetsOnRound, resNum, resColour, resSize);
            const totalPayout = settlements.reduce((sum, s) => sum + s.payout, 0);
            const totalStakeInRound = settlements.reduce((sum, s) => sum + s.stake, 0);
            const netProfit = totalPayout - totalStakeInRound;

            if (totalPayout > 0) {
              setBalance((prev) => {
                const nextBal = prev + totalPayout;
                saveBalance(nextBal);
                return nextBal;
              });
            }

            setStats((prev) => {
              const updated = {
                ...prev,
                totalRounds: prev.totalRounds + 1,
                totalPredictions: prev.totalPredictions + userBetsOnRound.length,
                wins: prev.wins + settlements.filter((s) => s.won).length,
                losses: prev.losses + settlements.filter((s) => !s.won).length,
                totalStake: prev.totalStake + totalStakeInRound,
                totalPayout: prev.totalPayout + totalPayout,
                netProfit: prev.netProfit + netProfit,
              };
              saveStats(updated);
              return updated;
            });

            if (settlements.some((s) => s.won)) {
              playSound.win(settings.soundEnabled);
            } else {
              playSound.loss(settings.soundEnabled);
            }

            const modalRes: RoundResult = {
              period: finishedPeriod,
              gameMode: 'wingo_1m',
              number: resNum,
              colour: resColour,
              size: resSize,
              timestamp: latestFinished.timestamp,
              isPreset: wasPreset,
              settlements,
              totalPayout,
            };

            setCurrentResultModal(modalRes);

            if (wasPreset) {
              setPreset(null);
              savePreset(null);
              setAllPresets((prev) => ({ ...prev, wingo: null }));
            }
          }
        }

        latestKnownIssueRef.current = latestFinished.period;

        // Current active betting period is the NEXT round
        const nextPeriod = calculateNextPeriodFromLatest(latestFinished.period);
        setCurrentPeriod(nextPeriod);

        if (isManual) {
          addToast('success', 'Live Results Synced', `${liveResults.length} real 1M rounds updated from API`);
        }
      }
    } catch {
      if (isManual) {
        addToast('error', 'Sync Failed', 'Could not reach live API. Stored history preserved.');
      }
    } finally {
      if (isManual) setIsLiveLoading(false);
    }
  }, [addToast, predictions, preset, settings.soundEnabled]);

  // Initial live fetch and periodic background sync every 6 seconds
  useEffect(() => {
    syncLiveWingoResults(false);

    const poller = setInterval(() => {
      syncLiveWingoResults(false);
    }, 6000);

    return () => clearInterval(poller);
  }, [syncLiveWingoResults]);

  // Main Win Go Countdown Loop (Synchronized with real 1-minute clock)
  useEffect(() => {
    const timer = setInterval(() => {
      const currentSecond = new Date().getSeconds();
      const remainingSeconds = 60 - currentSecond;
      const displaySeconds = remainingSeconds === 60 ? 0 : remainingSeconds;

      setTimeLeft(displaySeconds);

      if (displaySeconds <= 10 && displaySeconds > 3 && selectedGame === 'wingo') {
        playSound.tick(settings.soundEnabled);
      } else if (displaySeconds <= 3 && displaySeconds > 0 && selectedGame === 'wingo') {
        playSound.urgentTick(settings.soundEnabled);
      }

      if (displaySeconds === 0) {
        syncLiveWingoResults(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedGame, settings.soundEnabled, syncLiveWingoResults]);

  const currentRoundBets = predictions.filter((p) => p.period === currentPeriod);
  const currentRoundStake = currentRoundBets.reduce((sum, b) => sum + b.stake, 0);

  // Category selection handler
  const handleSelectCategory = (cat: LobbyCategory) => {
    setActiveCategory(cat);
    if (cat === 'lottery') {
      setSelectedGame('wingo');
    } else if (cat === 'slots') {
      setSelectedGame('fortunegems');
    } else if (cat === 'minigame') {
      setSelectedGame('boom');
    } else {
      setSelectedGame(null);
    }
  };

  const isAnyPresetActive =
    !!allPresets.wingo ||
    !!allPresets.aviatorCrashMultiplier ||
    !!allPresets.chickenRoadOutcome ||
    !!allPresets.boomOutcome ||
    !!allPresets.cricketOutcome ||
    !!allPresets.fortuneGemsSymbol ||
    !!allPresets.luckyWheelPrize;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-amber-500/20">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Tashan Win Top Header */}
      <Header
        balance={balance}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          if (t === 'home') setSelectedGame(null);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isPresetActive={isAnyPresetActive}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-lg flex-1 px-3 sm:px-4 py-3 flex flex-col gap-3.5">
        {/* Safety Banner */}
        <SafetyBanner />

        {/* ======================================================== */}
        {/* TAB 1: HOME (LOBBY or PLAYABLE GAME) */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <>
            {/* If a game is active: Render the playable game */}
            {selectedGame === 'aviator' && (
              <AviatorGame
                balance={balance}
                onUpdateBalance={handleUpdateBalance}
                onBackToLobby={() => setSelectedGame(null)}
                soundEnabled={settings.soundEnabled}
                presetMultiplier={allPresets.aviatorCrashMultiplier}
                onConsumePreset={handleConsumeAviatorPreset}
                onOpenAdmin={() => handleOpenAdminForGame('aviator')}
              />
            )}

            {selectedGame === 'chickenroad' && (
              <ChickenRoadGame
                balance={balance}
                onUpdateBalance={handleUpdateBalance}
                onBackToLobby={() => setSelectedGame(null)}
                soundEnabled={settings.soundEnabled}
                presetOutcome={allPresets.chickenRoadOutcome}
                onConsumePreset={handleConsumeChickenPreset}
                onOpenAdmin={() => handleOpenAdminForGame('chickenroad')}
              />
            )}

            {selectedGame === 'boom' && (
              <BoomGame
                balance={balance}
                onUpdateBalance={handleUpdateBalance}
                onBackToLobby={() => setSelectedGame(null)}
                soundEnabled={settings.soundEnabled}
                presetOutcome={allPresets.boomOutcome}
                onConsumePreset={handleConsumeBoomPreset}
                onOpenAdmin={() => handleOpenAdminForGame('boom')}
              />
            )}

            {selectedGame === 'cricket' && (
              <CricketGame
                balance={balance}
                onUpdateBalance={handleUpdateBalance}
                onBackToLobby={() => setSelectedGame(null)}
                soundEnabled={settings.soundEnabled}
                presetOutcome={allPresets.cricketOutcome}
                onConsumePreset={handleConsumeCricketPreset}
                onOpenAdmin={() => handleOpenAdminForGame('cricket')}
              />
            )}

            {selectedGame === 'fortunegems' && (
              <FortuneGemsGame
                balance={balance}
                onUpdateBalance={handleUpdateBalance}
                onBackToLobby={() => setSelectedGame(null)}
                soundEnabled={settings.soundEnabled}
                presetSymbol={allPresets.fortuneGemsSymbol}
                presetMultiplier={allPresets.fortuneGemsMultiplier}
                onConsumePreset={handleConsumeFortuneGemsPreset}
                onOpenAdmin={() => handleOpenAdminForGame('fortunegems')}
              />
            )}

            {selectedGame === 'wingo' && (
              <div className="flex flex-col gap-3.5">
                {/* Back to lobby bar */}
                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 shadow-md">
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Lobby</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-purple-400">
                    <span>🎱 WIN GO LOTTERY</span>
                    <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-500/30">
                      DEMO
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {formatVC(balance)}
                    </span>
                  </div>
                </div>

                {/* Active Win Go Preset Banner */}
                {allPresets.wingo && (
                  <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 p-2.5 px-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="text-base animate-bounce">⚡</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                            WIN GO PRESET ARMED
                          </span>
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-200 border border-amber-500/40 font-mono">
                            #{allPresets.wingo.number} {allPresets.wingo.colour}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Period #{allPresets.wingo.period.slice(-5)} forced to result in {allPresets.wingo.number} ({allPresets.wingo.size})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulation Speed Mode Selector */}
                <GameSelector
                  currentMode={gameMode}
                  onSelectMode={handleSelectGameMode}
                />

                {/* Current Round Live Countdown Card */}
                <CurrentRoundCard
                  gameConfig={currentGameConfig}
                  period={currentPeriod}
                  timeLeft={timeLeft}
                  totalDuration={currentGameConfig.durationSeconds}
                  isPreset={!!preset}
                />

                {/* Active Predictions in this round */}
                <ActivePredictionsList
                  predictions={predictions}
                  currentPeriod={currentPeriod}
                />

                {/* Prediction Options: Colours, Numbers, Sizes */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
                  <PredictionOptions
                    selectedBet={selectedBet}
                    onSelectBet={setSelectedBet}
                    disabled={timeLeft <= 5}
                  />
                </div>

                {/* Demo Stake Selector */}
                <StakeSelector
                  stake={stake}
                  onStakeChange={setStake}
                  balance={balance}
                  disabled={timeLeft <= 5}
                />

                {/* Place Demo Prediction CTA */}
                <PlacePredictionButton
                  selectedBet={selectedBet}
                  stake={stake}
                  balance={balance}
                  isLocked={timeLeft <= 5}
                  onPlacePrediction={handlePlacePrediction}
                />

                {/* Live Win Go 1-Minute Official Results History (All 500 Past Rounds) */}
                <WingoHistorySection
                  results={results}
                  isLoading={isLiveLoading}
                  lastSyncedAt={lastSyncedAt}
                  onRefresh={() => syncLiveWingoResults(true)}
                />
              </div>
            )}

            {/* If NO game is active: Render the Tashan Win Casino Lobby! */}
            {selectedGame === null && (
              <div className="flex flex-col gap-3.5">
                {/* 1. Winning Information Ticker */}
                <WinningTicker />

                {/* 2. Golden Category Navigation */}
                <CategoryNav
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                />

                {/* 3. Recommended Games Grid matching the screenshot! */}
                <RecommendedGamesGrid
                  onSelectGame={(gameId) => setSelectedGame(gameId)}
                  onOpenWheel={() => setIsWheelOpen(true)}
                />

                {/* 4. Virtual Balance & Quick Topup Card */}
                <VirtualBalanceCard
                  balance={balance}
                  netProfit={stats.netProfit}
                  onAddCredits={handleAddCredits}
                  onResetDemo={() => setIsResetConfirmOpen(true)}
                />
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ACTIVITY (Daily Rewards & Quests) */}
        {/* ======================================================== */}
        {activeTab === 'activity' && (
          <ActivityView
            balance={balance}
            onAddCredits={handleAddCredits}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROMOTION (Referral & Partner Simulation) */}
        {/* ======================================================== */}
        {activeTab === 'promotion' && <PromotionView />}

        {/* ======================================================== */}
        {/* TAB 4: ACCOUNT (Matching tsgame2026.com Screenshot) */}
        {/* ======================================================== */}
        {activeTab === 'account' && (
          <ProfileView
            accountId={accountId}
            balance={balance}
            stats={stats}
            results={results}
            predictions={predictions}
            balanceHistory={balanceHistory}
            onAddCredits={handleAddCredits}
            onResetDemo={() => setIsResetConfirmOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Disclaimer Notice */}
        <FooterDisclaimer />
      </main>

      {/* Floating Action Buttons from Screenshot */}
      {activeTab === 'home' && selectedGame === null && (
        <FloatingWidgets onOpenWheel={() => setIsWheelOpen(true)} />
      )}

      {/* Result Modal for Win Go */}
      {currentResultModal && (
        <ResultModal
          result={currentResultModal}
          onClose={() => setCurrentResultModal(null)}
        />
      )}

      {/* Interactive Lucky Wheel Modal ("Get ₹500" from screenshot) */}
      <LuckyWheelModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onReward={(reward) => handleAddCredits(reward)}
        soundEnabled={settings.soundEnabled}
        presetPrize={allPresets.luckyWheelPrize}
        onConsumePreset={handleConsumeWheelPreset}
        onOpenAdmin={() => handleOpenAdminForGame('wheel')}
      />

      {/* Admin Demo Simulation Controls Modal */}
      {isAdminOpen && (
        <AdminDemoPanel
          currentPeriod={currentPeriod}
          currentMode={gameMode}
          timeLeft={timeLeft}
          activePredictionsCount={currentRoundBets.length}
          activeStakeTotal={currentRoundStake}
          balance={balance}
          allPresets={allPresets}
          onUpdatePresets={handleUpdateAllPresets}
          onClose={() => setIsAdminOpen(false)}
          initialGameTab={adminInitialTab}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onAddCredits={handleAddCredits}
          onResetDemo={() => setIsResetConfirmOpen(true)}
          onClearHistory={() => {
            setResults([]);
            saveResults([]);
            setPredictions([]);
            savePredictions([]);
            addToast('info', 'History Cleared', 'Round and prediction histories emptied');
          }}
          onOpenAdmin={() => handleOpenAdminForGame('wingo')}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Mobile Fixed Bottom Navigation matching screenshot */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') setSelectedGame(null);
        }}
        onOpenWheel={() => setIsWheelOpen(true)}
        onOpenAdmin={() => handleOpenAdminForGame('wingo')}
        isPresetActive={isAnyPresetActive}
      />
    </div>
  );
}
