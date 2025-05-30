# Configuration de la synchronisation GitHub

## Étapes pour configurer la synchronisation des données

### 1. Créer un Personal Access Token GitHub

1. Allez sur [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Cliquez sur "Generate new token (classic)"
3. Donnez un nom à votre token (ex: "Budget Manager Data Sync")
4. Sélectionnez les permissions suivantes :
   - `repo` (Full control of private repositories)
5. Cliquez sur "Generate token"
6. **IMPORTANT**: Copiez le token immédiatement, vous ne pourrez plus le voir après

### 2. Créer le repository de données

1. Créez un nouveau repository GitHub (peut être privé)
2. Nommez-le `budget` ou un autre nom de votre choix
3. Créez un dossier `data` dans le repository
4. Le fichier `app-data.json` sera créé automatiquement lors de la première sauvegarde

### 3. Configuration dans l'application

Le token GitHub est actuellement configuré directement dans le code pour la démo.
En production, vous devriez :

1. Créer un fichier `.env.local` à la racine du projet
2. Ajouter votre token :
```
VITE_GITHUB_TOKEN=votre_token_ici
```

### 4. Structure des données sauvegardées

Les données sont sauvegardées au format JSON avec la structure suivante :
```json
{
  "budgets": [...],
  "expenses": {...},
  "users": {...},
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 5. Utilisation

- **Sauvegarde automatique** : Les données sont automatiquement sauvegardées après chaque modification
- **Sauvegarde manuelle** : Utilisez le bouton "Sauvegarder" dans les Paramètres
- **Chargement** : Utilisez le bouton "Charger" pour récupérer les dernières données depuis GitHub
- **Multi-appareils** : Vos données sont synchronisées entre tous vos appareils

### Sécurité

- Gardez votre token GitHub secret
- Ne le partagez jamais
- Vous pouvez révoquer le token à tout moment depuis GitHub
- Les données sont stockées dans votre repository GitHub privé 