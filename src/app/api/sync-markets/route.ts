import { NextResponse } from "next/server";
import { syncMarkets, syncSummary } from "@/lib/sync";

/**
 * GET /api/sync-markets
 *
 * Fetches all traditional asset markets from Hyperliquid, Ostium, and Lighter,
 * normalizes tickers, and returns the merged asset list.
 *
 * In production, this would be called by a Vercel Cron every 30 minutes
 * and would write to a database / KV store. For now, it returns the data
 * directly so we can use it from the frontend via fetch or as a data source.
 *
 * Auth: In production, protect with CRON_SECRET. Currently open for dev.
 */
export async function GET(request: Request) {
  // Optional: verify cron auth in production
  // const authHeader = request.headers.get("authorization");
  // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const assets = await syncMarkets();
    const summary = syncSummary(assets);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      assets,
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Cache for 5 minutes in production
export const revalidate = 300;
