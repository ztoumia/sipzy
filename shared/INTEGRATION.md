# Guide d'integration de @sipzy/shared

Ce guide explique comment integrer la librairie partagee dans les projets frontend et backoffice.

## Etape 1: Configuration de TypeScript

### Frontend (Next.js)

Ajouter dans `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@sipzy/shared": ["../shared/index.ts"],
      "@sipzy/shared/*": ["../shared/*"]
    }
  }
}
```

### Backoffice (Vite + React)

Ajouter dans `backoffice/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@sipzy/shared": ["../shared/index.ts"],
      "@sipzy/shared/*": ["../shared/*"]
    }
  }
}
```

## Etape 2: Configuration du bundler

### Frontend (Next.js)

Ajouter dans `frontend/next.config.js`:

```javascript
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

### Backoffice (Vite)

Ajouter dans `backoffice/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sipzy/shared': path.resolve(__dirname, '../shared'),
    },
  },
});
```

## Etape 3: Migration du code existant

### 1. Remplacer les imports de types

**Avant:**
```typescript
import { User, Coffee, Review } from '@/types';
```

**Apres:**
```typescript
import { User, Coffee, Review } from '@sipzy/shared/types';
```

### 2. Remplacer l'utilitaire cn

**Avant:**
```typescript
import { cn } from '@/lib/utils';
// ou
import { cn } from '@/lib/utils/cn';
```

**Apres:**
```typescript
import { cn } from '@sipzy/shared/lib/utils';
```

### 3. Adapter le client API

#### Frontend

**Avant (frontend/lib/api/apiClient.ts):**
```typescript
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... interceptors ...
```

**Apres:**
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
  // Gestion de l'authentification echouee
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
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
} from '@sipzy/shared/lib/api';
```

#### Backoffice

**Avant (backoffice/lib/api/apiClient.ts):**
```typescript
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... interceptors ...
```

**Apres:**
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
  // Gestion de l'authentification echouee
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
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
} from '@sipzy/shared/lib/api';
```

### 4. Remplacer les composants UI

**Avant:**
```typescript
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
```

**Apres:**
```typescript
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Avatar } from '@sipzy/shared/components/ui/Avatar';
import { Badge } from '@sipzy/shared/components/ui/Badge';
```

## Etape 4: Mettre a jour les imports dans tout le projet

Utilisez la commande de recherche et remplacement de votre IDE:

### Remplacements a effectuer:

1. **Types:**
   - `from '@/types'` → `from '@sipzy/shared/types'`
   - `from '../types'` → `from '@sipzy/shared/types'`

2. **Utilitaires:**
   - `from '@/lib/utils'` → `from '@sipzy/shared/lib/utils'`
   - `from '@/lib/utils/cn'` → `from '@sipzy/shared/lib/utils'`

3. **Composants UI (seulement pour Button, Input, Avatar, Badge):**
   - `from '@/components/ui/Button'` → `from '@sipzy/shared/components/ui/Button'`
   - `from '@/components/ui/Input'` → `from '@sipzy/shared/components/ui/Input'`
   - `from '@/components/ui/Avatar'` → `from '@sipzy/shared/components/ui/Avatar'`
   - `from '@/components/ui/Badge'` → `from '@sipzy/shared/components/ui/Badge'`

## Etape 5: Nettoyer les fichiers dupliques

Une fois la migration terminee, vous pouvez supprimer les fichiers dupliques:

### Frontend
```bash
# NE PAS supprimer si d'autres fichiers les utilisent encore
rm frontend/types/index.ts                    # Si tous les imports ont ete migres
rm frontend/lib/utils/cn.ts                   # Si tous les imports ont ete migres
rm frontend/components/ui/Button.tsx          # Si tous les imports ont ete migres
rm frontend/components/ui/Input.tsx           # Si tous les imports ont ete migres
rm frontend/components/ui/Avatar.tsx          # Si tous les imports ont ete migres
rm frontend/components/ui/Badge.tsx           # Si tous les imports ont ete migres
```

### Backoffice
```bash
# NE PAS supprimer si d'autres fichiers les utilisent encore
rm backoffice/types/index.ts                  # Si tous les imports ont ete migres
rm backoffice/lib/utils.ts                    # Si tous les imports ont ete migres
rm backoffice/components/ui/Button.tsx        # Si tous les imports ont ete migres
rm backoffice/components/ui/Input.tsx         # Si tous les imports ont ete migres
rm backoffice/components/ui/Avatar.tsx        # Si tous les imports ont ete migres
rm backoffice/components/ui/Badge.tsx         # Si tous les imports ont ete migres
```

## Etape 6: Tester l'integration

### Frontend
```bash
cd frontend
npm run dev
```

### Backoffice
```bash
cd backoffice
npm run dev
```

Verifiez que:
- [ ] Aucune erreur de compilation TypeScript
- [ ] Les composants UI s'affichent correctement
- [ ] Le client API fonctionne
- [ ] Les types sont correctement importes
- [ ] Les styles Tailwind sont appliques

## Etape 7: Ajouter de nouveaux composants partages

Pour ajouter un nouveau composant a la librairie:

1. **Creer le composant dans `shared/components/ui/`:**

```typescript
// shared/components/ui/Card.tsx
'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-coffee-200 bg-white p-6 shadow-sm',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
```

2. **Utiliser le nouveau composant:**

```typescript
import { Card } from '@sipzy/shared/components/ui/Card';

function MyComponent() {
  return (
    <Card>
      <h2>Mon contenu</h2>
    </Card>
  );
}
```

## Troubleshooting

### Erreur: "Cannot find module '@sipzy/shared'"

**Solution:** Verifier la configuration des paths dans `tsconfig.json`.

### Erreur: "Module parse failed"

**Solution:** Verifier que le package est bien transpile dans la config du bundler.

### Les styles Tailwind ne s'appliquent pas

**Solution:** S'assurer que `tailwind.config.js` inclut les fichiers de la librairie shared:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx}', // Ajouter cette ligne
  ],
  // ...
};
```

### Erreur TypeScript sur les imports de composants

**Solution:** Verifier que `@types/react` est installe et que la version correspond.

## Avantages de cette approche

1. **DRY (Don't Repeat Yourself):** Code partage entre frontend et backoffice
2. **Consistance:** Memes types et composants partout
3. **Maintenabilite:** Un seul endroit pour les modifications
4. **Type Safety:** TypeScript partage entre projets
5. **Performance:** Pas de package npm a publier/installer

## Notes importantes

- Ne pas installer les dependances dans `shared/` (elles sont `peerDependencies`)
- Les modifications dans `shared/` sont immediatement disponibles (hot reload)
- Utiliser des imports absolus (`@sipzy/shared/...`) pour la clarte
- Documenter les nouveaux composants dans le README
