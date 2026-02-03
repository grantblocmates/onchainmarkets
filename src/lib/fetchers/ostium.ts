import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const OSTIUM_URL =
  "https://metadata-backend.ostium.io/PricePublish/latest-prices";

// Skip crypto assets — we only want tradfi
const CRYPTO_TICKERS = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "TRX", "ADA", "HYPE", "LINK",
  "DOGE", "AVAX", "SUI", "NEAR", "APT", "OP", "ARB", "SEI", "TIA",
]);

// Forex bases that pair as XXXUSD
const FOREX_BASES = new Set(["EUR", "GBP", "AUD", "NZD"]);

// Forex quotes where USD is the base (USDXXX)
const FOREX_QUOTES = new Set(["JPY", "CAD", "CHF", "MXN"]);

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
 * Ostium REST API does NOT provide volume or 24h change.
 */
export async function fetchOstium(): Promise<NormalizedMarket[]> {
  try {
    const res = await fetch(OSTIUM_URL, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("[Ostium] Fetch failed:", res.status);
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("[Ostium] Response is not an array:", typeof data);
      return [];
    }

    console.log("[Ostium] Raw data count:", data.length);

    const markets: NormalizedMarket[] = [];

    for (const item of data as OstiumPrice[]) {
      const base = item.from;   // "XAU", "EUR", "TSLA", etc.
      const quote = item.to;    // "USD", "JPY", etc.
      const price = parseFloat(String(item.mid));

      if (!base || !price) continue;

      // Skip crypto
      if (CRYPTO_TICKERS.has(base)) continue;

      // Construct the raw ticker we'll pass to normalization:
      // - Forex XXX/USD → "EURUSD", "GBPUSD", etc.
      // - Forex USD/XXX → "USDJPY", "USDCAD", etc.
      // - Everything else → just the base ("XAU", "TSLA", "NDX")
      let rawTicker = base;
      if (FOREX_BASES.has(base) && quote === "USD") {
        rawTicker = `${base}USD`;
      } else if (base === "USD" && FOREX_QUOTES.has(quote)) {
        rawTicker = `USD${quote}`;
      }

      const ticker = normalizeTicker(rawTicker, "ostium");
      const type = classifyAsset(ticker);

      // Skip anything that didn't match a registry entry
      if (type === "crypto") continue;

      markets.push({
        ticker,
        rawTicker,
        name: getAssetName(ticker),
        type,
        exchange: "ostium",
        isActive: true,
        maxLeverage: getOstiumLeverage(type),
        price: isFinite(price) && price > 0 ? price : undefined,
        volume24h: undefined,
        change24h: undefined,
      });
    }

    console.log("[Ostium] Returning", markets.length, "tradfi markets");
    return markets;
  } catch (error) {
    console.error("[Ostium] Fetch error:", error);
    return [];
  }
}

/** Ostium leverage varies by asset type. */
function getOstiumLeverage(type: string): number {
  switch (type) {
    case "forex":
      return 500;
    case "commodity":
    case "stock":
    case "index":
      return 200;
    default:
      return 100;
  }
}
