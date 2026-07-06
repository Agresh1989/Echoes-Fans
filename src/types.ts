export interface Story {
  id: string;
  title: string;
  creatorName: string;
  creatorAddress: string;
  audioUrl: string;
  duration: string;
  coverUrl: string;
  description: string;
  transcript: string;
  tags: string[];
  symbol: string;
  price: number; // in SOL
  supply: number; // total shares
  volume: number; // cumulative SOL traded
  royaltyPaid: number; // total creator royalties in SOL
  arweaveHash: string;
  createdAt: string;
  bids: Trade[];
  isCompetitionEntry?: boolean;
  competitionId?: string;
  sponsoredBy?: string;
}

export interface Trade {
  id: string;
  type: "BUY" | "SELL";
  traderAddress: string;
  traderName: string;
  shares: number;
  price: number; // price per share in SOL
  total: number; // total SOL
  timestamp: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  prizePool: string;
  sponsorName: string;
  sponsorLogoUrl: string;
  endDate: string;
  active: boolean;
  theme: string;
  entriesCount: number;
}

export interface WalletState {
  connected: boolean;
  address: string;
  balance: number; // SOL
  points: number; // Echoes loyalty points
}

export interface PlatformActivity {
  id: string;
  type: "MINT" | "BUY" | "SELL" | "CHALLENGE_SUBMIT";
  userAddress: string;
  userName: string;
  storyId?: string;
  storyTitle?: string;
  storySymbol?: string;
  shares?: number;
  price?: number; // in SOL
  totalAmount?: number; // in SOL
  challengeId?: string;
  challengeName?: string;
  timestamp: string; // ISO string
}

