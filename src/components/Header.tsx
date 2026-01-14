import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth");
  };

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          Football Teams
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/teams">Équipes</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/matchs">Matchs</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favoris</span>
              </Link>
            </Button>
          </nav>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.email}
              </span>
              <form action={signOut}>
                <Button variant="outline" size="sm">
                  Déconnexion
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
