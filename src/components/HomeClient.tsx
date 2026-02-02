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
        // Don't allow deselecting all
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const displayAssets = useMemo(() => {
    let result = assets;

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.ticker.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (activeFilter !== "all") {
      result = result.filter((a) => a.type === activeFilter);
    }

    // Exchange filter: show asset if it has ANY listing on a selected exchange
    if (selectedExchanges.size < EXCHANGE_LIST.length) {
      result = result.filter((a) =>
        a.listings.some(
          (l) => l.isActive && selectedExchanges.has(l.exchangeId)
        )
      );
    }

    // Sort
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

  // Count assets by type from live data
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const type of CATEGORY_TYPES) {
      counts[type] = assets.filter((a) => a.type === type).length;
    }
    return counts;
  }, [assets]);

  const sortLabel =
    sortMode === "volume"
      ? "sorted by 24h volume"
      : sortMode === "price"
        ? "sorted by price"
        : "sorted by 24h change";

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
            On-Chain Traditional Asset Markets
          </h1>
          <p className="mt-1 text-sm text-[#888]">
            {assets.length} tradable assets across {exchangeCount}{" "}
            decentralized exchanges — {sortLabel}
          </p>
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-[#f7f7f7] rounded-lg p-1 overflow-x-auto whitespace-nowrap">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeFilter === "all"
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "text-[#888] hover:text-[#1a1a1a]"
                }`}
              >
                All
              </button>
              {CATEGORY_TYPES.map((type) => {
                const meta = ASSET_TYPE_META[type];
                const count = typeCounts[type] || 0;
                // Hide categories with no assets
                if (count === 0) return null;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeFilter === type
                        ? "bg-white text-[#1a1a1a] shadow-sm"
                        : "text-[#888] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {meta.label}
                    <span className="ml-1.5 text-xs opacity-50">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-72">
              <SearchBar onSearch={setQuery} />
            </div>
          </div>

          {/* Exchange filters + sort toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
              <span className="text-xs font-medium text-[#999] mr-1">Exchanges:</span>
              {EXCHANGE_LIST.map((ex) => {
                const isSelected = selectedExchanges.has(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => toggleExchange(ex.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? "border-[#d0d0d0] bg-white text-[#1a1a1a]"
                        : "border-[#e5e5e5] bg-[#f9f9f9] text-[#bbb]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isSelected ? ex.color : "#ddd",
                      }}
                    />
                    {ex.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-[#f7f7f7] rounded-lg p-0.5">
              {(
                [
                  { key: "volume", label: "Volume" },
                  { key: "price", label: "Price" },
                  { key: "change", label: "Change" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortMode(opt.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    sortMode === opt.key
                      ? "bg-white text-[#1a1a1a] shadow-sm"
                      : "text-[#888] hover:text-[#1a1a1a]"
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
        <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-[40px_1.4fr_1fr_80px_1fr] md:grid-cols-[40px_1.8fr_1fr_1fr_80px_1fr_1.2fr] items-center gap-2 px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa] min-w-[500px]">
            <span className="text-xs font-semibold text-[#999] text-center">
              #
            </span>
            <span className="text-xs font-semibold text-[#999]">Name</span>
            <span className="text-xs font-semibold text-[#999] text-right hidden md:block">
              24h Volume
            </span>
            <span className="text-xs font-semibold text-[#999] text-right">
              Price
            </span>
            <span className="text-xs font-semibold text-[#999] text-right">
              Today
            </span>
            <span className="text-xs font-semibold text-[#999] text-right hidden md:block">
              Exchanges
            </span>
            <span className="text-xs font-semibold text-[#999] text-right">
              Trade On
            </span>
          </div>

          {/* Rows */}
          {displayAssets.length > 0 ? (
            displayAssets.map((asset, i) => (
              <AssetTableRow key={asset.ticker} asset={asset} rank={i + 1} />
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-[#999] text-sm">
                No assets found{query ? ` for "${query}"` : ""}.
                {activeFilter !== "all" && (
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="ml-1 text-[#3B82F6] hover:underline"
                  >
                    Show all
                  </button>
                )}
              </p>
            </div>
          )}
          </div>{/* end overflow-x-auto */}
        </div>

        {/* Quick hint */}
        {!query && activeFilter === "all" && (
          <p className="mt-4 text-xs text-[#bbb] text-center">
            Search by ticker (TSLA), name (Tesla), or sector (Semiconductors) •
            Live data from exchange APIs • Refreshes every 5 minutes
          </p>
        )}
      </div>
    </div>
  );
}
