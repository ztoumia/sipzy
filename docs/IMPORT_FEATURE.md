# Fonctionnalité d'Import - Backend Sipzy

## Vue d'ensemble

Une fonctionnalité complète d'import a été ajoutée au backend Sipzy pour permettre l'import en masse de cafés (coffees) et torréfacteurs (roasters) avec gestion automatique des images.

## Fonctionnalités principales

### ✅ Import de données
- **Import de roasters** : Création et mise à jour de torréfacteurs
- **Import de coffees** : Création et mise à jour de cafés
- **Import batch** : Import en masse de plusieurs roasters et coffees simultanément

### ✅ Gestion des images
- **Téléchargement automatique** : Les images sont téléchargées depuis des URLs externes
- **Upload vers Cloudinary** : Upload automatique avec transformations appropriées
- **Validation** : Vérification du format, taille (max 10 MB), et accessibilité
- **Gestion d'erreurs** : Si l'image échoue, l'entité est quand même créée avec un warning

### ✅ Mises à jour
- **Update par ID** : Fournir un ID pour mettre à jour une entité existante
- **Mise à jour partielle** : Seuls les champs fournis sont mis à jour
- **Auto-approval** : Option pour approuver automatiquement les coffees importés

### ✅ Résolution intelligente
- **Roasters** : Résolution par ID ou par nom
- **Notes** : Résolution par IDs ou par noms
- **Submitter** : Utilisation d'un user spécifique ou fallback vers admin

### ✅ Gestion d'erreurs robuste
- **Continue on error** : Option pour continuer l'import même en cas d'erreur
- **Validation complète** : Validation de tous les champs selon les règles métier
- **Messages détaillés** : Messages d'erreur et warnings détaillés pour chaque opération
- **Transactions** : Utilisation de transactions pour garantir la cohérence

## Architecture

### Structure des packages

```
com.sipzy.importer/
├── controller/
│   └── ImportController.java           # REST endpoints
├── dto/
│   ├── request/
│   │   ├── ImportRoasterRequest.java   # DTO pour import de roaster
│   │   ├── ImportCoffeeRequest.java    # DTO pour import de coffee
│   │   └── BatchImportRequest.java     # DTO pour import batch
│   └── response/
│       ├── ImportResult.java           # Résultat d'une opération
│       └── ImportResponse.java         # Réponse globale d'import
└── service/
    ├── ImportService.java              # Service principal d'import
    └── ImageDownloadService.java       # Service de téléchargement d'images
```

### Endpoints REST

Tous les endpoints nécessitent le rôle **ADMIN**.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/import/roaster` | Import d'un seul roaster |
| POST | `/api/import/coffee` | Import d'un seul coffee |
| POST | `/api/import/batch` | Import batch de roasters et coffees |
| POST | `/api/import/roasters` | Import de plusieurs roasters |
| POST | `/api/import/coffees` | Import de plusieurs coffees |
| GET | `/api/import/health` | Health check du service |

## Utilisation

### 1. Import d'un roaster

```bash
curl -X POST http://localhost:8080/api/import/roaster \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Café de Spécialité Paris",
    "description": "Torréfacteur artisan",
    "location": "Paris, France",
    "website": "https://example.com",
    "logoUrl": "https://example.com/logo.jpg",
    "isVerified": true
  }'
```

### 2. Import d'un coffee

```bash
curl -X POST http://localhost:8080/api/import/coffee \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ethiopian Yirgacheffe",
    "roasterId": 1,
    "origin": "Ethiopia",
    "process": "Natural",
    "variety": "Heirloom",
    "altitudeMin": 1800,
    "altitudeMax": 2200,
    "harvestYear": 2024,
    "priceRange": "€€€",
    "description": "Café éthiopien vibrant",
    "imageUrl": "https://example.com/coffee.jpg",
    "noteIds": [1, 2, 3],
    "autoApprove": false
  }'
