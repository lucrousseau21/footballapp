"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Changer le thème"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 border rounded-md p-1 bg-background">
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme("light")}
        aria-label="Mode clair"
        title="Mode clair"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme("dark")}
        aria-label="Mode sombre"
        title="Mode sombre"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme("system")}
        aria-label="Système"
        title="Utiliser le thème du système"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
