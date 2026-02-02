import Link from "next/link";
import type { Asset } from "@/config/types";
import { getExchange, getTradingUrl } from "@/config/exchanges";

interface AssetTableRowProps {
  asset: Asset;
  rank: number;
}

function formatVolume(value: number | undefined): string {
  if (value == null || value <= 0) return "\u2014";
  if (value >= 1_000_000_000) {
    return "$" + (value / 1_000_000_000).toFixed(1) + "B";
  }
  if (value >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1) + "M";
  }
  if (value >= 1_000) {
    return "$" + (value / 1_000).toFixed(1) + "K";
  }
  return "$" + value.toFixed(0);
}

function formatPrice(price: number | undefined): string {
  if (price == null || price <= 0) return "\u2014";
  if (price >= 10000)
    return "$" + price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  if (price >= 1)
    return "$" + price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 0.01) return "$" + price.toFixed(4);
  return "$" + price.toFixed(6);
}

export default function AssetTableRow({ asset, rank }: AssetTableRowProps) {
  const activeListings = asset.listings.filter((l) => l.isActive);

  const change = asset.change24h;
  const hasChange = change != null;
  const isPositive = hasChange && change >= 0;

  return (
    <Link href={"/asset/" + asset.ticker} className="block">
      <div className="grid grid-cols-[32px_1.4fr_1fr_80px_1fr] md:grid-cols-[32px_1.8fr_1fr_1fr_80px_0.6fr_1.2fr] items-center gap-2 px-4 py-2.5 border-b border-border-light hover:bg-row-hover transition-colors cursor-pointer group min-w-[500px]">
        {/* Rank */}
        <span className="font-data text-xs text-text-muted text-center">
          {rank}
        </span>

        {/* Name + Ticker */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <span className="font-medium text-text-primary text-sm block truncate">
              {asset.name}
            </span>
            <span className="font-data text-[11px] text-text-muted tracking-wide">
              {asset.ticker}
            </span>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="text-right hidden md:block">
          <span className="font-data text-sm text-text-secondary">
            {formatVolume(asset.volume24h)}
          </span>
        </div>

        {/* Price */}
        <div className="text-right">
          <span className="font-data text-sm text-text-primary">
            {formatPrice(asset.price)}
          </span>
        </div>

        {/* 24h Change */}
        <div className="text-right">
          {hasChange ? (
            <span
              className={"font-data text-sm " + (isPositive ? "text-positive" : "text-negative")}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          ) : (
            <span className="font-data text-sm text-text-muted">{"\u2014"}</span>
          )}
        </div>

        {/* Venue count */}
        <div className="text-right hidden md:block">
          <span className="font-data text-sm text-text-muted">
            {activeListings.length}
          </span>
        </div>

        {/* Trade On (exchange pills) */}
        <div className="flex items-center justify-end gap-1 flex-wrap">
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
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 border border-border-light text-text-muted hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer whitespace-nowrap"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: exchange.color }}
                />
                {exchange.name}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
