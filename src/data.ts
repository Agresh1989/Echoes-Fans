import { Story, Competition } from "./types";
import cover1 from "./assets/images/neon_audio_wave_1783326183651.jpg";
import cover2 from "./assets/images/cosmic_storyteller_1783326194652.jpg";
import cover3 from "./assets/images/voice_token_1783326206497.jpg";

export const INITIAL_STORIES: Story[] = [
  {
    id: "story-1",
    title: "Solana Summer: The Missing Wallet",
    creatorName: "CyberShaman",
    creatorAddress: "7xKXvS2gY9zpH3RkJwA90sL9Q1K6fL2yS",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "2:14",
    coverUrl: cover1,
    description: "An interactive cyber-thriller about an old ledger found in a vintage market, holding millions in SOL, but encrypted with a riddle that leads to Lisbon.",
    transcript: "It was August in Lisbon. The heat was radiating off the pavement. I was scanning a table at a local market when my eyes caught an old, silver metal thumb drive. It had the early Solana logo scratched into it. The seller wanted 2 Euros. Little did I know, this device held the keys to a wallet that hadn't been opened since 2020. But there was a catch—the seed phrase was locked behind a cryptographic audio riddle.",
    tags: ["Cyberpunk", "Adventure", "SolanaSummer", "TrueCrime"],
    symbol: "WALLET",
    price: 0.12,
    supply: 240,
    volume: 18.5,
    royaltyPaid: 0.925,
    arweaveHash: "Ar_9v3XyK_F9k3jK1o0_Ls6b9D_z9S8K3Q0",
    createdAt: "2026-07-04T12:00:00.000Z",
    bids: [
      { id: "t1", type: "BUY", traderAddress: "9sXyH8Jp4nKqB9L5rQ9K3vA0sS7dF8g9", traderName: "DeFi_Don", shares: 10, price: 0.11, total: 1.1, timestamp: "2026-07-05T14:30:00Z" },
      { id: "t2", type: "BUY", traderAddress: "2nKp...Pq90", traderName: "SolyBoy", shares: 5, price: 0.12, total: 0.6, timestamp: "2026-07-05T16:15:00Z" },
    ]
  },
  {
    id: "story-2",
    title: "The Astronaut's Final Dispatch",
    creatorName: "CosmicGazer",
    creatorAddress: "D9zRPq45vS2gH3RjKwA90sL9Q1K6fL2y",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "3:45",
    coverUrl: cover2,
    description: "The last audio recording sent from Echo-9, a lone explorer vessel drifting near the Sagittarius Arm. Grounded in loneliness, hope, and cosmic beauty.",
    transcript: "Echo-9 to Houston, do you read? The solar sails have stabilized, but the comms array is failing. I am looking out the main portal at the birth of a nebula. It is a canvas of deep violet, cyan, and gold. If this is my final transmission, I want my voice to be preserved. Not in a government database, but scattered permanently among the stars. To anyone listening—remember me by my voice.",
    tags: ["Sci-Fi", "Cosmic", "Drama", "Solo"],
    symbol: "ECHO9",
    price: 0.28,
    supply: 150,
    volume: 42.1,
    royaltyPaid: 2.105,
    arweaveHash: "Ar_z8H3qW_T8z9xP1_o9Dk2r9S7J_L5V0",
    createdAt: "2026-07-03T09:00:00.000Z",
    bids: [
      { id: "t3", type: "BUY", traderAddress: "4xQp...Kp23", traderName: "ArweaveAlchemist", shares: 20, price: 0.25, total: 5.0, timestamp: "2026-07-04T10:00:00Z" },
      { id: "t4", type: "BUY", traderAddress: "7xKXvS2gY9zpH3RkJwA90sL9Q1K6fL2yS", traderName: "CyberShaman", shares: 8, price: 0.28, total: 2.24, timestamp: "2026-07-05T18:20:00Z" },
    ]
  },
  {
    id: "story-3",
    title: "Voice Protocols: The Tokenization Era",
    creatorName: "SolyBuilder",
    creatorAddress: "8vRp...Xy89",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "1:58",
    coverUrl: cover3,
    description: "A profound manifesto on why ownership of human speech matters. Explores the history of centralized platforms and the rise of decentralized audio layers.",
    transcript: "For decades, we gave away our voices. We recorded videos, podcasts, and notes on platforms that took our data, sold ads, and gave us back pennies. But voice is the ultimate signature of the soul. It is unique. By tokenizing our stories, we create a direct economic link between the speaker and the listener. No censors. No middlemen. Only permanent echoes stored forever on Arweave and owned on Solana.",
    tags: ["Manifesto", "Web3", "AudioNFT", "Solana"],
    symbol: "VOICE",
    price: 0.08,
    supply: 500,
    volume: 12.4,
    royaltyPaid: 0.62,
    arweaveHash: "Ar_k9Y3pS_Z3x9wL4_o8Dj3m8F4S_X7V1",
    createdAt: "2026-07-05T08:00:00.000Z",
    bids: [
      { id: "t5", type: "BUY", traderAddress: "9sXyH8Jp4nKqB9L5rQ9K3vA0sS7dF8g9", traderName: "DeFi_Don", shares: 50, price: 0.05, total: 2.5, timestamp: "2026-07-05T09:00:00Z" },
    ]
  }
];

