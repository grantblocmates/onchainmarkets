import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssetsByType } from "@/config/assets";
import { ASSET_TYPE_META, AssetType } from "@/config/types";
import AssetCard from "@/components/AssetCard";

const validTypes: AssetType[] = ["stock", "commodity", "index", "forex", "bond", "ipo", "etf"];

export function generateStaticParams() {
  return validTypes.map((type) => ({ type }));
}

export function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  return params.then(({ type }) => {
    if (!validTypes.includes(type as AssetType)) {
      return { title: "Category Not Found \u2014 Onchain Markets" };
    }
    const meta = ASSET_TYPE_META[type as AssetType];
    return {
      title: meta.label + " \u2014 Onchain Markets",
      description: meta.description + ". Browse all " + meta.label.toLowerCase() + " available as perpetual contracts on decentralized venues.",
    };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!validTypes.includes(type as AssetType)) {
    notFound();
  }

  const assetType = type as AssetType;
  const meta = ASSET_TYPE_META[assetType];
  const categoryAssets = getAssetsByType(assetType);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="label-system text-[11px] hover:text-text-primary transition-colors mb-10 inline-block"
      >
        &larr; BACK TO INDEX
      </Link>

      {/* Category header */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="heading-condensed text-2xl md:text-3xl text-text-primary mb-2">
          {meta.label.toUpperCase()}
        </h1>
        <p className="text-sm text-text-secondary">{meta.description}</p>
        <p className="label-system text-[10px] mt-3">
          {categoryAssets.length} INSTRUMENT{categoryAssets.length !== 1 ? "S" : ""} INDEXED
        </p>
      </div>

      {/* Assets grid */}
      {categoryAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-border-light">
          {categoryAssets.map((asset) => (
            <div key={asset.ticker} className="border-r border-b border-border-light">
              <AssetCard asset={asset} />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border-light p-12 text-center">
          <p className="text-sm text-text-secondary">
            No {meta.label.toLowerCase()} indexed.
          </p>
          <p className="text-xs text-text-muted mt-1">
            New markets are indexed as venues list them.
          </p>
        </div>
      )}
    </div>
  );
}
