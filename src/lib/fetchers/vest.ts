import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const BASE_URL = "https://server-prod.hz.vestmarkets.com/v2";

const HEADERS = {
  xrestservermm: "restserver0",
};

interface VestTicker {
  symbol: string;       // e.g. "AAPL-USD-PERP" (tradfi) or "BTC-PERP" (crypto)
  closePrice: string;
  quoteVolume: string;  // 24h volume in USD
  priceChange: string | null;
  priceChangePercent: string | null;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
}

interface VestExchangeSymbol {
  symbol: string;           // e.g. "AAPL-USD-PERP"
  displayName: string;
  base: string;             // e.g. "AAPL-USD"
  quote: string;            // e.g. "USDC"
  sizeDecimals: number;
  priceDecimals: number;
  initMarginRatio: string;  // e.g. "0.040000" → 25x leverage
  maintMarginRatio: string;
  asset: string;            // "stock" | "forex" | "crypto"
}

/**
 * Fetch all markets from Vest Exchange.
 * Uses /v2/ticker/24hr for live data and /v2/exchangeInfo for market metadata.
 * Tradfi symbol format: "AAPL-USD-PERP" — we strip the -USD-PERP suffix.
 * Crypto symbol format: "BTC-PERP" — these are filtered out.
 */
export async function fetchVest(): Promise<NormalizedMarket[]> {
  // Fetch both endpoints in parallel
  const [tickerRes, infoRes] = await Promise.allSettled([
    fetch(`${BASE_URL}/ticker/24hr`, { headers: HEADERS }),
    fetch(`${BASE_URL}/exchangeInfo`, { headers: HEADERS }),
  ]);

  // Build leverage map and asset type map from exchangeInfo
  const leverageMap = new Map<string, number>();
  const assetTypeMap = new Map<string, string>();
  if (infoRes.status === "fulfilled" && infoRes.value.ok) {
    try {
      const info: { symbols: VestExchangeSymbol[] } = await infoRes.value.json();
      for (const sym of info.symbols) {
        // Compute leverage from initMarginRatio: 0.04 → 25x
        const margin = parseFloat(sym.initMarginRatio);
        const lev = margin > 0 ? Math.floor(1 / margin) : 20;
        leverageMap.set(sym.symbol, lev);
        assetTypeMap.set(sym.symbol, sym.asset);
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
    // Response is { tickers: [...] }
    tickers = Array.isArray(body) ? body : body.tickers ?? [];
  } catch {
    console.error("Vest ticker parse error");
    return [];
  }

  const markets: NormalizedMarket[] = [];

  for (const t of tickers) {
    // Skip crypto by asset type from exchangeInfo (faster than normalization)
    const vestAssetType = assetTypeMap.get(t.symbol);
    if (vestAssetType === "crypto") continue;

    // Tradfi symbols: "AAPL-USD-PERP" -> "AAPL"
    // Crypto symbols: "BTC-PERP" -> "BTC" (will be filtered by classifyAsset)
    const rawTicker = t.symbol.replace(/-USD-PERP$/i, "").replace(/-PERP$/i, "");
    const ticker = normalizeTicker(rawTicker, "vest");
    const type = classifyAsset(ticker);

    // Skip crypto (fallback filter)
    if (type === "crypto") continue;

    const price = parseFloat(t.closePrice || t.lastPrice);
    const volume = parseFloat(t.quoteVolume);
    const maxLeverage = leverageMap.get(t.symbol) ?? 20;

    // Compute change% — priceChangePercent is often null, derive from open/close
    let change24h: number | undefined;
    if (t.priceChangePercent != null) {
      change24h = parseFloat(t.priceChangePercent);
    } else {
      const open = parseFloat(t.openPrice);
      const close = parseFloat(t.closePrice);
      if (isFinite(open) && open > 0 && isFinite(close)) {
        change24h = ((close - open) / open) * 100;
      }
    }

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
      change24h: isFinite(change24h!) ? change24h : undefined,
    });
  }

  return markets;
}
