import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const META_URL = "https://pro.edgex.exchange/api/v1/public/meta/getMetaData";
const TICKER_URL = "https://pro.edgex.exchange/api/v1/public/quote/getTicker";

interface EdgexContract {
  contractId: string;
  contractName: string;
  displayMaxLeverage: string;
  enableTrade: boolean;
  enableOpenPosition: boolean;
}

interface EdgexTickerData {
  contractId: string;
  contractName: string;
  lastPrice: string;
  priceChangePercent: string;
  value: string; // 24h USD volume
  openInterest: string;
  fundingRate: string;
  open: string;
  close: string;
}

/**
 * Fetch all tradfi markets from EdgeX.
 * Uses /meta/getMetaData for contract metadata (leverage, active status)
 * and /quote/getTicker per contract for live price data.
 * Contract name format: "XAUTUSD", "TSLAUSD" — mapped via registry.
 */
export async function fetchEdgex(): Promise<NormalizedMarket[]> {
  try {
    // Phase 1: Fetch metadata to discover tradfi contracts
    const metaRes = await fetch(META_URL);
    if (!metaRes.ok) {
      console.error("[EdgeX] Metadata fetch failed:", metaRes.status);
      return [];
    }

    const metaBody = await metaRes.json();
    if (metaBody.code !== "SUCCESS" || !metaBody.data?.contractList) {
      console.error("[EdgeX] Metadata response invalid:", metaBody.code);
      return [];
    }

    const contracts: EdgexContract[] = metaBody.data.contractList;

    // Filter for tradfi contracts using registry lookup
    const tradfiContracts: (EdgexContract & { canonical: string; assetType: string })[] = [];
    for (const c of contracts) {
      const ticker = normalizeTicker(c.contractName, "edgex");
      const type = classifyAsset(ticker);
      if (type !== "crypto") {
        tradfiContracts.push({ ...c, canonical: ticker, assetType: type });
      }
    }

    console.log(`[EdgeX] Found ${tradfiContracts.length} tradfi contracts out of ${contracts.length} total`);

    if (tradfiContracts.length === 0) return [];

    // Phase 2: Fetch ticker data for all tradfi contracts in parallel
    const tickerResults = await Promise.allSettled(
      tradfiContracts.map((c) =>
        fetch(`${TICKER_URL}?contractId=${c.contractId}`).then((r) =>
          r.ok ? r.json() : null
        )
      )
    );

    // Build ticker data map: contractId -> ticker data
    const tickerMap = new Map<string, EdgexTickerData>();
    for (let i = 0; i < tradfiContracts.length; i++) {
      const result = tickerResults[i];
      if (result.status === "fulfilled" && result.value?.code === "SUCCESS") {
        const data = result.value.data;
        if (Array.isArray(data) && data.length > 0) {
          tickerMap.set(tradfiContracts[i].contractId, data[0]);
        }
      }
    }

    console.log(`[EdgeX] Got ticker data for ${tickerMap.size}/${tradfiContracts.length} contracts`);

    // Phase 3: Build normalized markets
    const markets: NormalizedMarket[] = [];

    for (const c of tradfiContracts) {
      const ticker = c.canonical;
      const type = c.assetType;
      const tickerData = tickerMap.get(c.contractId);

      const maxLeverage = parseInt(c.displayMaxLeverage) || 20;
      const isActive = c.enableTrade && c.enableOpenPosition;

      let price: number | undefined;
      let volume24h: number | undefined;
      let change24h: number | undefined;
      let openInterest: number | undefined;
      let funding: number | undefined;

      if (tickerData) {
        const p = parseFloat(tickerData.lastPrice);
        price = isFinite(p) && p > 0 ? p : undefined;

        const v = parseFloat(tickerData.value);
        volume24h = isFinite(v) && v > 0 ? v : undefined;

        // priceChangePercent is a decimal ratio (e.g. 0.025 = 2.5%), convert to percentage
        const ch = parseFloat(tickerData.priceChangePercent) * 100;
        change24h = isFinite(ch) ? ch : undefined;

        const oi = parseFloat(tickerData.openInterest);
        openInterest = isFinite(oi) && oi > 0 ? oi : undefined;

        const f = parseFloat(tickerData.fundingRate);
        funding = isFinite(f) ? f : undefined;
      }

      markets.push({
        ticker,
        rawTicker: c.contractName,
        name: getAssetName(ticker),
        type: type as NormalizedMarket["type"],
        exchange: "edgex",
        isActive,
        maxLeverage,
        price,
        volume24h,
        change24h,
        openInterest,
        funding,
      });
    }

    console.log(`[EdgeX] Returning ${markets.length} tradfi markets`);
    return markets;
  } catch (error) {
    console.error("[EdgeX] Fetch error:", error);
    return [];
  }
}
