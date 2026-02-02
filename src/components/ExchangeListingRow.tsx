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
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border-light hover:bg-row-hover transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: exchange.color }}
        />
        <span className="font-medium text-sm text-text-primary">{exchange.name}</span>
        {listing.isHip3 && listing.deployer && (
          <span className="label-system text-[10px]">HIP-3</span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="label-system text-[10px] block mb-0.5">LEVERAGE</span>
          <span
            className={`font-data text-sm font-medium ${
              isHighestLeverage ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {listing.maxLeverage}x
          </span>
        </div>

        <a
          href={tradingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="label-system text-[11px] px-3 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
        >
          TRADE
        </a>
      </div>
    </div>
  );
}
