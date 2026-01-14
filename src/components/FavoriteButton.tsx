"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteTeam } from "@/app/favorites/actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  teamId: number;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export function FavoriteButton({ teamId, className, size = "icon" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  // Charger l'état initial des favoris
  useEffect(() => {
    async function loadFavoriteStatus() {
      try {
        const response = await fetch("/api/favorites");
        const { data } = await response.json();
        setIsFavorite(data.includes(teamId));
      } catch (error) {
        console.error("Error loading favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFavoriteStatus();
  }, [teamId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;

    setIsToggling(true);
    const result = await toggleFavoriteTeam(teamId);
    
    if (result.success) {
      setIsFavorite(!isFavorite);
      router.refresh();
    } else if (result.error) {
      // Vous pourriez afficher une notification d'erreur ici
      console.error(result.error);
    }
    
    setIsToggling(false);
  };

  if (isLoading) {
    return (
      <Button
      variant="ghost"
        size={size}
      className={cn(
        "rounded-full bg-white/70 text-muted-foreground shadow-sm backdrop-blur-sm opacity-60",
        className
      )}
        disabled
      >
        <Heart className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isToggling}
      className={cn(
        "rounded-full border border-white/40 bg-white/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-all",
        isFavorite &&
          "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white",
        !isFavorite &&
          "hover:bg-white/90 hover:text-foreground",
        className
      )}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all",
          isFavorite && "fill-current"
        )}
      />
    </Button>
  );
}
