import { Asset } from "./types";

export const assets: Asset[] = [
  // ============ STOCKS ============
  {
    ticker: "TSLA",
    name: "Tesla",
    type: "stock",
    sector: "Automotive / Tech",
    listings: [
      {
        exchangeId: "hyperliquid",

        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    type: "stock",
    sector: "Semiconductors",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
      {
        exchangeId: "lighter",
        maxLeverage: 50,
        makerFee: 0,
        takerFee: 0.02,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "AAPL",
    name: "Apple",
    type: "stock",
    sector: "Technology",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    type: "stock",
    sector: "Technology",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "PLTR",
    name: "Palantir",
    type: "stock",
    sector: "Technology",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "HOOD",
    name: "Robinhood",
    type: "stock",
    sector: "Fintech",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    type: "stock",
    sector: "Technology",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    type: "stock",
    sector: "Technology",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "GOOGL",
    name: "Alphabet (Google)",
    type: "stock",
    sector: "Technology",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    type: "stock",
    sector: "Semiconductors",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "COIN",
    name: "Coinbase",
    type: "stock",
    sector: "Fintech / Crypto",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "NFLX",
    name: "Netflix",
    type: "stock",
    sector: "Entertainment",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },

  // ============ INDICES ============
  {
    ticker: "XYZ100",
    name: "Nasdaq 100 Tracker",
    type: "index",
    description: "Tracks the Nasdaq 100 index",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: true,
        deployer: "tradeXYZ",
        marginType: "cross",
        isActive: true,
      },
    ],
  },

  // ============ COMMODITIES ============
  {
    ticker: "XAU",
    name: "Gold",
    type: "commodity",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
      {
        exchangeId: "lighter",
        maxLeverage: 50,
        makerFee: 0,
        takerFee: 0.02,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
    ],
  },
  {
    ticker: "XAG",
    name: "Silver",
    type: "commodity",
    listings: [
      {
        exchangeId: "hyperliquid",
        maxLeverage: 40,
        makerFee: 0.01,
        takerFee: 0.035,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "cross",
        isActive: true,
      },
      {
        exchangeId: "ostium",
        maxLeverage: 200,
        makerFee: 0,
        takerFee: 0.005,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },

  // ============ FOREX ============
  {
    ticker: "EURUSD",
    name: "Euro / US Dollar",
    type: "forex",
    listings: [
      {
        exchangeId: "ostium",
        maxLeverage: 500,
        makerFee: 0,
        takerFee: 0.003,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "GBPUSD",
    name: "British Pound / US Dollar",
    type: "forex",
    listings: [
      {
        exchangeId: "ostium",
        maxLeverage: 500,
        makerFee: 0,
        takerFee: 0.003,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "USDJPY",
    name: "US Dollar / Japanese Yen",
    type: "forex",
    listings: [
      {
        exchangeId: "ostium",
        maxLeverage: 500,
        makerFee: 0,
        takerFee: 0.003,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
  {
    ticker: "AUDUSD",
    name: "Australian Dollar / US Dollar",
    type: "forex",
    listings: [
      {
        exchangeId: "ostium",
        maxLeverage: 500,
        makerFee: 0,
        takerFee: 0.003,
        settlementCurrency: "USDC",
        isHip3: false,
        marginType: "isolated",
        isActive: true,
      },
    ],
  },
];

// Helper functions
export function getAssetByTicker(ticker: string): Asset | undefined {
  return assets.find(
    (a) => a.ticker.toLowerCase() === ticker.toLowerCase()
  );
}

export function getAssetsByType(type: Asset["type"]): Asset[] {
  return assets.filter((a) => a.type === type);
}

export function searchAssets(query: string): Asset[] {
  const q = query.toLowerCase().trim();
  if (!q) return assets;
  return assets.filter(
    (a) =>
      a.ticker.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.sector && a.sector.toLowerCase().includes(q))
  );
}

export function getAssetsOnExchange(exchangeId: string): Asset[] {
  return assets.filter((a) =>
    a.listings.some((l) => l.exchangeId === exchangeId && l.isActive)
  );
}
