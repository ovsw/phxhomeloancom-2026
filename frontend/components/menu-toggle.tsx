"use client";

import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const subscribeToHydration = () => () => {};

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribeToHydration, () => true, () => false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          aria-current={mounted && theme === "light" ? "true" : undefined}
          className="flex items-center justify-between"
          onClick={() => setTheme("light")}
        >
          Light {mounted && theme === "light" ? <Check className="ml-2 size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-current={mounted && theme === "dark" ? "true" : undefined}
          className="flex items-center justify-between"
          onClick={() => setTheme("dark")}
        >
          Dark {mounted && theme === "dark" ? <Check className="ml-2 size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-current={mounted && theme === "system" ? "true" : undefined}
          className="flex items-center justify-between"
          onClick={() => setTheme("system")}
        >
          System {mounted && theme === "system" ? <Check className="ml-2 size-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
