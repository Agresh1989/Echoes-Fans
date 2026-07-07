import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, TrendingUp, DollarSign, RefreshCw, Layers, Clipboard, ExternalLink, ShieldAlert } from "lucide-react";
import { Story, WalletState, Trade, PlatformActivity } from "../types";
import RecentActivityFeed from "./RecentActivityFeed";

interface DiscoverFeedProps {
  stories: Story[];
  wallet: WalletState;
  onTrade: (storyId: string, tradeType: "BUY" | "SELL", sharesCount: number) => void;
  openWalletDrawer: () => void;
  activities: PlatformActivity[];
  onTriggerMockActivity: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export default function DiscoverFeed({
  stories,
  wallet,
  onTrade,
  openWalletDrawer,
  activities,
  onTriggerMockActivity,
  isStreaming,
  onToggleStreaming,
}: DiscoverFeedProps) {
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Trading panel local inputs
  const [sharesToTrade, setSharesToTrade] = useState<{ [key: string]: number }>({});
  const [tradingStoryId, setTradingStoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "transcript" | "trades" | "arweave">("info");
  const [tradeMessage, setTradeMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Global Audio controller
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Quick feedback helper
  const showFeedback = (text: string, type: "error" | "success") => {
    setTradeMessage({ text, type });
    setTimeout(() => {
      setTradeMessage(null);
    }, 4000);
  };

  // Handle Play/Pause
  const handlePlayPause = (story: Story) => {
    if (activeStoryId === story.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setActiveStoryId(story.id);
      setIsPlaying(false);
      // Let standard browser audio load
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = story.audioUrl;
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Playback error:", err));
        }
      }, 50);
    }
  };

  // Sync player times
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [activeStoryId]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatSecs = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const executeTrade = (story: Story, type: "BUY" | "SELL") => {
    if (!wallet.connected) {
      openWalletDrawer();
      return;
    }

    const count = sharesToTrade[story.id] || 1;
    if (count <= 0) {
      showFeedback("Please specify a valid share quantity.", "error");
      return;
    }

    const sharePrice = story.price;
    const totalCost = sharePrice * count;

    if (type === "BUY" && wallet.balance < totalCost) {
      showFeedback("Insufficient Solana balance. Please request an airdrop in your wallet drawer.", "error");
      return;
    }

    onTrade(story.id, type, count);
    showFeedback(`Successfully submitted ${type} order for ${count} keys of ${story.symbol}!`, "success");
    // Clear trade input
    setSharesToTrade({ ...sharesToTrade, [story.id]: 1 });
  };

