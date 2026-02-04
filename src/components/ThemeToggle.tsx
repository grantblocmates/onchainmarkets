"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="label-system px-3 py-1.5 hover:text-text-primary transition-colors cursor-pointer"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={theme === "light" ? "GN — switch to dark mode" : "GM — switch to light mode"}
    >
      {theme === "light" ? "GN" : "GM"}
    </button>
  );
}
