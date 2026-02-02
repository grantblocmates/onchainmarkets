import Link from "next/link";
import type { AssetType } from "@/config/types";
import { ASSET_TYPE_META } from "@/config/types";

const categoryStyles: Record<AssetType, string> = {
  stock: "bg-coral/10 hover:bg-coral/15 border-coral/20",
  commodity: "bg-green/10 hover:bg-green/15 border-green/20",
  index: "bg-purple/10 hover:bg-purple/15 border-purple/20",
  forex: "bg-amber-50 hover:bg-amber-100/70 border-amber-200/50",
  bond: "bg-slate-50 hover:bg-slate-100/70 border-slate-200/50",
};

const categoryTextAccent: Record<AssetType, string> = {
  stock: "text-coral",
  commodity: "text-green-dark",
  index: "text-purple",
  forex: "text-amber-600",
  bond: "text-slate-600",
};

interface CategoryCardProps {
  type: AssetType;
  assetCount: number;
}

export default function CategoryCard({ type, assetCount }: CategoryCardProps) {
  const meta = ASSET_TYPE_META[type];

  return (
    <Link href={`/category/${type}`} className="block group">
      <div
        className={`rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${categoryStyles[type]}`}
      >
        <div className="text-4xl mb-4">{meta.icon}</div>
        <h3 className={`text-lg font-bold mb-1 ${categoryTextAccent[type]}`}>
          {meta.label}
        </h3>
        <p className="text-sm text-text-secondary mb-4">{meta.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            {assetCount} {assetCount === 1 ? "asset" : "assets"}
          </span>
          <span className="text-text-muted group-hover:translate-x-1 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
