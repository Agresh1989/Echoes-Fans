import React, { useEffect, useState } from "react";
import { Activity, Coins, Mic, Trophy, Sparkles, TrendingUp, TrendingDown, Play, Pause, Zap } from "lucide-react";
import { PlatformActivity } from "../types";

interface RecentActivityFeedProps {
  activities: PlatformActivity[];
  onTriggerMockActivity: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export default function RecentActivityFeed({
  activities,
  onTriggerMockActivity,
  isStreaming,
  onToggleStreaming,
}: RecentActivityFeedProps) {
  // Local state to force rerenders to update relative timestamps
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 10000); // refresh relative times every 10 seconds
    return () => clearInterval(timer);
  }, []);

  // Helper to format relative time
  const formatRelativeTime = (isoString: string) => {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    const diffMs = now - past;

    if (diffMs < 5000) return "Just now";
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-5 backdrop-blur-sm flex flex-col gap-4">
      {/* Header and Live Status */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity Feed</h3>
        </div>

        {/* Live streaming indicator badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all ${
              isStreaming
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-neutral-800 border-neutral-700 text-neutral-400"
            }`}
            title={isStreaming ? "Click to Pause Stream" : "Click to Resume Stream"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStreaming ? "bg-green-500 animate-pulse" : "bg-neutral-500"
              }`}
            ></span>
            {isStreaming ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      {/* Activity List Container */}
      <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-500">
            No platform activity recorded yet.
          </div>
        ) : (
          activities.map((activity, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={activity.id}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isLatest
                    ? "bg-neutral-900/70 border-purple-900/40 shadow-sm shadow-purple-900/10"
                    : "bg-neutral-950/40 border-neutral-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Event Type Icon Indicator */}
                    <div className="mt-0.5 shrink-0">
                      {activity.type === "MINT" && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {activity.type === "BUY" && (
                        <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {activity.type === "SELL" && (
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {activity.type === "CHALLENGE_SUBMIT" && (
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Event text content */}
                    <div className="min-w-0 text-xxs">
                      <div className="text-neutral-300 font-semibold truncate">
                        <span className="text-white font-bold hover:underline cursor-pointer">
                          {activity.userName}
                        </span>{" "}
                        {activity.type === "MINT" && (
                          <>
                            minted <span className="text-indigo-400 font-bold">{activity.storyTitle}</span>
                          </>
                        )}
                        {activity.type === "BUY" && (
                          <>
                            bought {activity.shares} keys of{" "}
                            <span className="text-teal-400 font-bold">
                              {activity.storySymbol}
                            </span>
                          </>
                        )}
                        {activity.type === "SELL" && (
                          <>
                            sold {activity.shares} keys of{" "}
                            <span className="text-rose-400 font-bold">
                              {activity.storySymbol}
                            </span>
                          </>
                        )}
                        {activity.type === "CHALLENGE_SUBMIT" && (
                          <>
                            submitted <span className="text-yellow-400 font-bold">{activity.storyTitle}</span> to the{" "}
                            <span className="text-yellow-400 font-bold underline">
                              {activity.challengeName}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Details & Metadata row */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-mono">
                        <span>
                          {activity.userAddress.slice(0, 4)}...{activity.userAddress.slice(-4)}
                        </span>
                        {activity.totalAmount !== undefined && (
                          <>
                            <span>•</span>
                            <span className={activity.type === "BUY" ? "text-teal-400 font-bold" : "text-rose-400 font-bold"}>
                              {activity.type === "BUY" ? "+" : "-"}
                              {activity.totalAmount.toFixed(3)} SOL
                            </span>
                          </>
                        )}
                        {activity.type === "MINT" && (
                          <>
                            <span>•</span>
                            <span className="text-purple-400 font-semibold">Arweave NFT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Relative timestamp */}
                  <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap shrink-0">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Sandbox Trigger Actions */}
      <div className="mt-2 pt-3 border-t border-neutral-850/50 flex items-center justify-between text-xxs">
        <span className="text-neutral-500 flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-500" />
          Real-time updates active
        </span>
        <button
          onClick={onTriggerMockActivity}
          className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-purple-500/40 text-[10px] font-bold text-neutral-300 hover:text-purple-400 px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-purple-400 animate-spin-slow" />
          Simulate Event
        </button>
      </div>
    </div>
  );
}
