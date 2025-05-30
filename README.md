# BudgetManager

Application web responsive de gestion de budget conforme aux normes d'accessibilité AAA WCAG.

## 🎯 Objectif

BudgetManager est une application moderne de gestion de budget qui permet aux utilisateurs de :
- Gérer leurs budgets mensuels et annuels
- Suivre leurs dépenses en temps réel
- Visualiser leurs données avec des graphiques et jauges
- Collaborer en temps réel avec d'autres utilisateurs
- Exporter leurs données en PDF/CSV

## ✨ Fonctionnalités

### 🏠 Tableau de bord
- Vue d'ensemble des budgets et dépenses
- Jauges dynamiques avec codes couleur
- Tableau des budgets en cours avec progression
- Bouton "Mois suivant" pour la gestion temporelle

### 📊 Budgets de référence
- Modèles de budgets réutilisables
- Catégories prédéfinies (Courant, Mensuel, Annuel, Épargne)
- Import/Export de modèles
- Valeurs par défaut configurables

### 📈 Historique
- Consultation des mois précédents
- Détail des dépenses par budget
- Filtres et recherche avancée
- Visualisation des tendances

### ⚙️ Paramètres
- Gestion des comptes bancaires
- Préférences utilisateur
- Notifications et alertes
- Invitations d'utilisateurs

## 🎨 Design & Accessibilité

- **Responsive** : Compatible desktop, tablette, mobile
- **Accessibilité AAA** : Conforme aux normes WCAG
- **Navigation clavier** : Totalement accessible au clavier
- **Lecteurs d'écran** : Compatible avec les technologies d'assistance
- **Contrastes élevés** : Couleurs conformes AAA
- **Material Design** : Interface moderne et intuitive

## 👥 Utilisateurs

### Comptes prédéfinis
- **Nicolas Guy** (Master Maître) : `nikuland@gmail.com`
- **Romain Troalen** (Master) : `romain.troalen@gmail.com`
- **Guillaume Marion** (Master) : `guillaume.marion.perso@gmail.com`
- **Rémi Roux** (Master) : `remi.roux@gmail.com`
- **Alix Guy** (Simple) : `alix.troalen@gmail.com`

### Rôles et permissions
- **Master Maître** : Peut inviter des comptes maîtres
- **Master** : Peut inviter des utilisateurs simples
- **Simple** : Utilisation standard de l'application

### Partage de foyer
- **Nicolas Guy** et **Alix Guy** partagent le même foyer
- Toutes les modifications sont synchronisées entre leurs comptes
- Ils voient les mêmes budgets et dépenses en temps réel

## 🚀 Installation

### Prérequis
- Node.js >= 18.0.0
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Configuration Firebase
Créez un fichier `.env.local` à la racine du projet avec vos clés Firebase :

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Démarrage en développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production
```bash
npm run build
```

### Aperçu de la production
```bash
npm run preview
```

## 🛠️ Technologies

### Frontend
- **React 18** avec TypeScript
- **Material-UI v5** pour l'interface
- **React Router** pour la navigation
- **React Hook Form** + Yup pour les formulaires
- **React Query** pour la gestion des données
- **Date-fns** pour la manipulation des dates
- **Recharts** pour les graphiques

### Backend & Base de données
- **Firebase** pour l'authentification et la base de données
- **Firestore** pour le stockage des données
- **Firebase Auth** pour la gestion des utilisateurs

### Outils de développement
- **Vite** pour le bundling
- **ESLint** pour le linting
- **TypeScript** pour le typage statique
- **PWA** support avec Vite PWA plugin

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Layout/         # Layout principal
│   └── common/         # Composants communs
├── contexts/           # Contextes React
├── pages/              # Pages de l'application
├── types/              # Types TypeScript
├── theme/              # Configuration du thème
├── config/             # Configuration (Firebase, etc.)
└── main.tsx           # Point d'entrée
```

## 🔧 Configuration

### Firebase Setup
1. Créez un projet Firebase sur https://console.firebase.google.com
2. Activez Authentication (Email/Password)
3. Activez Firestore Database
4. Copiez les clés de configuration dans `.env.local`
5. Configurez les règles de sécurité Firestore

### Règles Firestore recommandées
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs peuvent lire/écrire leurs propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Budgets et dépenses accessibles aux utilisateurs authentifiés
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 PWA Support

L'application est configurée comme une Progressive Web App :
- Installation sur mobile/desktop
- Fonctionnement hors-ligne
- Notifications push
- Mise à jour automatique

## 🧪 Tests

```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :
1. Fork le projet
2. Créer une branche feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub. 