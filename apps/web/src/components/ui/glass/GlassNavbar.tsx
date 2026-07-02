"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Moon, Sun, ShieldCheck, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function GlassNavbar() {
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  
  // Condense navbar when scrolled
  const padding = useTransform(scrollY, [0, 100], ["1.5rem", "0.75rem"]);
  const blur = useTransform(scrollY, [0, 100], ["blur(8px)", "blur(16px)"]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "var(--glass-bg)"]
  );

  return (
    <motion.header
      style={{ padding, backdropFilter: blur, backgroundColor }}
      className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--glass-border)] px-6 transition-colors duration-300"
    >
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-[var(--color-info)]" />
        <span className="text-xl font-bold tracking-tight">GoKlinik</span>
      </div>

      {/* Trust Signals (Hidden on very small screens) */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-[var(--color-success)]" />
          <span>UU PDP Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-[var(--color-success)]" />
          <span>SOC2 Type II</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full hover:bg-[var(--glass-border)] focus-ring"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </motion.header>
  );
}
