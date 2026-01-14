import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Team } from "@/types";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Heart, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = await createClient();

  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Récupérer les équipes favorites
  const { data: favorites, error: favoritesError } = await supabase
    .from("favorite_teams")
    .select("team_id")
    .eq("user_id", user.id);

  if (favoritesError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erreur lors du chargement</h1>
          <p className="text-muted-foreground">{favoritesError.message}</p>
        </div>
      </div>
    );
  }

  const teamIds = favorites?.map((fav) => fav.team_id) || [];

  if (teamIds.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/teams">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux équipes
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Mes équipes favorites
            </h1>
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore d&apos;équipes favorites
            </p>
          </div>

          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">
              Ajoutez des équipes à vos favoris en cliquant sur l&apos;icône cœur
              sur les cartes d&apos;équipes.
            </p>
            <Link href="/teams">
              <Button>Voir toutes les équipes</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Récupérer les détails des équipes favorites
  const { data: teams, error: teamsError } = await supabase
    .from("equipe")
    .select("*")
    .in("id", teamIds)
    .order("name", { ascending: true });

  if (teamsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erreur lors du chargement</h1>
          <p className="text-muted-foreground">{teamsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/teams">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux équipes
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Mes équipes favorites
          </h1>
          <p className="text-muted-foreground">
            {teams?.length || 0} équipe{(teams?.length || 0) > 1 ? "s" : ""} favorite
            {(teams?.length || 0) > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams?.map((team: Team) => (
            <div key={team.id} className="relative group">
              <Link href={`/teams/${team.id}`}>
                <Card className="overflow-hidden shadow-xl bg-card/50 backdrop-blur-md text-card-foreground hover:bg-card/70 transition-all cursor-pointer h-full flex flex-col">
                  <div className="h-24 bg-gradient-to-r from-blue-900 via-red-900 to-blue-900 dark:from-blue-900 dark:via-red-900 dark:to-blue-900 relative flex items-center justify-center">
                    <Avatar className="w-20 h-20 border-4 border-background shadow-xl bg-white dark:bg-white">
                      <AvatarImage
                        src={team.crest}
                        alt={team.name}
                        className="object-contain p-2"
                      />
                      <AvatarFallback className="text-foreground text-xl font-bold bg-white dark:bg-white dark:text-slate-900">
                        {team.shortName?.substring(0, 2) ||
                          team.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <CardHeader className="pt-6 pb-4">
                    <CardTitle className="text-xl font-bold mb-2 line-clamp-2">
                      {team.name}
                    </CardTitle>
                    {team.shortName && (
                      <p className="text-muted-foreground text-sm">{team.shortName}</p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 pb-6 flex-1 flex flex-col justify-end">
                    <div className="space-y-2">
                      {team.venue && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          📍 {team.venue}
                        </p>
                      )}
                      {team.founded && (
                        <Badge variant="outline" className="w-fit">
                          Fondé en {team.founded}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton teamId={team.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
