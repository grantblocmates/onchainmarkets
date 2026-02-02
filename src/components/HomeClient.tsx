"use client";

import { useState, useMemo } from "react";
import type { Asset } from "@/config/types";
import { AssetType, ASSET_TYPE_META } from "@/config/types";
import { exchanges } from "@/config/exchanges";
import SearchBar from "@/components/SearchBar";
import AssetTableRow from "@/components/AssetTableRow";

const CATEGORY_TYPES: AssetType[] = ["stock", "commodity", "index", "forex", "bond"];

type SortMode = "volume" | "price" | "change";

const EXCHANGE_LIST = Object.values(exchanges);

interface HomeClientProps {
  assets: Asset[];
  exchangeCount: number;
}

export default function HomeClient({ assets, exchangeCount }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<AssetType | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("volume");
  const [selectedExchanges, setSelectedExchanges] = useState<Set<string>>(
    () => new Set(EXCHANGE_LIST.map((e) => e.id))
  );

  const toggleExchange = (id: string) => {
    setSelectedExchanges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const displayAssets = useMemo(() => {
    let result = assets;

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.ticker.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    if (activeFilter !== "all") {
      result = result.filter((a) => a.type === activeFilter);
    }

    if (selectedExchanges.size < EXCHANGE_LIST.length) {
      result = result.filter((a) =>
        a.listings.some(
          (l) => l.isActive && selectedExchanges.has(l.exchangeId)
        )
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortMode) {
        case "volume": {
          const aVol = a.volume24h ?? -1;
          const bVol = b.volume24h ?? -1;
          return bVol - aVol;
        }
        case "price": {
          const aPrice = a.price ?? 0;
          const bPrice = b.price ?? 0;
          return bPrice - aPrice;
        }
        case "change": {
          const aChange = a.change24h ?? -999;
          const bChange = b.change24h ?? -999;
          return bChange - aChange;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [assets, query, activeFilter, sortMode, selectedExchanges]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const type of CATEGORY_TYPES) {
      counts[type] = assets.filter((a) => a.type === type).length;
    }
    return counts;
  }, [assets]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Masthead */}
      <div className="mx-auto max-w-[1400px] px-6 pt-10 pb-8">
        <div className="mb-8">
          <h1 className="heading-condensed text-xl md:text-2xl text-text-primary mb-2">
            TRADITIONAL ASSET PERPETUALS
          </h1>
          <p className="text-sm text-text-muted max-w-xl">
            Real-time coverage of {assets.length} instruments across {exchangeCount} decentralized
            venues. Equities, commodities, indices, and foreign exchange.
          </p>
        </div>

        {/* Controls row */}
        <div className="flex flex-col gap-4">
          {/* Category filters + search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-0 overflow-x-auto whitespace-nowrap">
              <button
                onClick={() => setActiveFilter("all")}
                className={`label-system text-[11px] px-3 py-1.5 border-b-2 transition-colors ${
                  activeFilter === "all"
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                ALL
              </button>
              {CATEGORY_TYPES.map((type) => {
                const meta = ASSET_TYPE_META[type];
                const count = typeCounts[type] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`label-system text-[11px] px-3 py-1.5 border-b-2 transition-colors ${
                      activeFilter === type
                        ? "border-text-primary text-text-primary"
                        : "border-transparent text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {meta.label.toUpperCase()}
                    <span className="ml-1 opacity-40">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-64">
              <SearchBar onSearch={setQuery} />
            </div>
          </div>

          {/* Exchange filters + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-0 overflow-x-auto whitespace-nowrap">
              <span className="label-system text-[10px] mr-2">VENUES</span>
              {EXCHANGE_LIST.map((ex) => {
                const isSelected = selectedExchanges.has(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => toggleExchange(ex.id)}
                    className={`label-system text-[10px] px-2 py-1 border-b transition-colors ${
                      isSelected
                        ? "border-text-primary text-text-primary"
                        : "border-transparent text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {ex.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-0">
              <span className="label-system text-[10px] mr-2">SORT</span>
              {(
                [
                  { key: "volume", label: "VOLUME" },
                  { key: "price", label: "PRICE" },
                  { key: "change", label: "CHANGE" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortMode(opt.key)}
                  className={`label-system text-[10px] px-2 py-1 border-b transition-colors ${
                    sortMode === opt.key
                      ? "border-text-primary text-text-primary"
                      : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-[1400px] px-6 pb-20">
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-[32px_1.4fr_1fr_80px_1fr] md:grid-cols-[32px_1.8fr_1fr_1fr_80px_0.6fr_1.2fr] items-center gap-2 px-4 py-2.5 border-b border-border min-w-[500px]">
              <span className="label-system text-[10px] text-center">#</span>
              <span className="label-system text-[10px]">ASSET</span>
              <span className="label-system text-[10px] text-right hidden md:block">VOLUME 24H</span>
              <span className="label-system text-[10px] text-right">PRICE</span>
              <span className="label-system text-[10px] text-right">CHG%</span>
              <span className="label-system text-[10px] text-right hidden md:block">VENUES</span>
              <span className="label-system text-[10px] text-right">TRADE ON</span>
            </div>

            {/* Rows */}
            {displayAssets.length > 0 ? (
              displayAssets.map((asset, i) => (
                <AssetTableRow key={asset.ticker} asset={asset} rank={i + 1} />
              ))
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="text-text-muted text-sm">
                  No assets match current filters{query ? ` for "${query}"` : ""}.
                  {activeFilter !== "all" && (
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="ml-1 text-text-secondary underline hover:text-text-primary"
                    >
                      Clear filter
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scope note */}
        <div className="mt-6 flex items-center justify-between">
          <p className="label-system text-[10px]">
            {displayAssets.length} of {assets.length} instruments shown
          </p>
          <p className="label-system text-[10px]">
            {exchangeCount} venues indexed
          </p>
        </div>
      </div>
    </div>
  );
}
