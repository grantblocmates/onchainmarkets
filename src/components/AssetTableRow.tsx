import Link from "next/link";
import type { Asset } from "@/config/types";
import { getExchange, getTradingUrl } from "@/config/exchanges";

interface AssetTableRowProps {
  asset: Asset;
  rank: number;
}

/**
 * Format volume for display: $1.2B, $45.3M, $128K, etc.
 */
function formatVolume(value: number | undefined): string {
  if (value == null || value <= 0) return "—";
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format price for display.
 */
function formatPrice(price: number | undefined): string {
  if (price == null || price <= 0) return "—";
  if (price >= 10000)
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  if (price >= 1)
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export default function AssetTableRow({ asset, rank }: AssetTableRowProps) {
  const activeListings = asset.listings.filter((l) => l.isActive);

  const change = asset.change24h;
  const hasChange = change != null;
  const isPositive = hasChange && change >= 0;

  return (
    <Link href={`/asset/${asset.ticker}`} className="block">
      <div className="grid grid-cols-[40px_1.4fr_1fr_80px_1fr] md:grid-cols-[40px_1.8fr_1fr_1fr_80px_1fr_1.2fr] items-center gap-2 px-4 py-3.5 border-b border-[#f0f0f0] hover:bg-[#FFFDF5] transition-colors cursor-pointer group min-w-[500px]">
        {/* Rank */}
        <span className="text-sm text-[#858585] text-center font-medium">
          {rank}
        </span>

        {/* Name + Ticker */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Asset icon placeholder */}
          <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0 text-xs font-bold text-[#666]">
            {asset.ticker.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-[#1a1a1a] text-sm block truncate">
              {asset.name}
            </span>
            <span className="text-xs text-[#999] uppercase">
              {asset.ticker}
            </span>
          </div>
        </div>

        {/* 24h Volume - hidden on mobile */}
        <div className="text-right hidden md:block">
          <span className="text-sm text-[#1a1a1a] font-medium">
            {formatVolume(asset.volume24h)}
          </span>
        </div>

        {/* Price */}
        <div className="text-right">
          <span className="text-sm text-[#1a1a1a] font-medium">
            {formatPrice(asset.price)}
          </span>
        </div>

        {/* Today (24h change) */}
        <div className="text-right">
          {hasChange ? (
            <span
              className={`text-sm font-semibold ${
                isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          ) : (
            <span className="text-sm text-[#ccc]">—</span>
          )}
        </div>

        {/* Exchange count - hidden on mobile */}
        <div className="text-right hidden md:block">
          <span className="text-sm text-[#666]">
            {activeListings.length}
          </span>
        </div>

        {/* Trade On (exchange pills) */}
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {activeListings.map((listing) => {
            const exchange = getExchange(listing.exchangeId);
            if (!exchange) return null;
            return (
              <span
                key={listing.exchangeId}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(getTradingUrl(listing.exchangeId, asset.ticker), "_blank");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border border-[#e5e5e5] bg-white hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#f0f7ff] transition-all cursor-pointer whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: exchange.color }}
                />
                {exchange.name}
                <svg
                  className="w-3 h-3 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
