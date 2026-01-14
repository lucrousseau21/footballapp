import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CalendarIcon, MapPinIcon } from "lucide-react";
import { Match, MatchRaw } from "@/types";

export const revalidate = 0;

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Récupérer le match
  const { data: match, error: matchError } = await supabase
    .from("matchs")
    .select("*")
    .eq("id", id)
    .single();

  if (matchError || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Match non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            {matchError?.message || "Ce match n'existe pas"}
          </p>
          <Link href="/matchs">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux matchs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const matchRaw = match as MatchRaw;

  // Récupérer les équipes
  const { data: homeTeamData } = await supabase
    .from("equipe")
    .select("*")
    .eq("id", matchRaw.home_team_id)
    .single();

  const { data: awayTeamData } = await supabase
    .from("equipe")
    .select("*")
    .eq("id", matchRaw.away_team_id)
    .single();

  // Enrichir les données du match
  const enrichedMatch: Match = {
    id: matchRaw.id,
    utcDate: matchRaw.utc_date,
    status: matchRaw.status,
    matchday: matchRaw.matchday || undefined,
    homeTeam: {
      id: matchRaw.home_team_id,
      name: homeTeamData?.name || "Équipe inconnue",
      shortName: homeTeamData?.shortName,
      crest: homeTeamData?.crest,
    },
    awayTeam: {
      id: matchRaw.away_team_id,
      name: awayTeamData?.name || "Équipe inconnue",
      shortName: awayTeamData?.shortName,
      crest: awayTeamData?.crest,
    },
    score: {
      fullTime: {
        home: matchRaw.home_score ?? undefined,
        away: matchRaw.away_score ?? undefined,
      },
    },
    competition: matchRaw.competition_code || undefined,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: date.toLocaleString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const dateInfo = formatDate(enrichedMatch.utcDate);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      FINISHED: { label: "Terminé", variant: "default" },
      SCHEDULED: { label: "Programmé", variant: "outline" },
      TIMED: { label: "Programmé", variant: "outline" },
      LIVE: { label: "En direct", variant: "default" },
      IN_PLAY: { label: "En cours", variant: "default" },
      PAUSED: { label: "Pause", variant: "secondary" },
      POSTPONED: { label: "Reporté", variant: "secondary" },
      SUSPENDED: { label: "Suspendu", variant: "secondary" },
      CANCELLED: { label: "Annulé", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return (
      <Badge variant={statusInfo.variant} className="border-border">
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/matchs">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux matchs
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-border shadow-2xl bg-card text-card-foreground">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between mb-4">
              {getStatusBadge(enrichedMatch.status)}
              {enrichedMatch.matchday && (
                <Badge variant="outline" className="border-border">
                  Journée {enrichedMatch.matchday}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>{dateInfo.full}</span>
              </div>
              {enrichedMatch.competition && (
                <p className="text-sm text-muted-foreground">{enrichedMatch.competition}</p>
              )}
              {enrichedMatch.venue && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{enrichedMatch.venue}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Score principal */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-8">
                {/* Équipe à domicile */}
                <div className="flex flex-col items-center gap-4 flex-1">
                  <Link
                    href={`/teams/${enrichedMatch.homeTeam.id}`}
                    className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-24 h-24 border-4 border-border shadow-xl bg-white">
                      <AvatarImage
                        src={enrichedMatch.homeTeam.crest}
                        alt={enrichedMatch.homeTeam.name}
                        className="object-contain p-2"
                      />
                      <AvatarFallback className="text-2xl font-bold text-foreground bg-white">
                        {enrichedMatch.homeTeam.shortName?.substring(0, 2) ||
                          enrichedMatch.homeTeam.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {enrichedMatch.homeTeam.name}
                      </h3>
                      {enrichedMatch.homeTeam.shortName && (
                        <p className="text-sm text-muted-foreground">
                          {enrichedMatch.homeTeam.shortName}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-foreground">
                    {enrichedMatch.score?.fullTime?.home ?? "-"}
                  </div>
                  <div className="text-2xl text-muted-foreground">-</div>
                  <div className="text-5xl font-bold text-foreground">
                    {enrichedMatch.score?.fullTime?.away ?? "-"}
                  </div>
                </div>

                {/* Équipe à l'extérieur */}
                <div className="flex flex-col items-center gap-4 flex-1">
                  <Link
                    href={`/teams/${enrichedMatch.awayTeam.id}`}
                    className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-24 h-24 border-4 border-border shadow-xl bg-white">
                      <AvatarImage
                        src={enrichedMatch.awayTeam.crest}
                        alt={enrichedMatch.awayTeam.name}
                        className="object-contain p-2"
                      />
                      <AvatarFallback className="text-2xl font-bold text-foreground bg-white">
                        {enrichedMatch.awayTeam.shortName?.substring(0, 2) ||
                          enrichedMatch.awayTeam.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {enrichedMatch.awayTeam.name}
                      </h3>
                      {enrichedMatch.awayTeam.shortName && (
                        <p className="text-sm text-muted-foreground">
                          {enrichedMatch.awayTeam.shortName}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Separator className="bg-border my-8" />

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  Équipe à domicile
                </h4>
                <Link href={`/teams/${enrichedMatch.homeTeam.id}`}>
                  <Button variant="outline" className="w-full border-border">
                    Voir les détails de l&apos;équipe
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  Équipe à l&apos;extérieur
                </h4>
                <Link href={`/teams/${enrichedMatch.awayTeam.id}`}>
                  <Button variant="outline" className="w-full border-border">
                    Voir les détails de l&apos;équipe
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
