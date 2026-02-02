export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="heading-condensed text-xs text-text-muted tracking-[0.08em]">
              ON-CHAIN MARKETS
            </span>
            <p className="text-xs text-text-muted mt-1">
              Perpetual contract coverage across decentralized venues.
              Equity, commodity, index, and FX markets.
            </p>
          </div>
          <div className="text-right">
            <p className="label-system text-[10px]">
              Data refreshed every 5 min
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              Sources: Hyperliquid, Ostium, Lighter
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
