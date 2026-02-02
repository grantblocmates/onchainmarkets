import Link from "next/link";
import { notFound } from "next/navigation";
import { assets, getAssetByTicker } from "@/config/assets";
import { ASSET_TYPE_META } from "@/config/types";
import type { AssetType } from "@/config/types";
import ExchangeListingRow from "@/components/ExchangeListingRow";
import ExchangeBadge from "@/components/ExchangeBadge";

const typeBadgeStyles: Record<AssetType, string> = {
  stock: "bg-blue-50 text-blue",
  commodity: "bg-amber-50 text-amber-600",
  index: "bg-violet-50 text-violet-600",
  forex: "bg-emerald-50 text-emerald-600",
  bond: "bg-slate-50 text-slate-600",
};

export function generateStaticParams() {
  return assets.map((asset) => ({
    ticker: asset.ticker,
  }));
}

export function generateMetadata({ params }: { params: Promise<{ ticker: string }> }) {
  // We need to handle this synchronously for static generation
  return params.then(({ ticker }) => {
    const asset = getAssetByTicker(ticker);
    if (!asset) {
      return { title: "Asset Not Found — On-Chain Markets" };
    }
    return {
      title: `${asset.ticker} (${asset.name}) — Trade on ${asset.listings.length} Exchange${asset.listings.length !== 1 ? "s" : ""} | On-Chain Markets`,
      description: `Find where to trade ${asset.name} (${asset.ticker}) as a perpetual contract. Compare exchanges, leverage, and fees across ${asset.listings.length} venue${asset.listings.length !== 1 ? "s" : ""}.`,
    };
  });
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const asset = getAssetByTicker(ticker);

  if (!asset) {
    notFound();
  }

  const activeListings = asset.listings.filter((l) => l.isActive);
  const maxLeverage = Math.max(...activeListings.map((l) => l.maxLeverage));
  const meta = ASSET_TYPE_META[asset.type];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all assets
      </Link>

      {/* Asset header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
            {asset.ticker}
          </h1>
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-full ${typeBadgeStyles[asset.type]}`}
          >
            {meta.icon} {meta.label}
          </span>
        </div>
        <p className="text-xl text-text-secondary">{asset.name}</p>
        {asset.sector && (
          <p className="text-sm text-text-muted mt-1">{asset.sector}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
            Exchanges
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {activeListings.length}
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
            Max Leverage
          </p>
          <p className="text-2xl font-bold text-blue">{maxLeverage}x</p>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
            Available On
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {activeListings.map((l) => (
              <ExchangeBadge key={l.exchangeId} exchangeId={l.exchangeId} />
            ))}
          </div>
        </div>
      </div>

      {/* Exchange listings */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Where to trade {asset.ticker}
        </h2>
        <div className="space-y-3">
          {activeListings.map((listing) => (
            <ExchangeListingRow
              key={listing.exchangeId}
              listing={listing}
              ticker={asset.ticker}
              isHighestLeverage={listing.maxLeverage === maxLeverage}
            />
          ))}
        </div>
      </div>

      {/* HIP3 notice */}
      {activeListings.some((l) => l.isHip3) && (
        <div className="bg-blue-50 border border-blue/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-blue mb-1">
            🏗️ HIP-3 Market
          </p>
          <p className="text-sm text-text-secondary">
            This asset is available as a HIP-3 deployed market
            {activeListings.find((l) => l.isHip3)?.deployer &&
              ` by ${activeListings.find((l) => l.isHip3)?.deployer}`}
            . HIP-3 markets are community-deployed perpetual contracts on Hyperliquid.
          </p>
        </div>
      )}
    </div>
  );
}