```

### 3. Import batch

```bash
curl -X POST http://localhost:8080/api/import/batch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @batch-import-example.json
```

Voir `/backend/import-examples/batch-import-example.json` pour un exemple complet.

### 4. Mise à jour

Pour mettre à jour, il suffit de fournir l'ID :

```json
{
  "id": 1,
  "description": "Nouvelle description",
  "logoUrl": "https://example.com/new-logo.jpg"
}
```

## Cas d'usage

### Cas 1 : Import initial de données

Utiliser l'import batch pour créer des roasters et coffees :

```json
{
  "continueOnError": true,
  "autoApprove": false,
  "roasters": [ ... ],
  "coffees": [ ... ]
}
```

### Cas 2 : Mise à jour d'images

Mettre à jour l'image d'un coffee existant :

```json
{
  "id": 10,
  "imageUrl": "https://example.com/new-image.jpg"
}
```

### Cas 3 : Import depuis source externe

Si vous avez des données externes avec URLs d'images, le service :
1. Télécharge les images depuis les URLs
2. Upload vers Cloudinary
3. Crée les entités avec les URLs Cloudinary

### Cas 4 : Import avec erreurs partielles

Avec `continueOnError: true`, l'import continue même si certains items échouent :

```
Résultat : 10 total, 8 créés, 0 mis à jour, 2 erreurs, 0 skippés
```

Chaque résultat contient les détails de l'opération.

## Gestion des erreurs

### Types d'erreurs gérées

1. **Validation** : Champs manquants ou invalides
2. **Références** : Roaster ou notes introuvables
3. **Doublons** : Roaster avec nom existant
4. **Images** : Échec de téléchargement (génère un warning)
5. **Réseau** : Timeout ou URL inaccessible (pour images)

### Format de réponse d'erreur

```json
{
  "entityType": "COFFEE",
  "operation": "ERROR",
  "entityName": "My Coffee",
  "success": false,
  "errorMessage": "Roaster not found with ID: 999"
}
```

### Format de réponse avec warning

```json
{
  "entityType": "COFFEE",
  "operation": "CREATE",
  "entityId": 10,
  "entityName": "My Coffee",
  "success": true,
  "warning": "Failed to download image from URL: ..."
}
```

## Validation

### Roaster
- `name` : Requis, max 100 caractères, unique
- `description` : Max 1000 caractères
- `location` : Max 100 caractères
- `website` : Max 500 caractères
- `logoUrl` : Max 500 caractères, URL d'image valide

### Coffee
- `name` : Requis, 3-255 caractères
- `roasterId` ou `roasterName` : Requis
- `origin` : Max 100 caractères
- `process` : Max 50 caractères
- `variety` : Max 100 caractères
- `altitudeMin`, `altitudeMax` : 0-5000 mètres
- `harvestYear` : ≥ 2000
- `priceRange` : Doit correspondre au pattern `€{1,4}`
- `description` : Max 2000 caractères
- `imageUrl` : Max 500 caractères
- `noteIds` ou `noteNames` : 1-10 notes requises

## Sécurité

- ✅ **Authentication** : Tous les endpoints nécessitent un JWT valide
- ✅ **Authorization** : Rôle ADMIN requis pour tous les endpoints
- ✅ **Rate limiting** : Limites de taux appliquées
- ✅ **Validation** : Validation stricte des entrées
- ✅ **Transactions** : Garantie de cohérence des données

## Performance

### Optimisations
- **Cache invalidation** : Le cache est vidé après chaque import
- **Batch processing** : Import de plusieurs items en une seule transaction
- **Image streaming** : Téléchargement par streaming, pas de chargement complet en mémoire
- **Timeout configurables** : 10s connexion, 30s lecture pour images

### Limites
- Taille max des images : 10 MB
- Timeout de téléchargement : 30 secondes
- Taille max du batch : Limité par la mémoire et timeout HTTP

## Logs

Le service génère des logs détaillés :

```
INFO : Importing roaster: Café de Spécialité Paris
INFO : Created roaster: Café de Spécialité Paris with ID: 1
INFO : Downloading image from URL: https://example.com/image.jpg
INFO : Successfully uploaded image to Cloudinary: https://res.cloudinary.com/...
WARN : Failed to download image from URL: https://invalid.com/image.jpg
ERROR: Error importing coffee: My Coffee - Roaster not found
```

## Intégration Frontend

Le frontend peut appeler ces endpoints depuis le panneau admin :

```javascript
async function importCoffees(coffees) {
  const response = await fetch('/api/import/coffees', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(coffees)
  });

  const result = await response.json();

  if (result.success) {
    console.log('Import réussi:', result.data);
  } else {
    console.error('Import échoué:', result.message);
  }
}
```

## Tests

Pour tester la fonctionnalité :

1. **Obtenir un token admin** :
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sipzy.com", "password": "admin_password"}'
```

2. **Tester l'import d'un roaster** :
```bash
curl -X POST http://localhost:8080/api/import/roaster \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @backend/import-examples/single-roaster-import.json
```

3. **Vérifier le résultat** :
```bash
curl -X GET http://localhost:8080/api/roasters
```

## Fichiers d'exemple

Des exemples d'utilisation sont disponibles dans `/backend/import-examples/` :
- `batch-import-example.json` : Import batch complet
- `single-coffee-import.json` : Import d'un seul coffee
- `update-coffee-example.json` : Mise à jour d'un coffee
- `README.md` : Documentation complète avec tous les exemples

## Évolutions futures

### Potentielles améliorations

1. **Import asynchrone** : Pour les gros imports, utiliser des jobs asynchrones
2. **Import depuis fichier CSV** : Support de fichiers CSV en plus de JSON
3. **Validation préalable** : Endpoint pour valider les données avant import
4. **Rollback** : Possibilité d'annuler un import batch
5. **Dry-run mode** : Mode de simulation sans modification de la DB
6. **Import scheduling** : Planification d'imports récurrents
7. **Webhooks** : Notification de fin d'import
8. **Export** : Fonctionnalité d'export pour backup

## Dépendances

Le service utilise les dépendances existantes :
- Spring Boot 3.2.0
- Spring Data JPA
- Cloudinary SDK
- Jakarta Validation
- Lombok

Aucune nouvelle dépendance n'a été ajoutée.

## Maintenance

### Monitoring
- Vérifier les logs pour les erreurs récurrentes
- Surveiller le nombre d'imports échoués
- Vérifier la taille du cache Cloudinary

### Troubleshooting
- Si les images ne se téléchargent pas, vérifier la connectivité réseau
- Si les imports échouent, vérifier les logs pour les messages d'erreur
- Si le cache n'est pas invalidé, vérifier la configuration du cache

## Conclusion

Cette fonctionnalité d'import permet d'importer facilement des données de cafés et torréfacteurs dans Sipzy, avec une gestion robuste des erreurs et des images. Elle est prête à être utilisée par les administrateurs pour peupler la base de données.

Pour toute question ou support, consulter la documentation complète dans `/backend/import-examples/README.md`.
