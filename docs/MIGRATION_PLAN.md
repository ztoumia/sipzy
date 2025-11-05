# Plan de Migration Frontend → Backend

**Date:** 2025-10-29
**Objectif:** Connecter le frontend Next.js au backend Spring Boot et migrer de mock APIs vers des APIs réelles

---

## Table des matières

1. [Analyse Comparative](#analyse-comparative)
2. [Différences Identifiées](#différences-identifiées)
3. [Plan de Migration par Phase](#plan-de-migration-par-phase)
4. [Checklist de Migration](#checklist-de-migration)
5. [Risques et Mitigations](#risques-et-mitigations)
6. [Ressources](#ressources)

---

## Analyse Comparative

### ✅ Alignements Backend ↔ Frontend

**Total: 44 endpoints parfaitement alignés**

#### Authentication (5 endpoints)
- Login, Register, Logout, Verify Token, Forgot Password

#### Coffees (8 endpoints)
- CRUD complet + Popular, Recent, Similar

#### Reviews (6 endpoints)
- CRUD complet + Vote, Recent global

#### Users (8 endpoints)
- Profils, Reviews, Coffees, Preferences

#### Upload (3 endpoints)
- Signatures Cloudinary (avatar, coffee-image, review-image)

#### Admin (14 endpoints)
- Stats, Modération cafés, Gestion users, Gestion reports

---

## Différences Identifiées

### ✅ Corrigé dans le Backend (Anciennement Priorité 1)

#### 1. Roasters API ✅ IMPLÉMENTÉ
```
GET /api/roasters          - Liste tous les torréfacteurs
GET /api/roasters/{id}     - Détails d'un torréfacteur
```
**Statut:** Implémenté avec RoasterController + tests
**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Blue Bottle Coffee",
    "description": "...",
    "location": "Oakland, CA",
    "website": "https://...",
    "logoUrl": "https://...",
    "isVerified": true,  // NOUVEAU champ
    "createdAt": "...",
    "updatedAt": "..."
  },
  "timestamp": "..."
}
```

#### 2. Notes API ✅ IMPLÉMENTÉ
```
GET /api/notes             - Liste toutes les notes aromatiques
GET /api/notes/categories  - Notes groupées par catégorie
```
**Statut:** Implémenté avec NoteController + tests
**Response Structure:**
```json
{
  "success": true,  // NOUVEAU champ
  "data": [...],
  "timestamp": "..."
}
```

#### 3. Admin Activity Endpoint ✅ IMPLÉMENTÉ
```
GET /api/admin/activity?limit=10
```
**Statut:** Implémenté avec ActivityRepository + tests

### 🔄 Changements Breaking API (Important pour Frontend)

#### A. ApiResponse Structure - `success` field ajouté
**Avant:**
```json
{
  "data": {...},
  "timestamp": "..."
}
```

**Après:**
```json
{
  "success": true,
  "data": {...},
  "timestamp": "..."
}
```

**Impact Frontend:** Adapter tous les appels API pour vérifier `response.data.success`

#### B. ErrorResponse Structure - `success` field ajouté
**Avant:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "...",
  "path": "/api/...",
  "timestamp": "..."
}
```

**Après:**
```json
{
  "success": false,
  "status": 404,
  "error": "Not Found",
  "message": "...",
  "path": "/api/...",
  "timestamp": "..."
}
```

**Impact Frontend:** Vérifier `response.data.success === false` pour détecter erreurs

#### C. RoasterResponse - `isVerified` field ajouté
**Nouveau champ:** `isVerified: boolean`
**Impact Frontend:** Afficher badge "Verified" si `roaster.isVerified === true`

### ⚠️ À Décider (Priorité 2)

#### 4. Favorites API Backend
```
GET /api/users/favorites           - Liste des favoris
POST /api/users/favorites/{id}     - Ajouter aux favoris
DELETE /api/users/favorites/{id}   - Retirer des favoris
```
**Options:**
- **A (Simple):** Garder localStorage (pas de sync multi-appareils)
- **B (Complet):** Implémenter API backend (sync multi-appareils)

#### 5. User Preferences - Conflit de Structure
- **Backend actuel:** `favoriteOrigins`, `favoriteNoteIds`, `preferredPriceRange`
- **Frontend actuel:** `emailNotifications`, `reviewNotifications`, `coffeeApprovalNotifications`

**Options:**
- **A (Recommandé):** Fusionner les deux types dans une seule interface
- **B:** Séparer en deux endpoints distincts

---

## Plan de Migration par Phase

### 📅 Phase 1: Préparation (Semaine 1) ✅ TERMINÉE
**Objectif:** Infrastructure et configuration

**Backend:**
- [x] Implémenter `RoasterController` (GET /api/roasters) ✅
- [x] Implémenter `NoteController` (GET /api/notes) ✅
- [x] Ajouter endpoint admin activity ✅
- [x] Tests unitaires pour nouveaux endpoints ✅
- [x] Créer migration Flyway pour `is_verified` ✅
- [x] Harmoniser RoasterResponse/RoasterSummary ✅
- [x] Créer PaginationConstants ✅
- [x] Ajouter `success` field à ApiResponse/ErrorResponse ✅

**Frontend:**
- [ ] Installer axios
- [ ] Créer `frontend/lib/api/apiClient.ts` (HTTP client avec interceptors)
- [ ] Créer `frontend/lib/api/realApi.ts` (wrapper pour tous les services)
- [ ] Créer `frontend/lib/utils/errorHandler.ts` (gestion erreurs globale)
- [ ] Configurer `.env.local`

**Livrables:**
- ✅ Backend avec tous les endpoints nécessaires
- ✅ Tests passants (46/46 tests)
- ⏳ Infrastructure API frontend à créer

---

### 📅 Phase 2: Authentication (Semaine 2)

- [ ] Migrer `AuthContext` vers appels réels
- [ ] Tester login/register/logout
- [ ] Tester persistance de session
- [ ] Tester expired token handling

**Critères de succès:**
- ✅ Login fonctionne avec backend réel
- ✅ Token JWT stocké et utilisé correctement
- ✅ Déconnexion automatique si token expiré

---

### 📅 Phase 3: Coffees (Semaine 3)

**Pages concernées:**
- `/coffees` - Liste avec filtres
- `/coffees/[id]` - Détail café
- `/coffees/new` - Création café

**Tâches:**
- [ ] Migrer API calls vers backend réel
- [ ] Tester filtres et pagination
- [ ] Tester création de café avec upload image
- [ ] Tester modification et suppression

**Critères de succès:**
- ✅ Liste des cafés chargée depuis backend
- ✅ Filtres fonctionnels (origin, roaster, notes, rating)
- ✅ Création de café avec status PENDING
- ✅ Upload d'image Cloudinary fonctionne

---

### 📅 Phase 4: Reviews (Semaine 3)

- [ ] Migrer affichage des reviews
- [ ] Tester création de review
- [ ] Tester vote helpful/not helpful
- [ ] Tester modification et suppression

**Critères de succès:**
- ✅ Reviews affichées depuis backend
- ✅ Création de review fonctionne
- ✅ Votes enregistrés
- ✅ Rating moyen mis à jour

---

### 📅 Phase 5: Users & Profiles (Semaine 4)

**Pages concernées:**
- `/profile/[username]` - Profil public
- `/profile/edit` - Édition profil
- `/profile/reviews` - Mes reviews
- `/profile/submissions` - Mes cafés
- `/profile/favorites` - Mes favoris

**Tâches:**
- [ ] Migrer page profil public
- [ ] Migrer page édition profil
- [ ] Tester upload avatar
- [ ] **Décider et implémenter structure User Preferences**
- [ ] Tester affichage reviews/coffees utilisateur

**Critères de succès:**
- ✅ Profil public chargé depuis backend
- ✅ Modification de profil fonctionne
- ✅ Avatar upload Cloudinary fonctionne
- ✅ Préférences sauvegardées

---

### 📅 Phase 6: Admin (Semaine 4-5)

**Pages concernées:**
- `/admin` - Dashboard
- `/admin/coffees` - Modération cafés
- `/admin/users` - Gestion utilisateurs
- `/admin/reports` - Gestion signalements
- `/admin/activity` - Historique activité

**Tâches:**
- [ ] Migrer dashboard stats
- [ ] Migrer modération cafés
- [ ] Migrer gestion utilisateurs
- [ ] Migrer gestion reports
- [ ] Tester approve/reject/ban actions

**Critères de succès:**
- ✅ Stats dashboard affichées
- ✅ Modération de cafés fonctionne
- ✅ Ban/unban utilisateurs fonctionne
- ✅ Reports triés et traités

---

### 📅 Phase 7: Favorites (Semaine 5)

**Option A (Simple):**
- [ ] Aucun changement nécessaire
- ⚠️ Pas de sync multi-appareils

**Option B (Complet):**
- [ ] Backend API implémentée
- [ ] Frontend migré vers API
- [ ] Migration localStorage → Backend
- [ ] Tests de synchronisation

**Décision requise avant cette phase**

---

### 📅 Phase 8: Tests & QA (Semaine 6)

- [ ] Tests E2E complets (Playwright/Cypress)
- [ ] Tests de charge (Artillery/k6)
- [ ] Tests de sécurité (OWASP)
- [ ] Tests de compatibilité navigateurs
- [ ] Fix bugs identifiés
- [ ] Optimisation performance

**Tests prioritaires:**
- User journey: Register → Login → Create Coffee → Add Review
- Admin journey: Login → Moderate Coffee → Ban User
- Performance: Liste 1000+ cafés avec filtres

---

### 📅 Phase 9: Validation Finale (Semaine 6-7)

- [ ] Tests de sécurité complets
- [ ] Tests de performance (charge et stress)
- [ ] Audit de code final
- [ ] Documentation utilisateur
- [ ] Formation équipe support
- [ ] Préparation des données de production

**Livrables:**
- ✅ Application validée et prête pour déploiement
- ✅ Documentation complète
- ✅ Équipe formée

**Note:** Voir [docs/DEPLOYMENT.md](DEPLOYMENT.md) pour la documentation complète du déploiement sur VPS.

---

## Checklist de Migration

### Backend - Endpoints à Créer
- [ ] `GET /api/roasters` - Liste torréfacteurs
- [ ] `GET /api/roasters/{id}` - Détail torréfacteur
- [ ] `GET /api/notes` - Liste notes aromatiques
- [ ] `GET /api/notes/categories` - Notes par catégorie
- [ ] `GET /api/admin/activity` - Activité récente admin
- [ ] `GET /api/users/favorites` - Liste favoris (optionnel)
- [ ] `POST /api/users/favorites/{coffeeId}` - Ajouter favori (optionnel)
- [ ] `DELETE /api/users/favorites/{coffeeId}` - Retirer favori (optionnel)

### Backend - Configuration
- [ ] Configurer CORS pour frontend (`http://localhost:3000`)
- [ ] Valider JWT token generation
- [ ] Configurer Cloudinary
- [ ] Configurer email service (forgot password)
- [ ] Tests unitaires pour nouveaux endpoints
- [ ] Mettre à jour Swagger UI

### Frontend - Infrastructure
- [ ] Installer axios: `npm install axios`
- [ ] Créer `frontend/lib/api/apiClient.ts`
- [ ] Créer `frontend/lib/api/realApi.ts`
- [ ] Créer `frontend/lib/utils/errorHandler.ts`
- [ ] Configurer `frontend/.env.local`

### Frontend - Services à Migrer
- [ ] `authApi` → appels réels
- [ ] `coffeeApi` → appels réels
- [ ] `reviewApi` → appels réels
- [ ] `userApi` → appels réels
- [ ] `profileApi` → appels réels
- [ ] `adminApi` → appels réels
- [ ] `uploadApi` → appels réels (signatures Cloudinary)
- [ ] `favoritesApi` → backend (optionnel)

### Frontend - Contextes à Migrer
- [ ] `AuthContext` → appels réels
- [ ] Vérifier `ToastContext` pour erreurs API

### Frontend - Composants à Tester
- [ ] Login/Register forms
- [ ] Coffee list with filters
- [ ] Coffee detail page
- [ ] Create/Edit coffee form
- [ ] Review creation & voting
- [ ] Profile pages (public & edit)
- [ ] Admin dashboard & moderation

---

## Risques et Mitigations

### Risque 1: Incompatibilité de Formats
**Impact:** Élevé | **Probabilité:** Moyenne

**Mitigation:**
- Créer des adapters/transformers si nécessaire
- Valider les réponses avec TypeScript strict
- Tests exhaustifs de chaque endpoint

---

### Risque 2: CORS Issues
**Impact:** Bloquant | **Probabilité:** Élevée

**Mitigation:**
- Configurer CORS correctement dans le backend
- Tester avec frontend local et production
- Documenter les domaines autorisés

**Backend config nécessaire:**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://sipzy.app")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

### Risque 3: Token Expiration
**Impact:** Moyen | **Probabilité:** Certaine

**Mitigation:**
- Implémenter refresh token
- Afficher warning avant expiration
- Sauvegarder formulaires avant expiration
- Rediriger vers login avec message approprié

---

### Risque 4: Performance Dégradée
**Impact:** Moyen | **Probabilité:** Moyenne

**Mitigation:**
- Implémenter loading states partout
- Ajouter caching côté frontend (React Query)
- Optimiser requêtes backend (eager loading)
- Pagination stricte sur toutes les listes

---

### Risque 5: Data Migration (Favoris)
**Impact:** Élevé | **Probabilité:** Faible

**Mitigation:**
- Export/Import favoris avant migration
- Afficher warning à l'utilisateur
- Période de transition avec double storage

---

### Risque 6: User Preferences Conflict
**Impact:** Moyen | **Probabilité:** Élevée

**Mitigation:**
- **Décision rapide nécessaire** sur la structure finale
- Migration des données existantes
- Documentation claire pour les utilisateurs
- Tests de migration de données

---

## Ressources

### Documentation
- **Backend API:** [backend/docs/API.md](../backend/docs/API.md)
- **Frontend API:** [frontend/docs/API.md](../frontend/docs/API.md)
- **Déploiement:** [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`

### Outils Recommandés

**Frontend:**
- HTTP Client: Axios
- State Management: React Query (cache & invalidation)
- Testing: Vitest + React Testing Library
- E2E Testing: Playwright
- Error Tracking: Sentry

**Backend:**
- Testing: JUnit 5 + MockMvc
- API Documentation: Swagger/OpenAPI
- Monitoring: Spring Boot Actuator + Prometheus

### Variables d'Environnement

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=sipzy
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

**Backend (application.properties):**
```properties
# CORS
cors.allowed.origins=http://localhost:3000,https://sipzy.app

# JWT
jwt.secret=your_secret_key
jwt.expiration=86400000

# Cloudinary
cloudinary.cloud_name=sipzy
cloudinary.api_key=your_api_key
cloudinary.api_secret=your_api_secret

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email
spring.mail.password=your_password
```

### Ordre de Migration Recommandé

1. **Authentication** (critique, tout dépend de ça)
2. **Roasters & Notes APIs** (backend) - nécessaire pour les filtres
3. **Coffees** (fonctionnalité principale)
4. **Reviews** (complément naturel de Coffees)
5. **Users & Profiles** (fonctionnalité autonome)
6. **Upload** (utilisé dans plusieurs modules)
7. **Admin** (fonctionnalité isolée)
8. **Favorites** (nice-to-have, peut rester localStorage)

---

## Conclusion

**Résumé du Plan:**
- ✅ **44 endpoints** backend déjà alignés avec le frontend
- ❌ **3 endpoints critiques** manquants côté backend
- ⚠️ **2 décisions** à prendre (Favorites & User Preferences)
- 📅 **6-7 semaines** de développement estimées
- 🧪 **Tests exhaustifs** requis à chaque phase

**Prochaines Étapes Immédiates:**

1. ✅ Valider ce plan avec l'équipe
2. ⚠️ **Décider:** User Preferences (fusion vs séparation)
3. ⚠️ **Décider:** Favorites (localStorage vs API backend)
4. 🚀 Commencer Phase 1 (Infrastructure + Endpoints manquants)

**Suivi du Projet:**
- Mettre à jour ce document au fur et à mesure
- Créer des issues GitHub pour chaque tâche
- Stand-up quotidien pour synchronisation
- Review hebdomadaire des progrès

---

**Document créé le:** 2025-10-29
**Version:** 2.0 (Allégée)
**Auteur:** Claude Code Analysis
