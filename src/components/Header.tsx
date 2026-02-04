import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Stocks", href: "/category/stock" },
  { label: "Commodities", href: "/category/commodity" },
  { label: "Indices", href: "/category/index" },
  { label: "Forex", href: "/category/forex" },
];

export default function Header() {
  return (
    <header className="w-full border-b border-border bg-bg sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="heading-condensed text-sm text-text-primary tracking-[0.08em]">
            ONCHAIN MARKETS
          </Link>
          <span className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
            by blocmates
          </span>
        </div>

        <div className="flex items-center gap-0">
          <nav className="hidden md:flex items-center gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="label-system px-3 py-1.5 hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
