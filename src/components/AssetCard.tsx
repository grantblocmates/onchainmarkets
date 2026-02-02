import Link from "next/link";
import type { Asset, AssetType } from "@/config/types";
import { getExchange } from "@/config/exchanges";

const typeBadgeStyles: Record<AssetType, string> = {
  stock: "bg-coral/10 text-coral",
  commodity: "bg-green/20 text-green-dark",
  index: "bg-purple/10 text-purple",
  forex: "bg-orange-100 text-orange-600",
  bond: "bg-blue-100 text-blue-600",
};

const typeBadgeLabels: Record<AssetType, string> = {
  stock: "Stock",
  commodity: "Commodity",
  index: "Index",
  forex: "Forex",
  bond: "Bond",
};

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  const activeListings = asset.listings.filter((l) => l.isActive);
  const exchangeCount = activeListings.length;

  return (
    <Link href={`/asset/${asset.ticker}`} className="block group">
      <div className="bg-bg-card border border-border rounded-2xl p-6 hover:border-border-hover hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {asset.ticker}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadgeStyles[asset.type]}`}
              >
                {typeBadgeLabels[asset.type]}
              </span>
            </div>
            <p className="text-sm text-text-secondary truncate">{asset.name}</p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {activeListings.slice(0, 4).map((listing, i) => {
                  const ex = getExchange(listing.exchangeId);
                  return (
                    <div
                      key={listing.exchangeId}
                      className="w-3 h-3 rounded-full border-2 border-bg-card"
                      style={{
                        backgroundColor: ex?.color ?? "#9B9B9B",
                        zIndex: 4 - i,
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-medium text-text-muted">
                {exchangeCount} {exchangeCount === 1 ? "exchange" : "exchanges"}
              </span>
            </div>

            <span className="text-text-muted group-hover:text-coral transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
