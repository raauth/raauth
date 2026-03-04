"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

type ThemeToggleProps = React.ComponentProps<typeof Button>;

export function ThemeToggle({
  variant = "outline",
  size = "icon-sm",
  onClick,
  ...props
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={`Alternar para tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      title={`Alternar para tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setTheme(nextTheme);
      }}
      {...props}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
