export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-text-muted font-mono uppercase tracking-wide">
            Data refreshed every 5 min
          </div>
          <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-wide">
            <a
              href="https://t.me/blocmates"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              List an Exchange · Request an Asset · Get in Touch
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