  return (
    <div className="flex flex-col gap-8" id="discover-portal">
      {/* Hidden audio tag */}
      <audio ref={audioRef} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column: Feed card stack */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Active Ownership Market</h2>
            <div className="flex gap-2 text-neutral-400 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Bonding Curve Active
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {stories.map((story) => {
              const currentInputShares = sharesToTrade[story.id] || 1;
              const totalCost = (story.price * currentInputShares).toFixed(4);

              return (
                <div
                  key={story.id}
                  className={`bg-neutral-900/40 border transition-all duration-300 ease-out rounded-2xl overflow-hidden p-5 flex flex-col md:flex-row gap-5 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 ${
                    activeStoryId === story.id ? "border-purple-500/50 bg-neutral-900/60 shadow-lg shadow-purple-500/5" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                  id={`story-card-${story.id}`}
                >
                  {/* Left: Cover Art & Play Button */}
                  <div className="relative w-full md:w-36 h-36 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                    <img
                      src={story.coverUrl}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => handlePlayPause(story)}
                      className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex items-center justify-center text-white"
                    >
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-600/30 transform hover:scale-105 active:scale-95 transition-transform">
                        {activeStoryId === story.id && isPlaying ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        )}
                      </div>
                    </button>
                    <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded font-mono text-[10px] text-neutral-300">
                      {story.duration}
                    </span>
                  </div>

                  {/* Right: Info & Stats */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-white leading-snug">{story.title}</h3>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            By <span className="text-purple-400 font-semibold">{story.creatorName}</span>
                          </p>
                        </div>
                        <span className="text-xxs font-mono font-bold text-teal-400 bg-teal-950/30 border border-teal-900/30 px-2 py-0.5 rounded-md">
                          ${story.symbol}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 line-clamp-2 mt-2 leading-relaxed">
                        {story.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {story.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded-md text-neutral-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technical stats footer */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 pt-4 border-t border-neutral-850 mt-4 text-center">
                      <div>
                        <span className="text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">
                          Share Price
                        </span>
                        <p className="text-xs font-mono font-bold text-teal-400 mt-0.5">
                          {story.price.toFixed(3)} SOL
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">
                          Active Keys
                        </span>
                        <p className="text-xs font-mono font-bold text-white mt-0.5">
                          {story.supply}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">
                          Volume
                        </span>
                        <p className="text-xs font-mono font-bold text-white mt-0.5">
                          {story.volume.toFixed(2)} SOL
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">
                          Earned (Royalties)
                        </span>
                        <p className="text-xs font-mono font-bold text-purple-400 mt-0.5">
                          {story.royaltyPaid.toFixed(3)} SOL
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Bonding Curve Trading Widget */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              Ownership Exchange
            </h2>

            {/* Select target story for active display */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                  Select Audio Story to Trade
                </label>
                <select
                  onChange={(e) => setTradingStoryId(e.target.value)}
                  value={tradingStoryId || ""}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-750 focus:border-teal-500 text-sm text-white rounded-xl px-4 py-3 mt-1.5 outline-none"
                >
                  <option value="" disabled>
                    -- Select audio asset --
                  </option>
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title} (${story.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {tradingStoryId ? (
                (() => {
                  const targetStory = stories.find((s) => s.id === tradingStoryId)!;
                  const tradeShares = sharesToTrade[targetStory.id] || 1;
                  const estimatedCost = (targetStory.price * tradeShares).toFixed(4);

                  return (
                    <div className="flex flex-col gap-5 pt-2">
                      {/* Navigation tabs */}
                      <div className="flex gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                        {(["info", "transcript", "trades", "arweave"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                              activeTab === tab
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Feed Feedback message indicator */}
                      {tradeMessage && (
                        <div className={`p-3 rounded-xl border text-[11px] font-medium leading-snug flex items-center gap-2 ${
                          tradeMessage.type === "error"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-teal-500/10 border-teal-500/20 text-teal-300"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            tradeMessage.type === "error" ? "bg-red-500" : "bg-teal-400"
                          }`} />
                          <p>{tradeMessage.text}</p>
                        </div>
                      )}

                      {/* Info Tab */}
                      {activeTab === "info" && (
                        <div className="flex flex-col gap-4">
                          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs text-neutral-400">
                              <span>Estimated Share Price</span>
                              <span className="font-mono font-bold text-teal-400">
                                {targetStory.price.toFixed(3)} SOL
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-neutral-400">
                              <span>Network Creator Royalty</span>
                              <span className="font-mono font-bold text-purple-400">
                                5.00%
                              </span>
                            </div>
                          </div>

                          {/* Trading interface */}
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <label className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                                Quantity (Shares)
                              </label>
                              <span className="text-xxs text-neutral-400">
                                Cost/Credit: <span className="font-mono text-teal-400 font-bold">{estimatedCost} SOL</span>
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={tradeShares}
                                onChange={(e) =>
                                  setSharesToTrade({
                                    ...sharesToTrade,
                                    [targetStory.id]: Math.max(1, Number(e.target.value)),
                                  })
                                }
                                className="bg-neutral-950 border border-neutral-800 focus:border-teal-500 text-sm font-mono text-center text-white rounded-xl w-24 outline-none"
                              />
                              <button
                                onClick={() => executeTrade(targetStory, "BUY")}
                                className="flex-1 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95"
                              >
                                BUY KEYS
                              </button>
                              <button
                                onClick={() => executeTrade(targetStory, "SELL")}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-extrabold text-xs py-3 rounded-xl transition-all active:scale-95"
                              >
                                SELL KEYS
                              </button>
                            </div>
                          </div>

                          {/* Secure validation helper */}
                          <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-850 flex gap-2.5">
                            <Layers className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-neutral-400 leading-normal">
                              Bonding curve pricing models are server-calculated. Every buy raises the price of future keys, incentivizing early fans.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Transcript Tab */}
                      {activeTab === "transcript" && (
                        <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl">
                          <span className="text-xxs text-neutral-500 uppercase tracking-wider font-bold">
                            On-chain Story Script
                          </span>
                          <div className="max-h-[220px] overflow-y-auto mt-2 text-neutral-300 text-xs font-sans leading-relaxed whitespace-pre-wrap bg-neutral-900/40 p-3 rounded border border-neutral-850">
                            {targetStory.transcript}
                          </div>
                        </div>
                      )}

                      {/* Trades history tab */}
                      {activeTab === "trades" && (
                        <div className="flex flex-col gap-3">
                          <span className="text-xxs text-neutral-500 uppercase tracking-wider font-bold">
                            Live Order Book (Secondary trades)
                          </span>
                          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                            {targetStory.bids.length === 0 ? (
                              <p className="text-neutral-500 text-xs italic text-center py-6">
                                No trades recorded yet. Be the first!
                              </p>
                            ) : (
                              targetStory.bids.map((trade) => (
                                <div
                                  key={trade.id}
                                  className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 text-xxs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                        trade.type === "BUY"
                                          ? "bg-teal-900/40 text-teal-400"
                                          : "bg-red-900/40 text-red-400"
                                      }`}
                                    >
                                      {trade.type}
                                    </span>
                                    <span className="text-neutral-300 font-semibold">{trade.traderName}</span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className="text-white font-bold">{trade.shares} shares</span>
                                    <span className="text-neutral-500 ml-2">
                                      @{trade.price.toFixed(2)} SOL
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* Arweave Decentralized proof tab */}
                      {activeTab === "arweave" && (
                        <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl flex flex-col gap-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-400">Decentralized Storage</span>
                            <span className="text-teal-400 font-mono font-bold uppercase tracking-wider text-[10px] bg-teal-950/30 px-2 py-0.5 rounded border border-teal-900/30">
                              Arweave Permanent
                            </span>
                          </div>

                          <div className="bg-black/40 px-3 py-2 border border-neutral-850 rounded-lg">
                            <span className="text-[10px] text-neutral-500 block uppercase font-bold">
                              Arweave Storage Transaction Hash
                            </span>
                            <span className="text-[11px] text-neutral-300 font-mono block mt-1 break-all">
                              {targetStory.arweaveHash}
                            </span>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(targetStory.arweaveHash);
                                showFeedback("Arweave transaction hash copied to clipboard!", "success");
                              }}
                              className="text-neutral-400 hover:text-white border border-neutral-850 px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors text-xxs font-bold"
                            >
                              Copy Hash
                            </button>
                            <a
                              href={`https://arweave.net/${targetStory.arweaveHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xxs font-bold flex items-center gap-1 shadow-sm transition-all"
                            >
                              View on Explorer
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="py-12 border border-dashed border-neutral-850 rounded-2xl text-center flex flex-col items-center gap-2 mt-2 bg-neutral-950/20">
                  <Play className="w-8 h-8 text-neutral-500" />
                  <p className="text-neutral-500 text-xs italic">
                    Select any story above or from the dropdown menu to trigger interactive shares trading.
                  </p>
                </div>
              )}
            </div>
          </div>

          <RecentActivityFeed
            activities={activities}
            onTriggerMockActivity={onTriggerMockActivity}
            isStreaming={isStreaming}
            onToggleStreaming={onToggleStreaming}
          />
        </div>
      </div>

      {/* Persistent Bottom Playback Status Bar */}
      {activeStoryId && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800 shadow-2xl backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 relative">
            
            {/* Absolute Spotify-style progress bar on mobile, standard inline progress bar on desktop */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-neutral-900 md:hidden overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-teal-400"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
              ></div>
            </div>

            {(() => {
              const story = stories.find((s) => s.id === activeStoryId)!;
              return (
                <>
                  {/* Left: Metadata */}
                  <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={story.coverUrl}
                        alt={story.title}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white leading-normal truncate max-w-[150px] sm:max-w-[240px] md:max-w-xs">
                          {story.title}
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                          By <span className="text-purple-400 font-semibold">{story.creatorName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Simple play/pause and tag for mobile next to the title (right-aligned in parent row) */}
                    <div className="flex items-center gap-2 md:hidden">
                      <span className="text-[9px] font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-900/20 px-1.5 py-0.5 rounded shrink-0">
                        ${story.symbol}
                      </span>
                      <button
                        onClick={() => handlePlayPause(story)}
                        className="w-8 h-8 bg-white text-neutral-950 rounded-full flex items-center justify-center shadow-lg active:scale-95 shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-neutral-950" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-neutral-950 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scrubber controls (Hidden on mobile, elegant inline design on desktop) */}
                  <div className="hidden md:flex flex-1 items-center gap-3 w-full max-w-xl">
                    <span className="font-mono text-[10px] text-neutral-400">
                      {formatSecs(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleScrub}
                      className="flex-1 h-1 bg-neutral-800 accent-purple-500 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-neutral-400">
                      {formatSecs(duration)}
                    </span>
                  </div>

                  {/* Right: Controls (Hidden on mobile, standard row on desktop) */}
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handlePlayPause(story)}
                      className="w-10 h-10 bg-white hover:bg-neutral-100 text-neutral-950 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-neutral-950" />
                      ) : (
                        <Play className="w-4 h-4 fill-neutral-950 ml-0.5" />
                      )}
                    </button>
                    <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-900/30 px-2.5 py-1 rounded">
                      ${story.symbol} Key Connected
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
