import registryData from "@/config/asset-registry.json";
import { Exchange } from "./types";

/**
 * Exchange configuration — driven by asset-registry.json.
 * The registry's exchangeMeta is the single source of truth for
 * exchange names, colors, URL templates, and deployer info.
 */

type ExchangeMetaEntry = {
  name: string;
  color: string;
  urlTemplate: string;
  isHip3: boolean;
  deployer?: string;
};

const meta = registryData.exchangeMeta as Record<string, ExchangeMetaEntry>;

// Build Exchange objects from registry meta
export const exchanges: Record<string, Exchange> = {};

for (const [id, entry] of Object.entries(meta)) {
  exchanges[id] = {
    id,
    name: entry.name,
    logoUrl: `/exchanges/${id}.svg`,
    tradingUrlTemplate: entry.urlTemplate,
    color: entry.color,
    website: "",
    isHip3: entry.isHip3,
    deployer: entry.deployer,
  };
}

export const exchangeList = Object.values(exchanges);

export function getExchange(id: string): Exchange | undefined {
  return exchanges[id];
}

/**
 * Build the trading URL for an asset on a given exchange.
 * Looks up the exchange-specific raw ticker from the registry,
 * then replaces {TICKER} in the exchange's URL template.
 */
export function getTradingUrl(exchangeId: string, canonicalTicker: string): string {
  const exchange = exchanges[exchangeId];
  if (!exchange) return "#";

  // Look up the exchange-specific raw ticker from the registry
  const registryAsset = registryData.assets.find(
    (a) => a.canonical === canonicalTicker
  );
  const exchanges_ = registryAsset?.exchanges as Record<string, string | null> | undefined;
  const rawTicker = exchanges_?.[exchangeId] ?? canonicalTicker;

  return exchange.tradingUrlTemplate.replace("{TICKER}", rawTicker);
}
