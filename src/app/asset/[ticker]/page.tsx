import Link from "next/link";
import { notFound } from "next/navigation";
import { getLiveAssets } from "@/lib/getAssets";
import type { AssetType } from "@/config/types";
import ExchangeListingRow from "@/components/ExchangeListingRow";
import ExchangeBadge from "@/components/ExchangeBadge";

// Revalidate every 5 minutes — pulls fresh data from exchanges
export const revalidate = 300;

const typeLabels: Record<AssetType, string> = {
  stock: "EQUITY",
  commodity: "COMMODITY",
  index: "INDEX",
  forex: "FX",
  bond: "FIXED INCOME",
  ipo: "NEW IPO",
  etf: "ETF",
};

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const assets = await getLiveAssets();
  const asset = assets.find(
    (a) => a.ticker.toLowerCase() === ticker.toLowerCase()
  );
  if (!asset) {
    return { title: "Asset Not Found — On-Chain Markets" };
  }
  return {
    title: asset.ticker + " (" + asset.name + ") — " + asset.listings.length + " Venue" + (asset.listings.length !== 1 ? "s" : "") + " | On-Chain Markets",
    description: "Trade " + asset.name + " (" + asset.ticker + ") as a perpetual contract across " + asset.listings.length + " decentralized venue" + (asset.listings.length !== 1 ? "s" : "") + ".",
  };
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const assets = await getLiveAssets();
  const asset = assets.find(
    (a) => a.ticker.toLowerCase() === ticker.toLowerCase()
  );

  if (!asset) {
    notFound();
  }

  const activeListings = asset.listings.filter((l) => l.isActive);
  const maxLeverage = Math.max(...activeListings.map((l) => l.maxLeverage));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="label-system text-[11px] hover:text-text-primary transition-colors mb-10 inline-block"
      >
        &larr; BACK TO INDEX
      </Link>

      {/* Asset header */}
      <div className="mb-10 border-b border-border pb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="heading-condensed text-3xl md:text-4xl text-text-primary">
            {asset.ticker}
          </h1>
          <span className="label-system text-[11px]">
            {typeLabels[asset.type]}
          </span>
        </div>
        <p className="text-base text-text-secondary">{asset.name}</p>
        {asset.sector && (
          <p className="text-xs text-text-muted mt-1">{asset.sector}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-0 border-b border-border mb-10">
        <div className="py-4 pr-4">
          <span className="label-system text-[10px] block mb-1">VENUES</span>
          <span className="font-data text-xl text-text-primary">
            {activeListings.length}
          </span>
        </div>
        <div className="py-4 px-4 border-l border-border-light">
          <span className="label-system text-[10px] block mb-1">MAX LEVERAGE</span>
          <span className="font-data text-xl text-text-primary">{maxLeverage}x</span>
        </div>
        <div className="py-4 pl-4 border-l border-border-light">
          <span className="label-system text-[10px] block mb-1">AVAILABLE ON</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {activeListings.map((l) => (
              <ExchangeBadge key={l.exchangeId} exchangeId={l.exchangeId} />
            ))}
          </div>
        </div>
      </div>

      {/* Exchange listings */}
      <div className="mb-10">
        <h2 className="label-system text-[11px] mb-4">
          VENUE COMPARISON
        </h2>
        <div className="border-t border-border">
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
        <div className="border border-border-light p-4">
          <span className="label-system text-[10px] block mb-1">HIP-3 MARKET</span>
          <p className="text-xs text-text-secondary leading-relaxed">
            This instrument is available as a HIP-3 deployed market
            {activeListings.find((l) => l.isHip3)?.deployer &&
              (" by " + activeListings.find((l) => l.isHip3)?.deployer)}
            . HIP-3 markets are community-deployed perpetual contracts on Hyperliquid.
          </p>
        </div>
      )}
    </div>
  );
}
