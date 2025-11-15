# Modifications de la Base de Données - Analyse Détaillée

## Vue d'ensemble

Ce document récapitule toutes les modifications nécessaires dans la base de données PostgreSQL pour implémenter les nouvelles fonctionnalités.

---

## 1. Système de Prix et Price Range

### Modifications dans `coffees`

**Nouveaux champs à ajouter :**

```sql
ALTER TABLE coffees
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN weight INTEGER,
ADD COLUMN price_per_kg DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN weight > 0 THEN (price / weight) * 1000
    ELSE NULL
  END
) STORED;
```

**Note :** Le champ `price_range` existant devient calculé automatiquement.

### Nouvelle table `price_range_criteria`

```sql
CREATE TABLE price_range_criteria (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(20) NOT NULL UNIQUE,          -- '€', '€€', '€€€'
    display_name VARCHAR(50) NOT NULL,           -- 'Économique', 'Moyen', 'Premium'
    min_price_per_kg DECIMAL(10,2) NOT NULL,
    max_price_per_kg DECIMAL(10,2),              -- NULL pour le dernier niveau
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les requêtes de recherche
CREATE INDEX idx_price_range_criteria_order ON price_range_criteria(display_order);
CREATE INDEX idx_price_range_criteria_active ON price_range_criteria(is_active);
```

**Données initiales :**

```sql
INSERT INTO price_range_criteria (label, display_name, min_price_per_kg, max_price_per_kg, display_order) VALUES
('€', 'Économique', 0, 25, 1),
('€€', 'Accessible', 25, 40, 2),
('€€€', 'Premium', 40, 60, 3),
('€€€€', 'Grand Cru', 60, NULL, 4);
```

### Fonction de calcul automatique

```sql
CREATE OR REPLACE FUNCTION calculate_price_range(p_price_per_kg DECIMAL)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_label VARCHAR(20);
BEGIN
    SELECT label INTO v_label
    FROM price_range_criteria
    WHERE is_active = TRUE
      AND p_price_per_kg >= min_price_per_kg
      AND (max_price_per_kg IS NULL OR p_price_per_kg < max_price_per_kg)
    ORDER BY display_order
    LIMIT 1;

    RETURN COALESCE(v_label, '€');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_coffee_price_range()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price_per_kg IS NOT NULL THEN
        NEW.price_range := calculate_price_range(NEW.price_per_kg);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_price_range
BEFORE INSERT OR UPDATE OF price, weight ON coffees
FOR EACH ROW
EXECUTE FUNCTION update_coffee_price_range();
```

---

## 2. Gestion des Images

### Nouvelle table `images`

```sql
CREATE TABLE images (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    source VARCHAR(20) NOT NULL,                 -- 'UPLOAD', 'EXTERNAL', 'CLOUDINARY'
    entity_type VARCHAR(50),                      -- 'COFFEE', 'ROASTER', 'USER', 'NOTE'
    entity_id BIGINT,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    original_url VARCHAR(500),                    -- URL originale si source externe
    copyright_info TEXT,
    attribution_text VARCHAR(255),
    alt_text VARCHAR(255),
    width INTEGER,
    height INTEGER,
    file_size INTEGER,                            -- en bytes
    mime_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index
CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX idx_images_source ON images(source);
CREATE INDEX idx_images_uploaded_by ON images(uploaded_by);
CREATE INDEX idx_images_created_at ON images(created_at);
```

### Migration des données existantes

