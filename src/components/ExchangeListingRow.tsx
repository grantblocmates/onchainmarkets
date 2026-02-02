import type { Listing } from "@/config/types";
import { getExchange, getTradingUrl } from "@/config/exchanges";

interface ExchangeListingRowProps {
  listing: Listing;
  ticker: string;
  isHighestLeverage?: boolean;
}

export default function ExchangeListingRow({ listing, ticker, isHighestLeverage }: ExchangeListingRowProps) {
  const exchange = getExchange(listing.exchangeId);
  if (!exchange) return null;

  const tradingUrl = getTradingUrl(listing.exchangeId, ticker);

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-bg-card border border-border rounded-xl hover:border-border-hover transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: exchange.color }}
        />
        <span className="font-semibold text-sm text-text-primary">{exchange.name}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-xs text-text-muted block">Max Leverage</span>
          <span
            className={`text-lg font-bold ${
              isHighestLeverage ? "text-blue" : "text-text-primary"
            }`}
          >
            {listing.maxLeverage}x
          </span>
        </div>

        <a
          href={tradingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-blue text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-dark transition-colors"
        >
          Trade
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
