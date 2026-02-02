import {
  NormalizedMarket,
  ExchangeId,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const API_URL = "https://api.hyperliquid.xyz/info";

/**
 * Map HIP-3 deployer prefixes to exchange IDs.
 * Each deployer gets its own exchange column in the registry.
 */
const DEPLOYER_EXCHANGE_MAP: Record<string, ExchangeId> = {
  xyz: "tradexyz",
  cash: "cash",
  hyna: "hyna",
  vntl: "vntl",
  flx: "flx",
  km: "km",
};

/** All deployer DEXes to fetch */
const DEPLOYER_DEXES = Object.keys(DEPLOYER_EXCHANGE_MAP);

interface HyperliquidUniverse {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  marginTableId?: number;
  isDelisted?: boolean;
  marginMode?: string;
  onlyIsolated?: boolean;
}

interface HyperliquidAssetCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  impactPxs: [string, string];
  dayBaseVlm: string;
}

interface MetaAndAssetCtxsResponse {
  universe: HyperliquidUniverse[];
  marginTables?: unknown[];
}

/**
 * Fetch metadata + live data for a single DEX from Hyperliquid.
 */
async function fetchDex(
  dexName?: string
): Promise<{ meta: HyperliquidUniverse[]; ctxs: HyperliquidAssetCtx[] }> {
  const body: Record<string, string> = { type: "metaAndAssetCtxs" };
  if (dexName) body.dex = dexName;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`Hyperliquid API error (dex=${dexName ?? "main"}): ${res.status}`);
    return { meta: [], ctxs: [] };
  }

  const data = await res.json();
  const metaObj = data[0] as MetaAndAssetCtxsResponse;
  const ctxs = data[1] as HyperliquidAssetCtx[];

  return { meta: metaObj.universe || [], ctxs: ctxs || [] };
}

/**
 * Process markets from a single DEX fetch into NormalizedMarket[].
 */
function processMarkets(
  meta: HyperliquidUniverse[],
  ctxs: HyperliquidAssetCtx[],
  dexName?: string
): NormalizedMarket[] {
  const markets: NormalizedMarket[] = [];

  for (let i = 0; i < meta.length; i++) {
    const asset = meta[i];
    const ctx = ctxs[i];
    if (!asset || asset.isDelisted) continue;

    const rawTicker = asset.name;

    // Determine exchange ID for this market so we can do exchange-aware normalization
    const deployer = rawTicker.includes(":")
      ? rawTicker.split(":")[0]
      : dexName;

    const exchange: ExchangeId = deployer
      ? (DEPLOYER_EXCHANGE_MAP[deployer] ?? "hyperliquid")
      : "hyperliquid";

    // Exchange-aware normalization prevents false positives
    // (e.g. "SPX" on HL main is SPX6900 memecoin, not S&P 500)
    const ticker = normalizeTicker(rawTicker, exchange);
    const type = classifyAsset(ticker);
    if (type === "crypto") continue;

    const markPx = parseFloat(ctx?.markPx) || 0;
    const prevDayPx = parseFloat(ctx?.prevDayPx) || 0;
    const change24h =
      prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : undefined;

    markets.push({
      ticker,
      rawTicker,
      name: getAssetName(ticker),
      type,
      exchange,
      isActive: true,
      maxLeverage: asset.maxLeverage,
      marginMode: asset.marginMode,
      deployer,
      price: markPx || undefined,
      volume24h: parseFloat(ctx?.dayNtlVlm) || undefined,
      change24h,
      funding: parseFloat(ctx?.funding) || undefined,
      openInterest: parseFloat(ctx?.openInterest) || undefined,
    });
  }

  return markets;
}

/**
 * Fetch all perpetual markets from Hyperliquid, including all HIP-3 deployers.
 *
 * Makes separate calls for:
 * 1. Main perps (no dex param)
 * 2. Each deployer DEX (xyz, cash, hyna, vntl, flx, km)
 *
 * Only includes tickers that exist in the asset registry (non-crypto).
 */
export async function fetchHyperliquid(): Promise<NormalizedMarket[]> {
  const [mainResult, ...deployerResults] = await Promise.allSettled([
    fetchDex(),
    ...DEPLOYER_DEXES.map((d) => fetchDex(d)),
  ]);

  const markets: NormalizedMarket[] = [];

  // Main DEX
  if (mainResult.status === "fulfilled") {
    const { meta, ctxs } = mainResult.value;
    markets.push(...processMarkets(meta, ctxs));
  } else {
    console.error("Hyperliquid main DEX fetch failed:", mainResult.reason);
  }

  // Deployer DEXes
  for (let d = 0; d < DEPLOYER_DEXES.length; d++) {
    const result = deployerResults[d];
    const dexName = DEPLOYER_DEXES[d];

    if (result.status !== "fulfilled") {
      console.error(`Hyperliquid ${dexName} DEX fetch failed:`, result.reason);
      continue;
    }

    const { meta, ctxs } = result.value;
    markets.push(...processMarkets(meta, ctxs, dexName));
  }

  return markets;
}
