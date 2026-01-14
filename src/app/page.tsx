import { createClient } from "@/lib/supabase/server";
import { Match, MatchRaw } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Heart, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Récupérer les équipes favorites si l'utilisateur est connecté
  let favoriteTeamIds: number[] = [];
  if (user) {
    const { data: favorites } = await supabase
      .from("favorite_teams")
      .select("team_id")
      .eq("user_id", user.id);
    favoriteTeamIds = favorites?.map((fav) => fav.team_id) || [];
  }

  // Récupérer tous les matchs
  const { data: matches, error } = await supabase
    .from("matchs")
    .select("*")
    .order("utc_date", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erreur lors du chargement</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Ligue 1</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Aucun match disponible pour le moment
          </p>
          <Link href="/teams">
            <Button size="lg" className="text-lg px-8 py-6">
              Afficher toutes les équipes
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Trouver la journée actuelle ou la plus récente
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Trouver la journée la plus récente (matchday avec des matchs)
  const matchdaysWithMatches = new Map<number, MatchRaw[]>();
  (matches as MatchRaw[]).forEach((match) => {
    if (match.matchday) {
      if (!matchdaysWithMatches.has(match.matchday)) {
        matchdaysWithMatches.set(match.matchday, []);
      }
      matchdaysWithMatches.get(match.matchday)!.push(match);
    }
  });

  // Trouver la journée la plus récente (celle avec la date la plus proche d'aujourd'hui)
  let currentMatchday: number | null = null;
  let closestDate = Infinity;

  matchdaysWithMatches.forEach((matchdayMatches, matchday) => {
    // Trouver la date la plus proche d'aujourd'hui dans cette journée
    matchdayMatches.forEach((match) => {
      const matchDate = new Date(match.utc_date);
      const diff = Math.abs(matchDate.getTime() - today.getTime());
      if (diff < closestDate) {
        closestDate = diff;
        currentMatchday = matchday;
      }
    });
  });

  // Si aucune journée trouvée, prendre la première disponible
  if (currentMatchday === null && matchdaysWithMatches.size > 0) {
    currentMatchday = Array.from(matchdaysWithMatches.keys()).sort((a, b) => b - a)[0];
  }

  // Filtrer les matchs de la journée actuelle/récente
  let filteredMatches = (matches as MatchRaw[]).filter((match) => {
    if (currentMatchday === null) return true;
    return match.matchday === currentMatchday;
  });

  // Si l'utilisateur est connecté et a des favoris, filtrer par équipes favorites
  if (user && favoriteTeamIds.length > 0) {
    filteredMatches = filteredMatches.filter(
      (match) =>
        favoriteTeamIds.includes(match.home_team_id) ||
        favoriteTeamIds.includes(match.away_team_id)
    );
  }

  // Récupérer les équipes pour chaque match filtré
  const teamIds = new Set<number>();
  filteredMatches.forEach((match) => {
    if (match.home_team_id) teamIds.add(match.home_team_id);
    if (match.away_team_id) teamIds.add(match.away_team_id);
  });

  const { data: teams } = await supabase
    .from("equipe")
    .select("id, name, shortName, crest")
    .in("id", Array.from(teamIds));

  const teamsMap = new Map(teams?.map((team) => [team.id, team]) || []);

  // Enrichir les matchs avec les données des équipes
  const enrichedMatches: Match[] = filteredMatches.map((match) => {
    const homeTeamData = teamsMap.get(match.home_team_id);
    const awayTeamData = teamsMap.get(match.away_team_id);

    return {
      id: match.id,
      utcDate: match.utc_date,
      status: match.status,
      matchday: match.matchday || undefined,
      homeTeam: {
        id: match.home_team_id,
        name: homeTeamData?.name || "Équipe inconnue",
        shortName: homeTeamData?.shortName,
        crest: homeTeamData?.crest,
      },
      awayTeam: {
        id: match.away_team_id,
        name: awayTeamData?.name || "Équipe inconnue",
        shortName: awayTeamData?.shortName,
        crest: awayTeamData?.crest,
      },
      score: {
        fullTime: {
          home: match.home_score ?? undefined,
          away: match.away_score ?? undefined,
        },
      },
      competition: match.competition_code || undefined,
    };
  });

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
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {user && favoriteTeamIds.length > 0
              ? "Matchs de vos équipes favorites"
              : "Matchs de la journée"}
          </h1>
          <p className="text-muted-foreground">
            {currentMatchday
              ? `Journée ${currentMatchday}`
              : "Aucune journée spécifique"}
            {user && favoriteTeamIds.length > 0 && (
              <span className="ml-2 flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                {favoriteTeamIds.length} équipe{favoriteTeamIds.length > 1 ? "s" : ""} favorite
                {favoriteTeamIds.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        {enrichedMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              {user && favoriteTeamIds.length > 0
                ? "Aucun match de vos équipes favorites pour cette journée."
                : "Aucun match trouvé pour cette journée."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/matchs">
                <Button variant="outline">Voir tous les matchs</Button>
              </Link>
              {user && (
                <Link href="/favorites">
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Mes favoris
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {enrichedMatches.length} match{enrichedMatches.length > 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrichedMatches.map((match: Match) => (
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
            <div className="mt-8 text-center">
              <Link href="/matchs">
                <Button variant="outline">Voir tous les matchs</Button>
              </Link>
            </div>
          </>
        )}

        {/* Section CTA vers les équipes */}
        <div className="mt-16 pt-16 border-t border-border">
          <Card className="overflow-hidden bg-gradient-to-r from-blue-900/20 via-red-900/20 to-blue-900/20 dark:from-blue-900/30 dark:via-red-900/30 dark:to-blue-900/30 border-border">
            <CardContent className="p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <Users className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">
                      Découvrez toutes les équipes
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
                    Explorez les équipes de la Ligue 1, consultez leurs effectifs, leurs statistiques et ajoutez vos équipes favorites pour suivre leurs matchs en priorité.
                  </p>
                  <Link href="/teams">
                    <Button size="lg" className="text-lg px-8 py-6 group">
                      Voir toutes les équipes
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-red-500/20 flex items-center justify-center">
                    <Users className="w-32 h-32 text-primary/30" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
