import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash, Sparkles, Wand2, UploadCloud, ChevronRight, FileAudio, CheckCircle2, ShieldAlert, RefreshCw } from "lucide-react";
import { Story, WalletState } from "../types";
import defaultCover from "../assets/images/neon_audio_wave_1783326183651.jpg";

interface AudioRecorderProps {
  wallet: WalletState;
  onStoryMinted: (story: Story) => void;
  openWalletDrawer: () => void;
}

export default function AudioRecorder({
  wallet,
  onStoryMinted,
  openWalletDrawer,
}: AudioRecorderProps) {
  // Navigation & States
  const [activeStep, setActiveStep] = useState<"record" | "ai-tools" | "mint">("record");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");

  // AI Output states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [enhancedTranscript, setEnhancedTranscript] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [symbol, setSymbol] = useState("");

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Minting Flow States
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState<"none" | "arweave" | "solana" | "pool" | "success">("none");
  const [arweaveHash, setArweaveHash] = useState("");
  const [solanaSignature, setSolanaSignature] = useState("");
  const [supply, setSupply] = useState(100);
  const [royaltyFee, setRoyaltyFee] = useState(5);
  const [studioMessage, setStudioMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const showStudioFeedback = (text: string, type: "error" | "success" = "error") => {
    setStudioMessage({ text, type });
    setTimeout(() => {
      setStudioMessage(null);
    }, 5000);
  };

  // Audio Wave visualizer
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(10));

  // Refs for audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Drag and drop audio upload
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated recording support if mic permissions are denied or unavailable in sandboxed frames
  const [micError, setMicError] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const simulateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recording duration timer
  useEffect(() => {
    if (isRecording) {
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [isRecording]);

  // Clean up animation frames and simulation intervals
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (simulateIntervalRef.current) clearInterval(simulateIntervalRef.current);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Start Simulated Voice Recording (for sandbox/denied mic testing)
  const startSimulatedRecording = () => {
    setIsRecording(true);
    setIsSimulated(true);
    setRecordingDuration(0);
    setMicError(false);

    // Simulate wave visualization
    const updateSimulatedVisualizer = () => {
      const simulatedLevels = Array.from({ length: 30 }, () => Math.floor(Math.random() * 45) + 10);
      setAudioLevels(simulatedLevels);
    };

    simulateIntervalRef.current = setInterval(updateSimulatedVisualizer, 100);
  };

  // Stop Simulated Voice Recording
  const stopSimulatedRecording = () => {
    if (simulateIntervalRef.current) {
      clearInterval(simulateIntervalRef.current);
      simulateIntervalRef.current = null;
    }
    
    // Create a mock audio blob
    const sampleBlob = new Blob([new Uint8Array(1000)], { type: "audio/mp3" });
    setAudioBlob(sampleBlob);
    // Use a high-quality beautiful sample story audio url so that they have real voice narrations to play back!
    setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3");
    setIsRecording(false);
    setIsSimulated(false);
    setAudioLevels(Array(30).fill(15));
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      setMicError(false);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Audio frequency visualizer setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const normalized = Array.from(dataArray).map(val => Math.max(5, (val / 255) * 60));
        // Fill up visualizer spectrum
        setAudioLevels(normalized.slice(0, 30));
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        // Fill a clean flat visualizer wave
        setAudioLevels(Array(30).fill(15));
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Microphone Access Error:", err);
      setMicError(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks in the stream to release microphone light
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl("");
    setRecordingDuration(0);
  };

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setAudioBlob(file);
        setAudioUrl(URL.createObjectURL(file));
        setRecordingDuration(120); // mock duration estimate
      } else {
        showStudioFeedback("Please drop a valid audio file.", "error");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setRecordingDuration(180); // mock duration
    }
  };

  // AI Audio Suite API call
  const runAIEnhancer = async (type: "enhance" | "summarize") => {
    if (!title) {
      showStudioFeedback("Please provide a story title before running AI tools.", "error");
      return;
    }
    if (!transcript) {
      showStudioFeedback("Please enter a rough transcription or voice prompt script.", "error");
      return;
    }

    if (type === "enhance") setIsEnhancing(true);
    else setIsSummarizing(true);

    try {
      const response = await fetch("/api/story/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyTitle: title,
          transcriptText: transcript,
          promptType: type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (type === "enhance") {
          setEnhancedTranscript(data.enhancedTranscript);
        } else {
          setSummary(data.summary);
          setSuggestedTags(data.suggestedTags);
          setSymbol(data.tokenMetrics.recommendedSymbol);
        }
      }
    } catch (err) {
      console.error("AI Suite execution failure:", err);
    } finally {
      setIsEnhancing(false);
      setIsSummarizing(false);
    }
  };

  // Simulated Web3 Solana Tokenization & Arweave Permanent Storage Upload
  const startTokenizationAndMinting = () => {
    if (!wallet.connected) {
      openWalletDrawer();
      return;
    }

    if (!title) {
      showStudioFeedback("Title is required to mint.", "error");
      return;
    }

    if (wallet.balance < 0.05) {
      showStudioFeedback("Insufficient Solana devnet SOL. Please request a faucet airdrop in your wallet drawer.", "error");
      return;
    }

    setIsMinting(true);
    setMintStep("arweave");

    // Generate random mock Arweave hash
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    let hash = "Ar_";
    for (let i = 0; i < 30; i++) hash += chars.charAt(Math.floor(Math.random() * chars.length));
    setArweaveHash(hash);

    // Timeline simulation
    setTimeout(() => {
      // Arweave Success -> Proceed to Solana Mint
      setMintStep("solana");
      let sig = "5";
      for (let i = 0; i < 64; i++) sig += chars.charAt(Math.floor(Math.random() * chars.length));
      setSolanaSignature(sig);

      setTimeout(() => {
        // Solana Token Creation Success -> Create bonding curve liquidity pool
        setMintStep("pool");

        setTimeout(() => {
          // Pool creation success -> Complete
          setMintStep("success");
          setIsMinting(false);

          // Add to system stories
          const finalStory: Story = {
            id: `user-story-${Date.now()}`,
            title,
            creatorName: "You (Connected)",
            creatorAddress: wallet.address,
            audioUrl: audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            duration: formatTime(recordingDuration) || "1:30",
            coverUrl: defaultCover, // fallback cover
            description: summary || description || "No AI summary provided.",
            transcript: enhancedTranscript || transcript || "No transcription saved.",
            tags: suggestedTags.length > 0 ? suggestedTags : ["PersonalStory", "VoiceEcho"],
            symbol: symbol || "ECHO",
            price: 0.05,
            supply: supply,
            volume: 0,
            royaltyPaid: 0,
            arweaveHash: hash,
            createdAt: new Date().toISOString(),
            bids: [],
          };

          onStoryMinted(finalStory);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTranscript("");
    setSummary("");
    setEnhancedTranscript("");
    setSuggestedTags([]);
    setSymbol("");
    setAudioBlob(null);
    setAudioUrl("");
    setRecordingDuration(0);
    setActiveStep("record");
    setMintStep("none");
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm" id="creator-studio">
      {/* Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-neutral-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Audio Creator Studio</h2>
          <p className="text-neutral-400 text-xs mt-1">Record your narrative, enhance with Gemini AI, and mint permanent Solana NFTs.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setActiveStep("record")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeStep === "record"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/15"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            1. Capture
          </button>
          <button
            onClick={() => {
              if (!audioBlob) {
                showStudioFeedback("Please record or upload an audio file first.", "error");
                return;
              }
              setActiveStep("ai-tools");
            }}
            disabled={!audioBlob}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
              activeStep === "ai-tools"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/15"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            2. AI Enhancer
          </button>
          <button
            onClick={() => {
              if (!audioBlob) {
                showStudioFeedback("Please record or upload an audio file first.", "error");
                return;
              }
              setActiveStep("mint");
            }}
            disabled={!audioBlob}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
              activeStep === "mint"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/15"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            3. Tokenize
          </button>
        </div>
      </div>

      {/* Dynamic Studio Feedback message indicator */}
      {studioMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold leading-relaxed mb-6 flex items-center gap-3 ${
          studioMessage.type === "error"
            ? "bg-red-500/10 border-red-500/20 text-red-300"
            : "bg-teal-500/10 border-teal-500/20 text-teal-300"
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${studioMessage.type === "error" ? "bg-red-500" : "bg-teal-400"}`} />
          <p>{studioMessage.text}</p>
        </div>
      )}

      {/* Step 1: Record and Details */}
      {activeStep === "record" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="step-capture">
          {/* Left panel: Audio capture */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-neutral-950/80 border-2 border-dashed border-neutral-800 rounded-2xl relative min-h-[300px]">
              {!audioBlob ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 ${
                    dragActive ? "bg-purple-600/10 border-purple-500" : ""
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {isRecording ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <span className="absolute -inset-2 bg-red-600/20 rounded-full animate-ping"></span>
                        <div className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-xl shadow-red-600/20">
                          <Mic className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Waveform Visualization */}
                      <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-[280px]">
                        {audioLevels.map((level, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${level}px` }}
                            className="w-1.5 bg-gradient-to-t from-purple-500 to-red-400 rounded-full transition-all duration-75"
                          />
                        ))}
                      </div>

                      {/* High-fidelity Digital Stopwatch Display */}
                      <div className="bg-neutral-900/85 border border-red-500/30 rounded-2xl p-4 shadow-2xl shadow-red-500/5 max-w-xs w-full flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 text-red-500 text-[10px] uppercase tracking-widest font-extrabold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                          <span>ELAPSED RECORDING TIME</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 font-mono">
                          {/* Minutes */}
                          <div className="bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-850 shadow-inner">
                            <span className="text-3xl font-extrabold text-white tracking-widest">
                              {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}
                            </span>
                            <span className="block text-[8px] text-neutral-500 text-center uppercase tracking-wider mt-0.5">MIN</span>
                          </div>
                          
                          <span className="text-3xl font-extrabold text-red-500/80 animate-pulse">:</span>

                          {/* Seconds */}
                          <div className="bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-850 shadow-inner">
                            <span className="text-3xl font-extrabold text-white tracking-widest">
                              {String(recordingDuration % 60).padStart(2, '0')}
                            </span>
                            <span className="block text-[8px] text-neutral-500 text-center uppercase tracking-wider mt-0.5">SEC</span>
                          </div>
                        </div>
                        <span className="text-neutral-500 text-[9px] mt-1 font-semibold tracking-wide">
                          STUDIO CAPTURE LIVE
                        </span>
                      </div>

                      <button
                        onClick={isSimulated ? stopSimulatedRecording : stopRecording}
                        className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg active:scale-95"
                      >
                        <Square className="w-4 h-4 text-red-500 fill-red-500" />
                        Stop Recording
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-850">
                        <Mic className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-300 font-semibold">Microphone Voice Recorder</p>
                        <p className="text-neutral-500 text-xs mt-1">Click below to start narrating your audio story</p>
                      </div>

                      {micError && (
                        <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-left max-w-xs flex flex-col gap-1 text-[11px] text-purple-200">
                          <p className="font-bold flex items-center gap-1.5 text-purple-400">
                            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                            Iframe Mic Access Restrained
                          </p>
                          <p className="text-neutral-400 leading-relaxed">
                            Browsers restrict raw microphone inputs inside preview frame containers. No worries! Use our dynamic sandbox recorder instead.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 w-full max-w-[240px]">
                        <button
                          onClick={startRecording}
                          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Mic className="w-4 h-4 text-purple-400" />
                          Start Voice Mic
                        </button>
                        
                        <button
                          onClick={startSimulatedRecording}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          Simulate Live Recording
                        </button>
                      </div>

                      <div className="flex items-center gap-2 w-full max-w-[180px] my-1">
                        <div className="h-px bg-neutral-850 flex-1"></div>
                        <span className="text-xxs text-neutral-500 uppercase font-semibold">or</span>
                        <div className="h-px bg-neutral-850 flex-1"></div>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 hover:underline"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload Audio File
                      </button>
                      <p className="text-neutral-600 text-[10px]">Supports MP3, WAV, M4A up to 25MB</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Audio Recorded Successfully Panel */
                <div className="w-full flex flex-col gap-6 items-center p-4">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                    <FileAudio className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Audio Capture Locked</p>
                    <p className="text-xs text-neutral-500 mt-1">Duration: {formatTime(recordingDuration)}</p>
                  </div>

                  <audio src={audioUrl} controls className="w-full max-w-sm" />

                  <div className="flex gap-2">
                    <button
                      onClick={deleteRecording}
                      className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-red-400 font-semibold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Discard Recording
                    </button>
                    <button
                      onClick={() => setActiveStep("ai-tools")}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      Proceed to AI Enhancer
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Metadata Capture */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-neutral-300 text-xs font-semibold uppercase tracking-wider">Story Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Echoes from the Edge of Solana"
                className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-white mt-1.5 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-neutral-300 text-xs font-semibold uppercase tracking-wider">Rough Transcription / Voice Prompt Script</label>
              <p className="text-xxs text-neutral-500 mt-0.5">Type or paste what you spoke, or enter ideas. Echoes AI uses this to create dynamic summaries & NFT metadata!</p>
              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the words you just recorded or draft your script here..."
                className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-white mt-1.5 outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-neutral-300 text-xs font-semibold uppercase tracking-wider">Short Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A personal memoir on building the future."
                className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-white mt-1.5 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: AI Enhancer suite */}
      {activeStep === "ai-tools" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="step-ai-tools">
          {/* Left panel: Actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Echoes AI Co-Producer
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Unlock high-fidelity Web3 packaging. Use Gemini AI on our secure servers to enhance your transcript with vocal performance cues, extract relevant keywords/tags, and recommend an optimized Solana token ticker symbol.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => runAIEnhancer("summarize")}
                  disabled={isSummarizing || !transcript}
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-55"
                >
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-teal-400" />
                    Extract Summary, Tags & Ticker
                  </span>
                  {isSummarizing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </button>

                <button
                  onClick={() => runAIEnhancer("enhance")}
                  disabled={isEnhancing || !transcript}
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-55"
                >
                  <span className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400" />
                    Generate Professional Script Cues
                  </span>
                  {isEnhancing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Input Transcript reference */}
            <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4">
              <span className="text-xxs text-neutral-500 uppercase tracking-wider font-bold">Your Draft Transcription</span>
              <p className="text-xs text-neutral-300 mt-2 line-clamp-4 leading-relaxed font-mono bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                {transcript || "Draft is empty. Go back and record/write script first."}
              </p>
            </div>
          </div>

          {/* Right panel: AI Output displays */}
          <div className="flex flex-col gap-6">
            {/* Summary & Ticker Output */}
            <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xxs text-neutral-500 uppercase tracking-wider font-bold">Gemini AI Output Metadata</span>
                {summary ? (
                  <div className="mt-4 flex flex-col gap-4">
                    <div>
                      <span className="text-neutral-400 text-xxs font-semibold uppercase">AI Captivating Summary</span>
                      <p className="text-xs text-neutral-200 mt-1.5 leading-relaxed bg-neutral-900/60 p-3 rounded-lg border border-neutral-850">{summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-neutral-400 text-xxs font-semibold uppercase">Recommended Solana Symbol</span>
                        <p className="text-sm font-mono font-bold text-teal-400 mt-1 bg-teal-950/30 px-3 py-1.5 rounded-lg border border-teal-900/40 w-fit">
                          ${symbol}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-xxs font-semibold uppercase">Suggested Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {suggestedTags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 rounded-md">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center border border-dashed border-neutral-900 rounded-xl mt-4">
                    <p className="text-neutral-500 text-xs italic">Metadata analysis pending AI trigger...</p>
                  </div>
                )}
              </div>

              {/* Enhanced script representation */}
              <div className="mt-6 pt-4 border-t border-neutral-850">
                <span className="text-xxs text-neutral-400 font-bold uppercase tracking-wider block mb-2">Vocal Performance Script Cues</span>
                {enhancedTranscript ? (
                  <div className="max-h-[140px] overflow-y-auto bg-neutral-900/40 p-3 rounded-lg border border-neutral-850 text-xxs font-mono text-purple-300 leading-relaxed whitespace-pre-wrap">
                    {enhancedTranscript}
                  </div>
                ) : (
                  <p className="text-neutral-600 text-[10px] italic">Generate script cues to view structural and emotional pacing cues for audio files.</p>
                )}
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setActiveStep("record")}
                className="text-neutral-400 hover:text-white font-semibold text-xs py-2 px-4 rounded-xl hover:bg-neutral-900 transition-colors"
              >
                Back to capture
              </button>
              <button
                onClick={() => setActiveStep("mint")}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95"
              >
                Proceed to Tokenize & Mint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Solana Tokenization & Arweave Permanent Storage */}
      {activeStep === "mint" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="step-mint">
          {/* Left Panel: Minting settings */}
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">Configure Audio Story Collectible</h3>
              <p className="text-neutral-400 text-xs">Set the total supply and creator royalty fees for secondary trading on Solana.</p>

              {/* Tokenization parameters */}
              <div className="mt-6 flex flex-col gap-5">
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-300 font-semibold">Total Ownership Shares</span>
                    <span className="text-white font-mono font-bold bg-neutral-900 px-2 py-1 rounded border border-neutral-800">{supply} Shares</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={supply}
                    onChange={(e) => setSupply(Number(e.target.value))}
                    className="w-full accent-purple-500 mt-2"
                  />
                  <p className="text-xxs text-neutral-500 mt-1">Defines the total outstanding supply. Fractional keys will be sold on a bonding curve.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-300 font-semibold">Permanent Creator Royalty Fee</span>
                    <span className="text-teal-400 font-mono font-bold bg-teal-950/20 px-2 py-1 rounded border border-teal-900/30">{royaltyFee}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={royaltyFee}
                    onChange={(e) => setRoyaltyFee(Number(e.target.value))}
                    className="w-full accent-teal-500 mt-2"
                  />
                  <p className="text-xxs text-neutral-500 mt-1">Ears permanent royalties from EVERY trade made on secondary markets. Sent straight to your wallet.</p>
                </div>
              </div>
            </div>

            {/* Wallet authorization warning if un-connected */}
            {!wallet.connected ? (
              <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-200">Wallet Connection Required</p>
                  <p className="text-neutral-400 text-[10px] mt-1">Please connect your secure Privy account or Solana wallet before minting. Each mint costs roughly ~0.05 SOL for permanent Arweave storage & account initialization.</p>
                  <button
                    onClick={openWalletDrawer}
                    className="bg-red-900/40 hover:bg-red-800/40 text-red-200 border border-red-800/30 text-xxs px-3 py-1.5 rounded-lg font-bold mt-2.5 transition-all"
                  >
                    Authenticate Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <span className="text-neutral-300 text-xs">Airdrop Devnet active</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 text-xxs uppercase tracking-wider block font-bold">Your Balance</span>
                  <span className="text-white font-mono font-bold text-sm">{wallet.balance.toFixed(2)} SOL</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Active compilation/upload status */}
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-xxs text-neutral-400 font-bold uppercase tracking-wider block">Decentralized Deployment Pipeline</span>

              {mintStep === "none" && (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                  <UploadCloud className="w-10 h-10 text-neutral-500" />
                  <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                    Ready to initiate permanent Arweave block serialization and Solana smart contract key tokenization.
                  </p>
                </div>
              )}

              {/* Step 1: Arweave upload */}
              {(mintStep === "arweave" || mintStep === "solana" || mintStep === "pool" || mintStep === "success") && (
                <div className="mt-4 flex flex-col gap-4">
                  {/* Arweave Block */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    mintStep === "arweave" ? "bg-purple-950/20 border-purple-500/40" : "bg-neutral-900/60 border-neutral-800"
                  }`}>
                    <div className="flex items-center gap-3">
                      {mintStep === "arweave" ? (
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-white">Arweave Block Upload</p>
                        <p className="text-xxs text-neutral-400 mt-0.5">Encrypting audio & permanently hashing story node metadata</p>
                      </div>
                    </div>
                    {arweaveHash && (
                      <span className="font-mono text-xxs text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30">
                        {arweaveHash.slice(0, 10)}...
                      </span>
                    )}
                  </div>

                  {/* Solana Account creation */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    mintStep === "solana" ? "bg-purple-950/20 border-purple-500/40" : 
                    (mintStep === "pool" || mintStep === "success") ? "bg-neutral-900/60 border-neutral-800" : "opacity-40 border-neutral-900"
                  }`}>
                    <div className="flex items-center gap-3">
                      {mintStep === "solana" ? (
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : (mintStep === "pool" || mintStep === "success") ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-white">Initialize Token & Metadata Account</p>
                        <p className="text-xxs text-neutral-400 mt-0.5">Minting ${symbol || "ECHO"} non-custodial collectible NFT shares on-chain</p>
                      </div>
                    </div>
                  </div>

                  {/* Liquidity pool */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    mintStep === "pool" ? "bg-purple-950/20 border-purple-500/40" : 
                    mintStep === "success" ? "bg-neutral-900/60 border-neutral-800" : "opacity-40 border-neutral-900"
                  }`}>
                    <div className="flex items-center gap-3">
                      {mintStep === "pool" ? (
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : mintStep === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-white">Create Secondary Market Bonding Curve</p>
                        <p className="text-xxs text-neutral-400 mt-0.5">Injecting initial virtual liquidity pool (0.05 SOL base price)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Success banner */}
              {mintStep === "success" && (
                <div className="mt-4 p-4 bg-green-950/20 border border-green-900/30 rounded-xl text-center">
                  <p className="text-xs font-semibold text-green-400">Mint Complete & Tokenized!</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Story permanently verified. Bonding curve is officially live for secondary share trading.</p>
                  <button
                    onClick={resetForm}
                    className="bg-green-900/40 hover:bg-green-900/60 text-green-200 text-xxs font-bold px-3 py-1.5 rounded-lg mt-3 transition-colors"
                  >
                    Create Another Story
                  </button>
                </div>
              )}
            </div>

            {/* Launch Action */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setActiveStep("ai-tools")}
                disabled={isMinting}
                className="text-neutral-400 hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-neutral-900 transition-colors disabled:opacity-40"
              >
                Back to AI Suite
              </button>
              <button
                onClick={startTokenizationAndMinting}
                disabled={isMinting || mintStep === "success"}
                className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-45"
              >
                {isMinting ? "Processing Transaction..." : mintStep === "success" ? "MINTED" : "Launch permananent Arweave / Solana Mint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
