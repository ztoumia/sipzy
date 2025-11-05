# Changelog - Corrections de Cohérence API

**Date:** 2025-11-05
**Version:** v1.1.0
**Auteur:** Claude (Sonnet 4.5)

---

## Résumé

Cette mise à jour corrige les incohérences identifiées lors de l'analyse de cohérence de l'API REST backend Sipzy. Tous les tests passent (46/46) après ces modifications.

---

## Changements Breaking ⚠️

### 1. ApiResponse - Ajout du champ `success`

**Avant:**
```json
{
  "data": {...},
  "message": null,
  "timestamp": "2025-11-05T10:00:00Z"
}
```

**Après:**
```json
{
  "success": true,
  "data": {...},
  "message": null,
  "timestamp": "2025-11-05T10:00:00Z"
}
```

**Fichiers modifiés:**
- `backend/src/main/java/com/sipzy/common/dto/ApiResponse.java`
  - Ajout du champ `@Builder.Default private Boolean success = true;`
  - Ajout de `.success(true)` dans les méthodes factory

**Impact Frontend:**
- ✅ Les clients doivent maintenant accéder aux données via `response.data.data` au lieu de `response.data`
- ✅ Vérifier le succès via `response.data.success === true`

**Migration Frontend:**
```typescript
// AVANT
const coffees = response.data;

// APRÈS
const coffees = response.data.data;
if (response.data.success) {
  // Traiter les données
}
```

---

### 2. ErrorResponse - Ajout du champ `success`

**Avant:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Roaster with id 999 not found",
  "path": "/api/roasters/999",
  "timestamp": "2025-11-05T10:00:00Z"
}
```

**Après:**
```json
{
  "success": false,
  "status": 404,
  "error": "Not Found",
  "message": "Roaster with id 999 not found",
  "path": "/api/roasters/999",
  "timestamp": "2025-11-05T10:00:00Z"
}
```

**Fichiers modifiés:**
- `backend/src/main/java/com/sipzy/common/dto/ErrorResponse.java`
  - Ajout du champ `@Builder.Default private Boolean success = false;`

**Impact Frontend:**
- ✅ Vérifier les erreurs via `response.data.success === false`
- ✅ Plus besoin de vérifier uniquement le status HTTP

**Migration Frontend:**
```typescript
// AVANT
if (response.status >= 400) {
  handleError(response.data);
}

