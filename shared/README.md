# @sipzy/shared

Librairie partagee entre le frontend et le backoffice de l'application Sipzy.

## Structure

```
shared/
├── package.json          # Configuration du package
├── tsconfig.json         # Configuration TypeScript
├── index.ts              # Point d'entree principal
├── types/
│   └── index.ts         # Types TypeScript partages
├── lib/
│   ├── utils.ts         # Utilitaires (cn pour Tailwind)
│   └── api/
│       └── apiClient.ts # Client API de base avec rate limiting
├── components/
│   └── ui/
│       ├── Button.tsx   # Composant bouton
│       ├── Input.tsx    # Composant input
│       ├── Avatar.tsx   # Composant avatar
│       └── Badge.tsx    # Composant badge
└── README.md            # Ce fichier

```

## Installation

Cette librairie utilise des `peerDependencies`. Assurez-vous que les packages suivants sont installes dans votre projet :

- react ^19.0.0
- react-dom ^19.0.0
- axios ^1.7.9
- clsx ^2.1.1
- tailwind-merge ^2.6.0

## Utilisation

### Types

```typescript
import { User, Coffee, Review, ApiResponse } from '@sipzy/shared/types';
```

### Utilitaires

```typescript
import { cn } from '@sipzy/shared/lib/utils';

// Fusionner des classes Tailwind
const className = cn('px-4 py-2', isActive && 'bg-blue-500');
```

### Client API

```typescript
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor,
  getRateLimitStatus,
  getErrorMessage
} from '@sipzy/shared/lib/api';

// Creer un client API
const apiClient = createApiClient('http://localhost:8080');

// Configurer les interceptors
setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient, () => {
  // Callback pour gerer l'authentification echouee
  console.log('Unauthorized - redirection vers login');
});

// Utiliser le client
try {
  const response = await apiClient.get('/api/coffees');
  console.log(response.data);
} catch (error) {
  console.error(getErrorMessage(error));
}

// Verifier le status de rate limiting
const rateLimitInfo = getRateLimitStatus();
console.log(`Requetes restantes: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}`);
```

### Composants UI

```typescript
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Avatar } from '@sipzy/shared/components/ui/Avatar';
import { Badge } from '@sipzy/shared/components/ui/Badge';

function MyComponent() {
  return (
    <div>
      <Button variant="primary" size="md">
        Cliquez-moi
      </Button>

      <Input
        label="Email"
        type="email"
        placeholder="votre@email.com"
        error="Email invalide"
      />

      <Avatar
        src="https://example.com/avatar.jpg"
        fallback="John Doe"
        size="lg"
      />

      <Badge variant="success">Approuve</Badge>
    </div>
  );
}
```

## Exports disponibles

### Types (`@sipzy/shared/types`)
- `User`, `Coffee`, `Review`, `Roaster`, `Note`
- `LoginForm`, `RegisterForm`, `CoffeeForm`, `ReviewForm`
- `ApiResponse`, `ErrorResponse`, `PaginatedResponse`
- `AuthState`, `AuthResponse`
- Et bien d'autres...

### Utilitaires (`@sipzy/shared/lib/utils`)
- `cn()` - Fusion de classes Tailwind

### API Client (`@sipzy/shared/lib/api`)
- `createApiClient()` - Creer une instance axios
- `setupRequestInterceptor()` - Configurer l'interceptor de requete
- `setupResponseInterceptor()` - Configurer l'interceptor de reponse
- `getRateLimitStatus()` - Obtenir le status du rate limiting
- `isRateLimitWarning()` - Verifier si proche de la limite
- `getErrorMessage()` - Extraire le message d'erreur
- `getValidationErrors()` - Obtenir les erreurs de validation
- `setAuthToken()`, `getAuthToken()`, `removeAuthToken()` - Gestion du token
- `isAuthenticated()` - Verifier si authentifie

### Composants UI
- `Button` - Bouton avec variants et loading state
- `Input` - Input avec label, erreur et helper text
- `Avatar` - Avatar avec fallback initiales
- `Badge` - Badge avec variants

## Features

### Rate Limiting
Le client API inclut un support complet du rate limiting :
- Extraction automatique des headers `X-RateLimit-*`
- Detection de proximite de limite
- Auto-retry pour les requetes GET (conditions specifiques)
- Logging des warnings en developpement

### Gestion d'erreurs
- Extraction automatique des messages d'erreur
- Support des erreurs de validation
- Messages d'erreur en francais
- Types d'erreur TypeScript

### Token Management
- Stockage automatique du token JWT
- Ajout automatique dans les headers
- Fonctions utilitaires pour la gestion du token

## Notes

- Cette librairie est en mode `private: true` car elle est destinee a un usage interne
- Les composants UI utilisent Tailwind CSS avec un theme personnalise (couleurs `coffee-*` et `cream-*`)
- Le client API supporte le SSR/SSG (verification `typeof window !== 'undefined'`)
- Les interceptors loggent automatiquement en mode developpement

## Integration dans les projets

### Frontend (Next.js)

```typescript
// frontend/lib/api/apiClient.ts
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor
} from '@sipzy/shared/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = createApiClient(BASE_URL);

setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient, () => {
  // Rediriger vers la page de login
  window.location.href = '/login?expired=true';
});

export default apiClient;
```

### Backoffice (React)

```typescript
// backoffice/lib/api/apiClient.ts
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor
} from '@sipzy/shared/lib/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = createApiClient(BASE_URL);

setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient, () => {
  // Rediriger vers la page de login
  window.location.href = '/login';
});

export default apiClient;
```

## Developpement

Pour mettre a jour la librairie :

1. Modifier les fichiers dans `shared/`
2. Les changements sont immediatement disponibles dans frontend et backoffice (pas de build necessaire)
3. Verifier que les imports fonctionnent correctement dans les deux projets

## TODO

- [ ] Ajouter des tests unitaires
- [ ] Ajouter plus de composants UI communs
- [ ] Documenter les composants avec Storybook
- [ ] Ajouter un build step pour la production
- [ ] Publier sur npm (optionnel)
