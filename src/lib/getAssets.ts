import { syncMarkets, type MergedAsset } from "./sync";
import type { Asset } from "@/config/types";
import { assets as staticAssets } from "@/config/assets";
import registryData from "@/config/asset-registry.json";

const exchangeMeta = registryData.exchangeMeta as Record<
  string,
  { isHip3: boolean; deployer?: string }
>;

/**
 * Fetch live market data and merge with our static config.
 *
 * Strategy:
 * 1. Call syncMarkets() to get live data from all exchanges
 * 2. Merge into Asset[] format compatible with the frontend
 * 3. If fetch fails, fall back to the static config
 */
export async function getLiveAssets(): Promise<Asset[]> {
  try {
    const merged = await syncMarkets();
    return mergedToAssets(merged);
  } catch (err) {
    console.error("getLiveAssets failed, using static config:", err);
    return staticAssets;
  }
}

/**
 * Convert MergedAsset[] (from sync) to Asset[] (frontend format).
 * Passes through real price, volume, and change data.
 */
function mergedToAssets(merged: MergedAsset[]): Asset[] {
  return merged
    .filter((m) => m.type !== "crypto")
    .map((m) => ({
      ticker: m.ticker,
      name: m.name,
      type: m.type as Asset["type"],
      sector: getSector(m.ticker),
      listings: m.listings
        .filter((l) => l.isActive)
        .map((l) => {
          const exMeta = exchangeMeta[l.exchange];
          return {
            exchangeId: l.exchange,
            maxLeverage: l.maxLeverage,
            makerFee: 0,
            takerFee: 0,
            settlementCurrency: "USDC",
            isHip3: exMeta?.isHip3 ?? !!l.deployer,
            deployer: exMeta?.deployer ?? l.deployer,
            marginType: (l.marginMode === "strictIsolated"
              ? "isolated"
              : l.marginMode === "noCross"
                ? "isolated"
                : "cross") as "cross" | "isolated" | "both",
            isActive: l.isActive,
          };
        }),
      price: m.price,
      volume24h: m.volume24h,
      change24h: m.change24h,
    }));
}

/**
 * Get sector label for known stock tickers.
 */
function getSector(ticker: string): string | undefined {
  const sectors: Record<string, string> = {
    TSLA: "Automotive / Tech",
    NVDA: "Semiconductors",
    AAPL: "Technology",
    MSFT: "Technology",
    GOOGL: "Technology",
    AMZN: "Technology",
    META: "Technology",
    AMD: "Semiconductors",
    COIN: "Fintech / Crypto",
    HOOD: "Fintech",
    PLTR: "Technology",
    NFLX: "Entertainment",
    MSTR: "Tech / Bitcoin Treasury",
    BABA: "E-commerce",
    BYD: "Automotive / EV",
    ORCL: "Technology",
    COST: "Retail",
    RIVN: "Automotive / EV",
    XOM: "Energy / Oil",
    CVX: "Energy / Oil",
    CRCL: "Fintech / Crypto",
    INTC: "Semiconductors",
    MU: "Semiconductors",
    LLY: "Healthcare / Pharma",
    TSM: "Semiconductors",
    CRWV: "Cybersecurity",
    RKLB: "Aerospace",
    URNM: "Nuclear / Uranium",
    SPACEX: "Aerospace",
    OPENAI: "AI",
    ANTHROPIC: "AI",
  };
  return sectors[ticker];
}
