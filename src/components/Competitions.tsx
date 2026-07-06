import React, { useState } from "react";
import { Trophy, Calendar, Sparkles, Send, Coins, ShieldAlert, BadgeCheck, CheckCircle, RefreshCw } from "lucide-react";
import { Competition, Story, WalletState } from "../types";

interface CompetitionsProps {
  competitions: Competition[];
  stories: Story[];
  wallet: WalletState;
  onAddCompetition: (newComp: Competition) => void;
  onSubmitToCompetition: (storyId: string, compId: string) => void;
  openWalletDrawer: () => void;
}

export default function Competitions({
  competitions,
  stories,
  wallet,
  onAddCompetition,
  onSubmitToCompetition,
  openWalletDrawer,
}: CompetitionsProps) {
  // Sponsor form states
  const [showSponsorPortal, setShowSponsorPortal] = useState(false);
  const [sponsorName, setSponsorName] = useState("");
  const [theme, setTheme] = useState("");
  const [prize, setPrize] = useState("10");
  const [description, setDescription] = useState("");
  const [sponsorLogo, setSponsorLogo] = useState("💎");

  // Submission states
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedCompId, setSelectedCompId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Submit story handler
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.connected) {
      openWalletDrawer();
      return;
    }

    if (!selectedStoryId || !selectedCompId) {
      alert("Please select both an audio story and a challenge.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitToCompetition(selectedStoryId, selectedCompId);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setSelectedStoryId("");
        setSelectedCompId("");
      }, 3500);
    }, 1500);
  };

  // Launch sponsored competition pool
  const handleLaunchPool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.connected) {
      openWalletDrawer();
      return;
    }

    const prizeNum = Number(prize);
    if (!sponsorName || !theme || isNaN(prizeNum) || prizeNum <= 0) {
      alert("Please enter valid details and sponsor prize pool amount.");
      return;
    }

    if (wallet.balance < prizeNum) {
      alert(`Insufficient balance. Launching this challenge requires funding the ${prizeNum} SOL pool directly from your wallet.`);
      return;
    }

    const newComp: Competition = {
      id: `comp-${Date.now()}`,
      title: `${theme} Challenge`,
      theme,
      description,
      prizePool: `${prizeNum.toFixed(1)} SOL`,
      sponsorName,
      sponsorLogoUrl: sponsorLogo,
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days out
      active: true,
      entriesCount: 0
    };

    onAddCompetition(newComp);
    setShowSponsorPortal(false);
    // Reset form
    setSponsorName("");
    setTheme("");
    setPrize("10");
    setDescription("");
    alert(`Success! Successfully created and funded the ${theme} challenge with ${prizeNum} SOL.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="competitions-portal">
      {/* Left side: Competition cards */}
      <div className="md:col-span-7 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Sponsor Challenges
            </h2>
            <p className="text-neutral-400 text-xs mt-0.5">Submit your tokenized stories to win sponsor pool funding.</p>
          </div>
          <button
            onClick={() => setShowSponsorPortal(!showSponsorPortal)}
            className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs text-white px-4 py-2 rounded-xl transition-all font-semibold"
          >
            {showSponsorPortal ? "View Challenges" : "Sponsor Portal"}
          </button>
        </div>

        {showSponsorPortal ? (
          /* Sponsor Portal Form */
          <form onSubmit={handleLaunchPool} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-neutral-850">
              <Coins className="w-4.5 h-4.5 text-teal-400" />
              Sponsor Portal: Fund a Challenge Pool
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-400 text-xxs font-bold uppercase block mb-1.5">Sponsor Brand / Name</label>
                <input
                  type="text"
                  required
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="e.g. Solana Foundation"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-xxs font-bold uppercase block mb-1.5">Sponsor Logo Emoji</label>
                <select
                  value={sponsorLogo}
                  onChange={(e) => setSponsorLogo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  <option value="💎">💎 Diamond</option>
                  <option value="⚡">⚡ Lightning</option>
                  <option value="🐘">🐘 Elephant</option>
                  <option value="🔒">🔒 Secure</option>
                  <option value="🎪">🎪 Carnival</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-400 text-xxs font-bold uppercase block mb-1.5">Challenge Theme</label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Web3 Identity"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-xxs font-bold uppercase block mb-1.5">Funding Pool (SOL)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 text-xxs font-bold uppercase block mb-1.5">Thematic Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what creators should record and discuss under this theme..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-purple-600/10 transition-all mt-2"
            >
              Initialize & Fund Challenge ({prize} SOL)
            </button>
          </form>
        ) : (
          /* List active challenges */
          <div className="flex flex-col gap-4">
            {competitions.map((comp) => (
              <div
                key={comp.id}
                className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-750 transition-colors flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0" role="img" aria-label="Sponsor Logo">
                      {comp.sponsorLogoUrl}
                    </span>
                    <div>
                      <span className="text-xxs text-neutral-500 uppercase tracking-wider font-bold">
                        Sponsored by {comp.sponsorName}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{comp.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed max-w-xl">
                    {comp.description}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      Ends: {new Date(comp.endDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-purple-400 font-semibold">{comp.entriesCount} Submissions</span>
                  </div>
                </div>

                <div className="shrink-0 flex md:flex-col justify-between items-end md:text-right border-t md:border-t-0 border-neutral-800 pt-3 md:pt-0">
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold block">
                      Prize Pool
                    </span>
                    <span className="text-lg font-bold font-mono text-yellow-400 block mt-0.5">
                      {comp.prizePool}
                    </span>
                  </div>
                  <span className="text-[10px] bg-green-950/30 text-green-400 border border-green-900/30 px-2 py-0.5 rounded font-semibold uppercase">
                    Active Challenge
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Interactive Submission box */}
      <div className="md:col-span-5 flex flex-col gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white tracking-tight mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" />
            Submit Story Entry
          </h2>
          <p className="text-neutral-400 text-xs mb-5">
            Got an audio story minted? Submit your collectible tokens into active challenges to claim your share of the SOL reward pools.
          </p>

          <form onSubmit={handleSubmitEntry} className="flex flex-col gap-4">
            <div>
              <label className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                Select Your Minted Story
              </label>
              {stories.length === 0 ? (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-center text-xs mt-1 text-neutral-500">
                  No stories minted yet. Create one first!
                </div>
              ) : (
                <select
                  required
                  value={selectedStoryId}
                  onChange={(e) => setSelectedStoryId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-xs text-white rounded-xl px-3 py-3 mt-1.5 outline-none"
                >
                  <option value="" disabled>
                    -- Select minted story --
                  </option>
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                Select Target Challenge
              </label>
              <select
                required
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-xs text-white rounded-xl px-3 py-3 mt-1.5 outline-none"
              >
                <option value="" disabled>
                  -- Select challenge --
                </option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.title} ({comp.prizePool})
                  </option>
                ))}
              </select>
            </div>

            {!wallet.connected && (
              <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg text-xxs text-red-300 flex gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>You must connect identity credentials to verify ownership stakes before submitting entries.</span>
              </div>
            )}

            {submittedSuccess ? (
              <div className="bg-green-950/20 border border-green-900/30 p-3 rounded-xl text-center">
                <BadgeCheck className="w-6 h-6 text-green-400 mx-auto" />
                <p className="text-xs font-semibold text-green-400 mt-2">Entry Verified & Submitted!</p>
                <p className="text-[10px] text-neutral-400 mt-1">Successfully linked metadata. You've earned +20 Echo Points!</p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || stories.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-45 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Submitting secure entry...
                  </>
                ) : (
                  "Verify & Submit Entry"
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
