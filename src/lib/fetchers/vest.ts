import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const BASE_URL = "https://serverprod.vest.exchange/v2";

interface VestTicker {
  symbol: string;       // e.g. "AAPL-PERP"
  closePrice: string;
  quoteVolume: string;  // 24h volume in USD
  priceChange: string;  // absolute change
  priceChangePercent: string; // percentage change
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
}

interface VestExchangeInfo {
  symbols: Array<{
    symbol: string;       // e.g. "AAPL-PERP"
    status: string;       // e.g. "TRADING"
    baseAsset: string;    // e.g. "AAPL"
    quoteAsset: string;   // e.g. "USD"
    pricePrecision: number;
    quantityPrecision: number;
    maxLeverage?: string;
  }>;
}

/**
 * Fetch all markets from Vest Exchange.
 * Uses /v2/ticker/24hr for live data and /v2/exchangeInfo for market metadata.
 * Symbol format: "AAPL-PERP" — we strip the -PERP suffix for normalization.
 */
export async function fetchVest(): Promise<NormalizedMarket[]> {
  // Fetch both endpoints in parallel
  const [tickerRes, infoRes] = await Promise.allSettled([
    fetch(`${BASE_URL}/ticker/24hr`),
    fetch(`${BASE_URL}/exchangeInfo`),
  ]);

  // Build leverage map from exchangeInfo
  const leverageMap = new Map<string, number>();
  if (infoRes.status === "fulfilled" && infoRes.value.ok) {
    try {
      const info: VestExchangeInfo = await infoRes.value.json();
      for (const sym of info.symbols) {
        const lev = sym.maxLeverage ? parseInt(sym.maxLeverage, 10) : 20;
        leverageMap.set(sym.symbol, lev);
      }
    } catch {
      console.error("Vest exchangeInfo parse error");
    }
  }

  // Process ticker data
  if (tickerRes.status !== "fulfilled" || !tickerRes.value.ok) {
    const status = tickerRes.status === "fulfilled" ? tickerRes.value.status : "network error";
    console.error(`Vest ticker API error: ${status}`);
    return [];
  }

  let tickers: VestTicker[];
  try {
    const body = await tickerRes.value.json();
    // Response may be { tickers: [...] } or a direct array
    tickers = Array.isArray(body) ? body : body.tickers ?? [];
  } catch {
    console.error("Vest ticker parse error");
    return [];
  }

  const markets: NormalizedMarket[] = [];

  for (const t of tickers) {
    // Strip -PERP suffix: "AAPL-PERP" -> "AAPL"
    const rawTicker = t.symbol.replace(/-PERP$/i, "");
    const ticker = normalizeTicker(rawTicker, "vest");
    const type = classifyAsset(ticker);

    // Skip crypto
    if (type === "crypto") continue;

    const price = parseFloat(t.lastPrice || t.closePrice);
    const volume = parseFloat(t.quoteVolume);
    const change = parseFloat(t.priceChangePercent);
    const maxLeverage = leverageMap.get(t.symbol) ?? 20;

    markets.push({
      ticker,
      rawTicker: t.symbol,
      name: getAssetName(ticker),
      type,
      exchange: "vest",
      isActive: true,
      maxLeverage,
      price: isFinite(price) && price > 0 ? price : undefined,
      volume24h: isFinite(volume) && volume > 0 ? volume : undefined,
      change24h: isFinite(change) ? change : undefined,
    });
  }

  return markets;
}
