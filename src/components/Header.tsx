import Link from "next/link";

const navLinks = [
  { label: "Stocks", href: "/category/stock" },
  { label: "Commodities", href: "/category/commodity" },
  { label: "Indices", href: "/category/index" },
  { label: "Forex", href: "/category/forex" },
];

export default function Header() {
  return (
    <header className="w-full border-b border-[#e5e5e5] bg-white sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#1a1a1a] tracking-tight">
          onchainmarkets
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm font-medium text-[#888] rounded-lg hover:bg-[#f5f5f5] hover:text-[#1a1a1a] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="text-xs text-[#ccc]">
          {/* Placeholder for future features */}
        </div>
      </div>
    </header>
  );
}
