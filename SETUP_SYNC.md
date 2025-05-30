# 🚀 Configuration de la synchronisation GitHub

## ⚡ Guide rapide pour synchroniser vos données entre appareils

### 1. Créer le repository GitHub
- Allez sur https://github.com/new
- **Nom** : `budget-data`
- **Privé** : ✅ Oui (recommandé)
- ✅ Cochez "Add README"
- Cliquez "Create repository"

### 2. Créer le dossier data
Dans votre nouveau repository :
- Cliquez "Create new file"
- Tapez : `data/README.md`
- Ajoutez du contenu (ex: "Dossier de données BudgetManager")
- Cliquez "Commit"

### 3. Créer votre token
- GitHub → Settings → Developer settings
- Personal access tokens → Tokens (classic)
- "Generate new token (classic)"
- **Permissions** : Cochez `repo`
- Copiez le token généré ⚠️

### 4. Configurer le token dans l'app
Modifiez le fichier `src/contexts/BudgetContext.tsx` ligne ~106 :

**AVANT :**
```typescript
const token = import.meta.env.VITE_GITHUB_TOKEN || 'VOTRE_TOKEN_ICI'
```

**APRÈS :**
```typescript
const token = import.meta.env.VITE_GITHUB_TOKEN || 'github_pat_VOTRE_VRAI_TOKEN'
```

### 5. Tester la synchronisation
1. Ajoutez une dépense sur votre MacBook
2. Allez dans Paramètres → Sauvegarder sur GitHub
3. Vérifiez que le fichier `data/app-data.json` apparaît dans votre repository
4. Sur votre iPhone, allez dans Paramètres → Charger depuis GitHub

## ✅ Résultat
Vos données seront synchronisées entre tous vos appareils !

## 🔧 Dépannage
- Si erreur 401 : Vérifiez votre token
- Si erreur 404 : Vérifiez le nom du repository (`budget-data`)
- Si pas de synchronisation : Vérifiez la console pour les erreurs

## 📱 Synchronisation automatique
Une fois configuré, l'app sauvegarde automatiquement après chaque modification et charge les données au démarrage. 