/**
 * Types and helpers for On-Chain Markets.
 *
 * The asset registry (asset-registry.json) is the single source of truth
 * for tickers, names, categories, and exchange mappings.
 * All normalization and classification is driven by the registry.
 */

import registryData from "@/config/asset-registry.json";

// --------------- Core types ---------------

export interface NormalizedMarket {
  ticker: string; // Canonical ticker from registry, e.g. "TSLA", "XAU", "EURUSD"
  rawTicker: string; // Original ticker from exchange, e.g. "xyz:TSLA", "XAG/USD"
  name: string; // Human-readable name
  type: AssetCategory;
  exchange: ExchangeId; // Which exchange this market lives on
  isActive: boolean;
  maxLeverage: number;
  marginMode?: string;
  price?: number;
  volume24h?: number;
  change24h?: number;
  funding?: number;
  openInterest?: number;
  deployer?: string; // For HIP-3: "xyz", "flx", "km", "cash", "hyna", "vntl"
}

export type ExchangeId =
  | "hyperliquid"
  | "tradexyz"
  | "cash"
  | "hyna"
  | "vntl"
  | "flx"
  | "km"
  | "lighter"
  | "ostium"
  | "qfex"
  | "vest";

export type AssetCategory =
  | "stock"
  | "commodity"
  | "index"
  | "forex"
  | "bond"
  | "crypto";

// --------------- Registry-driven lookup tables ---------------

interface RegistryAsset {
  canonical: string;
  name: string;
  category: string;
  exchanges: Record<string, string | null>;
}

const registryAssets: RegistryAsset[] = registryData.assets;

/**
 * Reverse lookup: raw exchange ticker -> canonical ticker.
 * Built from the registry at import time.
 */
const RAW_TO_CANONICAL = new Map<string, string>();

/** canonical ticker -> registry entry */
const CANONICAL_MAP = new Map<string, RegistryAsset>();

/**
 * Exchange-specific reverse lookup: "exchangeId:rawTicker" -> canonical ticker.
 * This prevents false positives where a raw ticker on one exchange (e.g. "GAS"
 * on FLX = Natural Gas) accidentally matches a crypto token with the same
 * ticker on another exchange (e.g. "GAS" on HL main = Gas crypto token).
 */
const EXCHANGE_RAW_TO_CANONICAL = new Map<string, string>();

for (const asset of registryAssets) {
  CANONICAL_MAP.set(asset.canonical, asset);
  RAW_TO_CANONICAL.set(asset.canonical, asset.canonical);

  for (const [exchangeId, rawTicker] of Object.entries(asset.exchanges)) {
    if (rawTicker) {
      RAW_TO_CANONICAL.set(rawTicker, asset.canonical);

      // Exchange-specific mapping: only map tickers for exchanges where the asset is actually listed
      EXCHANGE_RAW_TO_CANONICAL.set(`${exchangeId}:${rawTicker}`, asset.canonical);
      // Also map canonical ticker → itself for this exchange
      EXCHANGE_RAW_TO_CANONICAL.set(`${exchangeId}:${asset.canonical}`, asset.canonical);

      // Strip /USD suffix for matching (e.g. "XAU/USD" -> "XAU")
      if (rawTicker.includes("/")) {
        const stripped = rawTicker.split("/")[0];
        if (!RAW_TO_CANONICAL.has(stripped)) {
          RAW_TO_CANONICAL.set(stripped, asset.canonical);
        }
        EXCHANGE_RAW_TO_CANONICAL.set(`${exchangeId}:${stripped}`, asset.canonical);
      }
    }
  }
}

// --------------- Public API ---------------

/**
 * Normalize a raw ticker to its canonical form using the registry.
 * Strips deployer prefix, checks reverse lookup, falls back to uppercase.
 *
 * When `exchangeId` is provided, uses exchange-specific lookup to avoid
 * false positives (e.g. "SPX" on HL main is SPX6900 memecoin, not S&P 500).
 * Only tickers actually registered for that exchange will match.
 */
export function normalizeTicker(raw: string, exchangeId?: ExchangeId): string {
  const withoutPrefix = raw.includes(":") ? raw.split(":")[1] : raw;

  // If exchange is specified, ONLY use exchange-specific lookup.
  // This prevents false positives where a ticker exists as a canonical name
  // but is actually a different asset on this exchange (e.g. SPX on HL main
  // is SPX6900 memecoin, not S&P 500 index).
  if (exchangeId) {
    const exSpecific = EXCHANGE_RAW_TO_CANONICAL.get(`${exchangeId}:${withoutPrefix}`);
    if (exSpecific) return exSpecific;

    const exFull = EXCHANGE_RAW_TO_CANONICAL.get(`${exchangeId}:${raw}`);
    if (exFull) return exFull;

    const strippedEx = withoutPrefix.replace(/\/USD[C]?$/i, "");
    const exStripped = EXCHANGE_RAW_TO_CANONICAL.get(`${exchangeId}:${strippedEx}`);
    if (exStripped) return exStripped;

    // No match for this exchange — return a prefixed form that won't match
    // any canonical ticker, so classifyAsset() returns "crypto" and it gets filtered
    return `__UNREGISTERED__${strippedEx.toUpperCase()}`;
  }

  // Global lookup (no exchange context)
  const direct = RAW_TO_CANONICAL.get(withoutPrefix);
  if (direct) return direct;

  const full = RAW_TO_CANONICAL.get(raw);
  if (full) return full;

  const stripped = withoutPrefix.replace(/\/USD[C]?$/i, "");
  const strippedLookup = RAW_TO_CANONICAL.get(stripped);
  if (strippedLookup) return strippedLookup;

  return stripped.toUpperCase();
}

/**
 * Classify a canonical ticker using the registry.
 * Returns "crypto" if not found.
 */
export function classifyAsset(ticker: string): AssetCategory {
  const entry = CANONICAL_MAP.get(ticker);
  if (entry) return entry.category as AssetCategory;
  return "crypto";
}

/**
 * Get the human-readable name for a canonical ticker.
 */
export function getAssetName(ticker: string): string {
  const entry = CANONICAL_MAP.get(ticker);
  if (entry) return entry.name;
  return ticker;
}

/**
 * Check if a canonical ticker exists in the registry.
 */
export function isRegisteredAsset(ticker: string): boolean {
  return CANONICAL_MAP.has(ticker);
}

/**
 * Get the raw exchange ticker for a canonical ticker on a given exchange.
 */
export function getExchangeTicker(
  canonical: string,
  exchangeId: ExchangeId
): string | null {
  const entry = CANONICAL_MAP.get(canonical);
  if (!entry) return null;
  return entry.exchanges[exchangeId] ?? null;
}
