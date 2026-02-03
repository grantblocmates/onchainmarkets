import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const API_URL =
  "https://metadata-backend.ostium.io/PricePublish/latest-prices";

interface OstiumPrice {
  feed_id: string;
  bid: number;
  mid: number;
  ask: number;
  isMarketOpen: boolean;
  isDayTradingClosed: boolean;
  secondsToToggleIsDayTradingClosed: number;
  from: string;
  to: string;
  timestampSeconds: number;
}

/**
 * Fetch all markets from Ostium's price endpoint.
 * Returns traditional assets with real-time mid price.
 * Note: Ostium's REST API does NOT provide volume, 24h change, or funding data.
 * Those fields are left undefined.
 */
export async function fetchOstium(): Promise<NormalizedMarket[]> {
  try {
    const res = await fetch(API_URL, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("[Ostium] Fetch failed:", res.status);
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("[Ostium] Unexpected response format:", typeof data);
      return [];
    }

    const prices: OstiumPrice[] = data;
    console.log(`[Ostium] Received ${prices.length} price feeds`);

    const markets: NormalizedMarket[] = [];

    for (const item of prices) {
      if (!item.from || !item.to) continue;

      const rawTicker = `${item.from}/${item.to}`;
      const ticker = normalizeTicker(rawTicker, "ostium");
      const type = classifyAsset(ticker);

      // Skip crypto — we only want traditional assets
      if (type === "crypto") {
        console.log(`[Ostium] Skipped ${rawTicker} -> ${ticker} (crypto)`);
        continue;
      }

      markets.push({
        ticker,
        rawTicker,
        name: getAssetName(ticker),
        type,
        exchange: "ostium",
        isActive: true,
        maxLeverage: getOstiumLeverage(type),
        price: item.mid || undefined,
        // Ostium REST API has no volume, change, or funding data
        volume24h: undefined,
        change24h: undefined,
      });
    }

    console.log(`[Ostium] Returning ${markets.length} tradfi markets`);
    return markets;
  } catch (error) {
    console.error("[Ostium] Fetch error:", error);
    return [];
  }
}

/**
 * Ostium leverage varies by asset type.
 */
function getOstiumLeverage(type: string): number {
  switch (type) {
    case "forex":
      return 500;
    case "commodity":
      return 200;
    case "stock":
      return 200;
    case "index":
      return 200;
    default:
      return 100;
  }
}
