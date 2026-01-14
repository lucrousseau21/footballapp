"use client";

import { Team, Player, Coach } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  MapPinIcon,
  GlobeIcon,
  UserIcon,
  TrophyIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";

interface TeamDisplayProps {
  team: Team;
  players: Player[] | null;
  coach: Coach | null;
}

// Catégories de postes disponibles
const POSITION_CATEGORIES = ["Tous", "Gardiens", "Défenseurs", "Milieu", "Attaquants"] as const;

// Fonction pour mapper un poste à sa catégorie
function getPositionCategory(position: string): string {
  const posLower = position.toLowerCase();
  
  // Gardiens
  if (
    posLower.includes("goalkeeper") ||
    posLower.includes("gardien") ||
    posLower === "gk" ||
    posLower === "g"
  ) {
    return "Gardiens";
  }
  
  // Défenseurs
  if (
    posLower.includes("defender") ||
    posLower.includes("défenseur") ||
    posLower.includes("defence") ||
    posLower.includes("back") ||
    posLower === "cb" ||
    posLower === "rb" ||
    posLower === "lb" ||
    posLower === "rwb" ||
    posLower === "lwb"
  ) {
    return "Défenseurs";
  }
  
  // Milieu
  if (
    posLower.includes("midfielder") ||
    posLower.includes("milieu") ||
    posLower.includes("midfield") ||
    posLower === "cm" ||
    posLower === "cdm" ||
    posLower === "cam" ||
    posLower === "lm" ||
    posLower === "rm"
  ) {
    return "Milieu";
  }
  
  // Attaquants
  if (
    posLower.includes("attacker") ||
    posLower.includes("attaquant") ||
    posLower.includes("forward") ||
    posLower.includes("striker") ||
    posLower.includes("winger") ||
    posLower === "st" ||
    posLower === "cf" ||
    posLower === "lw" ||
    posLower === "rw"
  ) {
    return "Attaquants";
  }
  
  // Par défaut, retourner le poste tel quel
  return position;
}

export function TeamDisplay({ team, players, coach }: TeamDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  // Filtrer les joueurs par catégorie sélectionnée
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (selectedCategory === "Tous") return players;
    return players.filter((player) => {
      const playerCategory = getPositionCategory(player.position);
      return playerCategory === selectedCategory;
    });
  }, [players, selectedCategory]);
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md text-card-foreground">
        <div className="h-32 bg-gradient-to-r from-blue-900 via-red-900 to-blue-900 dark:from-blue-900 dark:via-red-900 dark:to-blue-900 relative">
          <div className="absolute -bottom-16 left-8">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl bg-white dark:bg-white">
              <AvatarImage
                src={team.crest}
                alt={team.name}
                className="object-contain p-2"
              />
              <AvatarFallback className="text-foreground text-2xl font-bold bg-white dark:bg-white dark:text-slate-900">
                {team.shortName?.substring(0, 2) || team.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardHeader className="pt-20 pb-8 px-8">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                {team.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" /> {team.address}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <FavoriteButton teamId={team.id} size="default" />
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm"
                >
                  Fondé en {team.founded}
                </Badge>
              </div>
              {team.website && (
                <a
                  href={team.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 transition-colors"
                >
                  <GlobeIcon className="w-3 h-3" /> Site web
                </a>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="squad" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="squad">Effectif</TabsTrigger>
              <TabsTrigger value="info">Informations</TabsTrigger>
            </TabsList>

            <TabsContent value="squad" className="space-y-6">
              {coach && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <UserIcon className="w-5 h-5 text-yellow-500" /> Entraîneur
                  </h3>
                  <Card className="bg-muted/40">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="w-16 h-16 border-2 border-border">
                        <AvatarFallback className="bg-muted text-foreground">
                          HC
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {coach.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{coach.nationality}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" /> Né le{" "}
                            {new Date(coach.dateOfBirth).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <TrophyIcon className="w-5 h-5 text-blue-500" /> Joueurs
                  </h3>
                  {filteredPlayers.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {filteredPlayers.length} joueur
                      {filteredPlayers.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Filtres par catégorie de poste */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {POSITION_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "transition-all",
                        selectedCategory === category && "shadow-md"
                      )}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {filteredPlayers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun joueur trouvé pour ce poste.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlayers.map((player) => (
                      <Card
                        key={player.id}
                        className="bg-muted/40 hover:bg-muted/60 transition-colors"
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarFallback className="bg-muted text-xs text-foreground">
                              {player.position.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {player.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {player.position} • {player.nationality}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Stade
                    </h4>
                    <p className="text-lg text-foreground">{team.venue}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Couleurs du club
                    </h4>
                    <p className="text-lg text-foreground">{team.clubcolors}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Adresse
                    </h4>
                    <p className="text-lg text-foreground">{team.address}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      TLA
                    </h4>
                    <p className="text-lg text-foreground">{team.tla}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
