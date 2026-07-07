import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Play, Pause, Flame, Cpu, ShieldCheck, Database, Landmark, 
  ArrowRight, Coins, Mic, Trophy, Users, TrendingUp, Sparkles,
  Zap, Headphones, Radio, Calculator, ArrowUpRight
} from "lucide-react";
import { Story, Competition, WalletState } from "../types";

interface LandingPageProps {
  setActiveTab: (tab: "home" | "discover" | "create" | "competitions") => void;
  stories: Story[];
  competitions: Competition[];
  wallet: WalletState;
  openWalletDrawer: () => void;
}

export default function LandingPage({
  setActiveTab,
  stories,
  competitions,
  wallet,
  openWalletDrawer
}: LandingPageProps) {
  // Calculator State
  const [sharesEstimated, setSharesEstimated] = useState<number>(75);
  const [estimatedRoyaltyVolume, setEstimatedRoyaltyVolume] = useState<number>(120);

  // Stats Counters
  const [totalStoriesCount, setTotalStoriesCount] = useState(1284);
  const [totalVolume, setTotalVolume] = useState(4289.4);
  const [arweaveGB, setArweaveGB] = useState(14.82);

  // Active Story Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  // Simulated live stats tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalStoriesCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setTotalVolume(prev => +(prev + (Math.random() > 0.45 ? Math.random() * 0.5 : 0)).toFixed(2));
      setArweaveGB(prev => +(prev + (Math.random() > 0.85 ? 0.01 : 0)).toFixed(2));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Calculate projected values based on bonding curve logic
  // Price P = 0.05 + supply * 0.003
  // Average price roughly mid point
  const basePrice = 0.05;
  const priceSensitivity = 0.003;
  
  // Calculate price at target supply
  const priceAtSupply = +(basePrice + sharesEstimated * priceSensitivity).toFixed(4);
  // Total SOL pool in curve: integral of (0.05 + x * 0.003) dx from 0 to shares = 0.05*shares + 0.0015*shares^2
  const creatorValue = +(0.05 * sharesEstimated + 0.0015 * Math.pow(sharesEstimated, 2)).toFixed(2);
  // Royalty is 5% of secondary volume
  const royaltyRewards = +(estimatedRoyaltyVolume * 0.05).toFixed(2);

  // Main featured story for play preview
  const featuredStory = stories[0] || {
    title: "The Cryptographic Lisbon Ledger",
    creatorName: "SolyBoy",
    symbol: "LISBON42",
    duration: "2:14",
    price: 0.145,
    volume: 18.25,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    description: "An interactive cyber-thriller about an old ledger found in a vintage market, holding millions in SOL."
  };

  const handlePlayToggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(featuredStory.audioUrl);
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentPlayTime(audioRef.current ? audioRef.current.currentTime : 0);
      });
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentPlayTime(0);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="space-y-16 py-4" id="landing-page-view">
      
      {/* 1. Epic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-900 bg-radial from-purple-950/20 via-black to-black p-8 md:p-14 text-center">
        {/* Glow ambient spots */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Hero Badging */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-purple-400 mb-6"
        >
          <Flame className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          <span>The Audio Asset Revolution is Live on Solana</span>
        </motion.div>

        {/* Hero Headings */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-white max-w-4xl mx-auto leading-[1.08]"
        >
          Turn Your Voice and Stories <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-teal-300 bg-clip-text text-transparent">
            Into Permanent Digital Assets
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Capture raw speech, enhance with deep AI pipelines, back permanently onto Arweave, and fractionalize fractional ownership through automated Solana bonding curves.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <button
            onClick={() => setActiveTab("discover")}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-purple-600/15 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Coins className="w-4 h-4 text-teal-300" />
            Explore Audio Market
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold text-sm px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-purple-400" />
            Open Creator Studio
          </button>
        </motion.div>

        {/* Dynamic Highlight Story Player */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl mx-auto mt-14 bg-neutral-950/90 border border-neutral-850 rounded-2xl p-4 sm:p-5 text-left flex flex-col sm:flex-row items-center gap-5 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 rounded-2xl pointer-events-none group-hover:opacity-100 transition-opacity"></div>
          
          {/* Cover Disc Visual */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-500/40 shadow-lg shadow-purple-500/10">
            <div className={`absolute inset-0 bg-gradient-to-tr from-purple-950 to-neutral-900 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
              <div className="absolute w-12 h-12 rounded-full border border-purple-500/30 flex items-center justify-center">
                <Radio className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            {/* Play Button overlay */}
            <button 
              onClick={handlePlayToggle}
              className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors group-hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white fill-white shrink-0" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white ml-1 shrink-0" />
              )}
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 w-full text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-between">
              <span className="text-[10px] font-extrabold font-mono text-purple-400 tracking-wider uppercase">FEATURED LAUNCH</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400 rounded-md font-mono">
                {featuredStory.duration}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{featuredStory.title}</h3>
            <p className="text-neutral-400 text-xs line-clamp-1 mt-0.5">{featuredStory.description}</p>
            
            {/* Audio Waveform progress visual */}
            <div className="flex items-center gap-1 pt-2">
              <div className="h-1 bg-neutral-900 rounded-full flex-1 overflow-hidden relative">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300" 
                  style={{ width: isPlaying ? `${(currentPlayTime / 134) * 100}%` : "0%" }}
                ></div>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">
                {isPlaying ? `${Math.floor(currentPlayTime / 60)}:${String(Math.floor(currentPlayTime % 60)).padStart(2, '0')}` : "0:00"}
              </span>
            </div>
          </div>

          {/* Quick Price Block */}
          <div className="bg-neutral-900/80 border border-neutral-850 rounded-xl p-3 text-center min-w-[120px] shrink-0 w-full sm:w-auto">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">Current Share</span>
            <span className="text-base font-extrabold text-teal-400 block mt-0.5 font-mono">{featuredStory.price.toFixed(3)} SOL</span>
            <span className="text-[10px] font-semibold text-neutral-400 block mt-0.5">Vol: {featuredStory.volume.toFixed(1)} SOL</span>
          </div>
        </motion.div>
      </section>

      {/* 2. Platform Statistics Banner */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="landing-stats-grid">
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 text-center flex flex-col justify-center gap-1.5 shadow-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-1">
            <Headphones className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {totalStoriesCount.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-widest">Stories Stored</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 text-center flex flex-col justify-center gap-1.5 shadow-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-1">
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {totalVolume.toLocaleString()} <span className="text-xs text-neutral-400">SOL</span>
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-widest">Trade Volume</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 text-center flex flex-col justify-center gap-1.5 shadow-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-1">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {arweaveGB.toFixed(2)} <span className="text-xs text-neutral-400">GB</span>
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-widest">Arweave Storage</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 text-center flex flex-col justify-center gap-1.5 shadow-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {competitions.length} <span className="text-xs text-neutral-400">Active</span>
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-widest">Challenges Live</span>
        </div>
      </section>

      {/* 3. Core Features: How the Protocol works */}
      <section className="space-y-8" id="features-showcase">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Engineered For Immutable Voice Ownership</h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
            Traditional platforms host audio on centralized clouds. Echoes Fans leverages modern web3 infrastructure to make voice sovereign.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Arweave */}
          <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-6 space-y-4 hover:border-purple-900/30 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Permanent Storage via Arweave</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your recorded raw audio chunks are packed, indexed, and locked onto the Arweave blockweave network forever. No subscription bills, no central database outages, no deletion risk.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider block bg-purple-950/30 border border-purple-900/20 px-2.5 py-1 rounded-md w-fit">
                Immutable IPFS Hash Layer
              </span>
            </div>
          </div>

          {/* Card 2: AI Enhancer */}
          <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-6 space-y-4 hover:border-teal-900/30 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Deep AI Speech Enhancer</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Our built-in AI pipeline transcribes voice automatically, extracts short premium meta summaries, tags matching topics, and compiles Solana-compliant on-chain token metadata.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold font-mono text-teal-400 uppercase tracking-wider block bg-teal-950/30 border border-teal-900/20 px-2.5 py-1 rounded-md w-fit">
                Google Gemini API Pipeline
              </span>
            </div>
          </div>

          {/* Card 3: Bonding Curves */}
          <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-6 space-y-4 hover:border-indigo-900/30 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Bonding Curve Liquidity</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Secured on Solana. Every story acts as a unique voice market. Buying shares mints keys dynamically based on supply, generating passive liquidity and royalties automatically.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider block bg-indigo-950/30 border border-indigo-900/20 px-2.5 py-1 rounded-md w-fit">
                Automatic Creator Royalties
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Earnings Calculator Slider */}
      <section className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-10" id="creator-yield-calculator">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left panel: Info & Controls */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-widest">
                <Calculator className="w-4 h-4" />
                <span>ROI FORECASTING ENGINE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Project Your Creator Yields</h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Adjust the sliders to visualize your financial growth under Echoes Fans' dual economic layer. Dynamic bonding curves scale your story's value with community attention.
              </p>
            </div>

            {/* Slider 1: Voice keys sold */}
            <div className="space-y-3 bg-neutral-900/50 p-4 border border-neutral-850 rounded-2xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-bold uppercase tracking-wider">Projected Voice Keys Held</span>
                <span className="text-teal-400 font-mono font-bold text-sm bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-850">
                  {sharesEstimated} Keys
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                value={sharesEstimated}
                onChange={(e) => setSharesEstimated(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>10 (Early Stage)</span>
                <span>500 (Viral Hit)</span>
              </div>
            </div>

            {/* Slider 2: Secondary Market Trading Volume */}
            <div className="space-y-3 bg-neutral-900/50 p-4 border border-neutral-850 rounded-2xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-bold uppercase tracking-wider">Estimated Volume Traded</span>
                <span className="text-purple-400 font-mono font-bold text-sm bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-850">
                  {estimatedRoyaltyVolume} SOL
                </span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="1000" 
                value={estimatedRoyaltyVolume}
                onChange={(e) => setEstimatedRoyaltyVolume(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>5 SOL</span>
                <span>1,000 SOL</span>
              </div>
            </div>
          </div>

          {/* Right panel: Live Outputs */}
          <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-850 rounded-2xl p-5 sm:p-6 space-y-6 relative overflow-hidden">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>

            <h3 className="text-xs font-extrabold font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-800 pb-3">
              YOUR PROJECTED LEDGER
            </h3>

            <div className="space-y-4">
              {/* Output 1: Price per Key */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">Next Voice Key Price</span>
                <span className="text-sm font-bold font-mono text-white bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">
                  {priceAtSupply} SOL
                </span>
              </div>

              {/* Output 2: Initial Capitalized Pool */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">Bonding Curve Pool Value</span>
                <span className="text-base font-extrabold font-mono text-teal-400">
                  {creatorValue} SOL
                </span>
              </div>

              {/* Output 3: 5% passive trading royalties */}
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <span className="text-xs text-neutral-400 block">Accumulated Royalties</span>
                  <span className="text-[10px] text-neutral-500 block">5% distributed on every secondary flip</span>
                </div>
                <span className="text-lg font-black font-mono text-purple-400">
                  {royaltyRewards} SOL
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-800"></div>

              {/* Total Projected Return */}
              <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                <div className="text-left">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Estimated Total Value</span>
                  <span className="text-[9px] text-neutral-500 block">Immediate liquidity pool + royalties</span>
                </div>
                <span className="text-xl font-black font-mono text-teal-300">
                  {+(creatorValue + royaltyRewards).toFixed(2)} SOL
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("create")}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-purple-600/10 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Launch Studio & Start Earning
            </button>
          </div>

        </div>
      </section>

      {/* 5. Live Active Challenges Grid Preview */}
      <section className="space-y-6" id="landing-challenges-feed">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Active Sponsored Challenges
            </h2>
            <p className="text-xs text-neutral-400">
              Submit your dynamic audio stories to sponsored prize pools on Solana. Earn guaranteed bounty shares.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab("competitions")}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0 bg-neutral-950 px-4 py-2 border border-neutral-900 rounded-xl transition-all cursor-pointer"
          >
            All Challenges
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitions.slice(0, 2).map((comp) => (
            <div 
              key={comp.id} 
              className="bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-3xl p-5 flex flex-col justify-between gap-4 text-left relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-[9px] text-yellow-400 font-bold rounded font-mono uppercase tracking-widest">
                    ACTIVE POOL
                  </span>
                  <span className="text-[10px] text-neutral-500 font-semibold">{comp.endDate}</span>
                </div>
                <h3 className="text-base font-extrabold text-white">{comp.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{comp.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-900 pt-4">
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 block uppercase tracking-wider">PRIZE POOL</span>
                  <span className="text-base font-black font-mono text-teal-400">{comp.prizePool} SOL</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 block uppercase tracking-wider text-right">ENTRIES</span>
                  <span className="text-sm font-bold text-neutral-300 block text-right">{comp.entriesCount} Stories</span>
                </div>
                <button
                  onClick={() => setActiveTab("competitions")}
                  className="bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Enter Bounty
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. On-Chain Pipeline Steps Roadmap */}
      <section className="bg-neutral-950/40 border border-neutral-900 rounded-3xl p-6 sm:p-10 space-y-10" id="onchain-pipeline">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">The Echoes Pipeline Lifecycle</h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
            From raw voice waveform capture in your browser to a fully tradeable permanent Solana smart contract.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Step 1 */}
          <div className="space-y-3 text-left bg-neutral-950 p-5 rounded-2xl border border-neutral-900 relative">
            <div className="absolute top-3 right-3 text-2xl font-black font-mono text-neutral-800">01</div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Capture High-Fidelity Voice</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Open the web recorder, speak naturally, and let our engine stream high-quality audio fragments directly into memory.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 text-left bg-neutral-950 p-5 rounded-2xl border border-neutral-900 relative">
            <div className="absolute top-3 right-3 text-2xl font-black font-mono text-neutral-800">02</div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Deep AI Synthesize & Meta</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Google Gemini processes the stream to create accurate speech summaries, matching custom tags, and complete rich captions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 text-left bg-neutral-950 p-5 rounded-2xl border border-neutral-900 relative">
            <div className="absolute top-3 right-3 text-2xl font-black font-mono text-neutral-800">03</div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Anchor Immutable Arweave</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Deploy audio payload onto Arweave forever. Receive a decentralized storage hash to bind securely to Solana state.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 text-left bg-neutral-950 p-5 rounded-2xl border border-neutral-900 relative">
            <div className="absolute top-3 right-3 text-2xl font-black font-mono text-neutral-800">04</div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-2">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Mint Dynamic Solana curve</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Instantiate dynamic bonding curve contracts with fully customized ticker symbols (e.g. SPEAK92) to kickstart secondary trade.
            </p>
          </div>

        </div>
      </section>

      {/* 7. Grand Final Call to Action */}
      <section className="bg-gradient-to-tr from-purple-950/20 via-neutral-950 to-neutral-950 border border-neutral-900 rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden" id="final-cta-banner">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-[80px]"></div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Ready to Claim Your Voice Royalty Stream?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Secure your identity, connect a devnet wallet simulation, start broadcasting, and join thousands of modern creators setting on-chain milestones today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {!wallet.connected ? (
            <button
              onClick={openWalletDrawer}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-600/20 cursor-pointer animate-pulse"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              Connect simulated wallet
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("create")}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Go to Creator Studio
            </button>
          )}

          <button
            onClick={() => setActiveTab("discover")}
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-neutral-300 hover:text-white font-bold text-xs py-3.5 px-8 rounded-2xl transition-all cursor-pointer"
          >
            Browse bonding curve feed
          </button>
        </div>
      </section>

    </div>
  );
}
