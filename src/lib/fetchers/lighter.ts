import {
  NormalizedMarket,
  normalizeTicker,
  classifyAsset,
  getAssetName,
} from "../types";

const API_URL = "https://mainnet.zklighter.elliot.ai/api/v1/orderBookDetails";

interface LighterOrderBookDetail {
  symbol: string;
  market_id: number;
  market_type: "perp" | "spot";
  base_asset_id: number;
  quote_asset_id: number;
  status: "active" | "inactive";
  taker_fee: string;
  maker_fee: string;
  liquidation_fee: string;
  min_base_amount: string;
  min_quote_amount: string;
  order_quote_limit: string;
  supported_size_decimals: number;
  supported_price_decimals: number;
  // Live data fields from orderBookDetails
  last_trade_price: number;
  daily_trades_count: number;
  daily_base_token_volume: number;
  daily_quote_token_volume: number; // 24h volume in USD
  daily_price_low: number;
  daily_price_high: number;
  daily_price_change: number; // percentage
  open_interest: number; // base units
  default_initial_margin_fraction: number; // basis points
  min_initial_margin_fraction: number;
  market_config?: {
    market_margin_mode: number;
    force_reduce_only: boolean;
  };
}

interface LighterResponse {
  code: number;
  order_book_details: LighterOrderBookDetail[];
}

/**
 * Fetch all markets from Lighter's orderBookDetails endpoint.
 * Returns perp markets with live price, volume, change, and OI data.
 * Only includes tickers in the asset registry.
 */
export async function fetchLighter(): Promise<NormalizedMarket[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    console.error(`Lighter API error: ${res.status}`);
    return [];
  }

  const data: LighterResponse = await res.json();
  const markets: NormalizedMarket[] = [];

  for (const book of data.order_book_details) {
    // Only perps, not spot
    if (book.market_type !== "perp") continue;

    const rawTicker = book.symbol;
    const ticker = normalizeTicker(rawTicker, "lighter");
    const type = classifyAsset(ticker);

    // Skip crypto
    if (type === "crypto") continue;

    // Compute max leverage from min_initial_margin_fraction (basis points)
    const marginBps = book.min_initial_margin_fraction || book.default_initial_margin_fraction;
    const maxLeverage = marginBps > 0 ? Math.floor(10000 / marginBps) : 50;

    markets.push({
      ticker,
      rawTicker,
      name: getAssetName(ticker),
      type,
      exchange: "lighter",
      isActive: book.status === "active",
      maxLeverage,
      price: book.last_trade_price || undefined,
      volume24h: book.daily_quote_token_volume || undefined,
      change24h: book.daily_price_change ?? undefined,
      openInterest: book.open_interest || undefined,
    });
  }

  return markets;
}
