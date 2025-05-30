# 🚀 Guide de Déploiement - Budget Manager

## ✅ Déploiement sur Netlify (Recommandé)

### 1. **Prérequis**
- Compte GitHub (✅ Fait)
- Repository GitHub public (✅ Fait: `nikulaguy/budget-manager`)
- Compte Netlify (à créer si nécessaire)

### 2. **Étapes de déploiement**

#### A. **Connexion à Netlify**
1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez sur "Sign up" ou "Log in"
3. Choisissez "Sign up with GitHub"
4. Autorisez Netlify à accéder à vos repositories

#### B. **Déploiement automatique**
1. Sur Netlify, cliquez "New site from Git"
2. Choisissez "GitHub"
3. Sélectionnez le repository `nikulaguy/budget-manager`
4. Branche à déployer : `clean-main`
5. Build command : `npm run build` (déjà configuré)
6. Publish directory : `dist` (déjà configuré)

#### C. **Configuration des variables d'environnement**
1. Dans Netlify, allez dans "Site settings" → "Environment variables"
2. Ajoutez la variable :
   - **Key**: `VITE_GITHUB_TOKEN`
   - **Value**: `VOTRE_TOKEN_GITHUB_ICI` (remplacez par votre token réel)

### 3. **URL de votre application**
Une fois déployé, vous aurez une URL comme :
`https://budget-manager-[random].netlify.app`

## 🔧 Déploiement sur Vercel (Alternative)

### 1. **Via GitHub (automatique)**
1. Connectez-vous sur [vercel.com](https://vercel.com) avec GitHub
2. Importez le repository `nikulaguy/budget-manager`
3. Configurez la variable d'environnement `VITE_GITHUB_TOKEN`

### 2. **Via CLI**
```bash
npx vercel login
npx vercel --prod
```

## 🧪 Test de la Production

### 1. **Vérifications après déploiement**
- [ ] L'application se charge correctement
- [ ] L'authentification fonctionne
- [ ] Les budgets s'affichent
- [ ] L'ajout de dépenses fonctionne
- [ ] La synchronisation GitHub fonctionne (test avec une dépense)

### 2. **Test cross-device**
1. Ajoutez une dépense sur votre MacBook (production)
2. Ouvrez l'application sur votre iPhone
3. Vérifiez que la dépense apparaît automatiquement

## 🔒 Sécurité

⚠️ **Important** : En production, le token GitHub est visible côté client. Pour une sécurité maximale, considérez :

1. **Solution simple** : Créer un token avec permissions limitées au repository `budget-data` uniquement
2. **Solution avancée** : Créer une API backend qui gère la synchronisation GitHub

## 📱 Accès mobile

Une fois déployé :
1. **Sur iPhone** : Ouvrez Safari et allez sur votre URL Netlify/Vercel
2. **Ajout à l'écran d'accueil** : Appuyez sur "Partager" → "Sur l'écran d'accueil"
3. **Progressive Web App** : L'application fonctionnera comme une app native

## 🎯 URL finale

Votre application sera accessible à :
- **Netlify** : `https://[votre-site].netlify.app`
- **Vercel** : `https://[votre-site].vercel.app`

## ✅ Checklist final

- [ ] Application déployée
- [ ] Variable d'environnement configurée
- [ ] Test de synchronisation fonctionnel
- [ ] Accessible sur mobile
- [ ] PWA installée sur iPhone 