# 📱 AFRI-INSURANCES-PRO
## Plateforme de Gestion Commerciale pour Assurances

**Type**: Application mobile/web multi-plateforme (React Native + Expo)  
**Langues**: Français  
**Technos**: TypeScript, Zustand, Axios, Tailwind CSS  
**Status**: En cours de développement  
**Version**: 1.0.0

---

## 🎯 Vue d'ensemble

**AFRI-PRO** est une plateforme complète de gestion commerciale conçue pour les équipes commerciales d'AFRI Insurance S.A. Elle permet de gérer l'ensemble du cycle de vie d'une opportunité commerciale : de la prospection à la vente, avec suivi des objectifs et collaboration d'équipe.

**Disponible sur**: 📱 iOS | 🤖 Android | 💻 Web

---

## ✨ Fonctionnalités principales

### 1️⃣ Authentification & Gestion des utilisateurs
- ✅ Connexion sécurisée (Login/identifiant + mot de passe)
- ✅ Gestion des rôles (Commercial, Manager adjoint, Manager, Chef d'agence, Admin)
- ✅ Stockage sécurisé des tokens (Expo Secure Store)
- ✅ Sauvegarde des données utilisateur (AsyncStorage)
- ✅ Système hiérarchique (Manager, Manager adjoint, Commercial)

**Écran**: `(auth)/login.tsx`

---

### 2️⃣ Dashboard Principal 📊

Tableau de bord personnalisé avec vue d'ensemble de la performance commerciale

**Contient**:
- 📈 **Métriques clés** (4 colonnes):
  - Nombre de prospects
  - Nombre de cotations
  - Nombre de ventes
  - Chiffre d'affaires (CA)
  
- 🎯 **Boîte d'objectifs** (vue Commercial uniquement):
  - Objectif mensuel
  - Barre de progression
  - CA cible vs réalisé
  - Style dégradé violet

- 📊 **Pipeline de ventes** (3 étapes):
  - Prospection → Cotation → Vente
  - Vue funnel du cycle commercial

- ⏰ **Suivi urgent** (Follow-ups urgents):
  - Liste des actions critiques
  - Dates de suivi rouge si dépassées
  - Avatar du client avec initiales

- 👤 **Informations utilisateur**
- 🚀 **Actions rapides** (boutons directs)

**Écran**: `(app)/dashboard.tsx`  
**Composants**: MetricCard, ObjectiveBox, Pipeline, UrgentFollowUps

---

### 3️⃣ Prospections 🔍

Gestion complète des prospects et opportunités commerciales

**Fonctionnalités**:
- 📋 **Liste des prospections** avec:
  - Nom du client (avatar coloré)
  - Produit associé
  - CA potentiel
  - Probabilité de conversion (barre de progression)
  - Statut (8 statuts différents)
  - Date de contact et date de suivi

- 🔎 **Recherche** (en temps réel):
  - Par nom de client
  - Par produit
  - Par commercial

- 🏷️ **Filtrage par statut**:
  - Tous
  - Nouveau prospect
  - En discussion
  - Devis envoyé
  - Attente réponse
  - Proposition refusée
  - Cotation acceptée
  - Contrat signé

- ➕ **Création de prospection** (modal):
  - Saisie client
  - Produit
  - CA potentiel
  - Probabilité
  - Statut
  - Dates de contact/suivi

- ⚠️ **Alertes urgentes** (suivi dépassé en rouge)

**Écran**: `(app)/prospections.tsx`  
**Modal**: `NewProspectionModal.tsx`

---

### 4️⃣ Cotations 📋

Gestion des devis et propositions commerciales

**Fonctionnalités**:
- 📝 Création/modification de cotations
- 🔗 Liaison avec prospects
- 📊 Suivi du statut (brouillon, envoyée, acceptée, refusée)
- 💰 Montants et détails produits
- 📅 Dates d'émission et d'expiration

**Écran**: `(app)/cotations.tsx`  
**Modal**: `NewCotationModal.tsx`

---

### 5️⃣ Ventes 🎉

Suivi des ventes conclues

**Fonctionnalités**:
- ✅ Enregistrement des ventes finalisées
- 💵 Montant total et commissions
- 📅 Date de signature du contrat
- 👤 Lien vers prospect/client
- 📊 Historique complet

**Écran**: `(app)/ventes.tsx`  
**Modal**: `NewVenteModal.tsx`

---

### 6️⃣ Objectifs 🎯

Suivi des objectifs commerciaux

**Fonctionnalités**:
- 📊 Objectif mensuel par utilisateur
- 📈 Progression vs objectif
- 💰 CA réalisé vs CA cible
- 🔔 Alertes si dépassement/non atteinte
- 📅 Vue mensuelle/trimestrielle

**Écran**: `(app)/objectifs.tsx`

---

### 7️⃣ Clients 👥

Base de données clients

**Fonctionnalités**:
- 📞 Répertoire complet des clients
- 📧 Emails et numéros
- 🏢 Informations d'entreprise
- 📋 Historique d'interactions
- 🔗 Prospects/Ventes associées

**Écran**: `(app)/clients.tsx`

---

### 8️⃣ Équipe 👨‍💼👩‍💼

Gestion et collaboration d'équipe

**Fonctionnalités**:
- 👥 Liste des collaborateurs
- 🏢 Hiérarchie organisationnelle
- 📊 Performance de chacun
- 🔗 Relations manager/commercial
- 📞 Coordonnées de contact

**Écran**: `(app)/equipe.tsx`

---

### 9️⃣ Statistiques 📊

Analytics et rapports commerciaux

**Fonctionnalités**:
- 📈 Graphiques de performance
- 🔝 Top 10 commerciaux
- 💰 Chiffre d'affaires par période
- 🎯 Taux de conversion
- 📉 Trends et prévisions
- 📥 **Export en CSV/Excel**

**Écran**: `(app)/stats.tsx`

---

### 🔟 Notifications 🔔

Système d'alertes et notifications

**Fonctionnalités**:
- ⏰ Rappels de suivi
- ⚠️ Cotations à suivre
- ✅ Confirmations d'actions
- 🆕 Nouvelles activités d'équipe

**Écran**: `(app)/notifications.tsx`

---

### 1️⃣1️⃣ Gestion des utilisateurs (Admin) 👤

Interface d'administration pour la gestion d'équipe

**Fonctionnalités**:
- ➕ Créer des utilisateurs
- ✏️ Modifier rôles et permissions
- 🗑️ Désactiver/Supprimer utilisateurs
- 📊 Assigner des objectifs
- 🏢 Organiser la hiérarchie

**Écran**: `(app)/users.tsx`

---

### 1️⃣2️⃣ Profil utilisateur 👤

Gestion du profil personnel

**Fonctionnalités**:
- 📝 Affichage infos personnelles
- 🔐 Changement mot de passe
- 🔔 Préférences de notifications
- 🌙 Paramètres d'affichage
- 🚪 Déconnexion

**Écran**: `(app)/profile.tsx`

---

## 🏗️ Architecture technique

```
Afri-pro/
├── app/                           # Écrans (Expo Router - file-based routing)
│   ├── (auth)/                   # Écrans non-authentifiés
│   │   ├── login.tsx             # Connexion
│   │   └── _layout.tsx
│   └── (app)/                    # Écrans protégés (après login)
│       ├── dashboard.tsx
│       ├── prospections.tsx
│       ├── cotations.tsx
│       ├── ventes.tsx
│       ├── clients.tsx
│       ├── equipe.tsx
│       ├── objectifs.tsx
│       ├── stats.tsx
│       ├── users.tsx
│       ├── notifications.tsx
│       ├── profile.tsx
│       └── _layout.tsx
│
├── src/
│   ├── components/               # Composants réutilisables
│   │   ├── common/              # Button, Card, Header, Badge
│   │   ├── dashboard/           # MetricCard, ObjectiveBox, Pipeline
│   │   ├── layout/              # Sidebar, PageWrapper, ModalWrapper
│   │   └── modals/              # NewProspectionModal, etc.
│   │
│   ├── hooks/                   # Hooks personnalisés
│   │   ├── useAuth.ts           # Authentification
│   │   ├── useDashboardStats.ts # Stats du dashboard
│   │   ├── useProspections.ts   # Données prospects
│   │   ├── useCotations.ts      # Données cotations
│   │   ├── useVentes.ts         # Données ventes
│   │   └── useClients.ts        # Données clients
│   │
│   ├── services/                # Services API
│   │   ├── auth.service.ts      # Authentification
│   │   ├── storage.service.ts   # AsyncStorage + SecureStore
│   │   └── api/
│   │       ├── client.ts        # Axios client avec intercepteurs
│   │       ├── endpoints.ts     # URLs API
│   │       └── api.ts
│   │
│   ├── store/                   # État global (Zustand)
│   │   └── authStore.ts         # État authentification
│   │
│   ├── types/                   # Types TypeScript
│   │   ├── auth.types.ts        # User, AuthResponse, LoginPayload
│   │   ├── api.types.ts         # ApiResponse, PaginatedResponse
│   │   └── common.types.ts      # AsyncState, Theme
│   │
│   ├── config/                  # Configuration
│   │   └── theme.ts             # Couleurs, espacements, typo
│   │
│   ├── utils/                   # Utilitaires
│   │   ├── constants.ts         # Constantes, STATUTS_PROSP
│   │   ├── export.ts            # Export CSV/Excel
│   │   ├── validation.ts        # Validation formulaires
│   │   └── errors.ts            # Gestion erreurs
│   │
│   └── styles/                  # Styles globaux
│
└── assets/                      # Images, icônes, logo
```

---

## 🎨 Design System

**Palette de couleurs** (exact match HTML):
- 🟣 **Violet** (Primaire): 
  - Dark: #4A1E61
  - Medium: #6B2D8B
  - Light: #8B3DAF
  - Pale: #F0E6F6

- 🟠 **Orange** (Accent): 
  - Main: #E8521A
  - Hover: #C4410F
  - Light: #FFF0EB

- ⚫ **Gris**: gray-50 → gray-800 (9 niveaux)

- 🟢 **Statuts**: 
  - Success (vert): #1A8A4A / bg: #E6F7EE
  - Warning (orange): #B87514 / bg: #FEF3DC
  - Danger (rouge): #C02020 / bg: #FDEAEA
  - Info (bleu): #1A5FA8 / bg: #E6F0FB
  - Teal: #0F6E56 / bg: #E1F5EE

**Composants principaux**:
- ✅ **Button**: primary, secondary, danger, outline, ghost (3 tailles: sm, base, lg)
- 📦 **Card**: filled/outlined (2 tailles: base, lg)
- 📄 **Header**: titre + sous-titre
- 🏷️ **Badge**: statuts colorés
- 📝 **Input**: champs texte saisie

---

## 📊 État et données

**Gestion d'état**: Zustand (store global)
- `authStore.ts`: User, token, loading, error

**Hooks personnalisés**: 
- Données mockées (par défaut)
- Intégration API (endpoints configurables)
- Avec refetch/reload capability

**Structures principales**:
- `User`: id, email, name, role, equipe, objectif
- `Prospection`: id, client, product, ca, probabilité, statut, dates
- `Cotation`: id, prospect, montant, statut, dates
- `Vente`: id, cotation, montant, date_signature
- `Client`: id, nom, email, téléphone, entreprise

---

## 🔌 Intégration API

**Client HTTP**: Axios avec intercepteurs
- Auto-authentification (token dans headers)
- Gestion erreurs 401 (re-login)
- URLs configurables en `.env`

**Endpoints principaux**:
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/prospections
POST   /api/prospections
PUT    /api/prospections/:id
GET    /api/cotations
POST   /api/cotations
GET    /api/ventes
GET    /api/clients
GET    /api/users
GET    /api/stats
```

---

## 🚀 Tech Stack

| Technologie | Usage |
|------------|-------|
| **React Native** | Framework mobile/web |
| **Expo** | Build & deployment |
| **Expo Router** | Navigation file-based |
| **TypeScript** | Type safety |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **Tailwind** (twrnc) | Styling |
| **AsyncStorage** | Données persistantes |
| **Expo Secure Store** | Tokens sécurisés |
| **XLSX** | Export Excel/CSV |
| **OpenAI SDK** | (pour features futures) |

---

## 📱 Platforms

- ✅ **Web** (Responsive): Sidebar + contenu
- ✅ **iOS**: Expo build
- ✅ **Android**: Expo build
- 📐 Design adaptatif (portrait/landscape)

---

## 🔐 Sécurité

✅ Authentification JWT  
✅ Tokens stockés sécurisés  
✅ Interception requêtes 401  
✅ Validation des rôles côté client  
✅ Validation des formulaires

---

## 📋 Scripts npm

```bash
npm start           # Lancer Expo
npm run web         # Lancer sur web
npm run ios         # Lancer sur iOS
npm run android     # Lancer sur Android
npm install         # Installer dépendances
```

---

## 📄 Configuration

Fichier `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

---

## 🎓 Résumé

**AFRI-PRO est une solution commerciale complète et moderne** pour gérer l'ensemble du cycle de vente, avec collaboration d'équipe, analytics et export de données.

**Points clés**:
- ✅ Multi-plateforme (Web, iOS, Android)
- ✅ Architecture moderne (React Native, Expo, TypeScript)
- ✅ Design System cohérent et moderne
- ✅ Gestion complète du cycle commercial
- ✅ Analytics et export de données
- ✅ Gestion d'équipe et hiérarchie
- ✅ Sécurité robuste
- ✅ Extensible et maintenable

---

**Version**: 1.0.0  
**Date**: Avril 2026  
**Propriétaire**: AFRI Insurance S.A.
