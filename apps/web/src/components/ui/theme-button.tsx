"use client";

import {
  type Resolved,
  type ThemeSelection,
  ThemeToggler,
} from "@animate-ui/react/primitives/effects/theme-toggler";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeButton() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <ThemeToggler
      theme={theme as ThemeSelection}
      resolvedTheme={resolvedTheme as Resolved}
      setTheme={setTheme}
    >
      {({ resolved, toggleTheme }) => {
        // Compare the resolved theme, not the selection: "system" must still flip to the opposite of what is on screen.
        const next: Resolved = resolved === "dark" ? "light" : "dark";
        const Icon = resolved === "dark" ? SunIcon : MoonIcon;

        return (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={`Switch to ${next} theme`}
            onClick={() => toggleTheme(next)}
          >
            <Icon className="size-4.5" />
          </Button>
        );
      }}
    </ThemeToggler>
  );
}
