# 🚀 Déploiement Simple sur GitHub Pages

## ✅ **Avantages de cette solution :**
- ✅ **Aucun service tiers** (pas de Netlify/Vercel)
- ✅ **Gratuit et illimité** 
- ✅ **Synchronisation automatique** des données
- ✅ **Accès cross-device** immédiat
- ✅ **Configuration simple**

## 📋 **Étapes simplifiées :**

### 1. **Build de l'application**
```bash
npm run build
```

### 2. **Activer GitHub Pages**
1. Allez sur votre repo GitHub : `https://github.com/nikulaguy/budget-manager`
2. **Settings** → **Pages**
3. **Source** → **GitHub Actions**

### 3. **Créer le fichier de déploiement automatique**
Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ production ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_GITHUB_TOKEN: ${{ secrets.VITE_GITHUB_TOKEN }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. **Configuration des secrets**
1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** :
   - Name: `VITE_GITHUB_TOKEN`
   - Value: `votre_token_github_personnel`

### 5. **Push et c'est fini !**
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin production
```

## 🌐 **Votre app sera accessible à :**
`https://nikulaguy.github.io/budget-manager/`

## 🔄 **Synchronisation automatique :**
- Toutes les données sont dans `budget-data/data/app-data.json`
- Lecture/écriture directe via GitHub API
- Pas besoin de base de données
- Synchronisation temps réel entre appareils

## 📱 **Installation mobile :**
1. Ouvrir l'URL sur le téléphone
2. **Ajouter à l'écran d'accueil**
3. L'app fonctionne comme une app native !

---

## 🎯 **Alternative encore plus simple : Local + GitHub Sync**

Si même GitHub Pages vous semble compliqué, on peut :

1. **Utiliser l'app localement** : `npm run dev` 
2. **GitHub sync automatique** : Vos données se synchronisent automatiquement
3. **Sur chaque appareil** : Clone le repo, `npm install`, `npm run dev`

Vos données restent synchronisées via GitHub ! 