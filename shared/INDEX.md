# Index - Documentation @sipzy/shared

Guide complet pour naviguer dans la documentation de la librairie partagee.

## Documents disponibles

### 1. QUICKSTART.md ⚡
**Pour:** Demarrer rapidement
**Contenu:** Vue d'ensemble, structure, prochaines etapes
**Temps de lecture:** 3 minutes

### 2. README.md 📚
**Pour:** Documentation complete
**Contenu:** Installation, utilisation, exemples, features
**Temps de lecture:** 10 minutes

### 3. INTEGRATION.md 🔧
**Pour:** Integrer dans frontend/backoffice
**Contenu:** Config TypeScript, bundlers, Tailwind, migration
**Temps de lecture:** 15 minutes

### 4. MIGRATION_PLAN.md 📋
**Pour:** Plan de migration detaille
**Contenu:** 3 phases, 5 jours, checklist complete
**Temps de lecture:** 20 minutes

### 5. VALIDATION.md ✅
**Pour:** Valider la creation
**Contenu:** Checklist, verification, commandes
**Temps de lecture:** 5 minutes

### 6. CREATION_REPORT.md 📊
**Pour:** Rapport detaille de creation
**Contenu:** Stats, contenu, avantages, conclusion
**Temps de lecture:** 15 minutes

### 7. INDEX.md 🗂️
**Pour:** Navigation dans la documentation
**Contenu:** Ce fichier

## Par cas d'usage

### Je veux comprendre rapidement
1. Lire QUICKSTART.md
2. Lire README.md

### Je veux integrer dans mon projet
1. Lire QUICKSTART.md
2. Lire INTEGRATION.md (section config)
3. Appliquer les configs
4. Tester avec un import simple

### Je veux migrer tout le code existant
1. Lire MIGRATION_PLAN.md
2. Suivre les 5 phases
3. Utiliser les checklists

### Je veux valider la creation
1. Lire VALIDATION.md
2. Executer les commandes de verification

### Je veux les stats et details
1. Lire CREATION_REPORT.md

## Structure du code

```
shared/
├── types/index.ts              # Types TypeScript
├── lib/utils.ts                # Utilitaire cn
├── lib/api/apiClient.ts        # Client API
└── components/ui/              # Composants UI
    ├── Button.tsx
    ├── Input.tsx
    ├── Avatar.tsx
    └── Badge.tsx
```

## Exports principaux

### Types
```typescript
import { User, Coffee, Review, ApiResponse } from '@sipzy/shared/types';
```

### Utilitaires
```typescript
import { cn } from '@sipzy/shared/lib/utils';
```

### API Client
```typescript
import {
  createApiClient,
  setupRequestInterceptor,
  setupResponseInterceptor,
  getErrorMessage
} from '@sipzy/shared/lib/api';
```

### Composants
```typescript
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Avatar } from '@sipzy/shared/components/ui/Avatar';
import { Badge } from '@sipzy/shared/components/ui/Badge';
```

## Configuration requise

### TypeScript (Frontend + Backoffice)
```json
"paths": {
  "@sipzy/shared": ["../shared/index.ts"],
  "@sipzy/shared/*": ["../shared/*"]
}
```

### Next.js (Frontend)
```javascript
transpilePackages: ['@sipzy/shared']
```

### Vite (Backoffice)
```typescript
alias: {
  '@sipzy/shared': path.resolve(__dirname, '../shared')
}
```

### Tailwind (Les deux)
```javascript
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  '../shared/**/*.{js,ts,jsx,tsx}'
]
```

## Ordre de lecture recommande

### Premier contact (15 minutes)
1. QUICKSTART.md (3 min)
2. README.md (10 min)
3. Tester un import simple (2 min)

### Integration complete (1 heure)
1. QUICKSTART.md (3 min)
2. INTEGRATION.md (15 min)
3. Appliquer configs (20 min)
4. Tester compilation (2 min)
5. MIGRATION_PLAN.md - Phase 1 (20 min)

### Migration complete (5 jours)
Suivre MIGRATION_PLAN.md jour par jour.

## Commandes utiles

### Verifier la structure
```bash
ls -R D:\cursor\Sipzy\shared
```

### Compter les lignes
```bash
find D:\cursor\Sipzy\shared -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

### Lire un document
```bash
cat D:\cursor\Sipzy\shared\QUICKSTART.md
```

## FAQ rapide

**Q: Dois-je installer npm dans shared/?**
A: NON! Les dependances sont des peerDependencies.

**Q: Par quoi commencer?**
A: Lire QUICKSTART.md puis configurer TypeScript.

**Q: Comment migrer le code existant?**
A: Suivre MIGRATION_PLAN.md phase par phase.

**Q: Ca ne compile pas!**
A: Verifier les paths dans tsconfig.json.

**Q: Les styles ne s'appliquent pas!**
A: Verifier que Tailwind inclut ../shared/**/*.{tsx,jsx}.

## Support

1. Consulter INDEX.md (ce fichier)
2. Lire le document approprie
3. Verifier les configurations
4. Consulter INTEGRATION.md pour troubleshooting

## Status du projet

✅ Structure creee
✅ Code copie et adapte
✅ Documentation complete
✅ Pret pour integration

**Prochaine etape:** Lire QUICKSTART.md et configurer TypeScript.

---

**Version:** 0.1.0
**Date:** 2025-11-06
