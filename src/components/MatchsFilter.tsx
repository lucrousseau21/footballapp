"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Match } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchsFilterProps {
  matches: Match[];
}

export function MatchsFilter({ matches }: MatchsFilterProps) {
  // Extraire toutes les journées disponibles
  const matchdays = useMemo(() => {
    const days = new Set<number>();
    matches.forEach((match) => {
      if (match.matchday) {
        days.add(match.matchday);
      }
    });
    return Array.from(days).sort((a, b) => a - b); // Tri croissant (1, 2, 3...)
  }, [matches]);

  // Trouver la dernière journée jouée (avec au moins un match FINISHED)
  const lastPlayedMatchday = useMemo(() => {
    const finishedMatchdays = matches
      .filter((match) => match.status === "FINISHED" && match.matchday)
      .map((match) => match.matchday!)
      .sort((a, b) => b - a);
    return finishedMatchdays[0] || matchdays[0] || null;
  }, [matches, matchdays]);

  // État pour la journée sélectionnée (par défaut la dernière journée jouée)
  const [selectedMatchday, setSelectedMatchday] = useState<number | "all">(
    lastPlayedMatchday || "all"
  );

  // Référence pour le conteneur de scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<number | "all", HTMLButtonElement>>(new Map());

  // Faire défiler pour mettre le bouton sélectionné en troisième position
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const selectedButton = buttonRefs.current.get(selectedMatchday);
    if (!selectedButton) return;

    const container = scrollContainerRef.current;
    
    // Calculer la position pour mettre le bouton en troisième position
    // On veut que le bouton soit à 2 positions après le début visible (3ème position)
    const buttons = Array.from(container.querySelectorAll("button"));
    const selectedIndex = buttons.indexOf(selectedButton);
    
    if (selectedIndex >= 0) {
      // Calculer la largeur de 2 boutons + gaps pour positionner le 3ème
      // Le bouton "Toutes" compte comme la première position
      let offset = 0;
      const startIndex = selectedMatchday === "all" ? 0 : 1; // Commencer après "Toutes" si on sélectionne une journée
      
      for (let i = startIndex; i < Math.min(selectedIndex, startIndex + 2); i++) {
        if (buttons[i]) {
          offset += buttons[i].offsetWidth + 8; // 8px pour le gap
        }
      }
      
      // Scroll pour positionner le bouton sélectionné en troisième position
      container.scrollTo({
        left: selectedButton.offsetLeft - offset,
        behavior: "smooth",
      });
    }
  }, [selectedMatchday]);

  // Filtrer les matchs selon la journée sélectionnée
  const filteredMatches = useMemo(() => {
    if (selectedMatchday === "all") {
      return matches;
    }
    return matches.filter((match) => match.matchday === selectedMatchday);
  }, [matches, selectedMatchday]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      FINISHED: { label: "Terminé", variant: "default" },
      SCHEDULED: { label: "Programmé", variant: "outline" },
      TIMED: { label: "Programmé", variant: "outline" },
      LIVE: { label: "En direct", variant: "default" },
      IN_PLAY: { label: "En cours", variant: "default" },
      PAUSED: { label: "Pause", variant: "secondary" },
      POSTPONED: { label: "Reporté", variant: "secondary" },
      SUSPENDED: { label: "Suspendu", variant: "secondary" },
      CANCELLED: { label: "Annulé", variant: "secondary" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "outline",
    };
    return (
      <Badge variant={statusInfo.variant} className="border-border">
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtre par journée avec slider */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground block">
          Filtrer par journée :
        </span>
        <div className="relative overflow-hidden">
          {/* Conteneur avec scroll horizontal */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          >
            <div className="flex items-center gap-2 min-w-max">
              <Button
                ref={(el) => {
                  if (el) buttonRefs.current.set("all", el);
                }}
                variant={selectedMatchday === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMatchday("all")}
                className={cn(
                  "transition-all whitespace-nowrap flex-shrink-0",
                  selectedMatchday === "all" && "shadow-md"
                )}
              >
                Toutes
              </Button>
              {matchdays.map((matchday) => (
                <Button
                  key={matchday}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(matchday, el);
                  }}
                  variant={selectedMatchday === matchday ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMatchday(matchday)}
                  className={cn(
                    "transition-all whitespace-nowrap flex-shrink-0",
                    selectedMatchday === matchday && "shadow-md"
                  )}
                >
                  Journée {matchday}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des matchs filtrés */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucun match trouvé pour cette journée.</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            {filteredMatches.length} match{filteredMatches.length > 1 ? "s" : ""}
            {selectedMatchday !== "all" && ` - Journée ${selectedMatchday}`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match: Match) => (
              <Link key={match.id} href={`/matchs/${match.id}`}>
                <Card className="overflow-hidden border-border shadow-xl bg-card hover:bg-muted/60 transition-all cursor-pointer h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      {getStatusBadge(match.status)}
                      {match.matchday && (
                        <Badge variant="outline" className="border-border">
                          Journée {match.matchday}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(match.utcDate)}</span>
                    </div>
                    {match.competition && (
                      <p className="text-xs text-muted-foreground">
                        {match.competition}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 pb-6 flex-1 flex flex-col justify-center">
                    <div className="space-y-4">
                      {/* Équipe à domicile */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage
                              src={match.homeTeam.crest}
                              alt={match.homeTeam.name}
                              className="object-contain p-1"
                            />
                            <AvatarFallback className="text-xs text-foreground bg-muted">
                              {match.homeTeam.shortName?.substring(0, 2) ||
                                match.homeTeam.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground flex-1">
                            {match.homeTeam.name}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-foreground ml-4">
                          {match.score?.fullTime?.home ?? "-"}
                        </span>
                      </div>

                      <div className="text-center text-muted-foreground text-sm">
                        VS
                      </div>

                      {/* Équipe à l'extérieur */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage
                              src={match.awayTeam.crest}
                              alt={match.awayTeam.name}
                              className="object-contain p-1"
                            />
                            <AvatarFallback className="text-xs text-foreground bg-muted">
                              {match.awayTeam.shortName?.substring(0, 2) ||
                                match.awayTeam.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground flex-1">
                            {match.awayTeam.name}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-foreground ml-4">
                          {match.score?.fullTime?.away ?? "-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
