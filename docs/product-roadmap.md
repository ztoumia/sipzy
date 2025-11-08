# Product Roadmap - Sipzy
## Plateforme Communautaire de Découverte de Cafés Spécialisés

**Date:** 2025-11-08
**Version:** 2.0 - Community Focus
**Product Owner:** Analysis Report
**Status du Projet:** Production Ready (Frontend 100%, Backend 85%)

---

## Table des Matières

1. [Executive Summary](#executive-summary)
2. [Vision Produit](#vision-produit)
3. [Analyse de l'Existant](#analyse-de-lexistant)
4. [Fonctionnalités à Affiner ou Terminer (PRIORITÉ 1)](#fonctionnalités-à-affiner-ou-terminer-priorité-1)
5. [Nouvelles Fonctionnalités Proposées](#nouvelles-fonctionnalités-proposées)
6. [Spécifications Détaillées](#spécifications-détaillées)
7. [Roadmap Timeline](#roadmap-timeline)
8. [Métriques de Succès (OKRs)](#métriques-de-succès-okrs)
9. [Recommandations Stratégiques](#recommandations-stratégiques)

---

## Executive Summary

### Vue d'Ensemble

**Sipzy est une plateforme COMMUNAUTAIRE** dédiée aux amateurs de café spécialisé. Comme Untappd pour la bière ou Vivino pour le vin, Sipzy permet de **découvrir, noter, partager et discuter** autour des cafés de spécialité.

**⚠️ CE N'EST PAS UN SITE E-COMMERCE** - Pas de panier, pas de paiement, pas de vente. L'objectif est de créer une communauté engagée autour de la passion du café.

### État Actuel

**Forces du Projet:**

✅ **Architecture Technique Solide**
- Frontend: Next.js 15, React 18, TypeScript (Production Ready)
- Backend: Spring Boot 3.2, Java 17, PostgreSQL 15 (85% complété)
- CQRS pattern, architecture hexagonale
- Tests complets, CI/CD automatisé

✅ **Fonctionnalités Cœur Implémentées**
- Authentification & profils utilisateurs
- Catalogue de cafés avec filtres avancés
- Reviews & ratings avec votes
- Favoris
- Dashboard admin complet
- Upload d'images (Cloudinary)
- Modération de contenu (workflow professionnel)

✅ **UX/UI Moderne**
- Design responsive
- Accessibilité WCAG 2.1 AA
- SEO optimisé
- Interface intuitive

### Opportunités d'Amélioration

Le projet a d'excellentes fondations, mais il manque les **fonctionnalités sociales et d'engagement** essentielles pour devenir une vraie communauté vibrante :

**PRIORITÉ 0-1 (Quick Wins & Fondations Sociales):**
1. Activer les notifications email (infrastructure existe)
2. Follow/Followers system
3. Feed d'activité personnalisé
4. Collections de cafés personnalisées
5. Social sharing

**PRIORITÉ 2 (Engagement & Rétention):**
6. Gamification (badges, achievements, points)
7. Leaderboard des top reviewers
8. Check-ins (comme Untappd)
9. Recommandations IA personnalisées
10. Photos multiples par café

**PRIORITÉ 3 (Communauté Avancée):**
11. Événements & meetups
12. Contenu éducatif (guides, brewing methods)
13. Q&A sur cafés
14. Discussion threads

---

## Vision Produit

### Mission

**"Connecter les passionnés de café spécialisé du monde entier et créer la communauté de référence pour découvrir, apprendre et partager autour du café de qualité."**

### Objectifs Stratégiques 2025

1. **Q1 2025:** Renforcer l'engagement (follow system, feed, notifications)
2. **Q2 2025:** Atteindre 10,000 utilisateurs actifs mensuels
3. **Q3 2025:** Gamification complète (badges, leaderboard, points)
4. **Q4 2025:** Devenir la référence francophone du café de spécialité

### Positionnement

**Sipzy vs. Concurrence:**

| Aspect | Sipzy | Vivino (vin) | Untappd (bière) | Goodreads (livres) |
|--------|-------|--------------|-----------------|-------------------|
| Communauté | ✅ En construction | ✅ Très forte | ✅ Très forte | ✅ Très forte |
| Reviews | ✅ Complet | ✅ Avancé | ✅ Avancé | ✅ Avancé |
| Social Features | ⚠️ Basique | ✅ Complet | ✅ Complet | ✅ Complet |
| Gamification | ❌ Manquant | ✅ Badges | ✅ Badges | ✅ Challenges |
| Découverte | ✅ Bon | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Spécialisation | ✅ Café only | ✅ Vin only | ✅ Bière only | ✅ Livres only |

**Notre Avantage Compétitif:** Premier à market pour une communauté café francophone avec une approche moderne et un focus total sur l'engagement communautaire.

---

## Analyse de l'Existant

### Fonctionnalités Implémentées

#### 1. Authentification & Gestion Utilisateurs ✅

**Fonctionnalités:**
- ✅ Inscription/Connexion (email + password)
- ✅ JWT Authentication avec rate limiting
- ✅ Profils utilisateurs (username, bio, avatar, location)
- ✅ Roles (USER, ADMIN)
- ⚠️ Reset password (infrastructure présente mais emails inactifs)
- ⚠️ Verification email (infrastructure présente mais emails inactifs)

**Modèle de Données:**
```java
User {
  id, username, email, passwordHash
  role (USER/ADMIN)
  avatarUrl, bio, location
  isVerified, isActive
  createdAt, updatedAt
}
```

**Endpoints API:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-token
POST   /api/auth/forgot-password
GET    /api/users/{id}
GET    /api/users/username/{username}
PUT    /api/users/profile
```

**Points Forts:**
- Sécurité robuste (JWT, rate limiting par role)
- Architecture propre (AuthService, UserService)
- UI moderne et accessible

**Points à Améliorer:**
- ❌ Emails pas actifs en production
- ❌ Pas de OAuth (Google, Facebook)
- ❌ Pas de 2FA
- ❌ Pas de compteurs sociaux (followers, following)
- ❌ Pas de follow system

**Score:** 7/10
**Priorité d'amélioration:** P0 (Emails), P1 (Follow system)

---

#### 2. Catalogue de Cafés ✅

**Fonctionnalités:**
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Workflow de modération (PENDING → APPROVED/REJECTED)
- ✅ Filtrage avancé (origine, torréfacteur, notes, process, rating)
- ✅ Recherche full-text (PostgreSQL pg_trgm)
- ✅ Tri par rating, reviews, nom, date
- ✅ Pagination performante
- ✅ Similar coffees (algorithme basique)
- ✅ Images via Cloudinary
- ✅ 30 tasting notes catégorisées

**Modèle de Données:**
```java
Coffee {
  id, name, roaster
  origin, process, variety
  altitudeMin, altitudeMax, harvestYear
  priceRange (€, €€, €€€, €€€€)  // Indicatif seulement
  description, imageUrl
  averageRating, reviewCount
  status (PENDING/APPROVED/REJECTED)
  submittedBy, moderatedBy
  notes[] (many-to-many)
  createdAt, updatedAt
}

Note {
  id, name, category
  // Ex: Chocolate (Chocolatey), Citrus (Fruity)
}
```

**Endpoints API:**
```
GET    /api/coffees                  - Liste avec filtres
GET    /api/coffees/{id}             - Détail
POST   /api/coffees                  - Créer (→ PENDING)
PUT    /api/coffees/{id}             - Modifier
DELETE /api/coffees/{id}             - Supprimer (admin)
GET    /api/coffees/popular          - Top 8 par rating
GET    /api/coffees/recent           - 8 plus récents
GET    /api/coffees/{id}/similar     - Cafés similaires
GET    /api/notes                    - Liste notes dégustation
GET    /api/roasters                 - Liste torréfacteurs
```

**Points Forts:**
- Modèle de données riche et complet
- Filtrage très performant avec indexes
- UX excellente (370 lignes React optimisé)
- Modération professionnelle

**Points à Améliorer:**
- ❌ Une seule image par café (pas de galerie)
- ❌ Pas de check-ins (Untappd style)
- ❌ Pas de Q&A community sur chaque café
- ❌ Pas de "want to try" wishlist
- ❌ Algorithme "similar" basique (améliorer avec ML)
- ❌ Pas de tags custom par users

**Score:** 8.5/10
**Priorité d'amélioration:** P2 (Galerie photos), P1 (Wishlist)

---

#### 3. Système de Reviews & Ratings ✅

**Fonctionnalités:**
- ✅ Notation 1-5 étoiles
- ✅ Commentaire texte (requis)
- ✅ Méthode de préparation (brewMethod)
- ✅ Vote helpful/not helpful
- ✅ Tri par: helpful, recent, rating
- ✅ 1 review par user par coffee (contrainte DB)
- ✅ Update/Delete possible

**Modèle de Données:**
```java
Review {
  id
  coffee, user
  rating (1-5)
  comment
  brewMethod (optionnel)
  helpfulCount, notHelpfulCount
  createdAt, updatedAt
}

ReviewVote {
  id, review, user
  isHelpful (boolean)
  createdAt
}
```

**Endpoints API:**
```
GET    /api/coffees/{coffeeId}/reviews  - Liste reviews d'un café
POST   /api/reviews                     - Créer review
PUT    /api/reviews/{id}                - Modifier
DELETE /api/reviews/{id}                - Supprimer
POST   /api/reviews/{id}/vote           - Voter
GET    /api/reviews/recent              - Reviews récentes global
```

**Algorithme de Rating:**
- Trigger PostgreSQL pour mise à jour auto
- Moyenne calculée en temps réel
- Compteur de reviews mis à jour

**Points Forts:**
- Système complet et robuste
- Triggers DB pour performance
- UX similaire à Yelp/Amazon
- Vote system pour valoriser bonnes reviews

**Points à Améliorer:**
- ❌ Pas de réponses/commentaires sur reviews
- ❌ Pas de review templates/guidelines
- ❌ Pas de photos multiples dans reviews
- ❌ Pas de rating détaillé (aroma, body, acidity, etc.)
- ❌ Pas de "certified taster" badge

**Score:** 8/10
**Priorité d'amélioration:** P2 (Comments on reviews), P3 (Detailed ratings)

---

#### 4. Favoris ✅

**Fonctionnalités:**
- ✅ Toggle favorite (add/remove)
- ✅ Liste des favoris avec pagination
- ✅ Check si favori
- ✅ Compteur de favoris
- ✅ Intégration profil utilisateur

**Modèle de Données:**
```java
Favorite {
  id, user, coffee
  createdAt
}
```

**Endpoints API:**
```
POST   /api/users/favorites/{coffeeId}      - Ajouter
DELETE /api/users/favorites/{coffeeId}      - Retirer
GET    /api/users/favorites                 - Liste favoris
GET    /api/users/favorites/{coffeeId}/check - Check si favori
```

**Points Forts:**
- Implémentation propre
- API complète
- UX intuitive avec animation

**Points à Améliorer:**
- ❌ Pas de collections nommées (ex: "Mes cafés du matin", "À essayer")
- ❌ Pas de partage de favoris
- ❌ Pas de favoris publics/privés
- ❌ Pas de "Want to try" séparé des "Tried & Loved"

**Score:** 7/10
**Priorité d'amélioration:** P1 (Collections nommées)

---

#### 5. Dashboard Admin ✅

**Fonctionnalités:**
- ✅ Statistiques globales (users, coffees, reviews, reports)
- ✅ Modération des cafés (approve/reject)
- ✅ Gestion utilisateurs (liste, ban/unban)
- ✅ Modération des reports (resolve/dismiss)
- ✅ Activity log (actions récentes)
- ✅ Import batch (roasters + coffees JSON)
- ✅ Filtrage et recherche
- ✅ Pagination

**Architecture:**
- Sidebar responsive (style AWS Console)
- Groupes expandables
- Badges de notification
- Pages spécialisées par domaine

**Endpoints API:**
```
GET    /api/admin/stats                    - KPIs dashboard
GET    /api/admin/coffees/pending          - Cafés à modérer
PUT    /api/admin/coffees/{id}/approve     - Approuver
PUT    /api/admin/coffees/{id}/reject      - Rejeter
GET    /api/admin/users                    - Liste users
PUT    /api/admin/users/{id}/ban           - Ban user
PUT    /api/admin/users/{id}/unban         - Unban
GET    /api/admin/reports                  - Liste reports
PUT    /api/admin/reports/{id}/resolve     - Résoudre report
PUT    /api/admin/reports/{id}/dismiss     - Dismisser
GET    /api/admin/activity                 - Activity log
POST   /api/import/batch                   - Import JSON
```

**Points Forts:**
- UI/UX professionnelle
- Workflow de modération complet
- Import batch très puissant
- Activity tracking

**Points à Améliorer:**
- ❌ Pas d'analytics avancés (charts, KPIs temporels)
- ❌ Pas de bulk actions
- ❌ Pas d'export CSV
- ❌ Pas de notifications push pour admins
- ❌ Pas de community health metrics

**Score:** 8.5/10
**Priorité d'amélioration:** P2 (Analytics charts)

---

#### 6. Upload d'Images ✅

**Fonctionnalités:**
- ✅ Intégration Cloudinary
- ✅ Signature-based upload (sécurisé)
- ✅ Direct upload frontend → Cloudinary
- ✅ Transformations auto (resize, crop, format)
- ✅ Auto-delete anciennes images
- ✅ Support: avatar, coffee image, review image

**Endpoints API:**
```
GET /api/upload/signature/avatar          - Signature upload avatar
GET /api/upload/signature/coffee-image    - Signature upload coffee
GET /api/upload/signature/review-image    - Signature upload review
```

**Points Forts:**
- Sécurité parfaite (signature)
- Performance optimale (direct upload)
- Cleanup automatique

**Points à Améliorer:**
- ❌ Pas de multi-upload (galerie de photos)
- ❌ Pas de crop/edit UI dans l'app
- ❌ Pas de photo tagging (ex: "packaging", "brew", "beans")

**Score:** 8.5/10
**Priorité d'amélioration:** P2 (Multi-upload galerie)

---

#### 7. Notifications ⚠️

**Fonctionnalités:**
- ⚠️ Service async configuré
- ⚠️ Templates HTML prêts:
  - Welcome email
  - Coffee approval/rejection
  - New review notification
  - Password reset
- ❌ **PAS ACTIF EN PRODUCTION**

**Points Forts:**
- Architecture solide
- Templates professionnels
- Async pour performance

**Points à Améliorer:**
- ❌ Pas activé en production (CRITIQUE)
- ❌ Pas de notifications in-app
- ❌ Pas de notifications push web
- ❌ Pas de préférences notifications par user
- ❌ Pas de digest email hebdomadaire

**Score:** 3/10 (infrastructure 9/10, production 0/10)
**Priorité d'amélioration:** **P0 (CRITIQUE - Activer emails)**

---

#### 8. Reports & Modération ✅

**Fonctionnalités:**
- ✅ Signalement de contenu (Coffee, Review, User)
- ✅ Raisons prédéfinies + description
- ✅ Workflow modération (PENDING/RESOLVED/DISMISSED)
- ✅ Admin notes
- ✅ Activity tracking

**Modèle de Données:**
```java
Report {
  id, reporter
  entityType (COFFEE/REVIEW/USER)
  entityId
  reason, description
  status (PENDING/RESOLVED/DISMISSED)
  resolvedBy, adminNotes
  createdAt, resolvedAt
}
```

**Points Forts:**
- Workflow complet
- Flexibilité (multi-types)
- UI admin claire

**Points à Améliorer:**
- ⚠️ Pas de notifications auto aux admins
- ⚠️ Pas de SLA tracking
- ⚠️ Pas de community guidelines claires

**Score:** 8/10
**Priorité d'amélioration:** P1 (Notifications admins)

---

### Résumé des Fonctionnalités Existantes

| Module | Completude | Score | État | Priorité Amélioration |
|--------|------------|-------|------|----------------------|
| Authentication | 70% | 7/10 | ✅ Prod | P0 (Emails), P1 (OAuth) |
| Catalogue Cafés | 85% | 8.5/10 | ✅ Prod | P2 (Galerie photos) |
| Reviews | 80% | 8/10 | ✅ Prod | P2 (Comments on reviews) |
| Favoris | 70% | 7/10 | ✅ Prod | P1 (Collections) |
| Admin Dashboard | 85% | 8.5/10 | ✅ Prod | P2 (Analytics) |
| Upload Images | 85% | 8.5/10 | ✅ Prod | P2 (Multi-upload) |
| Notifications | 30% | 3/10 | ❌ Not Prod | **P0 (CRITIQUE)** |
| Reports | 80% | 8/10 | ✅ Prod | P1 (Notif admins) |

**Score Moyen Global:** 7.6/10

---

## Fonctionnalités à Affiner ou Terminer (PRIORITÉ 1)

### Critiques (P0) - Quick Wins Essentiels

| # | Fonctionnalité | État Actuel | À Améliorer | Importance | Priorité | Valeur | Effort |
|---|---------------|-------------|-------------|-----------|----------|--------|--------|
| P0.1 | **Activation Emails Production** | Infrastructure OK, pas actif | Activer SMTP, tester tous templates | Critique | P0 | Très haute | S (2j) |
| P0.2 | **Notifications In-App** | Pas implémenté | Système de notifications temps réel | Haute | P0 | Haute | M (1w) |
| P0.3 | **Préférences Notifications** | Pas implémenté | Settings pour choisir notifs | Moyenne | P0 | Moyenne | S (3j) |

**Durée Totale P0:** 2 semaines
**Impact:** Transformation de l'expérience utilisateur, engagement +40%

---

### Haute Priorité (P1) - Fondations Sociales

| # | Fonctionnalité | État Actuel | À Améliorer | Importance | Priorité | Valeur | Effort |
|---|---------------|-------------|-------------|-----------|----------|--------|--------|
| P1.1 | **Follow/Followers System** | Pas implémenté | Suivre utilisateurs & torréfacteurs | Critique | P1 | Très haute | M (2w) |
| P1.2 | **Feed d'Activité Personnalisé** | Pas implémenté | Feed des gens qu'on suit | Critique | P1 | Très haute | L (3w) |
| P1.3 | **Collections de Favoris** | Favoris basiques | Collections nommées publiques/privées | Haute | P1 | Haute | M (1w) |
| P1.4 | **Social Sharing** | Pas implémenté | Partage Twitter, FB, Instagram | Haute | P1 | Haute | S (3j) |
| P1.5 | **Wishlist "Want to Try"** | Pas implémenté | Séparé de favoris, public | Haute | P1 | Haute | M (1w) |
| P1.6 | **Notifications Admins** | Pas implémenté | Notifs auto nouveaux reports | Haute | P1 | Moyenne | S (2j) |

**Durée Totale P1:** 8-10 semaines
**Impact:** Création d'une vraie communauté sociale, engagement +60%

---

## Nouvelles Fonctionnalités Proposées

### Phase 1 - Engagement Social (P1 - Q1 2025)

**Objectif:** Créer une communauté engagée et interactive

| # | Fonctionnalité | Inspiration | Importance | Priorité | Valeur | Effort | Durée |
|---|---------------|-------------|-----------|----------|--------|--------|-------|
| 1.1 | Follow/Followers System | Untappd, Instagram | Critique | P1 | Très haute | M | 2w |
| 1.2 | Feed d'Activité Personnalisé | Instagram, Twitter | Critique | P1 | Très haute | L | 3w |
| 1.3 | Collections de Favoris | Goodreads shelves | Haute | P1 | Haute | M | 1w |
| 1.4 | Social Sharing | Untappd | Haute | P1 | Haute | S | 3j |
| 1.5 | Wishlist "Want to Try" | Goodreads "to-read" | Haute | P1 | Haute | M | 1w |
| 1.6 | Comments on Reviews | Vivino | Moyenne | P1 | Moyenne | M | 2w |
| 1.7 | Notifications Push Web | Twitter | Haute | P1 | Haute | M | 1w |
| 1.8 | User Mentions (@username) | Twitter | Moyenne | P1 | Moyenne | S | 3j |
| 1.9 | Hashtags (#specialty) | Instagram | Basse | P2 | Moyenne | M | 1w |
| 1.10 | Profile Customization | Goodreads | Basse | P2 | Moyenne | M | 1w |

**Durée Totale Phase 1:** 10-12 semaines
**ROI:** Très élevé (engagement = rétention = croissance)

---

### Phase 2 - Découverte Personnalisée (P1/P2 - Q2 2025)

**Objectif:** Expérience ultra-personnalisée pour chaque utilisateur

| # | Fonctionnalité | Inspiration | Importance | Priorité | Valeur | Effort | Durée |
|---|---------------|-------------|-----------|----------|--------|--------|-------|
| 2.1 | **Recommandations IA** | Netflix, Spotify | Haute | P1 | Très haute | L | 4w |
| 2.2 | **Taste Profile** | Vivino | Haute | P1 | Haute | M | 2w |
| 2.3 | **Smart Discovery Feed** | TikTok | Haute | P1 | Très haute | L | 3w |
| 2.4 | **Similar Users** | Goodreads | Moyenne | P2 | Moyenne | M | 2w |
| 2.5 | **Coffee Quiz** | BuzzFeed | Moyenne | P2 | Haute | M | 1w |
| 2.6 | **Weekly Digest Email** | Product Hunt | Haute | P1 | Haute | M | 1w |
| 2.7 | **Trending Coffees** | Twitter trends | Moyenne | P2 | Moyenne | S | 3j |
| 2.8 | **Location-based Discovery** | Foursquare | Basse | P2 | Moyenne | M | 2w |
| 2.9 | **Advanced Search** | Google | Haute | P1 | Haute | M | 2w |
| 2.10 | **Saved Searches** | Indeed | Basse | P3 | Faible | S | 2j |

**Durée Totale Phase 2:** 12-14 semaines
**ROI:** Très élevé (découverte = engagement = reviews)

---

### Phase 3 - Gamification & Récompenses (P1/P2 - Q3 2025)

**Objectif:** Rendre l'expérience addictive et fun

| # | Fonctionnalité | Inspiration | Importance | Priorité | Valeur | Effort | Durée |
|---|---------------|-------------|-----------|----------|--------|--------|-------|
| 3.1 | **Badges & Achievements** | Untappd | Haute | P1 | Très haute | L | 3w |
| 3.2 | **Points System** | Stack Overflow | Haute | P1 | Haute | M | 2w |
| 3.3 | **Leaderboard** | Untappd | Moyenne | P1 | Haute | M | 1w |
| 3.4 | **User Levels** | Untappd | Moyenne | P2 | Moyenne | M | 2w |
| 3.5 | **Check-ins** | Untappd | Haute | P1 | Très haute | L | 3w |
| 3.6 | **Streaks** | Duolingo | Moyenne | P2 | Haute | M | 1w |
| 3.7 | **Challenges** | Strava | Moyenne | P2 | Haute | L | 3w |
| 3.8 | **Monthly Contests** | Untappd | Basse | P2 | Moyenne | M | 2w |
| 3.9 | **Verified Taster Badge** | Twitter verified | Haute | P1 | Haute | S | 1w |
| 3.10 | **Referral Program** | Dropbox | Moyenne | P2 | Moyenne | M | 2w |

**Durée Totale Phase 3:** 12-14 semaines
**ROI:** Très élevé (gamification = addiction = rétention)

---

### Phase 4 - Contenu & Éducation (P2 - Q4 2025)

**Objectif:** Devenir la référence éducation café

| # | Fonctionnalité | Inspiration | Importance | Priorité | Valeur | Effort | Durée |
|---|---------------|-------------|-----------|----------|--------|--------|-------|
| 4.1 | **Brewing Guides** | Serious Eats | Haute | P1 | Haute | L | 4w |
| 4.2 | **Glossaire Café** | Wine Folly | Haute | P1 | Haute | M | 2w |
| 4.3 | **Q&A sur Cafés** | Stack Overflow | Moyenne | P2 | Moyenne | L | 3w |
| 4.4 | **Blog Sipzy** | Medium | Moyenne | P2 | Moyenne | M | 2w |
| 4.5 | **Video Content** | YouTube | Moyenne | P2 | Haute | XL | 8w |
| 4.6 | **Podcasts** | Spotify | Basse | P3 | Moyenne | XL | 12w |
| 4.7 | **Coffee Maps** | Google Maps | Moyenne | P2 | Haute | L | 4w |
| 4.8 | **Roaster Stories** | Humans of NY | Moyenne | P2 | Moyenne | M | 2w |
| 4.9 | **Origin Stories** | Atlas Obscura | Basse | P3 | Moyenne | M | 2w |
| 4.10 | **Coffee Events** | Eventbrite | Haute | P2 | Haute | L | 3w |

**Durée Totale Phase 4:** Variable (8-20 semaines selon sélection)
**ROI:** Moyen à long terme (éducation = autorité = SEO)

---

### Phase 5 - Expansion & Innovations (P2/P3 - 2026)

**Objectif:** Features uniques et différenciantes

| # | Fonctionnalité | Inspiration | Importance | Priorité | Valeur | Effort | Durée |
|---|---------------|-------------|-----------|----------|--------|--------|-------|
| 5.1 | **Multi-langue (i18n)** | Duolingo | Haute | P2 | Très haute | L | 4w |
| 5.2 | **Dark Mode** | Twitter | Basse | P2 | Moyenne | S | 1w |
| 5.3 | **PWA** | Twitter Lite | Moyenne | P2 | Haute | M | 2w |
| 5.4 | **Mobile App** | Untappd | Haute | P2 | Très haute | XL | 12w |
| 5.5 | **Virtual Tastings** | Zoom | Moyenne | P2 | Haute | XL | 8w |
| 5.6 | **AR Packaging** | IKEA Place | Basse | P3 | Faible | XL | 6w |
| 5.7 | **API Publique** | Twitter API | Moyenne | P2 | Moyenne | L | 3w |
| 5.8 | **Webhooks** | Stripe | Basse | P3 | Faible | M | 1w |
| 5.9 | **Community Meetups** | Meetup.com | Haute | P2 | Haute | L | 4w |
| 5.10 | **Coffee Clubs** | Book clubs | Moyenne | P2 | Moyenne | L | 3w |

**Durée Totale Phase 5:** Variable selon budget
**ROI:** Moyen à long terme (différenciation)

---

## Spécifications Détaillées

### P0.1 - Activation Emails Production

**Importance:** Critique | **Priorité:** P0 | **Valeur:** Très haute | **Effort:** S (2j)

#### Objectif
Activer le service d'emails en production pour envoyer tous les emails transactionnels.

#### État Actuel
- ✅ Service `EmailService` implémenté
- ✅ Templates HTML prêts (Welcome, Coffee approval, New review, Password reset)
- ✅ Configuration SMTP présente
- ❌ Pas actif en production

#### Actions Requises

**Backend:**
1. Configurer SMTP provider (SendGrid ou Mailgun)
2. Ajouter credentials en env vars
3. Tester chaque template
4. Activer le service

**Configuration:**
```properties
# application.properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=${SMTP_USERNAME}
spring.mail.password=${SMTP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Emails à Envoyer:**
- Welcome email (inscription)
- Email verification
- Password reset
- Coffee approved/rejected (notification creator)
- New review on your coffee (notification creator)
- New follower (Phase 1)
- Weekly digest (Phase 2)

**Testing:**
- Mailtrap.io pour dev
- SendGrid test mode pour staging
- Production avec real emails

**Métriques de Succès:**
- Open rate: >40%
- Click rate: >10%
- Bounce rate: <2%
- Unsubscribe rate: <0.5%

---

### P1.1 - Follow/Followers System

**Importance:** Critique | **Priorité:** P1 | **Valeur:** Très haute | **Effort:** M (2w)

#### Objectif
Permettre aux utilisateurs de suivre d'autres amateurs et torréfacteurs pour créer une vraie communauté.

#### User Stories

```
En tant qu'utilisateur,
Je veux suivre d'autres passionnés de café
Afin de voir leur activité dans mon feed

Critères d'acceptation:
- Je peux follow/unfollow un user depuis son profil
- Je vois le nombre de followers/following
- Je vois la liste de mes followers
- Je vois la liste des gens que je suis
- Je reçois une notification quand quelqu'un me suit
- Je vois un badge "Follows you" si réciproque
```

#### Spécifications Techniques

**Database:**
```sql
-- Table de relations
CREATE TABLE user_follows (
    follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);

-- Compteurs dénormalisés pour performance
ALTER TABLE users ADD COLUMN followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;

-- Trigger pour mise à jour auto
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        UPDATE users SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET followers_count = followers_count - 1
        WHERE id = OLD.following_id;
        UPDATE users SET following_count = following_count - 1
        WHERE id = OLD.follower_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follow_counts
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
```

**Backend Model:**
```java
@Entity
@Table(name = "user_follows")
public class UserFollow {
    @EmbeddedId
    private UserFollowId id;

    @ManyToOne
    @MapsId("followerId")
    private User follower;

    @ManyToOne
    @MapsId("followingId")
    private User following;

    @CreationTimestamp
    private Instant createdAt;
}

@Embeddable
public class UserFollowId implements Serializable {
    private Long followerId;
    private Long followingId;
}
```

**API Endpoints:**
```java
// FollowController
POST   /api/users/{userId}/follow      - Follow user
DELETE /api/users/{userId}/follow      - Unfollow user
GET    /api/users/{userId}/followers   - Liste followers (paginé)
GET    /api/users/{userId}/following   - Liste following (paginé)
GET    /api/users/{userId}/is-following - Check si on suit
GET    /api/users/suggestions          - Suggestions de qui suivre
```

**Service:**
```java
@Service
public class FollowService {

    public void follow(Long followerId, Long followingId) {
        // Validations
        if (followerId.equals(followingId)) {
            throw new BadRequestException("Cannot follow yourself");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new BadRequestException("Already following");
        }

        // Créer relation
        UserFollow follow = new UserFollow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        followRepository.save(follow);

        // Notification
        notificationService.notifyNewFollower(followingId, followerId);
    }

    public List<UserResponse> getSuggestions(Long userId, int limit) {
        // Algorithme suggestions:
        // 1. Users avec goûts similaires (reviews similaires)
        // 2. Top reviewers globaux
        // 3. Users actifs récemment
        // 4. Exclure déjà suivis
        // 5. Randomize un peu pour variety

        List<User> similarTaste = findSimilarTasteUsers(userId, limit * 2);
        List<User> topReviewers = userRepository.findTopReviewers(limit);
        List<User> activeUsers = userRepository.findRecentlyActive(limit);

        // Merge et dedup
        Set<User> suggestions = new LinkedHashSet<>();
        suggestions.addAll(similarTaste);
        suggestions.addAll(topReviewers);
        suggestions.addAll(activeUsers);

        // Exclure suivis
        Set<Long> following = getFollowingIds(userId);
        suggestions.removeIf(u -> following.contains(u.getId()));

        return suggestions.stream()
            .limit(limit)
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }
}
```

**Frontend Components:**
```tsx
// FollowButton.tsx
export function FollowButton({ userId }: { userId: number }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      api.users.isFollowing(userId).then(setIsFollowing);
    }
  }, [userId, user]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await api.users.unfollow(userId);
        setIsFollowing(false);
        toast.success('Unfollowed');
      } else {
        await api.users.follow(userId);
        setIsFollowing(true);
        toast.success('Following!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      onClick={handleToggle}
      disabled={loading}
    >
      {isFollowing ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}

// FollowersList.tsx
export function FollowersList({ userId }: { userId: number }) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.users.getFollowers(userId, page, 20).then(res => {
      setFollowers(res.data);
    });
  }, [userId, page]);

  return (
    <div className="space-y-4">
      {followers.map(follower => (
        <UserCard key={follower.id} user={follower} />
      ))}
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
}

// SuggestedUsers.tsx
export function SuggestedUsers({ limit = 5 }) {
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    api.users.getSuggestions(limit).then(setSuggestions);
  }, [limit]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Who to follow</h3>
      <div className="space-y-4">
        {suggestions.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <UserAvatar user={user} />
            <FollowButton userId={user.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**UX Features:**
- Animation du bouton (smooth transition)
- Toast "You are now following @username"
- Notification email (optionnelle dans settings)
- Badge "Follows you" si réciproque
- Confetti animation si >100 followers 🎉

**Métriques de Succès:**
- 60% des users suivent au moins 1 personne
- Moyenne de 10 follows par user actif
- 30% taux de follow-back
- Rétention +25% pour users qui suivent >5 personnes

---

### P1.2 - Feed d'Activité Personnalisé

**Importance:** Critique | **Priorité:** P1 | **Valeur:** Très haute | **Effort:** L (3w)

#### Objectif
Créer un feed d'activité montrant ce que font les gens qu'on suit (reviews, check-ins, nouveaux favoris).

#### User Stories

```
En tant qu'utilisateur,
Je veux voir un feed des activités des gens que je suis
Afin de découvrir de nouveaux cafés et rester connecté

Critères d'acceptation:
- Je vois les reviews récentes de mes follows
- Je vois les nouveaux favoris de mes follows
- Je vois les check-ins de mes follows (Phase 3)
- Feed paginé et infini scroll
- Je peux liker et commenter
- Feed mis à jour en temps réel (ou refresh)
```

#### Spécifications Techniques

**Database:**
```sql
-- Table d'activités (Event Sourcing light)
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,  -- REVIEW_POSTED, COFFEE_FAVORITED, etc.
    entity_type VARCHAR(50),              -- COFFEE, REVIEW, etc.
    entity_id BIGINT,
    metadata JSONB,                       -- Data flexible
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type);

-- Types d'activités
-- REVIEW_POSTED: user posted a review
-- COFFEE_FAVORITED: user favorited a coffee
-- COFFEE_SUBMITTED: user submitted a new coffee
-- USER_FOLLOWED: user followed someone
-- COLLECTION_CREATED: user created a collection
-- CHECK_IN: user checked in (Phase 3)
-- BADGE_EARNED: user earned a badge (Phase 3)
```

**Backend Service:**
```java
@Service
public class ActivityService {

    // Créer une activité (appelé par events)
    @EventListener
    public void onReviewPosted(ReviewPostedEvent event) {
        Activity activity = Activity.builder()
            .userId(event.getUserId())
            .activityType(ActivityType.REVIEW_POSTED)
            .entityType("REVIEW")
            .entityId(event.getReviewId())
            .metadata(Map.of(
                "coffeeId", event.getCoffeeId(),
                "rating", event.getRating()
            ))
            .build();
        activityRepository.save(activity);
    }

    // Récupérer le feed
    public PageResponse<ActivityResponse> getFeed(Long userId, int page, int limit) {
        // 1. Récupérer les IDs des gens qu'on suit
        List<Long> followingIds = followRepository.findFollowingIdsByUserId(userId);

        // 2. Récupérer activités de ces users
        Page<Activity> activities = activityRepository
            .findByUserIdInOrderByCreatedAtDesc(
                followingIds,
                PageRequest.of(page - 1, limit)
            );

        // 3. Enrichir avec données (users, coffees, etc.)
        List<ActivityResponse> responses = activities.stream()
            .map(this::enrichActivity)
            .collect(Collectors.toList());

        return new PageResponse<>(responses, activities);
    }

    private ActivityResponse enrichActivity(Activity activity) {
        ActivityResponse response = activityMapper.toResponse(activity);

        // Enrichir avec user
        response.setUser(userService.getUserById(activity.getUserId()));

        // Enrichir selon type
        switch (activity.getActivityType()) {
            case REVIEW_POSTED:
                Long coffeeId = (Long) activity.getMetadata().get("coffeeId");
                response.setCoffee(coffeeService.getCoffeeById(coffeeId));
                response.setReview(reviewService.getReviewById(activity.getEntityId()));
                break;
            case COFFEE_FAVORITED:
                response.setCoffee(coffeeService.getCoffeeById(activity.getEntityId()));
                break;
            // etc.
        }

        return response;
    }
}
```

**API Endpoints:**
```java
GET /api/feed                    - Feed personnalisé (paginated)
GET /api/feed/global             - Feed global (tous users)
GET /api/activities              - Mes propres activités
```

**Frontend:**
```tsx
// FeedPage.tsx
export default function FeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const response = await api.feed.get(page, 20);
    setActivities(prev => [...prev, ...response.data]);
    setHasMore(response.pagination.hasNext);
    setPage(p => p + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <PageLayout>
      <Container className="max-w-2xl py-8">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

        <InfiniteScroll
          dataLength={activities.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
        >
          <div className="space-y-6">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </InfiniteScroll>
      </Container>
    </PageLayout>
  );
}

// ActivityCard.tsx
export function ActivityCard({ activity }: { activity: Activity }) {
  switch (activity.type) {
    case 'REVIEW_POSTED':
      return <ReviewActivityCard activity={activity} />;
    case 'COFFEE_FAVORITED':
      return <FavoriteActivityCard activity={activity} />;
    case 'USER_FOLLOWED':
      return <FollowActivityCard activity={activity} />;
    default:
      return null;
  }
}

// ReviewActivityCard.tsx
export function ReviewActivityCard({ activity }: { activity: ReviewActivity }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-start gap-4">
        <UserAvatar user={activity.user} size="md" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/profile/${activity.user.username}`} className="font-semibold hover:underline">
              {activity.user.username}
            </Link>
            <span className="text-gray-600">reviewed</span>
            <Link href={`/coffees/${activity.coffee.id}`} className="font-semibold text-coffee-600 hover:underline">
              {activity.coffee.name}
            </Link>
          </div>

          <div className="mb-3">
            <Rating value={activity.review.rating} readonly />
          </div>

          <p className="text-gray-700 mb-3">{activity.review.comment}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{formatTimeAgo(activity.createdAt)}</span>
            <button className="flex items-center gap-1 hover:text-coffee-600">
              <Heart className="w-4 h-4" />
              <span>{activity.review.helpfulCount}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-coffee-600">
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Performance:**
- Cache Redis pour feeds récents (TTL 5min)
- Pre-computation pour top users
- Pagination efficace (limit 20-50)
- Lazy loading images

**Métriques de Succès:**
- 70% des users visitent le feed quotidiennement
- Temps moyen sur feed: 5+ minutes
- Interactions (likes, comments): 2+ par visite
- Rétention: +40% pour users actifs sur feed

---

### P1.3 - Collections de Favoris Nommées

**Importance:** Haute | **Priorité:** P1 | **Valeur:** Haute | **Effort:** M (1w)

#### Objectif
Permettre de créer des collections nommées de cafés (comme les "shelves" Goodreads).

#### User Stories

```
En tant qu'utilisateur,
Je veux créer des collections thématiques de cafés
Afin d'organiser mes découvertes

Exemples:
- "My Morning Coffees"
- "To Try Next"
- "Ethiopian Favorites"
- "Gift Ideas"

Critères d'acceptation:
- Je peux créer des collections
- Je peux ajouter/retirer des cafés
- Collections publiques OU privées
- Collections partagées avec un lien
- Compteur de cafés dans chaque collection
```

#### Spécifications Techniques

**Database:**
```sql
CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    coffee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE collection_items (
    id BIGSERIAL PRIMARY KEY,
    collection_id BIGINT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    coffee_id BIGINT NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(collection_id, coffee_id)
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
```

**Backend:**
```java
@Entity
public class Collection {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    private String name;
    private String description;
    private Boolean isPublic = true;
    private Integer coffeeCount = 0;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}

// API Endpoints
POST   /api/collections                           - Create collection
GET    /api/collections                           - My collections
GET    /api/users/{userId}/collections            - User's public collections
PUT    /api/collections/{id}                      - Update
DELETE /api/collections/{id}                      - Delete
POST   /api/collections/{id}/coffees/{coffeeId}   - Add coffee
DELETE /api/collections/{id}/coffees/{coffeeId}   - Remove coffee
GET    /api/collections/{id}/coffees              - List coffees
```

**Frontend:**
```tsx
// CollectionSelector.tsx (modal pour ajouter à collection)
export function CollectionSelector({ coffeeId }: { coffeeId: number }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTo = async (collectionId: number) => {
    await api.collections.addCoffee(collectionId, coffeeId);
    toast.success('Added to collection');
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <PlusCircle className="w-4 h-4 mr-2" />
        Add to Collection
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">Add to Collection</h3>
        <div className="space-y-2">
          {collections.map(collection => (
            <button
              key={collection.id}
              onClick={() => handleAddTo(collection.id)}
              className="w-full text-left p-3 hover:bg-gray-50 rounded"
            >
              {collection.name} ({collection.coffeeCount})
            </button>
          ))}
          <button className="w-full text-left p-3 text-coffee-600 font-semibold">
            + Create New Collection
          </button>
        </div>
      </Modal>
    </>
  );
}
```

**Métriques de Succès:**
- 40% des users créent au moins 1 collection
- Moyenne de 3 collections par user actif
- Collections "To Try" la plus populaire

---

## Roadmap Timeline

### Q1 2025 - Fondations Sociales

**Objectif:** Transformer en vraie communauté

**Semaine 1-2:**
- ✅ P0.1: Activation emails production (2j)
- ✅ P0.2: Notifications in-app (1w)
- ✅ P0.3: Préférences notifications (3j)

**Semaine 3-4:**
- ✅ P1.1: Follow/Followers system (2w)

**Semaine 5-7:**
- ✅ P1.2: Feed d'activité personnalisé (3w)

**Semaine 8:**
- ✅ P1.3: Collections de favoris (1w)

**Semaine 9:**
- ✅ P1.4: Social sharing (3j)
- ✅ P1.5: Wishlist "Want to Try" (reste semaine)

**Semaine 10-12:**
- ✅ P1.6: Comments on reviews (2w)
- ✅ Testing & polish

**Livrables Q1:**
- Follow system complet
- Feed personnalisé
- Collections
- Social sharing
- Notifications actives

**KPIs Q1:**
- 1,000 MAU
- 60% avec follow >1 personne
- 300 reviews/mois
- Rétention D30: 35%

---

### Q2 2025 - Découverte & Personnalisation

**Objectif:** Expérience personnalisée et découverte magique

**Avril:**
- ✅ 2.1: Recommandations IA (4w)

**Mai:**
- ✅ 2.2: Taste Profile (2w)
- ✅ 2.3: Smart Discovery Feed (2w)

**Juin:**
- ✅ 2.6: Weekly Digest Email (1w)
- ✅ 2.9: Advanced Search (2w)
- ✅ Testing & optimization

**Livrables Q2:**
- Recommandations IA
- Taste profile
- Discovery feed
- Weekly digest

**KPIs Q2:**
- 5,000 MAU
- Click-through reco: 15%+
- Reviews/mois: 1,000
- Rétention D30: 40%

---

### Q3 2025 - Gamification

**Objectif:** Rendre addictif et fun

**Juillet:**
- ✅ 3.1: Badges & Achievements (3w)
- ✅ 3.2: Points System (1w)

**Août:**
- ✅ 3.5: Check-ins (3w)
- ✅ 3.3: Leaderboard (1w)

**Septembre:**
- ✅ 3.9: Verified Taster Badge (1w)
- ✅ 3.6: Streaks (1w)
- ✅ Testing & polish (2w)

**Livrables Q3:**
- Système de badges complet
- Points & levels
- Check-ins
- Leaderboard

**KPIs Q3:**
- 10,000 MAU
- 50% avec au moins 1 badge
- Check-ins/mois: 5,000
- Rétention D30: 45%

---

### Q4 2025 - Contenu & Expansion

**Objectif:** Devenir la référence éducation café

**Octobre:**
- ✅ 4.1: Brewing Guides (4w)

**Novembre:**
- ✅ 4.2: Glossaire Café (2w)
- ✅ 4.7: Coffee Maps (2w)

**Décembre:**
- ✅ 4.10: Coffee Events (3w)
- ✅ Review année & planning 2026 (1w)

**Livrables Q4:**
- 20+ brewing guides
- Glossaire complet
- Coffee maps
- Events platform

**KPIs Q4:**
- 25,000 MAU
- 50+ events created
- SEO traffic: 30% du total
- Rétention D30: 50%

---

## Métriques de Succès (OKRs)

### OKRs 2025

**Objectif 1: Croissance Utilisateurs**

| Métrique | Q1 | Q2 | Q3 | Q4 |
|----------|----|----|----|----|
| MAU (Monthly Active Users) | 1,000 | 5,000 | 10,000 | 25,000 |
| Nouveaux users/mois | 400 | 2,000 | 4,000 | 8,000 |
| Rétention D30 | 35% | 40% | 45% | 50% |
| Rétention D90 | 20% | 25% | 30% | 35% |

**Objectif 2: Engagement Communautaire**

| Métrique | Q1 | Q2 | Q3 | Q4 |
|----------|----|----|----|----|
| Reviews/mois | 300 | 1,000 | 3,000 | 8,000 |
| Reviews/user actif | 0.3 | 0.2 | 0.3 | 0.32 |
| % users avec follows | 60% | 70% | 75% | 80% |
| Avg follows/user | 5 | 8 | 12 | 15 |
| Check-ins/mois | - | - | 5,000 | 15,000 |
| Temps moyen/session | 5min | 7min | 10min | 12min |

**Objectif 3: Contenu & Découverte**

| Métrique | Q1 | Q2 | Q3 | Q4 |
|----------|----|----|----|----|
| Cafés dans catalogue | 500 | 1,000 | 2,000 | 5,000 |
| Soumissions/mois | 50 | 100 | 200 | 400 |
| Taux approbation | 80% | 85% | 85% | 85% |
| Click-through reco | - | 15% | 18% | 20% |

**Objectif 4: Qualité & Performance**

| Métrique | Target |
|----------|--------|
| Uptime | 99.9% |
| Page Load Time (p95) | <2s |
| API Response Time (p95) | <200ms |
| Error Rate | <0.1% |
| Lighthouse Score | >90 |

---

## Recommandations Stratégiques

### 1. Stratégie de Croissance

**Phase 1 - Early Adopters (Q1 2025)**

**Canaux d'acquisition:**
1. **Reddit** (r/Coffee, r/espresso)
   - Participer authentiquement
   - Partager reviews intéressantes
   - AMA avec roasters

2. **Instagram/TikTok**
   - Contenu éducatif (brewing tips)
   - Behind-the-scenes roasters
   - User-generated content

3. **SEO**
   - Guides brewing (long-form)
   - Comparatifs cafés par origine
   - Glossaire technique

4. **Partnerships**
   - Cafés locaux (stickers, QR codes)
   - Roasters (co-marketing)
   - Barista influencers

**Tactiques:**
- Lancement avec 20 beta users passionnés
- Incentives pour reviews (badges early adopter)
- Referral program (invite friends)

---

### 2. Stratégie de Rétention

**Hook Model (Nir Eyal):**

**1. Trigger:**
- Externe: Email weekly digest
- Interne: "Qu'est-ce que mes amis testent?"

**2. Action:**
- Consulter feed
- Découvrir nouveau café
- Lire reviews

**3. Variable Reward:**
- Nouveau café coup de cœur
- Nouveau follower
- Badge débloqué
- Featured review

**4. Investment:**
- Poster review
- Créer collection
- Follow quelqu'un
- Check-in

**Mécaniques de rétention:**
- Streaks (Duolingo style)
- Weekly challenges
- Leaderboard monthly
- Exclusive badges

---

### 3. Stratégie Contenu

**Piliers de Contenu:**

**1. Éducation (SEO + Valeur)**
- Brewing guides par méthode
- Glossaire complet
- Origin stories
- Roasting process

**2. Découverte**
- "Coffee of the Week"
- Trending dans ta région
- Hidden gems
- Seasonal recommendations

**3. Communauté**
- Top reviewers du mois
- Featured collections
- Success stories
- Q&A sessions

**4. Inspiration**
- Photos magnifiques
- Roaster stories
- Barista tips
- Coffee travel

---

### 4. Modèle Économique (Long Terme)

**Note:** Sipzy est une plateforme COMMUNAUTAIRE, pas e-commerce.

**Options de Monétisation (futures):**

**1. Freemium**
- Free: Accès complet à la communauté
- Premium (5€/mois):
  - Recommandations IA avancées
  - Collections illimitées
  - Analytics personnel
  - Badge premium
  - Priority support

**2. Partenariats Roasters**
- Listings premium (featured)
- Analytics avancés
- Promotional tools

**3. Affiliation**
- Links vers achats chez roasters
- Commission 5-10%
- Transparent pour users

**4. Events & Experiences**
- Virtual tastings payants
- Coffee courses
- Meetups premium

**Projection Revenues Année 2:**
- Premium subs: 100k€ (2000 × 5€ × 10 mois)
- Roaster partnerships: 50k€
- Affiliation: 30k€
- Events: 20k€
- **Total:** 200k€

---

### 5. Risques & Mitigations

**Risques Identifiés:**

**1. Croissance Lente**
- **Risque:** Pas assez d'users pour créer effet réseau
- **Mitigation:** Focus niche (specialty coffee), marketing ciblé, early adopters passionnés

**2. Faible Engagement**
- **Risque:** Users s'inscrivent mais ne contribuent pas
- **Mitigation:** Gamification, onboarding smooth, quick wins (badges)

**3. Qualité Contenu**
- **Risque:** Reviews spam/low quality
- **Mitigation:** Modération active, verified reviews, community guidelines

**4. Competition**
- **Risque:** Vivino ou Untappd lancent version café
- **Mitigation:** Speed to market, spécialisation profonde, communauté forte

**5. Technique (Scalabilité)**
- **Risque:** Architecture ne scale pas
- **Mitigation:** Architecture actuelle OK jusqu'à 100k users

---

### 6. Team & Ressources

**Phase 1 - MVP Social (Q1-Q2):**
- 1 × Backend Dev (Spring Boot)
- 1 × Frontend Dev (Next.js/React)
- 1 × Product Manager
- 0.5 × Designer UI/UX
- 0.5 × Community Manager

**Phase 2 - Growth (Q3-Q4):**
- +1 × Full-stack Dev
- +1 × Marketing/Growth
- +0.5 × Data Analyst
- +0.5 × Content Creator

**Budget Année 1:**
- Salaires: 250k€ (4 FTE)
- Infrastructure: 15k€ (Cloudinary, hosting, etc.)
- Marketing: 30k€
- Divers: 15k€
- **Total:** 310k€

---

## Annexes

### A. Stack Technique

**Frontend:**
- Framework: Next.js 15 (App Router)
- UI: React 18 + TypeScript
- Styling: Tailwind CSS 4
- State: React Context + SWR
- Forms: React Hook Form + Zod
- Icons: Lucide React

**Backend:**
- Framework: Spring Boot 3.2
- Language: Java 17
- Database: PostgreSQL 15
- Cache: Redis (futur)
- Auth: JWT
- Storage: Cloudinary

**DevOps:**
- Container: Docker
- CI/CD: GitHub Actions
- Hosting: Render/Railway
- Monitoring: (à implémenter)

---

### B. Inspirations

**Plateformes Communautaires:**
- **Untappd** (bière): Check-ins, badges, social
- **Vivino** (vin): Discovery, ratings, recommendations
- **Goodreads** (livres): Collections, social reading
- **Strava** (sport): Challenges, leaderboard, community

**Gamification:**
- **Duolingo**: Streaks, XP, leagues
- **Stack Overflow**: Points, badges, reputation

**Social:**
- **Instagram**: Feed, stories, explore
- **Twitter**: Follow, feed, trending

---

### C. Glossaire

- **MAU:** Monthly Active Users
- **DAU:** Daily Active Users
- **Rétention D30:** % users actifs 30j après signup
- **CTR:** Click-Through Rate
- **NPS:** Net Promoter Score
- **CQRS:** Command Query Responsibility Segregation
- **WCAG:** Web Content Accessibility Guidelines

---

**Document créé le:** 2025-11-08
**Dernière mise à jour:** 2025-11-08
**Version:** 2.0 - Community Focus
**Auteur:** Product Owner Analysis (Claude Sonnet 4.5)

**Status:** ✅ READY FOR REVIEW

---

## Prochaines Étapes Recommandées

1. ✅ Review avec stakeholders
2. ✅ Validation budget et ressources Q1
3. ✅ Création backlog détaillé Phase 1
4. ✅ **PRIORITÉ 0:** Activer emails en production (2 jours)
5. ✅ Kick-off P1.1 (Follow System)
6. ✅ Setup métriques et analytics
7. ✅ Recruter Community Manager
8. ✅ Définir community guidelines

---

**Questions? Besoin de clarifications?**

Ce document peut être affiné davantage selon vos besoins spécifiques. N'hésitez pas à demander des précisions sur n'importe quelle fonctionnalité ou phase.
