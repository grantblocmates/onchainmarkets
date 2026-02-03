import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const REFDATA_URL = "https://http.qfex.com/refdata";
const VOLUME_URL = "https://http.qfex.com/v4/volume/today";

interface QfexMarket {
  clobPairId: string;
  symbol: string;        // e.g. "AAPL-USD"
  base_asset: string;    // e.g. "AAPL"
  quote_asset: string;   // e.g. "USD"
  status: string;        // e.g. "ACTIVE"
  lot_size: string;
  tick_size: string;
  min_price: string;
  max_price: string;
  min_quantity: string;
  max_quantity: string;
}

interface QfexVolumeEntry {
  volume: number;
  notional: number;      // USD notional volume
}

/**
 * Fetch all markets from QFEX.
 * Uses /refdata for market metadata and /v4/volume/today for daily volume.
 * Symbol format: "AAPL-USD" — we use base_asset for normalization.
 */
export async function fetchQfex(): Promise<NormalizedMarket[]> {
  try {
    // --- Fetch refdata ---
    const refdataRes = await fetch(REFDATA_URL);
    if (!refdataRes.ok) {
      console.error("[QFEX] Refdata fetch failed:", refdataRes.status);
      return [];
    }

    const refdataBody = await refdataRes.json();

    // Response is { type: "refdata", data: [...] } or possibly a raw array
    const rawData = Array.isArray(refdataBody) ? refdataBody : refdataBody?.data;
    if (!Array.isArray(rawData)) {
      console.error("[QFEX] refdata.data is not an array:", typeof refdataBody);
      return [];
    }

    const refdataItems: QfexMarket[] = rawData;
    console.log(`[QFEX] Refdata: ${refdataItems.length} markets`);

    // --- Fetch volume (object keyed by symbol, NOT an array) ---
    let volumeData: Record<string, QfexVolumeEntry> = {};
    try {
      const volumeRes = await fetch(VOLUME_URL);
      if (volumeRes.ok) {
        const volumeBody = await volumeRes.json();
        if (volumeBody && typeof volumeBody === "object" && !Array.isArray(volumeBody)) {
          volumeData = volumeBody;
        }
      }
      console.log("[QFEX] Volume keys:", Object.keys(volumeData).length);
    } catch (e) {
      console.warn("[QFEX] Volume fetch failed, continuing without:", e);
    }

    // --- Build normalized markets ---
    const markets: NormalizedMarket[] = [];

    for (const item of refdataItems) {
      if (!item.base_asset || item.status !== "ACTIVE") continue;

      const rawTicker = item.base_asset;
      const ticker = normalizeTicker(rawTicker, "qfex");
      const type = classifyAsset(ticker);

      if (type === "crypto") {
        console.log(`[QFEX] Skipped ${rawTicker} -> ${ticker} (crypto)`);
        continue;
      }

      // Price from min/max bounds midpoint
      const minPrice = parseFloat(item.min_price) || 0;
      const maxPrice = parseFloat(item.max_price) || 0;
      const price = (minPrice + maxPrice) / 2;

      // Leverage from price bounds
      const halfSpread = maxPrice - price;
      const maxLeverage = halfSpread > 0 ? Math.max(1, Math.floor(price / halfSpread)) : 20;

      // Access volume directly by symbol key — no iteration needed
      const volumeEntry = volumeData[item.symbol];
      const volume24h = volumeEntry?.notional ?? 0;

      markets.push({
        ticker,
        rawTicker: item.symbol,
        name: getAssetName(ticker),
        type,
        exchange: "qfex",
        isActive: true,
        maxLeverage,
        price: isFinite(price) && price > 0 ? price : undefined,
        volume24h: volume24h > 0 ? volume24h : undefined,
      });
    }

    console.log(`[QFEX] Returning ${markets.length} tradfi markets`);
    return markets;
  } catch (error) {
    console.error("[QFEX] Fetch error:", error);
    return [];
  }
}
