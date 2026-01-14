import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: [], error: null });
  }

  // Récupérer les équipes favorites
  const { data, error } = await supabase
    .from("favorite_teams")
    .select("team_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorite teams:", error);
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }

  const teamIds = data?.map((fav) => fav.team_id) || [];
  return NextResponse.json({ data: teamIds, error: null });
}
