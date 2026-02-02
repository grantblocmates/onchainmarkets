"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

export default function SearchBar({ onSearch, defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (onSearch) {
        onSearch(value);
      }
    },
    [onSearch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!onSearch && query.trim()) {
        router.push(`/?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [onSearch, query, router]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 label-system text-[10px] pointer-events-none select-none">
          SEARCH
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Ticker, name, or sector..."
          className="w-full pl-14 pr-4 py-2 text-sm bg-transparent border-b border-border
            placeholder:text-text-muted text-text-primary font-data
            focus:outline-none focus:border-text-primary
            hover:border-border-hover transition-colors"
        />
      </div>
    </form>
  );
}
