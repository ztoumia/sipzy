# Quick Start - @sipzy/shared

Guide rapide pour demarrer avec la librairie partagee.

## Structure creee

```
D:\cursor\Sipzy\shared\
├── package.json              # Config du package
├── tsconfig.json             # Config TypeScript
├── index.ts                  # Point d'entree
├── .gitignore               # Fichiers ignores
├── README.md                # Doc principale
├── INTEGRATION.md           # Guide d'integration
├── MIGRATION_PLAN.md        # Plan de migration
├── VALIDATION.md            # Validation
├── types/
│   └── index.ts            # 253 lignes - Tous les types
├── lib/
│   ├── utils.ts            # 11 lignes - Utilitaire cn
│   └── api/
│       └── apiClient.ts    # 390 lignes - Client API + rate limiting
└── components/
    └── ui/
        ├── Button.tsx      # 74 lignes - Composant bouton
        ├── Input.tsx       # 55 lignes - Composant input
        ├── Avatar.tsx      # 67 lignes - Composant avatar
        └── Badge.tsx       # 49 lignes - Composant badge
```

**Total:** 899 lignes de code TypeScript

## Contenu

### Types (types/index.ts)
- ✅ User, Coffee, Review, Roaster, Note, Report
- ✅ LoginForm, RegisterForm, CoffeeForm, ReviewForm
- ✅ ApiResponse, ErrorResponse, PaginatedResponse
- ✅ AuthState, AuthResponse, AdminStats

### Utilitaires (lib/utils.ts)
- ✅ `cn()` - Fusion de classes Tailwind

### Client API (lib/api/apiClient.ts)
- ✅ `createApiClient()` - Creer instance axios
- ✅ `setupRequestInterceptor()` - Ajouter JWT token
- ✅ `setupResponseInterceptor()` - Gerer erreurs
- ✅ Rate limiting support complet
- ✅ Token management (set/get/remove)
- ✅ Error handling avec messages francais

### Composants UI
- ✅ `Button` - 5 variants, 3 sizes, loading state
- ✅ `Input` - Label, error, helper text
- ✅ `Avatar` - Image + fallback initiales
- ✅ `Badge` - 6 variants, 3 sizes

## Prochaines etapes

### 1. NE PAS installer les dependances
```bash
# ❌ NE PAS FAIRE:
cd shared
npm install

# ✅ Les dependances sont des peerDependencies
# Elles doivent etre installees dans frontend et backoffice
```

### 2. Configurer TypeScript (Frontend)
Ajouter dans `frontend/tsconfig.json`:
```json
"paths": {
  "@sipzy/shared": ["../shared/index.ts"],
  "@sipzy/shared/*": ["../shared/*"]
}
```

### 3. Configurer TypeScript (Backoffice)
Ajouter dans `backoffice/tsconfig.json`:
```json
"paths": {
  "@sipzy/shared": ["../shared/index.ts"],
  "@sipzy/shared/*": ["../shared/*"]
}
```

### 4. Configurer le bundler
Voir INTEGRATION.md pour:
- Next.js config (frontend)
- Vite config (backoffice)
- Tailwind config (les deux)

### 5. Migrer progressivement
Suivre MIGRATION_PLAN.md:
1. Jour 1: Configuration
2. Jour 2: Utilitaires et types
3. Jour 3: Client API
4. Jour 4: Composants UI
5. Jour 5: Nettoyage

## Usage rapide

### Types
```typescript
import { User, Coffee, ApiResponse } from '@sipzy/shared/types';
```

### Utilitaires
```typescript
import { cn } from '@sipzy/shared/lib/utils';
```

### Client API
```typescript
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor
} from '@sipzy/shared/lib/api';
```

### Composants
```typescript
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
```

## Documentation

- **README.md** - Documentation complete
- **INTEGRATION.md** - Guide d'integration detaille
- **MIGRATION_PLAN.md** - Plan de migration en 5 jours
- **VALIDATION.md** - Checklist de validation
- **QUICKSTART.md** - Ce fichier

## Status

✅ Structure creee
✅ Tous les fichiers presents
✅ Code copie et adapte
✅ Documentation complete
✅ Pret pour l'integration

**Date:** 2025-11-06
