# Budget Manager

Une application web moderne pour gérer vos budgets personnels et familiaux.

## Fonctionnalités

- 📊 Gestion des budgets par catégories
- 💰 Suivi des dépenses en temps réel
- 👥 Partage des budgets entre utilisateurs
- 📱 Interface responsive (mobile et desktop)
- 🔄 Synchronisation en temps réel avec Firebase
- 🌐 Mode hors ligne disponible

## Technologies utilisées

- React 18
- TypeScript
- Material-UI (MUI)
- Firebase (Auth & Firestore)
- Vite

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/nikulaguy/budget-manager.git
cd budget-manager
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec vos identifiants Firebase :
```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

4. Lancez l'application en mode développement :
```bash
npm run dev
```

## Scripts disponibles

- `npm run dev` : Lance l'application en mode développement
- `npm run build` : Compile l'application pour la production
- `npm run preview` : Prévisualise la version de production en local
- `npm run lint` : Vérifie le code avec ESLint
- `npm run typecheck` : Vérifie les types TypeScript
- `npm run format` : Formate le code avec Prettier

## Déploiement

L'application est automatiquement déployée sur GitHub Pages à chaque push sur la branche main.

URL de production : https://nikulaguy.github.io/budget-manager/

## Structure du projet

```
src/
  ├── components/     # Composants React
  ├── types/         # Types TypeScript
  ├── utils/         # Utilitaires et services
  ├── theme/         # Configuration du thème MUI
  └── App.tsx        # Point d'entrée de l'application
```

## Contribution

1. Fork le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

MIT
