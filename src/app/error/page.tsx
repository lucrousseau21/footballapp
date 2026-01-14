import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <h1 className="text-4xl font-bold mb-4 text-destructive">
        Une erreur s&apos;est produite
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Une erreur s&apos;est produite lors du traitement de votre demande. Veuillez réessayer plus tard.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
