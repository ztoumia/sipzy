#!/bin/bash

# Script de création des user stories dans GitHub Issues
# Repository: ztoumia/sipzy

# Configuration - Set GITHUB_TOKEN environment variable before running this script
# export GITHUB_TOKEN="your_github_token_here"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_OWNER="ztoumia"
REPO_NAME="sipzy"
API_URL="https://api.github.com"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set"
    echo "Please export your GitHub token: export GITHUB_TOKEN='your_token'"
    exit 1
fi

# Fonction pour créer une issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"

    curl -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer ${GITHUB_TOKEN}" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "${API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues" \
        -d "{
            \"title\": \"${title}\",
            \"body\": $(echo "$body" | jq -Rs .),
            \"labels\": ${labels}
        }"
}

echo "🚀 Création des user stories pour Sipzy..."
echo ""

# ============================================================
# EPIC 1: Système de Prix et Price Range Dynamique
# ============================================================

echo "📝 Epic 1: Système de Prix et Price Range"

# US-01
create_issue \
    "[US-01] En tant qu'administrateur, je veux configurer les critères de price range" \
    "## Description

En tant qu'administrateur du backoffice, je veux pouvoir configurer les critères de calcul du price range (€, €€, €€€, €€€€) afin de pouvoir les ajuster selon l'évolution du marché et des prix.

## Critères d'acceptation