export const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: "challenge-1",
    title: "Voices of the Future",
    theme: "AI Ethics vs Human Speech",
    description: "Sponsor challenge: Record a story exploring the friction, harmony, or dystopian future of AI deepfakes vs authenticated human speech on-chain. Best narrative wins the prize pool.",
    prizePool: "50.0 SOL",
    sponsorName: "Privy Auth",
    sponsorLogoUrl: "🔒",
    endDate: "2026-07-15T23:59:59.000Z",
    active: true,
    entriesCount: 14
  },
  {
    id: "challenge-2",
    title: "The Solana Hustle",
    theme: "Real Web3 Builder Memoirs",
    description: "Arweave & Echoes joint challenge: Tell your craziest hackathon story, the 4 AM deploys, the liquidations, or the massive wins. Must be a personal first-person voice log.",
    prizePool: "25.0 SOL",
    sponsorName: "Arweave Foundation",
    sponsorLogoUrl: "🐘",
    endDate: "2026-07-20T23:59:59.000Z",
    active: true,
    entriesCount: 8
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    type: "MINT" as const,
    userAddress: "7xKX...Y9zp",
    userName: "CyberShaman",
    storyId: "story-1",
    storyTitle: "Solana Summer: The Missing Wallet",
    storySymbol: "WALLET",
    timestamp: "2026-07-06T00:15:00.000Z"
  },
  {
    id: "act-2",
    type: "BUY" as const,
    userAddress: "9sXy...8Jp4",
    userName: "DeFi_Don",
    storyId: "story-3",
    storyTitle: "Voice Protocols: The Tokenization Era",
    storySymbol: "VOICE",
    shares: 50,
    price: 0.05,
    totalAmount: 2.50,
    timestamp: "2026-07-06T00:45:00.000Z"
  },
  {
    id: "act-3",
    type: "CHALLENGE_SUBMIT" as const,
    userAddress: "8vRp...Xy89",
    userName: "SolyBuilder",
    storyId: "story-3",
    storyTitle: "Voice Protocols: The Tokenization Era",
    challengeId: "challenge-1",
    challengeName: "Voices of the Future",
    timestamp: "2026-07-06T01:05:00.000Z"
  },
  {
    id: "act-4",
    type: "BUY" as const,
    userAddress: "2nKp...Pq90",
    userName: "SolyBoy",
    storyId: "story-1",
    storyTitle: "Solana Summer: The Missing Wallet",
    storySymbol: "WALLET",
    shares: 5,
    price: 0.12,
    totalAmount: 0.60,
    timestamp: "2026-07-06T01:12:00.000Z"
  }
];

