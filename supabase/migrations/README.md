# Configuration de la base de données pour les favoris

## Instructions pour créer la table `favorite_teams` dans Supabase

### Option 1 : Via l'interface Supabase (Recommandé)

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `create_favorite_teams.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

### Option 2 : Via la ligne de commande (si vous utilisez Supabase CLI)

```bash
supabase db push
```

## Vérification

Après avoir exécuté le script, vous devriez voir :

1. Une nouvelle table `favorite_teams` dans votre base de données
2. Les politiques RLS (Row Level Security) activées
3. Les index créés pour améliorer les performances

## Structure de la table

- `id` : Identifiant unique (BIGSERIAL)
- `user_id` : UUID de l'utilisateur (référence à `auth.users`)
- `team_id` : ID de l'équipe (référence à `equipe`)
- `created_at` : Date de création
- Contrainte unique sur `(user_id, team_id)` pour éviter les doublons

## Sécurité

Les politiques RLS garantissent que :
- Les utilisateurs ne peuvent voir que leurs propres favoris
- Les utilisateurs ne peuvent ajouter que leurs propres favoris
- Les utilisateurs ne peuvent supprimer que leurs propres favoris
