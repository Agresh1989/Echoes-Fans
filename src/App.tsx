import React, { useState, useEffect, useRef } from "react";
import { Coins, Mic, Trophy, Shield, Wallet, Zap, Menu, Globe, Share2, Home } from "lucide-react";
import { INITIAL_STORIES, INITIAL_COMPETITIONS, INITIAL_ACTIVITIES } from "./data";
import { Story, Competition, WalletState, Trade, PlatformActivity } from "./types";
import DiscoverFeed from "./components/DiscoverFeed";
import AudioRecorder from "./components/AudioRecorder";
import Competitions from "./components/Competitions";
import WalletDrawer from "./components/WalletDrawer";
import LandingPage from "./components/LandingPage";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "discover" | "create" | "competitions">("home");

  // Core Applet State
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [activities, setActivities] = useState<PlatformActivity[]>(INITIAL_ACTIVITIES);
  const [isStreaming, setIsStreaming] = useState(true);

  // Stabilizing refs for background interval simulation
  const storiesRef = useRef<Story[]>(stories);
  const competitionsRef = useRef<Competition[]>(competitions);

  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  useEffect(() => {
    competitionsRef.current = competitions;
  }, [competitions]);

  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
    balance: 0,
    points: 0,
  });

  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Connection handlers
  const handleConnect = (address: string) => {
    setWallet({
      connected: true,
      address,
      balance: 10.5, // Start with some SOL for active devnet interactions
      points: 150,
    });
  };

  const handleDisconnect = () => {
    setWallet({
      connected: false,
      address: "",
      balance: 0,
      points: 0,
    });
  };

  // Devnet SOL Airdrop Faucet
  const handleAirdrop = () => {
    if (!wallet.connected) return;
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + 5,
    }));
  };

  // Simulated bonding curve share trade execution
  const handleTrade = (storyId: string, tradeType: "BUY" | "SELL", sharesCount: number) => {
    setStories((prevStories) =>
      prevStories.map((story) => {
        if (story.id !== storyId) return story;

        const currentPrice = story.price;
        const totalCost = currentPrice * sharesCount;
        const royalty = totalCost * 0.05;

        // Create new trade log
        const newTrade: Trade = {
          id: `t-${Date.now()}`,
          type: tradeType,
          traderAddress: wallet.address,
          traderName: "You (Connected)",
          shares: sharesCount,
          price: currentPrice,
          total: totalCost,
          timestamp: new Date().toISOString(),
        };

        // Bonding curve pricing formulas:
        // Buying increases future price, Selling decreases future price.
        const priceMultiplier = 0.003; // Price sensitivity factor
        let nextPrice = story.price;
        let nextSupply = story.supply;
        let nextVolume = story.volume + totalCost;
        let nextRoyaltyPaid = story.royaltyPaid;

        if (tradeType === "BUY") {
          nextPrice = currentPrice + (sharesCount * priceMultiplier);
          nextSupply = story.supply + sharesCount;
          nextRoyaltyPaid = story.royaltyPaid + royalty;

          // Deduct from wallet balance & award points
          setWallet((prev) => ({
            ...prev,
            balance: prev.balance - totalCost,
            points: prev.points + (sharesCount * 10),
          }));
        } else {
          nextPrice = Math.max(0.01, currentPrice - (sharesCount * priceMultiplier));
          nextSupply = Math.max(0, story.supply - sharesCount);

          // Credit wallet balance & award points
          setWallet((prev) => ({
            ...prev,
            balance: prev.balance + totalCost,
            points: prev.points + (sharesCount * 5),
          }));
        }

        // Add to recent activities
        const newActivity: PlatformActivity = {
          id: `act-trade-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: tradeType,
          userAddress: wallet.address || "0xMOCK...5678",
          userName: wallet.connected ? "You" : "AnonTrader",
          storyId: story.id,
          storyTitle: story.title,
          storySymbol: story.symbol,
          shares: sharesCount,
          price: currentPrice,
          totalAmount: totalCost,
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev].slice(0, 50));

        return {
          ...story,
          price: nextPrice,
          supply: nextSupply,
          volume: nextVolume,
          royaltyPaid: nextRoyaltyPaid,
          bids: [newTrade, ...story.bids],
        };
      })
    );
  };

  // Add new sponsored challenge
  const handleAddCompetition = (newComp: Competition) => {
    setCompetitions((prev) => [newComp, ...prev]);

    // Deduct prize pool directly from sponsor wallet
    const prizeAmount = parseFloat(newComp.prizePool);
    setWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - prizeAmount),
      points: prev.points + 100, // Large point reward for sponsors
    }));
  };

  // Submit audio story to challenge
  const handleSubmitToCompetition = (storyId: string, compId: string) => {
    // Increment submission counter
    setCompetitions((prevComps) =>
      prevComps.map((comp) => {
        if (comp.id !== compId) return comp;
        return {
          ...comp,
          entriesCount: comp.entriesCount + 1,
        };
      })
    );

    // Update story tag / link it to comp
    setStories((prevStories) =>
      prevStories.map((story) => {
        if (story.id !== storyId) return story;
        return {
          ...story,
          isCompetitionEntry: true,
          competitionId: compId,
          tags: [...new Set([...story.tags, "ChallengeEntry"])],
        };
      })
    );

    // Award loyalty points
    setWallet((prev) => ({
      ...prev,
      points: prev.points + 20,
    }));

    // Add to recent activities
    const targetStory = stories.find((s) => s.id === storyId);
    const targetComp = competitions.find((c) => c.id === compId);
    const newActivity: PlatformActivity = {
      id: `act-submit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "CHALLENGE_SUBMIT",
      userAddress: wallet.address || "0xMOCK...5678",
      userName: wallet.connected ? "You" : "AnonCreator",
      storyId,
      storyTitle: targetStory?.title || "Audio Story",
      challengeId: compId,
      challengeName: targetComp?.title || "Challenge",
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
  };

  // Handle new story minted from Creator Studio
  const handleStoryMinted = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    // Deduct cost and award points
    setWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - 0.05),
      points: prev.points + 50,
    }));

    // Add to recent activities
    const newActivity: PlatformActivity = {
      id: `act-mint-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "MINT",
      userAddress: wallet.address || "0xMOCK...5678",
      userName: wallet.connected ? "You" : "AnonCreator",
      storyId: newStory.id,
      storyTitle: newStory.title,
      storySymbol: newStory.symbol,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));

    setActiveTab("discover");
  };

  // Automated background simulator of platform activity
  const handleTriggerMockActivity = () => {
    const names = ["SolyBoy", "DeFi_Don", "CyberShaman", "CosmicGazer", "ArweaveAlchemist", "SolyBuilder", "PhantomRider", "DegenSpike", "EchoSeeker", "NodeRunner"];
    const addresses = ["2nKp...Pq90", "9sXy...8Jp4", "7xKX...Y9zp", "D9zR...Pq45", "4xQp...Kp23", "8vRp...Xy89", "5mTk...Lw71", "3bQp...Yt66", "1zRy...Wp12", "6vLp...Qr54"];
    
    const randIdx = Math.floor(Math.random() * names.length);
    const userName = names[randIdx];
    const userAddress = addresses[randIdx];

    const randType = Math.random();
    
    if (randType < 0.65) {
      // Trade Simulation
      const currentStories = storiesRef.current;
      if (currentStories.length === 0) return;
      const randomStory = currentStories[Math.floor(Math.random() * currentStories.length)];
      const sharesCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 keys
      const tradeType = Math.random() > 0.45 ? ("BUY" as const) : ("SELL" as const);
      
      const currentPrice = randomStory.price;
      const totalCost = currentPrice * sharesCount;
      const royalty = totalCost * 0.05;

      const priceMultiplier = 0.003;
      let nextPrice = randomStory.price;
      let nextSupply = randomStory.supply;
      let nextVolume = randomStory.volume + totalCost;
      let nextRoyaltyPaid = randomStory.royaltyPaid;

      if (tradeType === "BUY") {
        nextPrice = currentPrice + (sharesCount * priceMultiplier);
        nextSupply = randomStory.supply + sharesCount;
        nextRoyaltyPaid = randomStory.royaltyPaid + royalty;
      } else {
        nextPrice = Math.max(0.01, currentPrice - (sharesCount * priceMultiplier));
        nextSupply = Math.max(0, randomStory.supply - sharesCount);
      }

      setStories((prevStories) =>
        prevStories.map((story) => {
          if (story.id !== randomStory.id) return story;
          
          const newTrade: Trade = {
            id: `t-mock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: tradeType,
            traderAddress: userAddress,
            traderName: userName,
            shares: sharesCount,
            price: currentPrice,
            total: totalCost,
            timestamp: new Date().toISOString(),
          };

          return {
            ...story,
            price: nextPrice,
            supply: nextSupply,
            volume: nextVolume,
            royaltyPaid: nextRoyaltyPaid,
            bids: [newTrade, ...story.bids].slice(0, 20),
          };
        })
      );

      const newActivity: PlatformActivity = {
        id: `act-mock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: tradeType,
        userAddress,
        userName,
        storyId: randomStory.id,
        storyTitle: randomStory.title,
        storySymbol: randomStory.symbol,
        shares: sharesCount,
        price: currentPrice,
        totalAmount: totalCost,
        timestamp: new Date().toISOString()
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));

    } else if (randType < 0.85) {
      // Challenge Entry Submission Simulation
      const currentStories = storiesRef.current;
      const currentComps = competitionsRef.current;
      if (currentStories.length === 0 || currentComps.length === 0) return;
      const randomStory = currentStories[Math.floor(Math.random() * currentStories.length)];
      const randomComp = currentComps[Math.floor(Math.random() * currentComps.length)];

      setCompetitions((prevComps) =>
        prevComps.map((comp) => {
          if (comp.id !== randomComp.id) return comp;
          return {
            ...comp,
            entriesCount: comp.entriesCount + 1,
          };
        })
      );

      const newActivity: PlatformActivity = {
        id: `act-mock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: "CHALLENGE_SUBMIT",
        userAddress,
        userName,
        storyId: randomStory.id,
        storyTitle: randomStory.title,
        challengeId: randomComp.id,
        challengeName: randomComp.title,
        timestamp: new Date().toISOString()
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));

    } else {
      // Mint New Story Simulation
      const subjects = ["Solana Saga", "Arweave Monolith", "DeFi Whispers", "Echo-7 Chronicles", "Genesis Voice Logs", "Midnight Node", "Proof of Speech", "Decentralized Dreams"];
      const subtitles = ["The Lost Protocol", "An On-chain Symphony", "The Cryptographic Manifesto", "A Terminal Diary", "Volume 1", "Cyberpunks of Lisbon"];
      const tagsPool = ["Web3", "Audio", "Degen", "Arweave", "Solana", "SciFi", "Lore"];
      
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const subtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
      const title = `${subject}: ${subtitle}`;
      const symbol = subject.split(" ")[0].toUpperCase() + Math.floor(Math.random() * 90 + 10);
      const id = `story-mock-${Date.now()}`;
      
      const newStory: Story = {
        id,
        title,
        creatorName: userName,
        creatorAddress: userAddress,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: `${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 50) + 10}`,
        coverUrl: Math.random() > 0.5 ? "/src/assets/images/neon_audio_wave_1783326183651.jpg" : "/src/assets/images/cosmic_storyteller_1783326194652.jpg",
        description: `A live-recorded transmission from ${userName} exploring decentralized network architectures and audio-centric communities.`,
        transcript: `Preserving my digital identity. This audio file represents an authentic human voice recorded on ${new Date().toLocaleDateString()}. Decentralized storage prevents censorship and ensures permanent access.`,
        tags: [tagsPool[Math.floor(Math.random() * tagsPool.length)], tagsPool[Math.floor(Math.random() * tagsPool.length)]],
        symbol,
        price: 0.05,
        supply: 1,
        volume: 0,
        royaltyPaid: 0,
        arweaveHash: `Ar_mock_${Math.random().toString(36).substring(2, 12)}`,
        createdAt: new Date().toISOString(),
        bids: []
      };

      setStories((prev) => [newStory, ...prev]);

      const newActivity: PlatformActivity = {
        id: `act-mock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: "MINT",
        userAddress,
        userName,
        storyId: id,
        storyTitle: title,
        storySymbol: symbol,
        timestamp: new Date().toISOString()
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));
    }
  };

  // Background interval effect
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      handleTriggerMockActivity();
    }, 12000); // Trigger every 12 seconds
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans antialiased selection:bg-purple-600 selection:text-white pb-24">
      {/* Top ambient decor bars */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-teal-400"></div>

      {/* Primary Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Brand Header */}
        <header className="py-6 flex flex-col md:flex-row items-center justify-between border-b border-neutral-900 gap-6 mb-8" id="primary-brand-header">
          
          {/* Logo Brand with Perfect Alignment */}
          <div 
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3.5 text-left w-full md:w-auto cursor-pointer select-none hover:opacity-90 transition-opacity"
          >
            {/* High-Fidelity Premium Waveform Logo */}
            <div className="relative w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-center overflow-hidden group shrink-0 shadow-lg shadow-purple-950/40">
              {/* Glowing decorative ambient background */}
              <div className="absolute inset-0.5 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-400 opacity-20 group-hover:opacity-45 transition-opacity blur-[2px]"></div>
              {/* Dual neon rings representing Sound Echo ripples */}
              <div className="absolute inset-0 rounded-2xl border border-purple-500/20 group-hover:border-purple-500/40 transition-colors"></div>
              <div className="absolute inset-1.5 rounded-xl border border-teal-500/10 group-hover:border-teal-500/30 transition-colors"></div>
              
              {/* Dynamic bouncing audio wave visualizer */}
              <div className="relative flex items-end justify-center gap-[2.5px] h-6 w-8 pb-[1px]">
                <span className="w-[3px] bg-teal-400 rounded-full animate-pulse h-2"></span>
                <span className="w-[3px] bg-purple-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.15s', animationDuration: '0.95s' }}></span>
                <span className="w-[3px] bg-indigo-400 rounded-full animate-bounce h-6" style={{ animationDelay: '0.3s', animationDuration: '1.25s' }}></span>
                <span className="w-[3px] bg-pink-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.05s', animationDuration: '1.1s' }}></span>
                <span className="w-[3px] bg-teal-300 rounded-full animate-pulse h-2.5" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>

            {/* Typography Stack */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                  Echoes Fans
                </h1>
                <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 rounded-md font-bold font-mono uppercase tracking-widest leading-none">
                  Solana v1
                </span>
              </div>
              <p className="text-neutral-400 text-[10px] font-bold font-mono tracking-wider mt-1 uppercase leading-none">
                THE AUDIO OWNERSHIP PROTOCOL ON SOLANA
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-neutral-950 p-1 sm:p-1.5 border border-neutral-900 rounded-xl sm:rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span className="truncate">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("discover")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "discover"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400 shrink-0" />
              <span className="truncate">Discover</span>
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span className="truncate">Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("competitions")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "competitions"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" />
              <span className="truncate">Challenges</span>
            </button>
          </nav>

          {/* Identity & Wallet connectivity Button */}
          <div className="flex items-center gap-3">
            {!wallet.connected ? (
              <button
                onClick={() => setIsWalletOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-purple-600/10"
                id="header-connect-btn"
              >
                <Wallet className="w-4 h-4" />
                Connect Identity
              </button>
            ) : (
              <button
                onClick={() => setIsWalletOpen(true)}
                className="bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-850 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-2.5 transition-all"
                id="header-connected-btn"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-neutral-300">
                  {wallet.address.slice(0, 5)}...{wallet.address.slice(-5)}
                </span>
                <span className="bg-neutral-800 text-[10px] px-1.5 py-0.5 rounded text-neutral-400 font-bold">
                  {wallet.balance.toFixed(1)} SOL
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Content Screens */}
        <main className="min-h-[500px]">
          {activeTab === "home" && (
            <LandingPage
              setActiveTab={setActiveTab}
              stories={stories}
              competitions={competitions}
              wallet={wallet}
              openWalletDrawer={() => setIsWalletOpen(true)}
            />
          )}

          {activeTab === "discover" && (
            <DiscoverFeed
              stories={stories}
              wallet={wallet}
              onTrade={handleTrade}
              openWalletDrawer={() => setIsWalletOpen(true)}
              activities={activities}
              onTriggerMockActivity={handleTriggerMockActivity}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
            />
          )}

          {activeTab === "create" && (
            <AudioRecorder
              wallet={wallet}
              onStoryMinted={handleStoryMinted}
              openWalletDrawer={() => setIsWalletOpen(true)}
            />
          )}

          {activeTab === "competitions" && (
            <Competitions
              competitions={competitions}
              stories={stories}
              wallet={wallet}
              onAddCompetition={handleAddCompetition}
              onSubmitToCompetition={handleSubmitToCompetition}
              openWalletDrawer={() => setIsWalletOpen(true)}
            />
          )}
        </main>

        {/* Interactive App-wide Metrics Overlay */}
        <footer className="mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-4 pb-12">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400">Echoes Fans v1</span>
            <span>•</span>
            <span>Secure permanent audio stories with Solana metadata accounts and Arweave block storage.</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              Devnet Server: Active
            </span>
            <span className="font-mono">Time (UTC): 2026-07-06</span>
          </div>
        </footer>

        {/* Wallet connection panel drawer */}
        <WalletDrawer
          wallet={wallet}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onAddFunds={handleAirdrop}
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          stories={stories}
        />
      </div>
    </div>
  );
}
