# Plan de Migration vers @sipzy/shared

Ce document presente un plan detaille pour migrer progressivement le frontend et le backoffice vers la librairie partagee.

## Vue d'ensemble

La migration se fait en 3 phases:
1. **Phase 1:** Configuration et verification (AVANT d'installer les dependances)
2. **Phase 2:** Migration progressive
3. **Phase 3:** Nettoyage et consolidation

## Phase 1: Configuration (A FAIRE MAINTENANT)

### 1.1 Configurer TypeScript (Frontend)

**Fichier:** `frontend/tsconfig.json`

Ajouter dans `compilerOptions`:
```json
"paths": {
  "@/*": ["./src/*"],
  "@sipzy/shared": ["../shared/index.ts"],
  "@sipzy/shared/*": ["../shared/*"]
}
```

### 1.2 Configurer TypeScript (Backoffice)

**Fichier:** `backoffice/tsconfig.json`

Ajouter dans `compilerOptions`:
```json
"paths": {
  "@/*": ["./src/*"],
  "@sipzy/shared": ["../shared/index.ts"],
  "@sipzy/shared/*": ["../shared/*"]
}
```

### 1.3 Configurer Next.js (Frontend)

**Fichier:** `frontend/next.config.js`

```javascript
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sipzy/shared'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@sipzy/shared': path.resolve(__dirname, '../shared'),
    };
    return config;
  },
};

module.exports = nextConfig;
```

### 1.4 Configurer Vite (Backoffice)

**Fichier:** `backoffice/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sipzy/shared': path.resolve(__dirname, '../shared'),
    },
  },
});
```

### 1.5 Configurer Tailwind (Frontend et Backoffice)

Ajouter dans `tailwind.config.js` des deux projets:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx}', // AJOUTER CETTE LIGNE
  ],
  // ... reste de la config
};
```

### 1.6 Tester la configuration

```bash
# Frontend
cd frontend
npm run dev

# Backoffice (dans un autre terminal)
cd backoffice
npm run dev
```

Si tout compile sans erreur, passer a la Phase 2.

## Phase 2: Migration Progressive

### 2.1 Migrer les utilitaires (FACILE - Commencer par ca)

#### Etape 1: Trouver tous les fichiers qui utilisent `cn`

```bash
# Frontend
cd frontend
grep -r "from '@/lib/utils'" src/
grep -r "from '@/lib/utils/cn'" src/

# Backoffice
cd backoffice
grep -r "from '@/lib/utils'" src/
grep -r "from '../lib/utils'" src/
```

#### Etape 2: Remplacer les imports

**Rechercher:** `from '@/lib/utils'` ou `from '@/lib/utils/cn'`
**Remplacer par:** `from '@sipzy/shared/lib/utils'`

#### Etape 3: Verifier

```bash
npm run dev
```

Si ca compile, supprimer les anciens fichiers:
```bash
# Frontend
rm frontend/lib/utils/cn.ts   # Si le dossier utils est vide
rmdir frontend/lib/utils       # Si vide

# Backoffice
rm backoffice/lib/utils.ts
```

### 2.2 Migrer les types (MOYEN - Faire ensuite)

#### Etape 1: Identifier les fichiers qui utilisent les types

```bash
# Frontend
cd frontend
grep -r "from '@/types'" src/
grep -r "from '../types'" src/

# Backoffice
cd backoffice
grep -r "from '@/types'" src/
grep -r "from '../types'" src/
```

#### Etape 2: Remplacer progressivement

**Strategie recommandee:** Migrer par module/feature

Exemple - Migrer le module auth:
```bash
# Trouver tous les fichiers du module auth
find src/features/auth -name "*.ts" -o -name "*.tsx"

# Remplacer dans ces fichiers seulement
# Rechercher: from '@/types'
# Remplacer: from '@sipzy/shared/types'
```

#### Etape 3: Tester chaque module migre

```bash
npm run dev
# Tester la fonctionnalite du module migre
```

#### Etape 4: Une fois tous les modules migres

```bash
# Frontend
rm frontend/types/index.ts

# Backoffice
rm backoffice/types/index.ts
```

### 2.3 Migrer le client API (DIFFICILE - Faire en dernier)

#### Etape 1: Creer le nouveau client API (Frontend)

**Fichier:** `frontend/lib/api/apiClient.ts`

```typescript
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor,
} from '@sipzy/shared/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = createApiClient(BASE_URL);

setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient, () => {
  // Callback pour authentification echouee
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login?expired=true';
  }
});

export default apiClient;

// Re-exporter les utilitaires
export {
  getRateLimitStatus,
  isRateLimitWarning,
  getErrorMessage,
  getValidationErrors,
  unwrapResponse,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
} from '@sipzy/shared/lib/api';
```

#### Etape 2: Faire de meme pour le Backoffice

**Fichier:** `backoffice/lib/api/apiClient.ts`

```typescript
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor,
} from '@sipzy/shared/lib/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = createApiClient(BASE_URL);

setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient, () => {
  // Callback pour authentification echouee
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
});

export default apiClient;