```sql
-- Migration des images de café
INSERT INTO images (url, source, entity_type, entity_id, is_active, created_at)
SELECT
    image_url,
    CASE
        WHEN image_url LIKE '%cloudinary%' THEN 'CLOUDINARY'
        ELSE 'EXTERNAL'
    END,
    'COFFEE',
    id,
    TRUE,
    created_at
FROM coffees
WHERE image_url IS NOT NULL;

-- Migration des logos de torréfacteurs
INSERT INTO images (url, source, entity_type, entity_id, is_active, created_at)
SELECT
    logo_url,
    CASE
        WHEN logo_url LIKE '%cloudinary%' THEN 'CLOUDINARY'
        ELSE 'EXTERNAL'
    END,
    'ROASTER',
    id,
    TRUE,
    created_at
FROM roasters
WHERE logo_url IS NOT NULL;

-- Migration des avatars d'utilisateurs
INSERT INTO images (url, source, entity_type, entity_id, uploaded_by, is_active, created_at)
SELECT
    avatar_url,
    CASE
        WHEN avatar_url LIKE '%cloudinary%' THEN 'CLOUDINARY'
        ELSE 'EXTERNAL'
    END,
    'USER',
    id,
    id,
    TRUE,
    created_at
FROM users
WHERE avatar_url IS NOT NULL;
```

### Modifications dans les tables existantes

**Option 1 : Garder les colonnes existantes (rétro-compatibilité)**
```sql
-- Ajouter colonnes de référence
ALTER TABLE coffees ADD COLUMN image_id BIGINT REFERENCES images(id) ON DELETE SET NULL;
ALTER TABLE roasters ADD COLUMN logo_id BIGINT REFERENCES images(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN avatar_id BIGINT REFERENCES images(id) ON DELETE SET NULL;

-- Créer trigger pour synchronisation
CREATE OR REPLACE FUNCTION sync_image_url()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'coffees' THEN
        UPDATE coffees SET image_url = (SELECT url FROM images WHERE id = NEW.image_id)
        WHERE id = NEW.id;
    ELSIF TG_TABLE_NAME = 'roasters' THEN
        UPDATE roasters SET logo_url = (SELECT url FROM images WHERE id = NEW.logo_id)
        WHERE id = NEW.id;
    ELSIF TG_TABLE_NAME = 'users' THEN
        UPDATE users SET avatar_url = (SELECT url FROM images WHERE id = NEW.avatar_id)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Option 2 : Migration complète (recommandé à long terme)**
```sql
-- Supprimer les anciennes colonnes après migration
ALTER TABLE coffees DROP COLUMN image_url;
ALTER TABLE roasters DROP COLUMN logo_url;
ALTER TABLE users DROP COLUMN avatar_url;

-- Renommer les nouvelles colonnes
ALTER TABLE coffees RENAME COLUMN image_id TO image;
ALTER TABLE roasters RENAME COLUMN logo_id TO logo;
ALTER TABLE users RENAME COLUMN avatar_id TO avatar;
```

---

## 3. Notes de Dégustation

### Modifications dans `notes`

```sql
ALTER TABLE notes
ADD COLUMN slug VARCHAR(100) UNIQUE,
ADD COLUMN description TEXT,
ADD COLUMN icon_url VARCHAR(500),
ADD COLUMN display_order INTEGER,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Index
CREATE UNIQUE INDEX idx_notes_slug ON notes(slug);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_display_order ON notes(display_order);
```

### Migration des slugs pour notes existantes

```sql
UPDATE notes SET
    slug = LOWER(REPLACE(name, ' ', '-')),
    display_order = id,
    is_active = TRUE;
```

### Script d'enrichissement avec descriptions

```sql
-- Fruity
UPDATE notes SET description = 'Notes d''agrumes vives et acidulées rappelant le citron, l''orange, le pamplemousse ou la mandarine.'
WHERE name = 'Citrus';

UPDATE notes SET description = 'Arômes de baies rouges et noires comme la framboise, la myrtille, la mûre ou la fraise.'
WHERE name = 'Berry';

