import { fetchHyperliquid, fetchOstium, fetchLighter, fetchQfex, fetchVest } from "./fetchers";
import type { NormalizedMarket, AssetCategory, ExchangeId } from "./types";

/**
 * Merged asset: one per canonical ticker, with listings from multiple exchanges.
 * Includes aggregated market data (price, volume, change).
 */
export interface MergedAsset {
  ticker: string;
  name: string;
  type: AssetCategory;
  listings: MergedListing[];
  price?: number;
  volume24h?: number;
  change24h?: number;
}

export interface MergedListing {
  exchange: ExchangeId;
  rawTicker: string;
  maxLeverage: number;
  isActive: boolean;
  marginMode?: string;
  deployer?: string;
  price?: number;
  volume24h?: number;
  change24h?: number;
  funding?: number;
  openInterest?: number;
}

/**
 * Fetch from all exchanges and merge into a unified asset list.
 * Each asset appears once with all exchange listings grouped together.
 *
 * - Fetches run in parallel; if one fails, the others still succeed.
 * - Deduplicates by (ticker, exchange) — keeps the one with highest leverage.
 * - Aggregates price/volume/change across exchanges.
 * - Filters out crypto (only traditional assets from registry).
 */
export async function syncMarkets(): Promise<MergedAsset[]> {
  const results = await Promise.allSettled([
    fetchHyperliquid(),
    fetchOstium(),
    fetchLighter(),
    fetchQfex(),
    fetchVest(),
  ]);

  const allMarkets: NormalizedMarket[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allMarkets.push(...result.value);
    } else {
      console.error("Exchange fetch failed:", result.reason);
    }
  }

  // Deduplicate: for each (ticker, exchange), keep the listing with highest leverage
  const bestByKey = new Map<string, NormalizedMarket>();
  for (const market of allMarkets) {
    const key = `${market.ticker}:${market.exchange}`;
    const existing = bestByKey.get(key);
    if (!existing || market.maxLeverage > existing.maxLeverage) {
      bestByKey.set(key, market);
    }
  }

  // Group by canonical ticker
  const assetMap = new Map<string, MergedAsset>();
  for (const market of bestByKey.values()) {
    if (!assetMap.has(market.ticker)) {
      assetMap.set(market.ticker, {
        ticker: market.ticker,
        name: market.name,
        type: market.type,
        listings: [],
      });
    }

    const asset = assetMap.get(market.ticker)!;
    asset.listings.push({
      exchange: market.exchange,
      rawTicker: market.rawTicker,
      maxLeverage: market.maxLeverage,
      isActive: market.isActive,
      marginMode: market.marginMode,
      deployer: market.deployer,
      price: market.price,
      volume24h: market.volume24h,
      change24h: market.change24h,
      funding: market.funding,
      openInterest: market.openInterest,
    });
  }

  // Sort listings and aggregate data
  for (const asset of assetMap.values()) {
    asset.listings.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.exchange.localeCompare(b.exchange);
    });

    const agg = aggregateMarketData(asset.listings);
    asset.price = agg.price;
    asset.volume24h = agg.volume24h;
    asset.change24h = agg.change24h;
  }

  return Array.from(assetMap.values());
}

/**
 * Aggregate price, volume, and change across exchange listings.
 */
function aggregateMarketData(listings: MergedListing[]): {
  price?: number;
  volume24h?: number;
  change24h?: number;
} {
  const withPrice = listings.filter((l) => l.price != null && l.price > 0);
  if (withPrice.length === 0) return {};

  const withVolume = listings.filter(
    (l) => l.volume24h != null && l.volume24h > 0
  );
  const totalVolume =
    withVolume.length > 0
      ? withVolume.reduce((sum, l) => sum + (l.volume24h ?? 0), 0)
      : undefined;

  let price: number | undefined;
  if (withVolume.length > 0 && totalVolume && totalVolume > 0) {
    const weightedSum = withVolume.reduce(
      (sum, l) => sum + (l.price ?? 0) * (l.volume24h ?? 0),
      0
    );
    price = weightedSum / totalVolume;
  } else {
    price =
      withPrice.reduce((sum, l) => sum + (l.price ?? 0), 0) / withPrice.length;
  }

  const withChange = listings.filter((l) => l.change24h != null);
  let change24h: number | undefined;
  if (withChange.length > 0) {
    const withChangeAndVolume = withChange.filter(
      (l) => l.volume24h != null && l.volume24h > 0
    );
    if (withChangeAndVolume.length > 0 && totalVolume && totalVolume > 0) {
      const weightedChangeSum = withChangeAndVolume.reduce(
        (sum, l) => sum + (l.change24h ?? 0) * (l.volume24h ?? 0),
        0
      );
      change24h = weightedChangeSum / totalVolume;
    } else {
      change24h =
        withChange.reduce((sum, l) => sum + (l.change24h ?? 0), 0) /
        withChange.length;
    }
  }

  return { price, volume24h: totalVolume, change24h };
}

/**
 * Summary stats from a sync run, useful for logging.
 */
export function syncSummary(assets: MergedAsset[]) {
  const totalListings = assets.reduce((sum, a) => sum + a.listings.length, 0);
  const byType = assets.reduce(
    (acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const byExchange = assets.reduce(
    (acc, a) => {
      for (const l of a.listings) {
        acc[l.exchange] = (acc[l.exchange] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );
  const withPrice = assets.filter((a) => a.price != null).length;
  const withVolume = assets.filter((a) => a.volume24h != null).length;

  return {
    totalAssets: assets.length,
    totalListings,
    byType,
    byExchange,
    withPrice,
    withVolume,
  };
}
