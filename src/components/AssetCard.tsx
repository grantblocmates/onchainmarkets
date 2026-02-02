import Link from "next/link";
import type { Asset, AssetType } from "@/config/types";
import { getExchange } from "@/config/exchanges";

const typeBadgeLabels: Record<AssetType, string> = {
  stock: "STOCK",
  commodity: "COMMODITY",
  index: "INDEX",
  forex: "FOREX",
  bond: "BOND",
  ipo: "NEW IPO",
  etf: "ETF",
};

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  const activeListings = asset.listings.filter((l) => l.isActive);
  const exchangeCount = activeListings.length;

  return (
    <Link href={"/asset/" + asset.ticker} className="block group">
      <div className="p-4 hover:bg-row-hover transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="heading-condensed text-base text-text-primary">
                {asset.ticker}
              </span>
              <span className="label-system text-[9px] text-text-muted">
                {typeBadgeLabels[asset.type]}
              </span>
            </div>
            <p className="text-sm text-text-secondary truncate">{asset.name}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1">
              {activeListings.slice(0, 4).map((listing) => {
                const ex = getExchange(listing.exchangeId);
                return (
                  <span
                    key={listing.exchangeId}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: ex?.color ?? "#999" }}
                  />
                );
              })}
            </div>
            <span className="label-system text-[10px]">
              {exchangeCount} {exchangeCount === 1 ? "venue" : "venues"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
