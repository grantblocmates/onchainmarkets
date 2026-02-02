import Link from "next/link";
import type { AssetType } from "@/config/types";
import { ASSET_TYPE_META } from "@/config/types";

interface CategoryCardProps {
  type: AssetType;
  assetCount: number;
}

export default function CategoryCard({ type, assetCount }: CategoryCardProps) {
  const meta = ASSET_TYPE_META[type];

  return (
    <Link href={"/category/" + type} className="block group">
      <div className="border border-border-light p-5 hover:border-border-hover hover:bg-row-hover transition-colors">
        <h3 className="heading-condensed text-sm text-text-primary mb-1">
          {meta.label.toUpperCase()}
        </h3>
        <p className="text-xs text-text-secondary mb-3">{meta.description}</p>
        <span className="label-system text-[10px]">
          {assetCount} {assetCount === 1 ? "instrument" : "instruments"}
        </span>
      </div>
    </Link>
  );
}
