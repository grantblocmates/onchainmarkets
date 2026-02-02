import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const API_URL = "https://http.qfex.com/refdata";

interface QfexMarket {
  symbol: string;        // e.g. "AAPL-USD"
  base_asset: string;    // e.g. "AAPL"
  quote_asset: string;   // e.g. "USD"
  status: string;        // e.g. "active"
  lot_size: string;
  tick_size: string;
  min_order_size: string;
  max_order_size: string;
  initial_margin: string;
  maintenance_margin: string;
}

/**
 * Fetch all markets from QFEX's refdata endpoint.
 * QFEX provides market discovery only (no live prices via REST).
 * Symbol format: "AAPL-USD" — we use base_asset for normalization.
 */
export async function fetchQfex(): Promise<NormalizedMarket[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    console.error(`QFEX API error: ${res.status}`);
    return [];
  }

  const data: QfexMarket[] = await res.json();
  const markets: NormalizedMarket[] = [];

  for (const item of data) {
    const rawTicker = item.base_asset;
    const ticker = normalizeTicker(rawTicker, "qfex");
    const type = classifyAsset(ticker);

    // Skip crypto
    if (type === "crypto") continue;

    // Compute max leverage from initial_margin (fractional, e.g. "0.1" = 10x)
    const marginFrac = parseFloat(item.initial_margin);
    const maxLeverage = marginFrac > 0 ? Math.floor(1 / marginFrac) : 20;

    markets.push({
      ticker,
      rawTicker: item.symbol,
      name: getAssetName(ticker),
      type,
      exchange: "qfex",
      isActive: item.status === "active",
      maxLeverage,
    });
  }

  return markets;
}
