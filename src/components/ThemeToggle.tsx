'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-20 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] transition-all duration-300 cursor-pointer"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Sliding pill indicator */}
      <span
        className={`absolute w-9 h-7 rounded-full bg-[var(--text-primary)] shadow-sm transition-transform duration-300 ease-in-out ${
          isLight ? 'translate-x-1' : 'translate-x-10'
        }`}
      />

      {/* GM label (left side) */}
      <span
        className={`relative z-10 flex-1 text-center text-xs font-mono font-bold transition-colors duration-300 ${
          isLight ? 'text-[var(--bg)]' : 'text-[var(--text-muted)]'
        }`}
      >
        GM
      </span>

      {/* GN label (right side) */}
      <span
        className={`relative z-10 flex-1 text-center text-xs font-mono font-bold transition-colors duration-300 ${
          !isLight ? 'text-[var(--bg)]' : 'text-[var(--text-muted)]'
        }`}
      >
        GN
      </span>
    </button>
  );
}