-- [... voir notes-enrichies.json pour la liste complète ...]
```

### Nouvelle table pour les images de notes (alternative)

Si on veut gérer les icônes séparément :

```sql
CREATE TABLE note_icons (
    note_id BIGINT PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
    icon_filename VARCHAR(100) NOT NULL,            -- citrus.svg
    icon_path VARCHAR(255) NOT NULL,                -- /static/icons/notes/
    icon_color VARCHAR(7),                          -- #FF6B35
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Modifications dans le CSV d'import

### Nouveau format `coffees.csv`

```csv
name,roaster_name,origin,process,variety,altitude_min,altitude_max,harvest_year,price,weight,description,image_url,notes,aromatic_profile,organic_certification,mouture,producer,espece
Café BIO Honduras Ceiba,Café Coutume,"Honduras, La Paz",Honey,"Parainema, Catuai rouge",1200,1700,2024,17.90,250,"Un café gourmand...",,Chocolat au Lait;Vanille,Sucré,yes,"Grains;Espresso",,Arabica
```

**Champs pour le calcul de prix automatique :**
- `price` : Prix en euros (DECIMAL) - pour calcul du price_range
- `weight` : Poids en grammes (INTEGER) - pour calcul du prix au kilo
- ~~`price_range`~~ : Supprimé du CSV (calculé automatiquement par le backend)

**Champs supplémentaires pour enrichissement :**
- `aromatic_profile` : Profil aromatique global (ex: "Fruité", "Sucré", "Épicé")
- `organic_certification` : Certification bio (yes/no)
- `mouture` : Types de mouture disponibles, séparés par ";" (ex: "Grains;Espresso;Filtre")
- `producer` : Nom du producteur ou de la coopérative
- `espece` : Espèce du café (Arabica, Robusta, etc.)

### Nouveau fichier `notes.csv` enrichi

```csv
slug,name,category,description,icon
citrus,Citrus,Fruity,"Notes d'agrumes vives...",citrus.svg
berry,Berry,Fruity,"Arômes de baies rouges...",berry.svg
```

---

## 5. Impact sur le Backend (Java/Spring Boot)

### Nouvelles entités à créer

**`PriceRangeCriteria.java`**
```java
@Entity
@Table(name = "price_range_criteria")
public class PriceRangeCriteria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String displayName;
    private BigDecimal minPricePerKg;
    private BigDecimal maxPricePerKg;
    private Integer displayOrder;
    private Boolean isActive;

    // getters/setters
}
```

**`Image.java`**
```java
@Entity
@Table(name = "images")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @Enumerated(EnumType.STRING)
    private ImageSource source; // UPLOAD, EXTERNAL, CLOUDINARY

    private String entityType;
    private Long entityId;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private String copyrightInfo;
    private String attributionText;
    private String altText;

    // getters/setters
}
```

### Modifications dans `Coffee.java`

```java
@Entity
public class Coffee {
    // Nouveaux champs pour calcul automatique du prix
    private BigDecimal price;
    private Integer weight;

    @Formula("(price / weight) * 1000")
    private BigDecimal pricePerKg;

    // Nouvelle gestion des images
    @ManyToOne
    @JoinColumn(name = "image_id")
    private Image image;

    // Champs supplémentaires pour enrichissement
    private String aromaticProfile;      // Profil aromatique global
    private Boolean organicCertification; // Certification bio
    private String mouture;               // Types de mouture (séparés par ;)
    private String producer;              // Nom du producteur
    private String espece;                // Espèce (Arabica, Robusta)

    // Garder priceRange pour compatibilité (devient calculé)
    private String priceRange;
}
```

### Modifications dans `Note.java`

```java
@Entity
public class Note {
    private String slug;
    private String description;
    private String iconUrl;
    private Integer displayOrder;
    private Boolean isActive;
}
```

### Nouveaux services

- `PriceRangeCriteriaService.java` : Gestion des critères
- `ImageService.java` : Gestion centralisée des images
- `NoteService.java` : Enrichir avec gestion des slugs

---

## 6. Impact sur le Frontend (Next.js + TypeScript)

### Modifications dans `shared/types/index.ts`

```typescript
export interface Coffee {
  // Nouveaux champs pour calcul automatique
  price?: number;
  weight?: number;
  pricePerKg?: number;

  // Nouvelle gestion des images
  image?: Image;
  imageUrl?: string; // Déprécié, utiliser image

  // Champs supplémentaires pour enrichissement
  aromaticProfile?: string;      // Profil aromatique global
  organicCertification?: boolean; // Certification bio
  mouture?: string;               // Types de mouture (séparés par ;)
  producer?: string;              // Nom du producteur
  espece?: string;                // Espèce (Arabica, Robusta)

  // Champs calculés
  priceRange?: string; // Calculé automatiquement par le backend

  // Autres champs existants inchangés...
}

export interface Image {
  id: number;
  url: string;
  source: 'UPLOAD' | 'EXTERNAL' | 'CLOUDINARY';
  uploadedBy?: User;
  copyrightInfo?: string;
  attributionText?: string;
  altText?: string;
  createdAt: string;
}

export interface Note {
  slug: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface PriceRangeCriteria {
  id: number;
  label: string;
  displayName: string;
  minPricePerKg: number;
  maxPricePerKg?: number;
  displayOrder: number;
  isActive: boolean;
}
```

### Nouveaux composants

- `<ImageAttribution />` : Affiche l'attribution d'image
- `<NoteCard />` : Carte de note avec icône
- `<PriceDisplay />` : Affichage du prix avec range calculé

### Nouvelles pages

**Frontend :**
- `/notes` : Liste des notes de dégustation avec icônes

**Backoffice :**
- `/settings/price-ranges` : Gestion des critères de prix
- `/coffees/notes` : Gestion enrichie des notes (avec upload d'icônes)

---

## 7. Migrations Flyway

### V14__add_price_and_weight_to_coffees.sql
```sql
ALTER TABLE coffees
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN weight INTEGER;
```

### V15__create_price_range_criteria.sql
```sql
CREATE TABLE price_range_criteria (...);
INSERT INTO price_range_criteria (...);
CREATE FUNCTION calculate_price_range(...);
CREATE TRIGGER trg_update_price_range ON coffees;
```

### V16__create_images_table.sql
```sql
CREATE TABLE images (...);
INSERT INTO images ... (migration);
ALTER TABLE coffees ADD COLUMN image_id;
ALTER TABLE roasters ADD COLUMN logo_id;
ALTER TABLE users ADD COLUMN avatar_id;
```

### V17__enrich_notes.sql
```sql
ALTER TABLE notes ADD COLUMN slug, description, icon_url, display_order, is_active;
UPDATE notes SET slug = ..., description = ...;
```

---

## 8. Ordre de mise en œuvre recommandé

1. **Phase 1 : Prix et Price Range**
   - Créer table `price_range_criteria`
   - Ajouter champs `price`, `weight` dans `coffees`
   - Implémenter calcul automatique
   - Mettre à jour backend, frontend, backoffice
   - Créer interface admin pour gérer les critères

2. **Phase 2 : Gestion des Images**
   - Créer table `images`
   - Migrer données existantes
   - Ajouter références dans tables existantes
   - Mettre à jour backend (entité Image, service)
   - Mettre à jour frontend (composant Attribution)

3. **Phase 3 : Notes Enrichies**
   - Ajouter champs dans table `notes`
   - Enrichir avec descriptions et slugs
   - Créer/uploader icônes SVG
   - Créer page `/notes` frontend
   - Améliorer interface backoffice

---

## 9. Checklist de validation

- [ ] Toutes les migrations Flyway s'exécutent sans erreur
- [ ] Les données existantes sont préservées
- [ ] Les triggers fonctionnent correctement
- [ ] Les entités Java sont synchronisées avec la DB
- [ ] Les types TypeScript correspondent aux DTOs backend
- [ ] Les tests unitaires passent
- [ ] Les tests d'intégration passent
- [ ] L'import CSV fonctionne avec les nouveaux champs
- [ ] La rétro-compatibilité est assurée
- [ ] La documentation est à jour

---

## 10. Risques et mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Perte de données lors migration images | Élevé | Faible | Backup DB avant migration, rollback plan |
| Performance dégradée (calculs prix) | Moyen | Moyen | Index sur price_per_kg, cache côté front |
| Incompatibilité API frontend/backend | Élevé | Moyen | Versionning API, période de transition |
| Slugs de notes en conflit | Faible | Faible | Contrainte UNIQUE, validation à l'import |

---

**Date de création :** 2025-11-15
**Auteur :** Claude (Product Owner Agent)
**Version :** 1.0
