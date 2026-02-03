import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const OSTIUM_URL = "https://data.ostiscan.xyz/api/coingecko/contracts";

// Skip crypto assets — we only want tradfi
const CRYPTO_TICKERS = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "TRX", "ADA", "HYPE", "LINK",
]);

// Forex bases that pair as XXXUSD
const FOREX_BASES = new Set(["EUR", "GBP", "AUD", "NZD"]);

// Forex quotes where USD is the base (USDXXX)
const FOREX_QUOTES = new Set(["JPY", "CAD", "CHF", "MXN"]);

/**
 * Fetch all markets from Ostium via ostiscan.xyz coingecko-compatible endpoint.
 * Fields: base_currency, target_currency, index_price, target_volume, open_interest_usd
 */
export async function fetchOstium(): Promise<NormalizedMarket[]> {
  try {
    const res = await fetch(OSTIUM_URL);

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

    for (const item of data) {
      const baseCurrency: string = (item.base_currency || "").toUpperCase();
      const targetCurrency: string = (item.target_currency || "").toUpperCase();
      const price = parseFloat(item.index_price) || 0;
      const volume = parseFloat(item.target_volume) || 0;

      if (!baseCurrency || !price) continue;

      // Skip crypto
      if (CRYPTO_TICKERS.has(baseCurrency)) continue;

      // Build the rawTicker for registry matching
      let rawTicker = baseCurrency;

      // For forex pairs, combine into standard format
      if (FOREX_BASES.has(baseCurrency) && targetCurrency === "USD") {
        rawTicker = `${baseCurrency}USD`; // EURUSD, GBPUSD
      } else if (baseCurrency === "USD" && FOREX_QUOTES.has(targetCurrency)) {
        rawTicker = `USD${targetCurrency}`; // USDJPY, USDCAD
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
        volume24h: volume > 0 ? volume : undefined,
        openInterest: parseFloat(item.open_interest_usd) || undefined,
      });
    }

    console.log("[Ostium] Returning", markets.length, "tradfi markets");
    return markets;
  } catch (error) {
    console.error("[Ostium] Error:", error);
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