- [ ] Une nouvelle page \`/settings/price-ranges\` est accessible dans le backoffice
- [ ] Je peux voir la liste des critères existants avec leurs seuils (min/max prix au kilo)
- [ ] Je peux créer un nouveau critère avec :
  - Label (€, €€, etc.)
  - Nom d'affichage (Économique, Premium, etc.)
  - Prix minimum au kilo
  - Prix maximum au kilo (optionnel pour le dernier niveau)
  - Ordre d'affichage
- [ ] Je peux modifier un critère existant
- [ ] Je peux activer/désactiver un critère
- [ ] Une validation empêche les chevauchements de plages de prix
- [ ] Les modifications sont immédiatement reflétées dans l'affichage des cafés

## Spécifications techniques

### Backend
- Créer table \`price_range_criteria\`
- Créer entité JPA \`PriceRangeCriteria.java\`
- Créer endpoints REST :
  - \`GET /api/admin/price-ranges\` - Lister les critères
  - \`POST /api/admin/price-ranges\` - Créer un critère
  - \`PUT /api/admin/price-ranges/{id}\` - Modifier un critère
  - \`DELETE /api/admin/price-ranges/{id}\` - Supprimer un critère
- Ajouter migration Flyway \`V15__create_price_range_criteria.sql\`

### Frontend Backoffice
- Créer page \`app/settings/price-ranges/page.tsx\`
- Créer composant \`PriceRangeForm\`
- Créer composant \`PriceRangeList\`
- Ajouter validation avec Zod

### Base de données
\`\`\`sql
CREATE TABLE price_range_criteria (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    min_price_per_kg DECIMAL(10,2) NOT NULL,
    max_price_per_kg DECIMAL(10,2),
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Données de test

\`\`\`sql
INSERT INTO price_range_criteria (label, display_name, min_price_per_kg, max_price_per_kg, display_order) VALUES
('€', 'Économique', 0, 25, 1),
('€€', 'Accessible', 25, 40, 2),
('€€€', 'Premium', 40, 60, 3),
('€€€€', 'Grand Cru', 60, NULL, 4);
\`\`\`

## DoD (Definition of Done)

- [ ] Code mergé dans la branche principale
- [ ] Tests unitaires écrits et passants
- [ ] Tests d'intégration écrits et passants
- [ ] Migration Flyway testée
- [ ] Documentation API mise à jour
- [ ] Revue de code effectuée
" \
    '["enhancement", "backend", "backoffice", "database", "epic:price-range"]'

sleep 2

# US-02
create_issue \
    "[US-02] En tant qu'utilisateur, je veux saisir le prix et le poids lors de l'import de café" \
    "## Description

En tant qu'utilisateur qui importe un café (via CSV ou formulaire), je veux saisir le prix et le poids du produit afin que le système calcule automatiquement le price range et le prix au kilo.

## Critères d'acceptation

- [ ] Le formulaire d'ajout/édition de café contient deux nouveaux champs :
  - Prix (en euros) - champ décimal
  - Poids (en grammes) - champ entier
- [ ] Le prix au kilo est calculé et affiché automatiquement : (prix / poids) × 1000
- [ ] Le price range (€, €€, €€€) est calculé automatiquement selon les critères configurés
- [ ] Les champs sont optionnels pour la rétro-compatibilité
- [ ] Le CSV d'import accepte les colonnes \`price\` et \`weight\`
- [ ] Un message d'aide explique le calcul du price range
- [ ] Validation : prix > 0, poids > 0

## Spécifications techniques

### Backend
- Ajouter champs dans \`Coffee.java\` :
  - \`private BigDecimal price;\`
  - \`private Integer weight;\`
  - \`@Formula(\"(price / weight) * 1000\") private BigDecimal pricePerKg;\`
- Créer fonction PostgreSQL \`calculate_price_range()\`
- Créer trigger pour calcul automatique
- Mettre à jour \`CoffeeDTO\` et \`CoffeeForm\`
- Mettre à jour \`ImportService\` pour traiter les nouveaux champs
- Ajouter migration Flyway \`V14__add_price_and_weight_to_coffees.sql\`

### Frontend
- Mettre à jour \`CoffeeForm\` dans shared
- Ajouter champs prix et poids dans le formulaire
- Afficher le prix au kilo calculé en temps réel
- Afficher le price range calculé
- Ajouter tooltip d'explication

### CSV Import
Nouveau format :
\`\`\`csv
name,roaster_name,origin,process,variety,altitude_min,altitude_max,harvest_year,price,weight,description,image_url,notes
Ethiopia Yirgacheffe,Café Lomi,Ethiopia,Washed,Heirloom,1800,2200,2024,18.50,250,\"Description...\",https://...,Citrus;Floral
\`\`\`

### Base de données
\`\`\`sql
ALTER TABLE coffees
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN weight INTEGER,
ADD COLUMN price_per_kg DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE WHEN weight > 0 THEN (price / weight) * 1000 ELSE NULL END
) STORED;

CREATE TRIGGER trg_update_price_range
BEFORE INSERT OR UPDATE OF price, weight ON coffees
FOR EACH ROW EXECUTE FUNCTION update_coffee_price_range();
\`\`\`

## Maquette UI

\`\`\`
┌─────────────────────────────────────────┐
│ Prix du café                            │
│ ┌─────────────────┐                     │
│ │ 18.50         € │                     │
│ └─────────────────┘                     │
│                                         │
│ Poids                                   │
│ ┌─────────────────┐                     │
│ │ 250           g │                     │
│ └─────────────────┘                     │
│                                         │
│ ℹ️ Prix au kilo: 74.00 € → €€€€         │
└─────────────────────────────────────────┘
\`\`\`

## DoD (Definition of Done)

- [ ] Code mergé dans la branche principale
- [ ] Tests unitaires écrits et passants
- [ ] Tests d'intégration pour l'import CSV
- [ ] Migration Flyway testée
- [ ] Formulaire frontend/backoffice fonctionnel
- [ ] Import CSV testé avec les nouveaux champs
- [ ] Documentation utilisateur mise à jour
" \
    '["enhancement", "backend", "frontend", "import", "epic:price-range"]'

sleep 2

# ============================================================
# EPIC 2: Gestion Avancée des Images
# ============================================================

echo "📝 Epic 2: Gestion des Images"

# US-03
create_issue \
    "[US-03] En tant que développeur, je veux une table centralisée pour gérer toutes les images" \
    "## Description

En tant que développeur, je veux créer une table \`images\` centralisée pour stocker toutes les métadonnées des images (cafés, torréfacteurs, utilisateurs, notes) afin d'améliorer la traçabilité et le respect des droits d'auteur.

## Critères d'acceptation

- [ ] Une nouvelle table \`images\` est créée avec tous les champs nécessaires
- [ ] Les images existantes sont migrées sans perte de données
- [ ] Une entité JPA \`Image.java\` est créée
- [ ] Un service \`ImageService.java\` centralise la logique métier
- [ ] Les relations sont établies avec Coffee, Roaster, User, Note
- [ ] Un rollback plan est documenté en cas d'échec

## Spécifications techniques

### Base de données

\`\`\`sql
CREATE TABLE images (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    source VARCHAR(20) NOT NULL,              -- 'UPLOAD', 'EXTERNAL', 'CLOUDINARY'
    entity_type VARCHAR(50),                   -- 'COFFEE', 'ROASTER', 'USER', 'NOTE'
    entity_id BIGINT,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    original_url VARCHAR(500),                 -- URL originale si externe
    copyright_info TEXT,
    attribution_text VARCHAR(255),
    alt_text VARCHAR(255),
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX idx_images_uploaded_by ON images(uploaded_by);
\`\`\`

### Migration des données

\`\`\`sql
-- Migration des images de café
INSERT INTO images (url, source, entity_type, entity_id, created_at)
SELECT image_url,
       CASE WHEN image_url LIKE '%cloudinary%' THEN 'CLOUDINARY' ELSE 'EXTERNAL' END,
       'COFFEE', id, created_at
FROM coffees WHERE image_url IS NOT NULL;

-- Idem pour roasters et users
\`\`\`

### Backend (Java)

\`\`\`java
@Entity
@Table(name = \"images\")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @Enumerated(EnumType.STRING)
    private ImageSource source; // UPLOAD, EXTERNAL, CLOUDINARY

    private String entityType;
    private Long entityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = \"uploaded_by\")
    private User uploadedBy;

    private String copyrightInfo;
    private String attributionText;
    private String altText;

    // ... autres champs
}
\`\`\`

### Service

\`\`\`java
@Service
public class ImageService {
    public Image createImage(String url, ImageSource source, User uploader);
    public Image updateImage(Long id, ImageUpdateDTO dto);
    public void deleteImage(Long id);
    public Image getImageForEntity(String entityType, Long entityId);
}
\`\`\`

## Stratégie de migration

1. **Phase 1** : Créer table \`images\` (sans toucher aux tables existantes)
2. **Phase 2** : Migrer les données existantes
3. **Phase 3** : Ajouter colonnes \`image_id\`, \`logo_id\`, \`avatar_id\`
4. **Phase 4** : Mettre à jour le code pour utiliser les nouvelles relations
5. **Phase 5** : (Future) Supprimer les anciennes colonnes \`*_url\`

## Rollback Plan

En cas de problème :
\`\`\`sql
DROP TABLE IF EXISTS images CASCADE;
ALTER TABLE coffees DROP COLUMN IF EXISTS image_id;
ALTER TABLE roasters DROP COLUMN IF EXISTS logo_id;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_id;
\`\`\`

## DoD

- [ ] Migration Flyway écrite et testée
- [ ] Backup de la DB effectué avant migration
- [ ] Entité Image créée avec tous les champs
- [ ] Service ImageService implémenté
- [ ] Tests unitaires passants
- [ ] Tests d'intégration passants
- [ ] Rollback plan testé
- [ ] 0 perte de données validée
" \
    '["enhancement", "backend", "database", "epic:images"]'

sleep 2

# US-04
create_issue \
    "[US-04] En tant qu'utilisateur, je veux voir l'attribution des images pour respecter les droits d'auteur" \
    "## Description

En tant qu'utilisateur du site, je veux voir l'attribution et la source des images affichées afin de respecter les droits d'auteur et connaître la provenance des visuels.

## Critères d'acceptation

- [ ] Un composant \`<ImageAttribution />\` affiche la source de l'image
- [ ] Pour les images externes, l'attribution s'affiche au survol ou en bas de l'image
- [ ] Pour les images uploadées, on affiche \"Uploadé par [username]\"
- [ ] L'attribution est discrète mais visible
- [ ] Un lien vers la source originale est présent si disponible
- [ ] L'alt text est toujours renseigné pour l'accessibilité

## Spécifications techniques

### Frontend Component

\`\`\`tsx
interface ImageAttributionProps {
  image: Image;
  position?: 'overlay' | 'below';
  size?: 'sm' | 'md';
}

export function ImageAttribution({ image, position = 'overlay' }: ImageAttributionProps) {
  if (!image.attributionText && !image.uploadedBy) return null;

  return (
    <div className={cn(
      \"image-attribution\",
      position === 'overlay' && \"absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs\"
    )}>
      {image.source === 'EXTERNAL' && image.attributionText && (
        <span>📸 {image.attributionText}</span>
      )}
      {image.source === 'UPLOAD' && image.uploadedBy && (
        <span>Uploadé par {image.uploadedBy.username}</span>
      )}
      {image.original_url && (
        <a href={image.original_url} target=\"_blank\" rel=\"noopener\" className=\"ml-2\">
          🔗 Source
        </a>
      )}
    </div>
  );
}
\`\`\`

### Utilisation

\`\`\`tsx
<div className=\"relative\">
  <Image src={coffee.image.url} alt={coffee.image.altText} />
  <ImageAttribution image={coffee.image} position=\"overlay\" />
</div>
\`\`\`

### Shared Types

\`\`\`typescript
export interface Image {
  id: number;
  url: string;
  source: 'UPLOAD' | 'EXTERNAL' | 'CLOUDINARY';
  uploadedBy?: User;
  copyrightInfo?: string;
  attributionText?: string;
  altText?: string;
  originalUrl?: string;
  createdAt: string;
}
\`\`\`

## Maquette UI

### Overlay
\`\`\`
┌────────────────────────────────────┐
│                                    │
│     [Image du café]                │
│                                    │
│                  ┌─────────────────┤
│                  │ 📸 Photo: Café │
│                  │ Lomi 🔗 Source  │
└──────────────────┴─────────────────┘
\`\`\`

### Below
\`\`\`
┌────────────────────────────────────┐
│     [Image du café]                │
└────────────────────────────────────┘
📸 Uploadé par jean_dupont
\`\`\`

## DoD

- [ ] Composant ImageAttribution créé dans shared/components
- [ ] Intégré sur toutes les pages affichant des images
- [ ] Tests unitaires du composant
- [ ] Accessibilité validée (alt text obligatoire)
- [ ] Design validé par l'équipe
- [ ] Documentation du composant
" \
    '["enhancement", "frontend", "ui", "epic:images"]'

sleep 2

# ============================================================
# EPIC 3: Notes de Dégustation Enrichies
# ============================================================

echo "📝 Epic 3: Notes de Dégustation"

# US-05
create_issue \
    "[US-05] En tant qu'administrateur, je veux enrichir les notes de dégustation avec descriptions et icônes" \
    "## Description

En tant qu'administrateur, je veux enrichir les notes de dégustation existantes avec des descriptions en français et des icônes visuelles afin d'améliorer l'expérience utilisateur et faciliter la compréhension des profils aromatiques.

## Critères d'acceptation

- [ ] Chaque note possède un slug unique (ex: \`citrus\`, \`dark-chocolate\`)
- [ ] Chaque note possède une description détaillée en français
- [ ] Chaque note possède une icône SVG associée
- [ ] Les 31 notes existantes sont toutes enrichies
- [ ] Les icônes sont stockées dans \`/public/icons/notes/\`
- [ ] Un endpoint API retourne les notes avec leurs descriptions et icônes

## Spécifications techniques

### Base de données

\`\`\`sql
ALTER TABLE notes
ADD COLUMN slug VARCHAR(100) UNIQUE,
ADD COLUMN description TEXT,
ADD COLUMN icon_url VARCHAR(500),
ADD COLUMN display_order INTEGER,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

CREATE UNIQUE INDEX idx_notes_slug ON notes(slug);

-- Migration des slugs
UPDATE notes SET
    slug = LOWER(REPLACE(name, ' ', '-')),
    display_order = id,
    is_active = TRUE;
\`\`\`

### Enrichissement des descriptions

Voir fichier \`import-examples/notes-enrichies.json\` pour les 31 notes enrichies.

Exemple :
\`\`\`sql
UPDATE notes SET
    description = 'Notes d''agrumes vives et acidulées rappelant le citron, l''orange, le pamplemousse ou la mandarine.',
    icon_url = '/icons/notes/citrus.svg'
WHERE name = 'Citrus';
\`\`\`

### Backend

\`\`\`java
@Entity
public class Note {
    private String slug;
    private String description;
    private String iconUrl;
    private Integer displayOrder;
    private Boolean isActive;

    // Nouveaux endpoints
    // GET /api/notes?include=description,icon
}
\`\`\`

### Icônes SVG

- Créer 31 icônes SVG minimales et cohérentes
- Format : 24x24px, stroke-width: 2, couleur adaptable
- Placer dans \`frontend/public/icons/notes/\`
- Noms : \`citrus.svg\`, \`berry.svg\`, etc.

### Fichier JSON de référence

\`\`\`json
{
  \"notes\": [
    {
      \"slug\": \"citrus\",
      \"name\": \"Citrus\",
      \"category\": \"Fruity\",
      \"description\": \"Notes d'agrumes vives...\",
      \"icon\": \"citrus.svg\"
    }
  ]
}
\`\`\`

## Assets à créer

- [ ] 31 icônes SVG (design minimaliste)
- [ ] Migration SQL avec les 31 descriptions
- [ ] Script d'import des icônes

## DoD

- [ ] Migration Flyway écrite et appliquée
- [ ] 31 descriptions ajoutées en français
- [ ] 31 icônes SVG créées et intégrées
- [ ] Endpoint API mis à jour
- [ ] Tests unitaires passants
- [ ] Validation avec l'équipe produit
" \
    '["enhancement", "backend", "database", "content", "epic:notes"]'

sleep 2

# US-06
create_issue \
    "[US-06] En tant qu'utilisateur, je veux voir une page dédiée aux notes de dégustation" \
    "## Description

En tant qu'utilisateur du site, je veux accéder à une page \`/notes\` présentant toutes les notes de dégustation avec leurs descriptions et icônes afin de mieux comprendre les profils aromatiques du café.

## Critères d'acceptation

- [ ] Une page \`/notes\` est accessible depuis le menu principal
- [ ] Les notes sont organisées par catégorie (Fruity, Floral, etc.)
- [ ] Chaque note affiche :
  - Son icône
  - Son nom
  - Sa description détaillée
- [ ] Un filtre permet de filtrer par catégorie
- [ ] La page est responsive (mobile, tablet, desktop)
- [ ] Les notes sont triées par display_order
- [ ] Le design est cohérent avec le reste du site

## Spécifications techniques

### Frontend Route

\`\`\`tsx
// app/notes/page.tsx
export default async function NotesPage() {
  const notes = await fetchNotes();
  const categories = [...new Set(notes.map(n => n.category))];

  return (
    <div className=\"container mx-auto py-8\">
      <h1>Guide des Notes de Dégustation</h1>
      <p>Découvrez les profils aromatiques du café</p>

      <CategoryFilter categories={categories} />

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
        {notes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
\`\`\`

### Composant NoteCard

\`\`\`tsx
interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Card className=\"hover:shadow-lg transition-shadow\">
      <CardHeader>
        <div className=\"flex items-center gap-3\">
          <img
            src={note.iconUrl}
            alt={note.name}
            className=\"w-12 h-12\"
          />
          <div>
            <CardTitle>{note.name}</CardTitle>
            <Badge variant=\"secondary\">{note.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className=\"text-muted-foreground\">
          {note.description}
        </p>
      </CardContent>
    </Card>
  );
}
\`\`\`

### API Endpoint

\`\`\`
GET /api/notes
Query params:
  - category: string (optional)
  - active: boolean (default: true)

Response:
[
  {
    \"id\": 1,
    \"slug\": \"citrus\",
    \"name\": \"Citrus\",
    \"category\": \"Fruity\",
    \"description\": \"Notes d'agrumes...\",
    \"iconUrl\": \"/icons/notes/citrus.svg\",
    \"displayOrder\": 1
  }
]
\`\`\`

## Maquette UI

\`\`\`
┌────────────────────────────────────────────────────────┐
│  Guide des Notes de Dégustation                        │
│  Découvrez les profils aromatiques du café             │
│                                                         │
│  [Toutes] [Fruity] [Floral] [Chocolatey] [Nutty]...   │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 🍊 Citrus    │ │ 🫐 Berry     │ │ 🌸 Floral    │   │
│  │ Fruity       │ │ Fruity       │ │ Floral       │   │
│  │              │ │              │ │              │   │
│  │ Notes d'agru-│ │ Arômes de    │ │ Notes flora- │   │
│  │ mes vives... │ │ baies...     │ │ les généra...│   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────────────────────────────────────┘
\`\`\`

## Navigation

Ajouter au menu principal :
\`\`\`tsx
<NavLink href=\"/notes\">
  <BookOpen className=\"w-4 h-4\" />
  Notes de dégustation
</NavLink>
\`\`\`

## SEO

- Title: \"Guide des Notes de Dégustation | Sipzy\"
- Description: \"Découvrez les 31 notes aromatiques du café : fruité, floral, chocolaté, et plus encore. Apprenez à identifier les profils de dégustation.\"
- OG Image: Générer une image avec quelques icônes de notes

## DoD

- [ ] Page /notes créée et fonctionnelle
- [ ] Composant NoteCard créé
- [ ] Filtre par catégorie fonctionnel
- [ ] Design responsive validé
- [ ] SEO optimisé
- [ ] Tests E2E écrits
- [ ] Documentation utilisateur
" \
    '["enhancement", "frontend", "ui", "epic:notes"]'

sleep 2

# US-07
create_issue \
    "[US-07] En tant qu'administrateur, je veux gérer les notes depuis le backoffice" \
    "## Description

En tant qu'administrateur du backoffice, je veux pouvoir gérer les notes de dégustation (créer, modifier, upload d'icônes) depuis une interface dédiée.

## Critères d'acceptation

- [ ] Une page \`/coffees/notes\` améliorée dans le backoffice
- [ ] Je peux créer une nouvelle note avec :
  - Nom
  - Slug (généré automatiquement, éditable)
  - Catégorie (sélection)
  - Description (textarea)
  - Icône (upload SVG)
  - Ordre d'affichage
- [ ] Je peux modifier une note existante
- [ ] Je peux uploader/remplacer l'icône d'une note
- [ ] Je peux réorganiser les notes par drag-and-drop
- [ ] Je peux activer/désactiver une note
- [ ] Validation : slug unique, icône au format SVG

## Spécifications techniques

### Backend Endpoints

\`\`\`
POST   /api/admin/notes              - Créer une note
PUT    /api/admin/notes/{id}         - Modifier une note
DELETE /api/admin/notes/{id}         - Supprimer une note
POST   /api/admin/notes/{id}/icon    - Upload icône
PUT    /api/admin/notes/reorder      - Réorganiser
\`\`\`

### Backoffice Page

\`\`\`tsx
// backoffice/app/coffees/notes/page.tsx
export default function NotesManagementPage() {
  return (
    <div className=\"space-y-6\">
      <PageHeader
        title=\"Gestion des Notes\"
        action={<CreateNoteButton />}
      />

      <Tabs defaultValue=\"all\">
        <TabsList>
          <TabsTrigger value=\"all\">Toutes</TabsTrigger>
          <TabsTrigger value=\"fruity\">Fruity</TabsTrigger>
          <TabsTrigger value=\"floral\">Floral</TabsTrigger>
          {/* etc */}
        </TabsList>

        <TabsContent value=\"all\">
          <NotesTable notes={notes} onReorder={handleReorder} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
\`\`\`

### Upload d'Icône

\`\`\`tsx
<input
  type=\"file\"
  accept=\".svg,image/svg+xml\"
  onChange={handleIconUpload}
/>

// Validation
const validateSVG = (file: File) => {
  if (file.type !== 'image/svg+xml') {
    throw new Error('Format invalide. SVG uniquement.');
  }
  if (file.size > 50000) { // 50KB max
    throw new Error('Fichier trop volumineux. Max 50KB.');
  }
};
\`\`\`

### Drag-and-Drop Reorder

Utiliser \`@dnd-kit/core\` :
\`\`\`tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function NotesTable({ notes, onReorder }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = notes.findIndex(n => n.id === active.id);
      const newIndex = notes.findIndex(n => n.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={notes} strategy={verticalListSortingStrategy}>
        {notes.map(note => <SortableNoteRow key={note.id} note={note} />)}
      </SortableContext>
    </DndContext>
  );
}
\`\`\`

### Form Validation

\`\`\`tsx
const noteSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(['Fruity', 'Floral', 'Chocolatey', 'Nutty', 'Sweet', 'Earthy', 'Spicy']),
  description: z.string().min(10).max(500),
  displayOrder: z.number().int().positive(),
  isActive: z.boolean()
});
\`\`\`

## Maquette UI

\`\`\`
┌────────────────────────────────────────────────────────┐
│  Gestion des Notes                    [+ Créer Note]   │
│                                                         │
│  [Toutes] [Fruity] [Floral] [Chocolatey] [Nutty]...   │
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │ ⋮⋮ 🍊 Citrus     Fruity    [Actif] [✏️] [🗑️]      ││
│  │ ⋮⋮ 🫐 Berry      Fruity    [Actif] [✏️] [🗑️]      ││
│  │ ⋮⋮ 🌸 Floral     Floral    [Actif] [✏️] [🗑️]      ││
│  └────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
\`\`\`

## DoD

- [ ] CRUD complet implémenté (backend + frontend)
- [ ] Upload d'icône SVG fonctionnel
- [ ] Drag-and-drop pour réorganisation
- [ ] Validation des formulaires
- [ ] Tests unitaires backend
- [ ] Tests E2E backoffice
- [ ] Documentation admin
" \
    '["enhancement", "backoffice", "backend", "epic:notes"]'

sleep 2

# ============================================================
# EPIC 4: Améliorations Transversales
# ============================================================

echo "📝 Epic 4: Améliorations Transversales"

# US-08
create_issue \
    "[US-08] Créer les migrations Flyway pour toutes les modifications DB" \
    "## Description

En tant que développeur, je veux créer toutes les migrations Flyway nécessaires pour déployer les nouvelles fonctionnalités de manière versionnée et traçable.

## Critères d'acceptation

- [ ] Toutes les migrations sont numérotées séquentiellement
- [ ] Chaque migration a un nom descriptif
- [ ] Chaque migration inclut un commentaire explicatif
- [ ] Toutes les migrations sont idempotentes
- [ ] Un script de rollback est fourni pour chaque migration
- [ ] Les migrations sont testées sur une DB vide
- [ ] Les migrations sont testées sur la DB de prod (copie)

## Migrations à créer

### V14__add_price_and_weight_to_coffees.sql

\`\`\`sql
-- V14: Add price and weight fields to coffees table
-- Allows users to enter exact price and weight, enabling automatic price range calculation

ALTER TABLE coffees
ADD COLUMN price DECIMAL(10,2) COMMENT 'Prix du café en euros',
ADD COLUMN weight INTEGER COMMENT 'Poids du café en grammes',
ADD COLUMN price_per_kg DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE WHEN weight > 0 THEN (price / weight) * 1000 ELSE NULL END
) STORED COMMENT 'Prix au kilo calculé automatiquement';

COMMENT ON COLUMN coffees.price IS 'Prix du café en euros';
COMMENT ON COLUMN coffees.weight IS 'Poids du café en grammes';
COMMENT ON COLUMN coffees.price_per_kg IS 'Prix au kilo calculé automatiquement';
\`\`\`

**Rollback:**
\`\`\`sql
ALTER TABLE coffees
DROP COLUMN IF EXISTS price_per_kg,
DROP COLUMN IF EXISTS weight,
DROP COLUMN IF EXISTS price;
\`\`\`

### V15__create_price_range_criteria.sql

\`\`\`sql
-- V15: Create price_range_criteria table and calculation logic
-- Enables administrators to configure dynamic price range thresholds

CREATE TABLE price_range_criteria (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    min_price_per_kg DECIMAL(10,2) NOT NULL,
    max_price_per_kg DECIMAL(10,2),
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_price_range_criteria_order ON price_range_criteria(display_order);
CREATE INDEX idx_price_range_criteria_active ON price_range_criteria(is_active);

-- Initial data
INSERT INTO price_range_criteria (label, display_name, min_price_per_kg, max_price_per_kg, display_order) VALUES
('€', 'Économique', 0, 25, 1),
('€€', 'Accessible', 25, 40, 2),
('€€€', 'Premium', 40, 60, 3),
('€€€€', 'Grand Cru', 60, NULL, 4);

-- Function to calculate price range
CREATE OR REPLACE FUNCTION calculate_price_range(p_price_per_kg DECIMAL)
RETURNS VARCHAR(20) AS \$\$
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
\$\$ LANGUAGE plpgsql;

-- Trigger to auto-update price_range
CREATE OR REPLACE FUNCTION update_coffee_price_range()
RETURNS TRIGGER AS \$\$
BEGIN
    IF NEW.price_per_kg IS NOT NULL THEN
        NEW.price_range := calculate_price_range(NEW.price_per_kg);
    END IF;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_price_range
BEFORE INSERT OR UPDATE OF price, weight ON coffees
FOR EACH ROW
EXECUTE FUNCTION update_coffee_price_range();
\`\`\`

**Rollback:**
\`\`\`sql
DROP TRIGGER IF EXISTS trg_update_price_range ON coffees;
DROP FUNCTION IF EXISTS update_coffee_price_range();
DROP FUNCTION IF EXISTS calculate_price_range(DECIMAL);
DROP TABLE IF EXISTS price_range_criteria CASCADE;
\`\`\`

### V16__create_images_table.sql

\`\`\`sql
-- V16: Create centralized images table
-- Provides better image metadata tracking and copyright management

CREATE TABLE images (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    source VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    original_url VARCHAR(500),
    copyright_info TEXT,
    attribution_text VARCHAR(255),
    alt_text VARCHAR(255),
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX idx_images_source ON images(source);
CREATE INDEX idx_images_uploaded_by ON images(uploaded_by);
CREATE INDEX idx_images_created_at ON images(created_at);

-- Migrate existing coffee images
INSERT INTO images (url, source, entity_type, entity_id, is_active, created_at)
SELECT image_url,
       CASE WHEN image_url LIKE '%cloudinary%' THEN 'CLOUDINARY' ELSE 'EXTERNAL' END,
       'COFFEE', id, TRUE, created_at
FROM coffees WHERE image_url IS NOT NULL;

-- Migrate existing roaster logos
INSERT INTO images (url, source, entity_type, entity_id, is_active, created_at)
SELECT logo_url,
       CASE WHEN logo_url LIKE '%cloudinary%' THEN 'CLOUDINARY' ELSE 'EXTERNAL' END,
       'ROASTER', id, TRUE, created_at
FROM roasters WHERE logo_url IS NOT NULL;

-- Migrate existing user avatars
INSERT INTO images (url, source, entity_type, entity_id, uploaded_by, is_active, created_at)
SELECT avatar_url,
       CASE WHEN avatar_url LIKE '%cloudinary%' THEN 'CLOUDINARY' ELSE 'EXTERNAL' END,
       'USER', id, id, TRUE, created_at
FROM users WHERE avatar_url IS NOT NULL;

-- Add foreign key columns (keep old columns for compatibility)
ALTER TABLE coffees ADD COLUMN image_id BIGINT REFERENCES images(id) ON DELETE SET NULL;
ALTER TABLE roasters ADD COLUMN logo_id BIGINT REFERENCES images(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN avatar_id BIGINT REFERENCES images(id) ON DELETE SET NULL;

-- Update foreign keys with migrated data
UPDATE coffees c SET image_id = i.id
FROM images i
WHERE i.entity_type = 'COFFEE' AND i.entity_id = c.id;

UPDATE roasters r SET logo_id = i.id
FROM images i
WHERE i.entity_type = 'ROASTER' AND i.entity_id = r.id;

UPDATE users u SET avatar_id = i.id
FROM images i
WHERE i.entity_type = 'USER' AND i.entity_id = u.id;
\`\`\`

**Rollback:**
\`\`\`sql
ALTER TABLE coffees DROP COLUMN IF EXISTS image_id;
ALTER TABLE roasters DROP COLUMN IF EXISTS logo_id;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_id;
DROP TABLE IF EXISTS images CASCADE;
\`\`\`

### V17__enrich_notes.sql

\`\`\`sql
-- V17: Enrich notes with slug, description, and icon
-- Improves user experience with detailed tasting note information

ALTER TABLE notes
ADD COLUMN slug VARCHAR(100) UNIQUE,
ADD COLUMN description TEXT,
ADD COLUMN icon_url VARCHAR(500),
ADD COLUMN display_order INTEGER,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

CREATE UNIQUE INDEX idx_notes_slug ON notes(slug);
CREATE INDEX idx_notes_display_order ON notes(display_order);

-- Generate slugs for existing notes
UPDATE notes SET
    slug = LOWER(REPLACE(name, ' ', '-')),
    display_order = id,
    is_active = TRUE;

-- Add descriptions (examples, full list in separate SQL file)
UPDATE notes SET description = 'Notes d''agrumes vives et acidulées rappelant le citron, l''orange, le pamplemousse ou la mandarine. Ces arômes apportent une fraîcheur et une vivacité caractéristiques.' WHERE name = 'Citrus';
UPDATE notes SET description = 'Arômes de baies rouges et noires comme la framboise, la myrtille, la mûre ou la fraise. Ces notes fruitées ajoutent une douceur délicate et complexe.' WHERE name = 'Berry';
-- [...] (voir notes-enrichies.json pour la liste complète)

-- Add icon URLs
UPDATE notes SET icon_url = '/icons/notes/' || slug || '.svg';
\`\`\`

**Rollback:**
\`\`\`sql
ALTER TABLE notes
DROP COLUMN IF EXISTS slug,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS icon_url,
DROP COLUMN IF EXISTS display_order,
DROP COLUMN IF EXISTS is_active;
\`\`\`

## Tests de migration

\`\`\`bash
# Test sur DB vide
docker-compose up -d postgres
./gradlew flywayMigrate

# Test rollback
./gradlew flywayUndo

# Test sur copie de prod
pg_dump prod_db > prod_backup.sql
createdb test_migration
psql test_migration < prod_backup.sql
./gradlew flywayMigrate
\`\`\`

## DoD

- [ ] Toutes les migrations créées et testées
- [ ] Scripts de rollback testés
- [ ] Documentation des migrations
- [ ] Tests sur DB vide réussis
- [ ] Tests sur copie de prod réussis
- [ ] Revue de code effectuée
" \
    '["database", "migration", "backend", "epic:database"]'

sleep 2

# US-09
create_issue \
    "[US-09] Mettre à jour la documentation et les types TypeScript" \
    "## Description

En tant que développeur, je veux que tous les types TypeScript soient synchronisés avec les nouvelles structures de données et que la documentation soit à jour.

## Critères d'acceptation

- [ ] Les types dans \`shared/types/index.ts\` sont à jour
- [ ] Les DTOs backend correspondent aux types frontend
- [ ] La documentation OpenAPI (Swagger) est à jour
- [ ] Le README est mis à jour avec les nouvelles fonctionnalités
- [ ] Des exemples d'utilisation sont fournis
- [ ] Les schémas de validation Zod sont synchronisés

## Spécifications techniques

### shared/types/index.ts

\`\`\`typescript
// Nouveaux types
export interface PriceRangeCriteria {
  id: number;
  label: string;
  displayName: string;
  minPricePerKg: number;
  maxPricePerKg?: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: number;
  url: string;
  source: 'UPLOAD' | 'EXTERNAL' | 'CLOUDINARY';
  entityType?: string;
  entityId?: number;
  uploadedBy?: User;
  originalUrl?: string;
  copyrightInfo?: string;
  attributionText?: string;
  altText?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types mis à jour
export interface Coffee {
  // Nouveaux champs
  price?: number;
  weight?: number;
  pricePerKg?: number;
  image?: Image;

  // Champs existants modifiés
  imageUrl?: string; // Déprécié, utiliser image
  priceRange?: string; // Calculé automatiquement

  // Autres champs inchangés...
}

export interface Note {
  // Nouveaux champs
  slug: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive: boolean;

  // Champs existants...
  id: number;
  name: string;
  category: string;
  createdAt: string;
}

// Nouveaux types de formulaires
export interface CoffeeFormData {
  name: string;
  roasterId?: number;
  roasterName?: string;
  origin?: string;
  process?: string;
  variety?: string;
  altitudeMin?: number;
  altitudeMax?: number;
  harvestYear?: number;
  price?: number;        // Nouveau
  weight?: number;       // Nouveau
  description?: string;
  imageFile?: File;      // Nouveau (upload)
  imageUrl?: string;
  noteIds: number[];
}

export interface PriceRangeCriteriaForm {
  label: string;
  displayName: string;
  minPricePerKg: number;
  maxPricePerKg?: number;
  displayOrder: number;
}

export interface NoteForm {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  iconFile?: File;
  displayOrder?: number;
}
\`\`\`

### Validation Zod

\`\`\`typescript
// shared/validation/schemas.ts
export const coffeeFormSchema = z.object({
  name: z.string().min(2).max(255),
  roasterId: z.number().optional(),
  roasterName: z.string().optional(),
  price: z.number().positive().optional(),
  weight: z.number().int().positive().optional(),
  // ... autres champs
}).refine(data => {
  // Si prix ET poids sont fournis, on calcule le price range
  if (data.price && data.weight) {
    return data.weight > 0;
  }
  return true;
}, {
  message: \"Le poids doit être supérieur à 0 si un prix est fourni\"
});

export const priceRangeCriteriaSchema = z.object({
  label: z.string().min(1).max(20),
  displayName: z.string().min(1).max(50),
  minPricePerKg: z.number().nonnegative(),
  maxPricePerKg: z.number().positive().optional(),
  displayOrder: z.number().int().positive()
}).refine(data => {
  if (data.maxPricePerKg) {
    return data.maxPricePerKg > data.minPricePerKg;
  }
  return true;
}, {
  message: \"Le prix max doit être supérieur au prix min\"
});

export const noteFormSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category: z.enum(['Fruity', 'Floral', 'Chocolatey', 'Nutty', 'Sweet', 'Earthy', 'Spicy']),
  description: z.string().min(10).max(500).optional(),
  displayOrder: z.number().int().positive().optional()
});

export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  entityType: z.enum(['COFFEE', 'ROASTER', 'USER', 'NOTE']),
  entityId: z.number().optional(),
  copyrightInfo: z.string().optional(),
  attributionText: z.string().optional(),
  altText: z.string().max(255)
}).refine(data => {
  // Validate file type
  return data.file.type.startsWith('image/');
}, {
  message: \"Le fichier doit être une image\"
}).refine(data => {
  // Max 5MB
  return data.file.size <= 5 * 1024 * 1024;
}, {
  message: \"La taille du fichier ne doit pas dépasser 5MB\"
});
\`\`\`

### Documentation OpenAPI

Mettre à jour \`backend/src/main/java/.../config/OpenApiConfig.java\` et les annotations:

\`\`\`java
@Operation(summary = \"Create a new coffee with price and weight\")
@ApiResponses(value = {
    @ApiResponse(responseCode = \"201\", description = \"Coffee created\"),
    @ApiResponse(responseCode = \"400\", description = \"Invalid input\")
})
public ResponseEntity<CoffeeDTO> createCoffee(@Valid @RequestBody CoffeeCreateDTO dto) {
    // ...
}
\`\`\`

### README.md

Ajouter section :

\`\`\`markdown
## Nouvelles Fonctionnalités (v2.0)

### Système de Prix Dynamique
- Saisie du prix et du poids lors de l'import
- Calcul automatique du price range (€, €€, €€€)
- Configuration des critères depuis le backoffice

### Gestion Avancée des Images
- Traçabilité complète des images
- Attribution et droits d'auteur
- Source (upload, externe, Cloudinary)

### Notes de Dégustation Enrichies
- 31 notes avec descriptions en français
- Icônes SVG pour chaque note
- Page dédiée \`/notes\`
\`\`\`

## DoD

- [ ] Tous les types TypeScript mis à jour
- [ ] Schémas Zod créés et testés
- [ ] Documentation OpenAPI à jour
- [ ] README mis à jour
- [ ] Tests de types passants (\`tsc --noEmit\`)
- [ ] Pas de \`any\` dans le code
" \
    '["documentation", "typescript", "frontend", "backend"]'

sleep 2

echo ""
echo "✅ Toutes les user stories ont été créées avec succès !"
echo ""
echo "📊 Récapitulatif :"
echo "   - Epic 1: Système de Prix (2 US)"
echo "   - Epic 2: Gestion des Images (2 US)"
echo "   - Epic 3: Notes de Dégustation (3 US)"
echo "   - Epic 4: Améliorations Transversales (2 US)"
echo "   TOTAL: 9 User Stories"
echo ""
echo "🔗 Voir les issues : https://github.com/${REPO_OWNER}/${REPO_NAME}/issues"
