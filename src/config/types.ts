// Core types for Onchain Markets

export type AssetType = "stock" | "commodity" | "index" | "forex" | "bond" | "ipo" | "etf";

export interface Asset {
  ticker: string;
  name: string;
  type: AssetType;
  sector?: string;
  description?: string;
  listings: Listing[];
  // Live market data aggregated across exchanges
  price?: number; // Volume-weighted average price
  volume24h?: number; // Total 24h USD volume across all exchanges
  change24h?: number; // Volume-weighted average 24h change %
  marketCap?: number; // Only if we have it (currently undefined)
}

export interface Exchange {
  id: string;
  name: string;
  logoUrl: string;
  tradingUrlTemplate: string; // URL with {TICKER} placeholder
  referralCode?: string;
  color: string; // brand color for UI
  website: string;
  isHip3?: boolean; // Whether this is a HIP-3 deployer on Hyperliquid
  deployer?: string; // HIP-3 deployer name if applicable
}

export interface Listing {
  exchangeId: string;
  maxLeverage: number;
  makerFee: number; // percentage, e.g. 0.01 = 0.01%
  takerFee: number;
  settlementCurrency: string;
  isHip3: boolean;
  deployer?: string; // HIP3 deployer name if applicable
  marginType?: "cross" | "isolated" | "both";
  isActive: boolean;
}

// For future use — market data from APIs
export interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  openInterest: number;
  fundingRate: number;
  updatedAt: string;
}

export interface Alert {
  id: string;
  email: string;
  ticker: string;
  createdAt: string;
  triggeredAt?: string;
}

// Category metadata
export const ASSET_TYPE_META: Record<
  AssetType,
  { label: string; description: string; icon: string }
> = {
  stock: {
    label: "Stocks",
    description: "Trade US equities as perpetual contracts",
    icon: "📈",
  },
  commodity: {
    label: "Commodities",
    description: "Gold, silver, and other commodity perpetuals",
    icon: "🪙",
  },
  index: {
    label: "Indices",
    description: "Track major market indices on-chain",
    icon: "📊",
  },
  forex: {
    label: "Forex",
    description: "Major and minor currency pairs",
    icon: "💱",
  },
  bond: {
    label: "Bonds",
    description: "Government bond perpetuals",
    icon: "🏛️",
  },
  ipo: {
    label: "New IPOs",
    description: "Pre-IPO and newly listed equity perpetuals",
    icon: "🚀",
  },
  etf: {
    label: "ETFs",
    description: "Exchange-traded fund perpetuals",
    icon: "📦",
  },
};
