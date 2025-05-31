# 💾 Configuration Offline-First 100% Gratuite

## ✨ Fonctionnalités

- **🆓 100% Gratuit** : Aucun coût de service cloud
- **📱 Offline-First** : Fonctionne sans connexion internet
- **🔄 Synchronisation automatique** : Synchronise vers GitHub quand la connexion revient
- **💾 Stockage robuste** : IndexedDB pour persistance locale
- **⚡ Performance** : Données toujours disponibles localement

## 🏗 Architecture

```
📱 App React
    ↓
📦 IndexedDB (Stockage principal)
    ↓
🔄 Service Hybride
    ↓
☁️ GitHub API (Backup gratuit)
```

## 🚀 Configuration

### 1. Token GitHub (Optionnel)

Pour la synchronisation cloud, créez un token GitHub :

1. Allez sur https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Sélectionnez les permissions :
   - `repo` (accès complet aux repositories)
4. Copiez le token

### 2. Variables d'environnement

Créez `.env` dans la racine du projet :

```env
# Optionnel - pour synchronisation GitHub
VITE_GITHUB_TOKEN=votre_token_github_ici
VITE_GITHUB_REPO=votre-username/budget-data
```

### 3. Repository GitHub (Optionnel)

Créez un repository GitHub pour stocker vos données :

1. Créez un nouveau repository sur GitHub
2. Nommez-le `budget-data` (ou comme vous voulez)
3. Laissez-le **public** ou **privé** selon vos préférences

## 💡 Comment ça fonctionne

### Mode Offline-First

1. **Toutes les données sont stockées localement** dans IndexedDB
2. **L'application fonctionne 100% hors ligne**
3. **Quand vous ajoutez une dépense hors ligne** :
   - ✅ Sauvegardé instantanément dans IndexedDB
   - 📝 Ajouté à la queue de synchronisation
   - 🟡 Indicateur "hors ligne" affiché

### Synchronisation Automatique

4. **Quand la connexion revient** :
   - 🌐 Détection automatique
   - 🔄 Synchronisation vers GitHub
   - ✅ Queue vidée
   - 🟢 Indicateur "synchronisé"

### Multi-Appareils

5. **Sur un autre appareil** :
   - 📥 Chargement depuis GitHub au démarrage
   - 🔄 Synchronisation bidirectionnelle
   - 🕐 Résolution basée sur l'horodatage

## 📊 Indicateur de Statut

L'indicateur en haut à droite montre :

- 🟢 **Synchronisé** : Tout est à jour
- 🟡 **X en attente** : Actions hors ligne à synchroniser
- 🔴 **Hors ligne** : Mode offline actif

Cliquez dessus pour :
- Voir les détails de synchronisation
- Forcer une synchronisation manuelle
- Voir l'historique

## 🛠 Utilisation

### Sans GitHub (100% Local)

1. L'app fonctionne parfaitement sans token GitHub
2. Toutes les données restent sur votre appareil
3. Pas de synchronisation multi-appareils

### Avec GitHub (Multi-Appareils)

1. Configurez le token GitHub
2. Synchronisation automatique entre appareils
3. Backup cloud gratuit de vos données

## 🔧 Dépannage

### L'app ne démarre pas

```bash
# Nettoyer le cache
rm -rf node_modules/.vite
npm run dev
```

### Données perdues

1. Les données sont d'abord dans IndexedDB (F12 > Application > IndexedDB)
2. Puis dans GitHub si configuré
3. En dernier recours : localStorage

### Synchronisation bloquée

1. Vérifiez votre token GitHub
2. Vérifiez que le repository existe
3. Forcez la synchronisation via l'indicateur

## 📈 Avantages vs Solutions Payantes

| Fonctionnalité | Cette Solution | Supabase Pro | Firebase |
|----------------|---------------|--------------|----------|
| **Coût** | 🟢 0€ | 🟡 25€/mois | 🟡 Variable |
| **Offline** | 🟢 Natif | 🟡 Limité | 🟢 Bon |
| **Stockage** | 🟢 Illimité* | 🟡 8GB | 🟡 1GB |
| **Setup** | 🟢 Simple | 🟡 Moyen | 🟡 Moyen |
| **Vendor Lock** | 🟢 Aucun | 🔴 Élevé | 🔴 Élevé |

*Limité par le quota GitHub (1GB) et l'espace disque local

## 🎯 Prochaines Améliorations

- [ ] Compression des données avant GitHub
- [ ] Chiffrement des données sensibles
- [ ] Synchronisation différentielle
- [ ] Support PWA pour installation
- [ ] Backup automatique local

## 🤝 Contribution

Cette solution est open-source ! Améliorations bienvenues :

1. Fork le repository
2. Créez une branche feature
3. Commit vos changements
4. Push et créez une Pull Request

---

**💡 Cette solution vous fait économiser 300€+/an par rapport aux alternatives payantes !** 