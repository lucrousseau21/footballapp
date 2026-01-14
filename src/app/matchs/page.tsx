import { createClient } from "@/lib/supabase/server";
import { Match, MatchRaw } from "@/types";
import { MatchsFilter } from "@/components/MatchsFilter";

export const revalidate = 0;

export default async function MatchsPage() {
  const supabase = await createClient();

  // Récupérer tous les matchs
  const { data: matches, error } = await supabase
    .from("matchs")
    .select("*")
    .order("utc_date", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erreur lors du chargement</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Aucun match trouvé</h1>
          <p className="text-muted-foreground">
            Il n&apos;y a pas encore de matchs dans la base de données.
          </p>
        </div>
      </div>
    );
  }

  // Récupérer les équipes pour chaque match
  const teamIds = new Set<number>();
  (matches as MatchRaw[]).forEach((match) => {
    if (match.home_team_id) teamIds.add(match.home_team_id);
    if (match.away_team_id) teamIds.add(match.away_team_id);
  });

  const { data: teams } = await supabase
    .from("equipe")
    .select("id, name, shortName, crest")
    .in("id", Array.from(teamIds));

  const teamsMap = new Map(teams?.map((team) => [team.id, team]) || []);

  // Enrichir les matchs avec les données des équipes
  const enrichedMatches: Match[] = (matches as MatchRaw[]).map((match) => {
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

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Tous les matchs
          </h1>
          <p className="text-muted-foreground">
            {matches.length} match{matches.length > 1 ? "s" : ""}
          </p>
        </div>

        <MatchsFilter matches={enrichedMatches} />
      </div>
    </main>
  );
}