// APRÈS
if (!response.data.success) {
  handleError(response.data);
}
```

---

### 3. RoasterResponse - Ajout du champ `isVerified`

**Avant:**
```json
{
  "id": 1,
  "name": "Blue Bottle Coffee",
  "description": "...",
  "location": "Oakland, CA",
  "website": "https://...",
  "logoUrl": "https://...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Après:**
```json
{
  "id": 1,
  "name": "Blue Bottle Coffee",
  "description": "...",
  "location": "Oakland, CA",
  "website": "https://...",
  "logoUrl": "https://...",
  "isVerified": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Fichiers modifiés:**
- `backend/src/main/java/com/sipzy/coffee/dto/response/RoasterResponse.java`
  - Ajout paramètre `Boolean isVerified` au record
- `backend/src/main/java/com/sipzy/coffee/domain/Roaster.java`
  - Ajout champ `@Builder.Default private Boolean isVerified = true;`
- `backend/src/main/resources/db/migration/V10__add_roaster_is_verified.sql`
  - Migration Flyway pour ajouter colonne `is_verified`

**Impact Frontend:**
- ✅ Nouveau champ disponible pour afficher badge "Verified"
- ✅ Non-breaking (champ optionnel en lecture)

---

### 4. RoasterSummary - Harmonisation avec RoasterResponse

**Avant:**
```typescript
{
  id: number;
  name: string;
  country: string;    // ❌ Différent de RoasterResponse.location
  website: string;
  logoUrl: string;
  isVerified: boolean;
}
```

**Après:**
```typescript
{
  id: number;
  name: string;
  location: string;   // ✅ Cohérent avec RoasterResponse
  website: string;
  logoUrl: string;
  isVerified: boolean;
}
```

**Fichiers modifiés:**
- `backend/src/main/java/com/sipzy/coffee/dto/response/RoasterSummary.java`
  - Renommé paramètre `country` → `location`
- `backend/src/main/java/com/sipzy/coffee/mapper/CoffeeMapper.java`
  - Supprimé méthode `toRoasterSummary` (déléguée à RoasterMapper)
  - Ajout `uses = {RoasterMapper.class}` au @Mapper
- `backend/src/main/java/com/sipzy/coffee/mapper/RoasterMapper.java`
  - Ajout méthode `RoasterSummary toRoasterSummary(Roaster roaster);`

**Impact Frontend:**
- ⚠️ BREAKING: `roasterSummary.country` devient `roasterSummary.location`
- ✅ Cohérence entre Response et Summary

**Migration Frontend:**
```typescript
// AVANT
<p>{coffee.roaster.country}</p>

// APRÈS
<p>{coffee.roaster.location}</p>
```

---

## Nouveaux Endpoints Implémentés

### 5. Roasters API ✅

**Endpoints:**
```
GET /api/roasters          - Liste tous les torréfacteurs
GET /api/roasters/{id}     - Détails d'un torréfacteur
```

**Fichiers créés:**
- `backend/src/main/java/com/sipzy/coffee/controller/RoasterController.java`
- `backend/src/main/java/com/sipzy/coffee/service/RoasterService.java`
- `backend/src/main/java/com/sipzy/coffee/mapper/RoasterMapper.java`
- `backend/src/main/java/com/sipzy/coffee/dto/response/RoasterResponse.java`
- `backend/src/main/java/com/sipzy/coffee/dto/response/RoasterSummary.java`
- `backend/src/test/java/com/sipzy/coffee/controller/RoasterControllerTest.java` (5 tests)
- `backend/src/test/java/com/sipzy/coffee/service/RoasterServiceTest.java` (4 tests)

**Tests:** 9/9 passent ✅

---

### 6. Notes API ✅

**Endpoints:**
```
GET /api/notes             - Liste toutes les notes aromatiques
GET /api/notes/categories  - Notes groupées par catégorie
```

**Fichiers créés:**
- `backend/src/main/java/com/sipzy/coffee/controller/NoteController.java`
- `backend/src/main/java/com/sipzy/coffee/service/NoteService.java`
- `backend/src/main/java/com/sipzy/coffee/mapper/NoteMapper.java`
- `backend/src/main/java/com/sipzy/coffee/dto/response/NoteResponse.java`
- `backend/src/main/java/com/sipzy/coffee/dto/response/NoteByCategoryResponse.java`
- `backend/src/main/java/com/sipzy/coffee/dto/response/NoteSummary.java`
- `backend/src/test/java/com/sipzy/coffee/controller/NoteControllerTest.java` (7 tests)
- `backend/src/test/java/com/sipzy/coffee/service/NoteServiceTest.java` (6 tests)

**Tests:** 13/13 passent ✅

---

### 7. Admin Activity API ✅

**Endpoint:**
```
GET /api/admin/activity?limit=10
```

**Fichiers créés:**
- `backend/src/main/java/com/sipzy/admin/domain/Activity.java`
- `backend/src/main/java/com/sipzy/admin/domain/ActivityType.java` (enum)
- `backend/src/main/java/com/sipzy/admin/repository/ActivityRepository.java`
- `backend/src/main/java/com/sipzy/admin/mapper/ActivityMapper.java`
- `backend/src/main/java/com/sipzy/admin/dto/response/ActivityResponse.java`
- `backend/src/main/resources/db/migration/V9__create_activities_table.sql`
- `backend/src/test/java/com/sipzy/admin/service/AdminActivityServiceTest.java` (5 tests)

**Fichiers modifiés:**
- `backend/src/main/java/com/sipzy/admin/controller/AdminController.java`
  - Ajout méthode `getRecentActivity(int limit)`
- `backend/src/main/java/com/sipzy/admin/service/AdminService.java`
  - Ajout méthode `getRecentActivity(int limit)`

**Tests:** 5/5 passent ✅

---

## Améliorations Non-Breaking

### 8. PaginationConstants ✅

**Problème:** Valeurs de pagination inconsistantes entre controllers
- CoffeeController: limit=12
- ReviewController: limit=10
- AdminController: limit varie entre 10 et 20

**Solution:** Création de constantes centralisées

**Fichier créé:**
- `backend/src/main/java/com/sipzy/common/constants/PaginationConstants.java`

**Constantes:**
```java
public static final int DEFAULT_PAGE = 1;
public static final int DEFAULT_LIMIT = 10;
public static final int COFFEE_GRID_LIMIT = 12;
public static final int ADMIN_LIMIT = 20;
public static final int MAX_LIMIT = 100;
public static final int MAX_PAGE = 10000;

// String versions for @RequestParam defaultValue
public static final String DEFAULT_PAGE_STR = "1";
public static final String DEFAULT_LIMIT_STR = "10";
public static final String COFFEE_GRID_LIMIT_STR = "12";
public static final String ADMIN_LIMIT_STR = "20";
```

**Impact:** Facilite la maintenance et garantit la cohérence

---

### 9. SecurityConfig - Endpoints publics

**Fichier modifié:**
- `backend/src/main/java/com/sipzy/config/SecurityConfig.java`

**Ajouts:**
```java
// Public READ endpoints - Roasters and Notes
.requestMatchers(HttpMethod.GET, "/api/roasters/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/notes/**").permitAll()
```

**Impact:** Roasters et Notes accessibles sans authentification

---

## Documentation Mise à Jour

### 10. API.md ✅

**Fichier:** `backend/docs/API.md`

**Ajouts:**
- Section "## Roasters" avec 2 endpoints documentés
- Section "## Notes" avec 2 endpoints documentés
- Mise à jour "## Response Format" avec le champ `success`
- Ajout exemples de réponses Success/Error avec `success: true/false`
- Ajout section "Paginated Response"

---

### 11. MIGRATION_PLAN.md ✅

**Fichier:** `docs/MIGRATION_PLAN.md`

**Modifications:**
- Phase 1 marquée comme ✅ TERMINÉE
- Section "Différences Identifiées" mise à jour:
  - Roasters API: ❌ Manquant → ✅ IMPLÉMENTÉ
  - Notes API: ❌ Manquant → ✅ IMPLÉMENTÉ
  - Admin Activity: ❌ Manquant → ✅ IMPLÉMENTÉ
- Ajout section "🔄 Changements Breaking API" avec:
  - ApiResponse `success` field
  - ErrorResponse `success` field
  - RoasterResponse `isVerified` field
  - Impact et exemples de migration frontend

---

### 12. API_CONSISTENCY_REVIEW.md ✅

**Fichier créé:** `docs/API_CONSISTENCY_REVIEW.md`

**Contenu:**
- Analyse complète de tous les 8 controllers
- Inventaire des 34 DTOs
- Liste des 6 exceptions customs
- Patterns et conventions identifiés
- 9 recommandations avec estimations d'effort
- Plan d'action en 3 phases

---

## Migration Database

### 13. V10__add_roaster_is_verified.sql ✅

**Fichier créé:** `backend/src/main/resources/db/migration/V10__add_roaster_is_verified.sql`

**Contenu:**
```sql
ALTER TABLE roasters
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX idx_roasters_is_verified ON roasters(is_verified);

UPDATE roasters SET is_verified = true WHERE is_verified IS NULL;
```

**Impact:** Tous les roasters existants sont marqués comme vérifiés par défaut

---

## Tests

### Résumé des Tests

**Total:** 46 tests
**Statut:** ✅ 46/46 passent (100%)

**Répartition:**
- RoasterServiceTest: 4/4 ✅
- RoasterControllerTest: 5/5 ✅
- NoteServiceTest: 6/6 ✅
- NoteControllerTest: 7/7 ✅
- AdminActivityServiceTest: 5/5 ✅
- Autres tests existants: 19/19 ✅

**Fichiers de tests modifiés:**
- `backend/src/test/java/com/sipzy/coffee/service/RoasterServiceTest.java`
  - Ajout paramètre `isVerified: true` aux RoasterResponse
- `backend/src/test/java/com/sipzy/coffee/controller/RoasterControllerTest.java`
  - Ajout `testRoaster.setIsVerified(true)` dans setUp
- `backend/src/test/java/com/sipzy/admin/service/AdminActivityServiceTest.java`
  - Ajout suffix unique pour éviter violations de contraintes
  - Ajout `@WithMockUser(roles = "ADMIN")`

**Commande de test:**
```bash
cd backend && ./gradlew test
```

---

## Checklist de Migration Frontend

### Étapes Obligatoires ⚠️

- [ ] **1. Mettre à jour les appels API pour gérer `success` field**
  ```typescript
  // AVANT
  const data = response.data;

  // APRÈS
  if (response.data.success) {
    const data = response.data.data;
  } else {
    handleError(response.data);
  }
  ```

- [ ] **2. Mettre à jour les interfaces TypeScript**
  ```typescript
  interface ApiResponse<T> {
    success: boolean;  // NOUVEAU
    data: T;
    message?: string;
    timestamp: string;
  }

  interface ErrorResponse {
    success: boolean;  // NOUVEAU (toujours false)
    status: number;
    error: string;
    message: string;
    path: string;
    timestamp: string;
    validationErrors?: Record<string, string>;
  }
  ```

- [ ] **3. Renommer `country` → `location` dans RoasterSummary**
  ```typescript
  // AVANT
  interface RoasterSummary {
    country: string;
  }

  // APRÈS
  interface RoasterSummary {
    location: string;
  }
  ```

- [ ] **4. Ajouter `isVerified` à RoasterResponse**
  ```typescript
  interface RoasterResponse {
    id: number;
    name: string;
    description: string;
    location: string;
    website: string;
    logoUrl: string;
    isVerified: boolean;  // NOUVEAU
    createdAt: string;
    updatedAt: string;
  }
  ```

- [ ] **5. Utiliser les nouveaux endpoints Roasters/Notes**
  ```typescript
  // Roasters
  GET /api/roasters
  GET /api/roasters/{id}

  // Notes
  GET /api/notes
  GET /api/notes/categories
  ```

### Étapes Optionnelles

- [ ] **6. Afficher badge "Verified" pour roasters**
  ```tsx
  {roaster.isVerified && <Badge>Verified</Badge>}
  ```

- [ ] **7. Utiliser PaginationConstants côté frontend**
  ```typescript
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 10;
  const COFFEE_GRID_LIMIT = 12;
  ```

---

## Rollback Procedure

En cas de problème, voici les étapes de rollback:

### 1. Rollback Database
```sql
-- Supprimer la colonne is_verified
ALTER TABLE roasters DROP COLUMN IF EXISTS is_verified;
DROP INDEX IF EXISTS idx_roasters_is_verified;

-- Supprimer la table activities
DROP TABLE IF EXISTS activities;
```

### 2. Rollback Code
```bash
git revert <commit-hash>
```

### 3. Rollback Frontend
Restaurer les anciennes interfaces sans le champ `success`

---

## Notes Importantes

1. **Tous les tests passent** (46/46) après ces modifications
2. **Pas de régression** sur les endpoints existants
3. **Migration database automatique** via Flyway au démarrage
4. **Documentation complète** disponible dans `/docs`
5. **Breaking changes documentés** dans MIGRATION_PLAN.md

---

## Prochaines Étapes

1. ✅ ~~Backend: Implémenter Roasters/Notes/Activity~~ FAIT
2. ✅ ~~Backend: Harmoniser DTOs~~ FAIT
3. ✅ ~~Backend: Créer constantes pagination~~ FAIT
4. ✅ ~~Backend: Tous tests passent~~ FAIT
5. ✅ ~~Documentation: Mettre à jour API.md~~ FAIT
6. ✅ ~~Documentation: Mettre à jour MIGRATION_PLAN.md~~ FAIT
7. ⏳ Frontend: Créer API client (apiClient.ts)
8. ⏳ Frontend: Adapter aux nouveaux formats de réponse
9. ⏳ Frontend: Migrer vers endpoints réels

---

## Contact

Pour toute question sur ces changements, consulter:
- `docs/API_CONSISTENCY_REVIEW.md` - Analyse complète
- `backend/docs/API.md` - Documentation API
- `docs/MIGRATION_PLAN.md` - Plan de migration frontend

**Dernière mise à jour:** 2025-11-05
