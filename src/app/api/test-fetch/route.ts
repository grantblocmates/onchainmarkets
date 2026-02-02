import { NextResponse } from "next/server";
import { fetchHyperliquid } from "@/lib/fetchers/hyperliquid";
import { fetchOstium } from "@/lib/fetchers/ostium";
import { fetchLighter } from "@/lib/fetchers/lighter";

/**
 * GET /api/test-fetch
 * Debug endpoint — returns raw fetcher output from each exchange.
 * Use ?exchange=hyperliquid to filter to a single exchange.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exchangeFilter = searchParams.get("exchange");

  const results: Record<string, unknown> = {};

  const fetchers: Record<string, () => Promise<unknown>> = {
    hyperliquid: fetchHyperliquid,
    ostium: fetchOstium,
    lighter: fetchLighter,
  };

  // Run selected or all fetchers
  const toRun = exchangeFilter && fetchers[exchangeFilter]
    ? { [exchangeFilter]: fetchers[exchangeFilter] }
    : fetchers;

  const entries = Object.entries(toRun);
  const settled = await Promise.allSettled(
    entries.map(([, fn]) => fn())
  );

  for (let i = 0; i < entries.length; i++) {
    const [name] = entries[i];
    const result = settled[i];
    if (result.status === "fulfilled") {
      const markets = result.value as Array<Record<string, unknown>>;
      // Group by exchange field for readability
      const byExchange: Record<string, unknown[]> = {};
      for (const m of markets) {
        const ex = (m.exchange as string) || "unknown";
        if (!byExchange[ex]) byExchange[ex] = [];
        byExchange[ex].push(m);
      }
      results[name] = {
        status: "ok",
        totalMarkets: markets.length,
        byExchange: Object.fromEntries(
          Object.entries(byExchange).map(([ex, list]) => [
            ex,
            { count: list.length, markets: list },
          ])
        ),
      };
    } else {
      results[name] = {
        status: "error",
        error: result.reason?.message || String(result.reason),
      };
    }
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
