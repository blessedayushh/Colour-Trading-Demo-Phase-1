import React, { useState } from 'react';
import {
  User,
  Shield,
  Copy,
  Check,
  RotateCw,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Crown,
  FileText,
  Receipt,
  Download,
  Upload,
  Bell,
  Gift,
  Ticket,
  BarChart2,
  Globe,
  Settings,
  MessageSquare,
  Megaphone,
  Headphones,
  BookOpen,
  Box,
  Power,
  X,
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { UserStats, RoundResult, Prediction, BalancePoint } from '../types/game';
import { formatVC, getColourTailwind } from '../utils/gameLogic';

interface ProfileViewProps {
  accountId: string;
  balance: number;
  stats: UserStats;
  results?: RoundResult[];
  predictions?: Prediction[];
  balanceHistory?: BalancePoint[];
  onAddCredits: (amount: number) => void;
  onResetDemo: () => void;
  onOpenSettings?: () => void;
}

type ActiveModal =
  | 'none'
  | 'wallet'
  | 'deposit'
  | 'withdraw'
  | 'vip'
  | 'gameHistory'
  | 'transactions'
  | 'notifications'
  | 'gifts'
  | 'coupons'
  | 'statistics'
  | 'language'
  | 'feedback'
  | 'announcements'
  | 'customerService'
  | 'guide'
  | 'about';

export const ProfileView: React.FC<ProfileViewProps> = ({
  accountId,
  balance,
  stats,
  results = [],
  predictions = [],
  balanceHistory = [],
  onAddCredits,
  onResetDemo,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [notificationCount, setNotificationCount] = useState(8);
  const [selectedLang, setSelectedLang] = useState('English');
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Formatted UID derived from accountId
  const uid = accountId.replace(/\D/g, '') || '6633799';
  const username = `MEMBERNNGSOS9J`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleClaimGift = () => {
    if (!giftClaimed) {
      onAddCredits(888);
      setGiftClaimed(true);
    }
  };

  const handleExecuteWithdraw = () => {
    const amt = parseInt(withdrawAmount, 10);
    if (!isNaN(amt) && amt > 0 && amt <= balance) {
      onAddCredits(-amt);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setActiveModal('none');
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-8 text-slate-100">
      {/* 1. TOP USER INFO HEADER */}
      <div className="flex items-center gap-3.5 px-1 pt-1">
        {/* Avatar with styled circle and portrait illustration */}
        <div className="relative shrink-0">
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-slate-700 bg-gradient-to-tr from-slate-800 via-purple-900 to-slate-800 shadow-xl flex items-center justify-center">
            {/* High fidelity stylized silhouette profile */}
            <svg viewBox="0 0 100 100" className="h-full w-full object-cover">
              <defs>
                <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="#1e293b" />
              {/* Soft background glow */}
              <circle cx="50" cy="40" r="28" fill="url(#avatarGrad)" opacity="0.35" />
              {/* Silhouette head */}
              <circle cx="50" cy="38" r="18" fill="#e2e8f0" />
              {/* Hair styling */}
              <path d="M 32 36 Q 48 18 68 36 Q 70 54 62 58 Q 50 62 38 58 Z" fill="#0f172a" />
              {/* Shoulders */}
              <path d="M 22 84 C 22 62, 36 58, 50 58 C 64 58, 78 62, 78 84 Z" fill="#cbd5e1" />
            </svg>
          </div>
          {/* VIP Badge icon overlay */}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 border border-slate-950 flex items-center justify-center shadow">
            <Crown className="h-3 w-3 text-slate-950 fill-current" />
          </div>
        </div>

        {/* User Identity Details */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-wide truncate">
              {username}
            </span>
            {/* VIP1 Badge matching screenshot */}
            <div className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-2 py-0.5 text-[9px] font-black text-white shadow-sm border border-blue-400/40 shrink-0">
              <Shield className="h-2.5 w-2.5 fill-current" />
              <span>VIP1</span>
            </div>
          </div>

          {/* UID with copy button */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-mono">
            <span>UID</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-bold">{uid}</span>
            <button
              onClick={handleCopy}
              className="text-amber-400 hover:text-amber-300 transition-colors p-0.5"
              title="Copy UID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-amber-400" />
              )}
            </button>
          </div>

          {/* Last Login Timestamp matching screenshot */}
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            Last login: 2026-10-07 16:57:14
          </span>
        </div>
      </div>

      {/* 2. TOTAL BALANCE CARD WITH ENTER WALLET */}
      <div className="rounded-2xl border border-slate-800 bg-[#161a23] p-4 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400">Total balance</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-white">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                onClick={handleRefreshBalance}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Refresh Balance"
              >
                <RotateCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Enter wallet button matching screenshot */}
          <button
            onClick={() => setActiveModal('wallet')}
            className="rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md active:scale-95 transition-all"
          >
            Enter wallet
          </button>
        </div>

        {/* 4 Quick Action Icons Row */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-800/80 pt-3">
          {/* ARWallet */}
          <button
            onClick={() => setActiveModal('wallet')}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
              ARWallet
            </span>
          </button>

          {/* Deposit */}
          <button
            onClick={() => setActiveModal('deposit')}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-sm">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
              Deposit
            </span>
          </button>

          {/* Withdraw */}
          <button
            onClick={() => setActiveModal('withdraw')}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-sm">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
              Withdraw
            </span>
          </button>

          {/* VIP */}
          <button
            onClick={() => setActiveModal('vip')}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-sm">
              <Crown className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
              VIP
            </span>
          </button>
        </div>
      </div>

      {/* 3. 2x2 HISTORY QUICK GRID */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Game History */}
        <button
          onClick={() => setActiveModal('gameHistory')}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98] group"
        >
          <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Game History</span>
            <span className="text-[10px] text-slate-500 block truncate">My game history</span>
          </div>
        </button>

        {/* Transaction */}
        <button
          onClick={() => setActiveModal('transactions')}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98] group"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Transaction</span>
            <span className="text-[10px] text-slate-500 block truncate">My transaction history</span>
          </div>
        </button>

        {/* Deposit History */}
        <button
          onClick={() => setActiveModal('deposit')}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98] group"
        >
          <div className="h-9 w-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Deposit</span>
            <span className="text-[10px] text-slate-500 block truncate">My deposit history</span>
          </div>
        </button>

        {/* Withdraw History */}
        <button
          onClick={() => setActiveModal('withdraw')}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98] group"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <Upload className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Withdraw</span>
            <span className="text-[10px] text-slate-500 block truncate">My withdraw history</span>
          </div>
        </button>
      </div>

      {/* 4. MENU OPTIONS LIST CARD */}
      <div className="rounded-2xl border border-slate-800 bg-[#161a23] divide-y divide-slate-800/80 overflow-hidden shadow-lg">
        {/* Notification */}
        <button
          onClick={() => setActiveModal('notifications')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">Notification</span>
          </div>
          <div className="flex items-center gap-2">
            {notificationCount > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center">
                {notificationCount}
              </span>
            )}
            <span className="text-slate-600 text-sm font-bold">›</span>
          </div>
        </button>

        {/* Gifts */}
        <button
          onClick={() => setActiveModal('gifts')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Gift className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">Gifts</span>
          </div>
          <span className="text-slate-600 text-sm font-bold">›</span>
        </button>

        {/* My Top-Up Coupons */}
        <button
          onClick={() => setActiveModal('coupons')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Ticket className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">My Top-Up Coupons</span>
          </div>
          <span className="text-slate-600 text-sm font-bold">›</span>
        </button>

        {/* Game statistics */}
        <button
          onClick={() => setActiveModal('statistics')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart2 className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">Game statistics</span>
          </div>
          <span className="text-slate-600 text-sm font-bold">›</span>
        </button>

        {/* Language */}
        <button
          onClick={() => setActiveModal('language')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">Language</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">{selectedLang}</span>
            <span className="text-slate-600 text-sm font-bold">›</span>
          </div>
        </button>
      </div>

      {/* 5. SERVICE CENTER (3x2 GRID) */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-xs font-bold text-slate-400 px-1">Service center</span>

        <div className="grid grid-cols-3 gap-2">
          {/* Settings */}
          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else setActiveModal('none');
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 gap-2 transition-all group"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Settings</span>
          </button>

          {/* Feedback */}
          <button
            onClick={() => setActiveModal('feedback')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 gap-2 transition-all group"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Feedback</span>
          </button>

          {/* Announcement */}
          <button
            onClick={() => setActiveModal('announcements')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 gap-2 transition-all group"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Megaphone className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Announcement</span>
          </button>

          {/* Customer Service */}
          <button
            onClick={() => setActiveModal('customerService')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 gap-2 transition-all group"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 text-center">
              Customer Service
            </span>
          </button>

          {/* Beginner's Guide */}
          <button
            onClick={() => setActiveModal('guide')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 gap-2 transition-all group"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 text-center">
              Beginner's Guide
            </span>
          </button>

          {/* About us */}
          <button
            onClick={() => setActiveModal('about')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#161a23] border border-slate-800 hover:border-slate-700 gap-2 transition-all group"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Box className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">About us</span>
          </button>
        </div>
      </div>

      {/* 6. LOG OUT OUTLINED BUTTON */}
      <div className="pt-2">
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-amber-600/70 bg-transparent text-amber-400 hover:bg-amber-500/10 active:scale-98 transition-all font-bold text-sm shadow-sm"
        >
          <Power className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS FOR ALL ACCOUNT FEATURES */}
      {/* ======================================================== */}

      {/* 1. WALLET MODAL */}
      {activeModal === 'wallet' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">ARWallet & Balance</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Available Demo Balance</span>
              <span className="font-mono text-2xl font-black text-amber-400">
                {formatVC(balance)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                UID: {uid} · Fast Instant Settlements
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveModal('deposit')}
                className="py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors"
              >
                Deposit Credits
              </button>
              <button
                onClick={() => setActiveModal('withdraw')}
                className="py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Withdraw Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEPOSIT MODAL */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Quick Demo Top-Up</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select virtual credit top-up pack to instantly reload your demo wallet:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[500, 1000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    onAddCredits(amt);
                    setActiveModal('none');
                  }}
                  className="p-3 rounded-2xl border border-slate-800 bg-slate-950 hover:border-amber-500/50 hover:bg-amber-500/10 text-center transition-all group"
                >
                  <span className="font-mono text-base font-black text-white group-hover:text-amber-300 block">
                    +₹{amt.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Instant VC</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. WITHDRAW MODAL */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-black text-white">Simulated Withdraw</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 flex flex-col items-center gap-2 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-400 animate-bounce" />
                <span className="text-sm font-black text-white">Withdrawal Successful!</span>
                <span className="text-xs text-slate-400">
                  ₹{withdrawAmount} demo funds released to simulated account.
                </span>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold">Withdraw Amount (₹)</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    Current balance: {formatVC(balance)}
                  </span>
                </div>

                <button
                  onClick={handleExecuteWithdraw}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors shadow-md"
                >
                  Confirm Withdraw
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. VIP MODAL */}
      {activeModal === 'vip' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">VIP Club Level 1</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white">CURRENT TIER: VIP 1</span>
                <span className="text-[10px] font-mono text-indigo-300">Next: VIP 2 (85%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[85%]" />
              </div>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                Enjoy priority settlements, exclusive daily wheel bonus multipliers, and zero-fee virtual transfers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. GAME HISTORY MODAL */}
      {activeModal === 'gameHistory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[85vh] rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-black text-white">My Game History</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 pr-1 max-h-[60vh]">
              {predictions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No prediction history yet. Place a bet in Win Go to view records!
                </div>
              ) : (
                predictions.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white">
                          #{p.period.slice(-5)}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300 font-bold">
                          {p.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-white block">
                        ₹{p.stake.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-400">{p.multiplier}× payout</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. TRANSACTIONS MODAL */}
      {activeModal === 'transactions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[85vh] rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Transaction History</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 pr-1 max-h-[60vh]">
              {balanceHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No transaction records yet.
                </div>
              ) : (
                balanceHistory.slice().reverse().map((pt, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {pt.delta >= 0 ? 'Credit Added' : 'Bet Staked'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(pt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className={`text-xs font-black block ${
                          pt.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pt.delta >= 0 ? `+₹${pt.delta.toLocaleString()}` : `-₹${Math.abs(pt.delta).toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Bal: ₹{pt.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Notifications ({notificationCount})</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
              {[
                { title: 'Daily Login Reward Ready', desc: 'Claim your daily virtual credits reward now!', time: '10m ago' },
                { title: 'Live Win Go 1M Sync Active', desc: '500 official live rounds are now streaming directly.', time: '25m ago' },
                { title: 'VIP1 Tier Unlocked', desc: 'Congratulations on achieving VIP1 status on Tashan Win.', time: '1h ago' },
              ].map((n, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{n.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setNotificationCount(0)}
              className="py-2 text-xs font-bold text-amber-400 hover:text-amber-300 text-center"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}

      {/* 8. GIFTS MODAL */}
      {activeModal === 'gifts' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Daily Mystery Gift</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 flex flex-col items-center gap-2">
              <span className="text-5xl animate-bounce">🎁</span>
              <span className="text-sm font-black text-white">Daily VIP Bonus Box</span>
              <p className="text-xs text-slate-400">
                Claim your special ₹888 Virtual Credits gift today!
              </p>
            </div>

            <button
              onClick={handleClaimGift}
              disabled={giftClaimed}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                giftClaimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-md'
              }`}
            >
              {giftClaimed ? 'Gift Claimed Today ✓' : 'Open & Claim ₹888 VC'}
            </button>
          </div>
        </div>
      )}

      {/* 9. COUPONS MODAL */}
      {activeModal === 'coupons' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">My Top-Up Coupons</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-amber-300 block">BONUS +20% VC</span>
                  <span className="text-[10px] text-slate-400">Valid on all virtual topups</span>
                </div>
                <span className="font-mono text-xs font-black text-white bg-slate-950 px-2 py-1 rounded-lg">
                  WIN20
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. STATISTICS MODAL */}
      {activeModal === 'statistics' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Game Statistics</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">TOTAL ROUNDS</span>
                <span className="font-mono text-base font-black text-white">{stats.totalPredictions}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">WIN RATE</span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {stats.totalPredictions > 0
                    ? ((stats.wins / stats.totalPredictions) * 100).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">TOTAL WINS</span>
                <span className="font-mono text-base font-black text-emerald-400">{stats.wins}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">TOTAL LOSSES</span>
                <span className="font-mono text-base font-black text-rose-400">{stats.losses}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. LANGUAGE MODAL */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Select Language</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {['English', 'हिन्दी (Hindi)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'বাংলা (Bengali)'].map(
                (lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang.split(' ')[0]);
                      setActiveModal('none');
                    }}
                    className={`p-3 rounded-xl text-left text-xs font-bold transition-colors ${
                      selectedLang === lang.split(' ')[0]
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800'
                    }`}
                  >
                    {lang}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 12. CUSTOMER SERVICE MODAL */}
      {activeModal === 'customerService' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">24/7 Live Customer Service</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-3 flex flex-col gap-2 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">🎧</span>
                <div>
                  <span className="font-bold text-white block">Online Support Agent</span>
                  <span className="text-[10px] text-emerald-400 font-mono">● Online & Ready to help</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect with our simulated VIP concierge for account inquiries, rules assistance, or demo balance reload help.
              </p>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors"
            >
              Start Live Chat
            </button>
          </div>
        </div>
      )}

      {/* 13. ABOUT & GUIDE MODAL */}
      {(activeModal === 'about' || activeModal === 'guide' || activeModal === 'announcements' || activeModal === 'feedback') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white capitalize">
                {activeModal === 'guide'
                  ? "Beginner's Guide"
                  : activeModal === 'about'
                  ? 'About Tashan Win'
                  : activeModal === 'feedback'
                  ? 'Feedback & Suggestions'
                  : 'Announcements'}
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 py-2">
              {activeModal === 'guide' && (
                <>
                  <p className="font-bold text-white">How to Play Win Go 1 Minute:</p>
                  <p className="text-[11px] text-slate-400">
                    1. Select Colour (Green, Red, Violet), Number (0–9), or Size (Big/Small).
                  </p>
                  <p className="text-[11px] text-slate-400">
                    2. Numbers 1, 3, 7, 9 are Green (2×). Numbers 2, 4, 6, 8 are Red (2×). Numbers 0 and 5 are Violet (4.5×).
                  </p>
                  <p className="text-[11px] text-slate-400">
                    3. Exact Number matches pay 9×!
                  </p>
                </>
              )}

              {activeModal === 'about' && (
                <>
                  <p className="font-bold text-white">Tashan Win Simulation Gaming</p>
                  <p className="text-[11px] text-slate-400">
                    Licensed virtual entertainment and demonstration gaming platform using Virtual Credits (VC). Completely non-monetary and safe.
                  </p>
                </>
              )}

              {activeModal === 'feedback' && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-slate-400">Send us your feedback or suggestions:</p>
                  <textarea
                    rows={3}
                    placeholder="Enter your comments here..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => setActiveModal('none')}
                    className="py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}

              {activeModal === 'announcements' && (
                <>
                  <p className="font-bold text-amber-300">🎉 Live 1-Minute API Sync Now Online</p>
                  <p className="text-[11px] text-slate-400">
                    500 official historical rounds and real-time live clock countdown have been integrated!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
