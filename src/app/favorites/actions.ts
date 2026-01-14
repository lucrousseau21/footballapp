"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addFavoriteTeam(teamId: number) {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour ajouter une équipe aux favoris" };
  }

  // Vérifier si l'équipe existe déjà dans les favoris
  const { data: existing } = await supabase
    .from("favorite_teams")
    .select("id")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (existing) {
    return { error: "Cette équipe est déjà dans vos favoris" };
  }

  // Ajouter l'équipe aux favoris
  const { error } = await supabase
    .from("favorite_teams")
    .insert({
      user_id: user.id,
      team_id: teamId,
    });

  if (error) {
    console.error("Error adding favorite team:", error);
    return { error: "Erreur lors de l'ajout de l'équipe aux favoris" };
  }

  revalidatePath("/teams");
  revalidatePath("/favorites");
  return { success: true };
}

export async function removeFavoriteTeam(teamId: number) {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour retirer une équipe des favoris" };
  }

  // Retirer l'équipe des favoris
  const { error } = await supabase
    .from("favorite_teams")
    .delete()
    .eq("user_id", user.id)
    .eq("team_id", teamId);

  if (error) {
    console.error("Error removing favorite team:", error);
    return { error: "Erreur lors du retrait de l'équipe des favoris" };
  }

  revalidatePath("/teams");
  revalidatePath("/favorites");
  return { success: true };
}

export async function toggleFavoriteTeam(teamId: number) {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour gérer vos favoris" };
  }

  // Vérifier si l'équipe est déjà dans les favoris
  const { data: existing } = await supabase
    .from("favorite_teams")
    .select("id")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (existing) {
    return await removeFavoriteTeam(teamId);
  } else {
    return await addFavoriteTeam(teamId);
  }
}

export async function getFavoriteTeams() {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: null };
  }

  // Récupérer les équipes favorites
  const { data, error } = await supabase
    .from("favorite_teams")
    .select("team_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorite teams:", error);
    return { data: [], error };
  }

  const teamIds = data?.map((fav) => fav.team_id) || [];
  return { data: teamIds, error: null };
}
