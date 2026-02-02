import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssetsByType } from "@/config/assets";
import { ASSET_TYPE_META, AssetType } from "@/config/types";
import AssetCard from "@/components/AssetCard";

const validTypes: AssetType[] = ["stock", "commodity", "index", "forex", "bond"];

export function generateStaticParams() {
  return validTypes.map((type) => ({ type }));
}

export function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  return params.then(({ type }) => {
    if (!validTypes.includes(type as AssetType)) {
      return { title: "Category Not Found — On-Chain Markets" };
    }
    const meta = ASSET_TYPE_META[type as AssetType];
    return {
      title: `${meta.label} — On-Chain Markets`,
      description: `${meta.description}. Browse all ${meta.label.toLowerCase()} available as perpetual contracts on decentralized exchanges.`,
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
    <div className="max-w-6xl mx-auto px-6 py-12">
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

      {/* Category header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{meta.icon}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
            {meta.label}
          </h1>
        </div>
        <p className="text-lg text-text-secondary">{meta.description}</p>
        <p className="text-sm text-text-muted mt-2">
          {categoryAssets.length} asset{categoryAssets.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Assets grid */}
      {categoryAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryAssets.map((asset) => (
            <AssetCard key={asset.ticker} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-bg-card p-12 text-center">
          <p className="text-4xl mb-4">{meta.icon}</p>
          <p className="text-lg font-semibold text-text-primary">
            No {meta.label.toLowerCase()} listed yet
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Check back soon — new markets are being added regularly.
          </p>
        </div>
      )}
    </div>
  );
}
