'use client';

import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center rounded-full border border-border overflow-hidden font-mono text-xs font-semibold"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span
        className={`px-3 py-1.5 transition-colors duration-300 ${
          isLight
            ? 'bg-text-primary text-bg'
            : 'bg-transparent text-text-muted'
        }`}
      >
        GM
      </span>
      <span
        className={`px-3 py-1.5 transition-colors duration-300 ${
          !isLight
            ? 'bg-text-primary text-bg'
            : 'bg-transparent text-text-muted'
        }`}
      >
        GN
      </span>
    </button>
  );
}
