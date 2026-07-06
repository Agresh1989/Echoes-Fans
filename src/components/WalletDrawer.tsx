import React, { useState } from "react";
import { Wallet, LogOut, Copy, Check, Shield, Zap, RefreshCw, Briefcase, TrendingUp, BarChart2, Coins, Flame } from "lucide-react";
import { WalletState, Story } from "../types";

interface WalletDrawerProps {
  wallet: WalletState;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  onAddFunds: () => void;
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
}

export default function WalletDrawer({
  wallet,
  onConnect,
  onDisconnect,
  onAddFunds,
  isOpen,
  onClose,
  stories = [],
}: WalletDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [authMethod, setAuthMethod] = useState<"privy" | "wallet" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const MOCK_WALLETS = [
    "7xKXvS2gY9zpH3RkJwA90sL9Q1K6fL2yS",
    "9sXyH8Jp4nKqB9L5rQ9K3vA0sS7dF8g9",
    "D9zRPq45vS2gH3RjKwA90sL9Q1K6fL2y",
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startConnection = (method: "privy" | "wallet") => {
    setIsConnecting(true);
    setAuthMethod(method);
    setTimeout(() => {
      const randomWallet = MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)];
      onConnect(randomWallet);
      setIsConnecting(false);
    }, 1200);
  };

  // 1. Calculate owned shares and royalties from central story registry
  const getPortfolioData = () => {
    if (!wallet.connected || !wallet.address) {
      return { totalShares: 0, totalValue: 0, totalRoyalties: 0, ownedList: [] };
    }

    let totalSharesOwned = 0;
    let totalPortfolioVal = 0;
    let totalRoyaltyEarned = 0;
    const ownedAssetList: { id: string; title: string; symbol: string; shares: number; price: number; value: number }[] = [];

    stories.forEach((story) => {
      let userShares = 0;
      story.bids.forEach((trade) => {
        if (trade.traderAddress.toLowerCase() === wallet.address.toLowerCase()) {
          if (trade.type === "BUY") {
            userShares += trade.shares;
          } else if (trade.type === "SELL") {
            userShares -= trade.shares;
          }
        }
      });

      if (userShares > 0) {
        totalSharesOwned += userShares;
        const currentVal = userShares * story.price;
        totalPortfolioVal += currentVal;
        ownedAssetList.push({
          id: story.id,
          title: story.title,
          symbol: story.symbol,
          shares: userShares,
          price: story.price,
          value: currentVal,
        });
      }

      // Royalties collected if user is creator
      if (story.creatorAddress.toLowerCase() === wallet.address.toLowerCase()) {
        totalRoyaltyEarned += story.royaltyPaid;
      }
    });

    return {
      totalShares: totalSharesOwned,
      totalValue: totalPortfolioVal,
      totalRoyalties: totalRoyaltyEarned,
      ownedList: ownedAssetList,
    };
  };

  const { totalShares, totalValue, totalRoyalties, ownedList } = getPortfolioData();

  // Create a wavy trend of past 7 points for sparkline based on current portfolio value
  const generateSparklinePoints = (val: number) => {
    // If value is 0, show a subtle baseline, otherwise scale beautifully
    const base = val > 0 ? val : 0;
    if (base === 0) {
      return [0, 0, 0, 0, 0, 0, 0];
    }
    return [
      base * 0.85,
      base * 0.94,
      base * 0.89,
      base * 1.08,
      base * 1.01,
      base * 0.95,
      base,
    ];
  };

  const sparkData = generateSparklinePoints(totalValue);
  const minVal = Math.min(...sparkData);
  const maxVal = Math.max(...sparkData);
  const range = maxVal - minVal || 1;

  // Map 7 points to a viewBox of width=180, height=40
  const pointsString = sparkData
    .map((d, i) => {
      const x = (i / (sparkData.length - 1)) * 180;
      // If totalValue is 0, render a flat line at height=32, otherwise scale y
      const y = totalValue === 0 ? 32 : 40 - ((d - minVal) / range) * 32 - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPointsString = `${pointsString} 180,40 0,40`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="wallet-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col justify-between">
        {/* Scrollable container for main content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Identity & Wallet</h3>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-neutral-900 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Connection State */}
          {!wallet.connected ? (
            <div className="py-8 flex flex-col gap-6">
              <div className="text-center">
                <p className="text-neutral-300 text-sm">
                  Log in to secure your stories, create audio collectibles, and earn royalties permanently.
                </p>
              </div>

              {isConnecting ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
                  <p className="text-neutral-400 text-xs">
                    {authMethod === "privy"
                      ? "Verifying Privy secure passkey..."
                      : "Connecting Solana wallet adapter..."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Privy Authentication */}
                  <button
                    onClick={() => startConnection("privy")}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/15 transition-all active:scale-[0.98]"
                    id="btn-privy-auth"
                  >
                    <Shield className="w-5 h-5" />
                    Secure Login with Privy
                  </button>

                  <div className="flex items-center justify-center gap-2 my-1">
                    <span className="h-px bg-neutral-800 flex-1"></span>
                    <span className="text-neutral-500 text-xs uppercase tracking-wider">or</span>
                    <span className="h-px bg-neutral-800 flex-1"></span>
                  </div>

                  {/* Web3 Solana Wallet Adapter */}
                  <button
                    onClick={() => startConnection("wallet")}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    id="btn-solana-wallet"
                  >
                    <Wallet className="w-5 h-5 text-teal-400" />
                    Connect Solana Wallet
                  </button>
                </div>
              )}

              {/* Secure Footnote */}
              <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800 flex gap-3">
                <Shield className="w-5 h-5 text-neutral-400 shrink-0" />
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Echoes operates a non-custodial interface. Your passkeys are stored securely via multi-party computation (MPC) and audited by top tier research teams.
                </p>
              </div>
            </div>
          ) : (
            /* Connected Content */
            <div className="flex flex-col gap-6">
              {/* Account Card */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-neutral-400 text-xs uppercase tracking-wider font-semibold">
                      Connected
                    </span>
                  </div>
                  <button
                    onClick={onDisconnect}
                    className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Solana Public Key */}
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-neutral-850 mb-4">
                  <span className="font-mono text-xs text-neutral-300">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-neutral-400 hover:text-white transition-colors p-1"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Balance Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-850">
                  <div>
                    <span className="text-neutral-500 text-xxs uppercase tracking-wider font-semibold">
                      Solana Balance
                    </span>
                    <p className="text-2xl font-bold text-white mt-1">
                      {wallet.balance.toFixed(2)}{" "}
                      <span className="text-xs text-teal-400 font-semibold font-mono">SOL</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-xxs uppercase tracking-wider font-semibold">
                      Echo Points
                    </span>
                    <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
                      {wallet.points}{" "}
                      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio & Performance Card */}
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-teal-400" />
                    <span className="text-xs uppercase tracking-wider font-bold text-white">
                      Creator Portfolio
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-neutral-800/60 text-xxs text-neutral-400 rounded-full border border-neutral-700/50 font-mono">
                    7D History
                  </span>
                </div>

                {/* Portfolio Value Sparkline */}
                <div className="flex flex-col gap-1 bg-black/40 p-3 rounded-xl border border-neutral-850">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xxs text-neutral-400 uppercase tracking-wider">
                      Portfolio Asset Valuation
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-400">
                      {totalValue.toFixed(3)} SOL
                    </span>
                  </div>

                  <div className="h-16 w-full flex items-end pt-2 relative">
                    {totalValue > 0 ? (
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 180 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area fill */}
                        <polygon points={areaPointsString} fill="url(#sparkline-grad)" />
                        {/* Line path */}
                        <polyline
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsString}
                        />
                      </svg>
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center">
                        <svg className="w-full h-full opacity-10" viewBox="0 0 180 40" preserveAspectRatio="none">
                          <line x1="0" y1="20" x2="180" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                        </svg>
                        <span className="absolute text-[10px] text-neutral-500 font-medium">
                          No active shares in portfolio
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio KPI Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-850 flex flex-col gap-0.5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium flex items-center gap-1">
                      <Coins className="w-3 h-3 text-purple-400" />
                      Owned Keys
                    </span>
                    <p className="text-lg font-bold text-white mt-1">
                      {totalShares}{" "}
                      <span className="text-[10px] text-neutral-400 font-normal">Shares</span>
                    </p>
                  </div>

                  <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-850 flex flex-col gap-0.5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                      Royalties Paid
                    </span>
                    <p className="text-lg font-bold text-white mt-1 font-mono text-orange-400">
                      {totalRoyalties.toFixed(3)}{" "}
                      <span className="text-[10px] text-neutral-400 font-normal font-sans">SOL</span>
                    </p>
                  </div>
                </div>

                {/* Owned Asset Details List */}
                {ownedList.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/40">
                    <span className="text-xxs text-neutral-500 uppercase tracking-wider font-bold">
                      Asset Breakdown
                    </span>
                    <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto pr-1">
                      {ownedList.map((asset) => (
                        <div key={asset.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-neutral-900">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                              {asset.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono uppercase">
                              {asset.symbol} • {asset.shares} {asset.shares === 1 ? 'key' : 'keys'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-white font-mono">
                              {asset.value.toFixed(3)} SOL
                            </p>
                            <p className="text-[9px] text-neutral-500 font-mono">
                              {asset.price} SOL/key
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={onAddFunds}
                  className="w-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  Request Devnet SOL Airdrop (+5 SOL)
                </button>
              </div>

              {/* Solana Explorer Network State */}
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Solana Network</span>
                <span className="px-2 py-0.5 bg-teal-900/40 text-teal-400 border border-teal-800 rounded font-mono font-medium">
                  devnet-v2
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 p-6 flex flex-col gap-2 bg-neutral-950 shrink-0">
          <div className="flex items-center justify-between text-xxs text-neutral-500">
            <span>Client RPC Latency</span>
            <span className="font-mono text-green-400">12ms (Secure)</span>
          </div>
          <div className="flex items-center justify-between text-xxs text-neutral-500">
            <span>Arweave Network Relay</span>
            <span className="font-mono text-green-400">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
