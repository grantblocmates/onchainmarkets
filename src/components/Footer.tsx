export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="heading-condensed text-xs text-text-muted tracking-[0.08em]">
              ONCHAIN MARKETS
            </span>
            <p className="text-xs text-text-muted mt-1">
              Perpetual contract coverage across decentralized venues.
              Equity, commodity, index, and FX markets.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-wide">
              <a
                href="https://t.me/blocmates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                Get in Touch
              </a>
              <a
                href="#exchange-form"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                List Your Exchange
              </a>
              <a
                href="#asset-form"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                Request an Asset
              </a>
            </div>
            <div className="text-right">
              <p className="label-system text-[10px]">
                Data refreshed every 5 min · 11 venues indexed
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
