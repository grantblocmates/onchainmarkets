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
    refdataItems = Array.isArray(body) ? body : body.data ?? [];
  } catch {
    console.error("[QFEX] Refdata parse error");
    return [];
  }

  console.log(`[QFEX] Refdata: ${refdataItems.length} markets`);

  // Parse volume data — response is { "AAPL-USD": { volume, notional }, ... }
  const volumeMap = new Map<string, number>();
  if (volumeRes.status === "fulfilled" && volumeRes.value.ok) {
    try {
      const volData: Record<string, QfexVolumeEntry> = await volumeRes.value.json();
      for (const [symbol, entry] of Object.entries(volData)) {
        if (entry.notional > 0) {
          volumeMap.set(symbol, entry.notional);
        }
      }
      console.log(`[QFEX] Volume: ${volumeMap.size} symbols with notional data`);
    } catch {
      console.error("[QFEX] Volume parse error");
    }
  } else {
    console.warn("[QFEX] Volume endpoint unavailable, continuing without volume data");
  }

  const markets: NormalizedMarket[] = [];

  for (const item of refdataItems) {
    const rawTicker = item.base_asset;
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

    // Leverage from price bounds: max_price / midpoint ratio gives approximate leverage
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
}
