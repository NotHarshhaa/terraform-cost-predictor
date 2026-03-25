"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-6 w-11 rounded-full bg-input animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-input transition-colors hover:bg-input/80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      role="switch"
      aria-checked={isDark}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Sliding toggle with icon */}
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-background shadow-md transition-transform duration-200 ease-in-out border border-border
          ${isDark ? "translate-x-5" : "translate-x-0.5"}
        `}
      >
        {/* Icon inside the toggle */}
        <div className="flex h-full w-full items-center justify-center">
          {isDark ? (
            <Moon className="h-3 w-3 text-foreground" />
          ) : (
            <Sun className="h-3 w-3 text-foreground" />
          )}
        </div>
      </span>
    </button>
  );
}
