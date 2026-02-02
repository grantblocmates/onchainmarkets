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
        <svg
          className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder='Search assets... (TSLA, Gold, Nasdaq)'
          className="w-full pl-14 pr-6 py-3.5 text-sm bg-bg-card border border-border rounded-xl
            placeholder:text-text-muted text-text-primary
            focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue
            hover:border-border-hover transition-all"
        />
      </div>
    </form>
  );
}
