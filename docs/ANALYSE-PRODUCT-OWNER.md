# Analyse Product Owner - Améliorations Sipzy.coffee

**Date :** 15 novembre 2025
**Version :** 1.0
**Statut :** ✅ Terminé

---

## 📋 Contexte

En tant que Product Owner, j'ai analysé le projet Sipzy.coffee pour proposer des améliorations sur les fonctionnalités suivantes :

1. **Système de prix et price range dynamique**
2. **Gestion avancée des images avec traçabilité**
3. **Notes de dégustation enrichies**

---

## 🎯 Objectifs

### 1. Prix et Price Range

**Problématique actuelle :**
- Le price range (€, €€, €€€) est stocké manuellement
- Pas de stockage du prix exact ni du poids
- Impossible de calculer le prix au kilo
- Critères de range non configurables

**Solution proposée :**
- ✅ Ajouter champs `price` (DECIMAL) et `weight` (INTEGER) dans table `coffees`
- ✅ Créer table `price_range_criteria` pour configurer les seuils
- ✅ Calcul automatique du price range via trigger PostgreSQL
- ✅ Interface backoffice pour gérer les critères

### 2. Gestion des Images

**Problématique actuelle :**
- Images stockées comme simples URLs (String)
- Pas de métadonnées (source, droits d'auteur, attribution)
- Impossible de tracer la provenance des images

**Solution proposée :**
- ✅ Créer table `images` centralisée
- ✅ Migration des données existantes sans perte
- ✅ Ajout métadonnées : source, copyright_info, attribution_text, uploaded_by
- ✅ Composant `<ImageAttribution />` pour afficher l'attribution

### 3. Notes de Dégustation

**Problématique actuelle :**
- 31 notes sans descriptions
- Pas d'icônes visuelles
- Pas de page dédiée pour explorer les notes
- IDs auto-générés non explicites

**Solution proposée :**
- ✅ Enrichir les 31 notes avec descriptions en français
- ✅ Ajouter champ `slug` unique pour IDs explicites
- ✅ Créer 31 icônes SVG
- ✅ Page frontend `/notes` pour explorer les profils aromatiques
- ✅ Interface backoffice pour gérer les notes

---

## 📊 User Stories Créées

### Epic 1 : Système de Prix et Price Range (2 US)

| # | Titre | Labels |
|---|-------|--------|
| [#36](https://github.com/ztoumia/sipzy/issues/36) | Configurer les critères de price range | `backend`, `backoffice`, `database` |
| [#37](https://github.com/ztoumia/sipzy/issues/37) | Saisir prix et poids lors de l'import | `backend`, `frontend`, `import` |

### Epic 2 : Gestion des Images (2 US)

| # | Titre | Labels |
|---|-------|--------|
| [#38](https://github.com/ztoumia/sipzy/issues/38) | Table centralisée pour images | `backend`, `database` |
| [#40](https://github.com/ztoumia/sipzy/issues/40) | Afficher attribution des images | `frontend`, `ui` |

### Epic 3 : Notes de Dégustation (3 US)

| # | Titre | Labels |
|---|-------|--------|
| [#41](https://github.com/ztoumia/sipzy/issues/41) | Enrichir notes avec descriptions et icônes | `backend`, `database`, `content` |
| [#42](https://github.com/ztoumia/sipzy/issues/42) | Page /notes pour afficher les notes | `frontend`, `ui` |
| [#43](https://github.com/ztoumia/sipzy/issues/43) | Gérer notes depuis backoffice | `backoffice`, `backend` |

### Epic 4 : Améliorations Transversales (2 US)

| # | Titre | Labels |
|---|-------|--------|
| [#44](https://github.com/ztoumia/sipzy/issues/44) | Créer migrations Flyway | `database`, `migration`, `backend` |
| [#45](https://github.com/ztoumia/sipzy/issues/45) | Mettre à jour documentation et types | `documentation`, `typescript` |

**Total : 9 User Stories**

---

## 📁 Livrables

### 1. Documentation Technique

- ✅ `/docs/modifications-db-analyse.md` - Analyse détaillée des modifications DB
  - Structure des nouvelles tables
  - Migrations SQL complètes
  - Impact backend/frontend
  - Stratégie de rollback

### 2. Données Enrichies

- ✅ `/import-examples/notes-enrichies.json` - 31 notes avec descriptions et icônes
  - Slugs explicites (citrus, berry, etc.)
  - Descriptions en français (150-200 caractères)
  - Noms d'icônes SVG
  - Catégorisation complète

### 3. Scripts

- ✅ `/scripts/create-user-stories.sh` - Script de création des issues GitHub
  - Automatisation de la création des 9 US
  - Labels et organisation par Epic
  - Body détaillé avec spécifications techniques

---

## 🗂️ Structure des Modifications DB

### Nouvelles Tables

```sql
-- 1. Critères de price range configurables
CREATE TABLE price_range_criteria (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(20) NOT NULL UNIQUE,          -- '€', '€€', '€€€'
    display_name VARCHAR(50) NOT NULL,
    min_price_per_kg DECIMAL(10,2) NOT NULL,
    max_price_per_kg DECIMAL(10,2),
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Images centralisées avec métadonnées
CREATE TABLE images (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    source VARCHAR(20) NOT NULL,                -- 'UPLOAD', 'EXTERNAL', 'CLOUDINARY'
    entity_type VARCHAR(50),
    entity_id BIGINT,
    uploaded_by BIGINT REFERENCES users(id),
    copyright_info TEXT,
    attribution_text VARCHAR(255),
    alt_text VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);
```

### Tables Modifiées

```sql
-- Coffees : ajout prix et poids
ALTER TABLE coffees
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN weight INTEGER,
ADD COLUMN price_per_kg DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE WHEN weight > 0 THEN (price / weight) * 1000 ELSE NULL END
) STORED;

-- Notes : enrichissement
ALTER TABLE notes
ADD COLUMN slug VARCHAR(100) UNIQUE,
ADD COLUMN description TEXT,
ADD COLUMN icon_url VARCHAR(500),
ADD COLUMN display_order INTEGER,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

---

## 🚀 Plan de Mise en Œuvre Recommandé

### Phase 1 : Prix et Price Range (Sprint 1)
1. Créer table `price_range_criteria` (US-01)
2. Ajouter champs prix/poids dans `coffees` (US-02)
3. Implémenter calcul automatique
4. Interface backoffice
5. Tests et validation

### Phase 2 : Gestion des Images (Sprint 2)
1. Créer table `images` (US-03)
2. Migration données existantes
3. Mettre à jour backend (entité + service)
4. Créer composant `<ImageAttribution />` (US-04)
5. Intégration frontend/backoffice
6. Tests et validation

### Phase 3 : Notes Enrichies (Sprint 3)
1. Enrichir table `notes` (US-05)
2. Créer/intégrer 31 icônes SVG
3. Créer page `/notes` (US-06)
4. Interface backoffice (US-07)
5. Tests et validation

### Phase 4 : Finalisation (Sprint 4)
1. Migrations Flyway complètes (US-08)
2. Documentation et types (US-09)
3. Tests E2E complets
4. Review et déploiement

---

## 📈 Métriques de Succès

### KPIs Techniques
- [ ] 100% des migrations Flyway passent
- [ ] 0% de perte de données lors des migrations
- [ ] Coverage tests : > 80%
- [ ] 0 régression sur fonctionnalités existantes

### KPIs Produit
- [ ] Temps de saisie d'un café réduit de 30% (prix auto-calculé)
- [ ] 100% des images avec attribution correcte
- [ ] Taux de complétion des profils de notes : 100% (31/31)
- [ ] Satisfaction utilisateur : > 8/10

---

## ⚠️ Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Perte de données lors migration images | Élevé | Faible | Backup complet avant migration + tests |
| Performance dégradée (calcul prix) | Moyen | Moyen | Index sur price_per_kg, cache frontend |
| Incompatibilité API frontend/backend | Élevé | Moyen | Versionning API, période de transition |
| Délai création 31 icônes SVG | Faible | Moyen | Templates réutilisables, design minimaliste |

---

## 📝 Notes Additionnelles

### Localisation
- ✅ Les CSV d'import sont déjà en français
- ✅ Les descriptions des notes sont en français
- ✅ Pas de modifications nécessaires

### Rétro-compatibilité
- Les anciennes colonnes `*_url` sont conservées en Phase 1
- Migration progressive pour éviter la rupture
- Période de transition de 2 sprints avant suppression

### Accessibilité
- Tous les champs `alt_text` sont obligatoires
- Les icônes de notes ont des labels ARIA
- Page `/notes` respecte WCAG 2.1 niveau AA

---

## 🔗 Liens Utiles

- **GitHub Issues :** https://github.com/ztoumia/sipzy/issues
- **Documentation technique :** `/docs/modifications-db-analyse.md`
- **Notes enrichies :** `/import-examples/notes-enrichies.json`
- **Script création issues :** `/scripts/create-user-stories.sh`

---

## ✅ Validation

**Validé par :** Claude (Agent PO)
**Date :** 2025-11-15
**Statut :** Prêt pour implémentation

---

## 📞 Contact

Pour toute question ou clarification sur cette analyse :
- Créer une issue GitHub avec le label `question`
- Référencer ce document : `ANALYSE-PRODUCT-OWNER.md`

---

**Fin du document**