// Re-exporter les utilitaires
export {
  getRateLimitStatus,
  isRateLimitWarning,
  getErrorMessage,
  getValidationErrors,
  unwrapResponse,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
} from '@sipzy/shared/lib/api';
```

#### Etape 3: Tester l'authentification

1. Tester le login
2. Tester les requetes authentifiees
3. Tester la gestion d'erreur 401
4. Tester le rate limiting

### 2.4 Migrer les composants UI (FACILE)

Pour chaque composant (Button, Input, Avatar, Badge):

#### Etape 1: Identifier les utilisations

```bash
# Exemple pour Button
grep -r "from '@/components/ui/Button'" src/
grep -r "from '../components/ui/Button'" src/
```

#### Etape 2: Remplacer les imports

**Rechercher:** `from '@/components/ui/Button'`
**Remplacer par:** `from '@sipzy/shared/components/ui/Button'`

#### Etape 3: Verifier visuellement

```bash
npm run dev
# Verifier que les composants s'affichent correctement
```

#### Etape 4: Supprimer les anciens composants

```bash
# Frontend
rm frontend/components/ui/Button.tsx
rm frontend/components/ui/Input.tsx
rm frontend/components/ui/Avatar.tsx
rm frontend/components/ui/Badge.tsx

# Backoffice
rm backoffice/components/ui/Button.tsx
rm backoffice/components/ui/Input.tsx
rm backoffice/components/ui/Avatar.tsx
rm backoffice/components/ui/Badge.tsx
```

## Phase 3: Nettoyage et Consolidation

### 3.1 Verifier qu'aucun fichier duplique n'existe

```bash
# Frontend
ls frontend/types/        # Doit etre vide ou supprime
ls frontend/lib/utils/    # Doit etre vide ou supprime
ls frontend/components/ui/Button.tsx  # Doit etre supprime

# Backoffice
ls backoffice/types/      # Doit etre vide ou supprime
ls backoffice/lib/utils.ts # Doit etre supprime
ls backoffice/components/ui/Button.tsx  # Doit etre supprime
```

### 3.2 Executer les tests

```bash
# Frontend
cd frontend
npm run test  # Si vous avez des tests

# Backoffice
cd backoffice
npm run test  # Si vous avez des tests
```

### 3.3 Tester manuellement

- [ ] Login fonctionne
- [ ] Logout fonctionne
- [ ] Navigation entre les pages
- [ ] Affichage des composants UI
- [ ] Gestion des erreurs API
- [ ] Rate limiting (si applicable)

### 3.4 Commit et push

```bash
cd D:\cursor\Sipzy
git add .
git commit -m "feat: Add shared library for common code between frontend and backoffice"
git push
```

## Checklist finale

### Configuration
- [ ] TypeScript config (Frontend)
- [ ] TypeScript config (Backoffice)
- [ ] Next.js config (Frontend)
- [ ] Vite config (Backoffice)
- [ ] Tailwind config (Frontend)
- [ ] Tailwind config (Backoffice)

### Migration
- [ ] Utilitaires (cn) - Frontend
- [ ] Utilitaires (cn) - Backoffice
- [ ] Types - Frontend
- [ ] Types - Backoffice
- [ ] Client API - Frontend
- [ ] Client API - Backoffice
- [ ] Button - Frontend
- [ ] Button - Backoffice
- [ ] Input - Frontend
- [ ] Input - Backoffice
- [ ] Avatar - Frontend
- [ ] Avatar - Backoffice
- [ ] Badge - Frontend
- [ ] Badge - Backoffice

### Nettoyage
- [ ] Supprimer fichiers dupliques Frontend
- [ ] Supprimer fichiers dupliques Backoffice
- [ ] Verifier aucune erreur TypeScript
- [ ] Tester toutes les fonctionnalites

### Documentation
- [ ] Lire README.md
- [ ] Lire INTEGRATION.md
- [ ] Lire MIGRATION_PLAN.md

## Ordre de migration recommande

1. **Jour 1:** Configuration (Phase 1)
   - Configurer TypeScript, bundlers, Tailwind
   - Tester que tout compile

2. **Jour 2:** Utilitaires et Types (Phase 2.1 et 2.2)
   - Migrer `cn` utility
   - Migrer les types progressivement

3. **Jour 3:** Client API (Phase 2.3)
   - Migrer le client API
   - Tester authentification et requetes

4. **Jour 4:** Composants UI (Phase 2.4)
   - Migrer Button, Input, Avatar, Badge
   - Verifier visuellement

5. **Jour 5:** Nettoyage (Phase 3)
   - Supprimer fichiers dupliques
   - Tests finaux
   - Commit et push

## Rollback en cas de probleme

Si vous rencontrez des problemes:

1. **Git revert:**
   ```bash
   git revert HEAD
   ```

2. **Ou restaurer manuellement:**
   - Copier les anciens fichiers depuis le backoffice ou frontend
   - Restaurer les anciens imports

## Support

Pour toute question ou probleme:
1. Consulter INTEGRATION.md
2. Consulter README.md
3. Verifier la configuration des paths
4. Verifier que Tailwind inclut les fichiers shared

## Notes importantes

- **NE PAS** installer `npm install` dans le dossier `shared/`
- Les dependances sont des `peerDependencies`
- Les modifications dans `shared/` sont immediatement disponibles (hot reload)
- Toujours tester apres chaque migration de module
