import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const BASE_URL = "https://http.qfex.com";

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
    const [refdataRes, volumeRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/refdata`),
      fetch(`${BASE_URL}/v4/volume/today`),
    ]);

    if (refdataRes.status !== "fulfilled" || !refdataRes.value.ok) {
      const detail = refdataRes.status === "rejected"
        ? String((refdataRes as PromiseRejectedResult).reason?.cause?.code ?? (refdataRes as PromiseRejectedResult).reason?.message ?? "unknown")
        : String(refdataRes.value.status);
      console.error(`[QFEX] Refdata API error: ${detail}`);
      return [];
    }

    // Parse refdata — response is { type: "refdata", data: [...] }
    let refdataItems: QfexMarket[];
    try {
      const body = await refdataRes.value.json();
      const rawData = Array.isArray(body) ? body : body?.data;
      if (!Array.isArray(rawData)) {
        console.error("[QFEX] Unexpected refdata format:", typeof body, Array.isArray(body) ? "array" : Object.keys(body || {}).join(","));
        return [];
      }
      refdataItems = rawData;
    } catch (e) {
      console.error("[QFEX] Refdata parse error:", e);
      return [];
    }

    console.log(`[QFEX] Refdata: ${refdataItems.length} markets`);

    // Parse volume data — response is { "AAPL-USD": { volume, notional }, ... }
    const volumeMap = new Map<string, number>();
    if (volumeRes.status === "fulfilled" && volumeRes.value.ok) {
      try {
        const volData = await volumeRes.value.json();
        if (volData && typeof volData === "object" && !Array.isArray(volData)) {
          for (const [symbol, entry] of Object.entries(volData)) {
            const vol = entry as QfexVolumeEntry;
            if (vol && typeof vol.notional === "number" && vol.notional > 0) {
              volumeMap.set(symbol, vol.notional);
            }
          }
        }
        console.log(`[QFEX] Volume: ${volumeMap.size} symbols with notional data`);
      } catch (e) {
        console.error("[QFEX] Volume parse error:", e);
      }
    } else {
      console.warn("[QFEX] Volume endpoint unavailable, continuing without volume data");
    }

    const markets: NormalizedMarket[] = [];

    for (const item of refdataItems) {
      const rawTicker = item.base_asset;
      if (!rawTicker) continue;

      const ticker = normalizeTicker(rawTicker, "qfex");
      const type = classifyAsset(ticker);

      if (type === "crypto") {
        console.log(`[QFEX] Skipped ${rawTicker} -> ${ticker} (crypto)`);
        continue;
      }

      // Estimate price from min/max bounds midpoint
      const minPrice = parseFloat(item.min_price);
      const maxPrice = parseFloat(item.max_price);
      const price = (minPrice + maxPrice) / 2;

      // Leverage from price bounds
      const halfSpread = maxPrice - price;
      const maxLeverage = halfSpread > 0 ? Math.max(1, Math.floor(price / halfSpread)) : 20;

      const volume24h = volumeMap.get(item.symbol);

      markets.push({
        ticker,
        rawTicker: item.symbol,
        name: getAssetName(ticker),
        type,
        exchange: "qfex",
        isActive: item.status === "ACTIVE",
        maxLeverage,
        price: isFinite(price) && price > 0 ? price : undefined,
        volume24h: volume24h && volume24h > 0 ? volume24h : undefined,
      });
    }

    console.log(`[QFEX] Returning ${markets.length} tradfi markets`);
    return markets;
  } catch (error) {
    console.error("[QFEX] Unexpected error:", error);
    return [];
  }
}
