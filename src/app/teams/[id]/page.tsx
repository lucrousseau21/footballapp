import { createClient } from "@/lib/supabase/server";
import { TeamDisplay } from "@/components/TeamDisplay";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team, error: teamError } = await supabase
    .from("equipe")
    .select("*")
    .eq("id", id)
    .single();

  if (teamError || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Équipe non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            {teamError?.message || "Cette équipe n'existe pas"}
          </p>
          <Link href="/teams">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux équipes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: players } = await supabase
    .from("joueurs")
    .select("*")
    .eq("equipe_id", team.id)
    .order("position", { ascending: true });

  const { data: coach } = await supabase
    .from("coache")
    .select("*")
    .eq("equipe_id", team.id)
    .single();

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto mb-6">
        <Link href="/teams">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux équipes
          </Button>
        </Link>
      </div>
      <TeamDisplay team={team} players={players} coach={coach} />
    </main>
  );
}
