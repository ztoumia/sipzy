# Admin Dashboard Redesign - Plan d'Implémentation

## 📋 Vue d'Ensemble

Ce document décrit le plan complet de refonte du dashboard admin de Sipzy. L'objectif est de créer une interface moderne, organisée et intuitive avec un menu latéral groupé (style AWS Console).

**Branche**: `feature/admin-dashboard-redesign`
**Date**: 2025-11-06

---

## 🎯 Objectifs

1. ✅ Remplacer la page "Data Management" générique par des pages CRUD spécialisées
2. ✅ Créer un sidebar responsive avec menu groupé et expandable
3. ✅ Implémenter uniquement l'import batch (pas l'import single)
4. ✅ Unifier toutes les pages sur le backend réel (realApi.ts)
5. ✅ Ajouter des actions inline (Edit/Delete) dans les tables
6. ✅ Grouper les fonctionnalités par domaine métier

---

## 📊 Structure du Menu

```
┌─────────────────────────────────────────────────────────┐
│  [☕] Sipzy Admin            [@Admin] [🔔] [⚙️] [↪️]    │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ 📊       │  Dashboard                                   │
│ Home     │  [Stats + Quick Actions]                     │
│          │                                              │
│ ━━━━━━━━ │                                              │
│ CONTENT  │                                              │
│          │                                              │
│ ☕       │                                              │
│ Coffees  │  ← Groupe expandable                         │
│  ▼       │                                              │
│  ├─ 📋  │  All Coffees                                │
│  │   15 │  [Search, Filter, Edit inline, Delete]       │
│  ├─ 🏭  │  All Roasters                               │
│  ├─ 🎨  │  All Flavors/Notes                          │
│  ├─ ⏳  │  Pending [Badge: 15]                        │
│  ├─ ✅  │  Approved                                    │
│  └─ ❌  │  Rejected                                    │
│          │                                              │
│ 👥       │                                              │
│ Users    │  ← Groupe expandable                         │
│  ▼       │                                              │
│  ├─ 📋  │  All Users                                  │
│  │      │  [Search, Ban/Unban, Edit, View profile]    │
│  ├─ 🚫  │  Banned Users                               │
│  └─ 👑  │  Admins                                     │
│          │                                              │
│ 📥       │                                              │
│ Import   │  Batch Import (JSON uniquement)              │
│          │                                              │
│ 🛡️       │                                              │
│ Reports  │  ← Groupe expandable                         │
│  ▼   3  │                                              │
│  ├─ 🚨  │  Pending [Badge: 3]                         │
│  ├─ ✅  │  Resolved                                    │
│  └─ ⏭️  │  Dismissed                                   │
│          │                                              │
│ 💬       │                                              │
│ Reviews  │  All Reviews                                 │
│          │                                              │
│ 📝       │                                              │
│ Activity │  Activity Log                                │
│          │                                              │
│ ━━━━━━━━ │                                              │
│ SYSTEM   │                                              │
│          │                                              │
│ 📈       │                                              │
│ Analytics│  Statistics & Charts                         │
│          │                                              │
│ ⚙️       │                                              │
│ Settings │  Admin Configuration                         │
│          │                                              │
│  [◀]    │  ← Toggle collapse                           │
└──────────┴──────────────────────────────────────────────┘
```

---

## 📁 Structure de Fichiers

```
frontend/
├── app/
│   └── admin/
│       ├── layout.tsx                    [CRÉER - Sidebar layout]
│       ├── page.tsx                      [MODIFIER - Dashboard]
│       │
│       ├── coffees/                      [REFAIRE]
│       │   ├── page.tsx                  (All Coffees avec CRUD inline)
│       │   ├── roasters/
│       │   │   └── page.tsx              (All Roasters CRUD)
│       │   ├── notes/
│       │   │   └── page.tsx              (All Notes/Flavors CRUD)
│       │   ├── pending/page.tsx          (Quick filter: status=PENDING)
│       │   ├── approved/page.tsx         (Quick filter: status=APPROVED)
│       │   └── rejected/page.tsx         (Quick filter: status=REJECTED)
│       │
│       ├── users/                        [REFAIRE]
│       │   ├── page.tsx                  (All Users avec Ban/Unban/Delete)
│       │   ├── banned/page.tsx           (Filter: banned users)
│       │   └── admins/page.tsx           (Filter: role=ADMIN)
│       │
│       ├── import/
│       │   └── page.tsx                  [CRÉER - Batch Import uniquement]
│       │
│       ├── reports/                      [CRÉER]
│       │   ├── page.tsx                  (All Reports)
│       │   ├── pending/page.tsx          (Filter: pending)
│       │   ├── resolved/page.tsx         (Filter: resolved)
│       │   └── dismissed/page.tsx        (Filter: dismissed)
│       │
│       ├── reviews/
│       │   └── page.tsx                  [CRÉER - All Reviews moderation]
│       │
│       ├── activity/
│       │   └── page.tsx                  [CRÉER - Activity log]
│       │
│       ├── analytics/
│       │   └── page.tsx                  [CRÉER - Stats dashboard]
│       │
│       ├── settings/
│       │   └── page.tsx                  [CRÉER - Settings]
│       │
│       └── data/                         [SUPPRIMER - Plus besoin]
│
├── components/
│   └── admin/
│       ├── layout/                       [CRÉER]
│       │   ├── AdminSidebar.tsx          (Sidebar avec groupes)
│       │   ├── SidebarItem.tsx           (Item avec badge)
│       │   ├── SidebarGroup.tsx          (Groupe expandable)
│       │   └── TopBar.tsx                (Header)
│       │
│       ├── tables/                       [CRÉER - Composants réutilisables]
│       │   ├── DataTable.tsx             (Table générique)
│       │   ├── TableActions.tsx          (Edit/Delete buttons)
│       │   ├── TableFilters.tsx          (Search/Filter bar)
│       │   └── TablePagination.tsx       (Pagination)
│       │
│       ├── modals/                       [CRÉER]
│       │   ├── EditModal.tsx             (Modal d'édition générique)
│       │   ├── DeleteConfirmModal.tsx    (Confirmation suppression)
│       │   └── BanUserModal.tsx          (Ban avec raison)
│       │
│       ├── import/                       [CRÉER]
│       │   ├── JsonUploader.tsx          (Drag & drop + paste)
│       │   ├── JsonEditor.tsx            (Editor avec syntax highlight)
│       │   ├── ImportProgress.tsx        (Progress bar)
│       │   └── ImportResults.tsx         (Results table)
│       │
│       └── [existing components...]
│
└── lib/
    └── api/
        ├── adminApi.ts                   [SUPPRIMER]
        ├── realApi.ts                    [UTILISER PARTOUT]
        ├── importApi.ts                  [CRÉER]
        └── dataManagementApi.ts          [SUPPRIMER ou FUSIONNER]
```

---

## 🚀 Plan d'Implémentation

### **Phase 1: Fondations du Layout** ⭐ PRIORITÉ MAX

**Durée estimée**: 1-2 jours

**Tâches**:
1. ✅ Créer `components/admin/layout/AdminSidebar.tsx`
   - Menu groupé avec sections expandables
   - Responsive (expanded desktop, collapsed tablet, overlay mobile)
   - Badge support pour pending counts
   - Toggle collapse button

2. ✅ Créer `components/admin/layout/SidebarItem.tsx`
   - Support icône + label
   - Badge optional (count + variant)
   - Active state
   - Hover effects

3. ✅ Créer `components/admin/layout/SidebarGroup.tsx`
   - Groupe expandable/collapsible
   - Animation smooth
   - État persisté (localStorage)

4. ✅ Créer `components/admin/layout/TopBar.tsx`
   - User menu
   - Notifications
   - Settings
   - Logout

5. ✅ Créer `app/admin/layout.tsx`
   - Intégrer le sidebar
   - Provider pour sidebar state
   - Responsive breakpoints

**Fichiers à créer**:
- `frontend/components/admin/layout/AdminSidebar.tsx`
- `frontend/components/admin/layout/SidebarItem.tsx`
- `frontend/components/admin/layout/SidebarGroup.tsx`
- `frontend/components/admin/layout/TopBar.tsx`
- `frontend/contexts/AdminSidebarContext.tsx`
- `frontend/app/admin/layout.tsx`

---

### **Phase 2: Composants Réutilisables**

**Durée estimée**: 1-2 jours

**Tâches**:
1. ✅ Créer `components/admin/tables/DataTable.tsx`
   - Table générique avec tri
   - Pagination
   - Loading state
   - Empty state

2. ✅ Créer `components/admin/tables/TableActions.tsx`
   - Boutons Edit/Delete
   - Dropdown menu pour actions multiples
   - Confirmation inline

3. ✅ Créer `components/admin/tables/TableFilters.tsx`
   - Search bar
   - Filters dropdown
   - Clear filters button

4. ✅ Créer `components/admin/modals/EditModal.tsx`
   - Modal générique pour édition
   - Form validation
   - Save/Cancel actions

5. ✅ Créer `components/admin/modals/DeleteConfirmModal.tsx`
   - Modal de confirmation
   - Warning message
   - Confirm/Cancel

**Fichiers à créer**:
- `frontend/components/admin/tables/DataTable.tsx`
- `frontend/components/admin/tables/TableActions.tsx`
- `frontend/components/admin/tables/TableFilters.tsx`
- `frontend/components/admin/tables/TablePagination.tsx`
- `frontend/components/admin/modals/EditModal.tsx`
- `frontend/components/admin/modals/DeleteConfirmModal.tsx`

---

### **Phase 3: Section Coffees (Réorganisée)**

**Durée estimée**: 2-3 jours

**Tâches**:
1. ✅ Refaire `/admin/coffees/page.tsx`
   - Liste complète des coffees
   - Search + filters (status, roaster)
   - CRUD inline (Edit/Delete)
   - Pagination
   - Connecter à realApi

2. ✅ Créer `/admin/coffees/roasters/page.tsx`
   - Liste complète des roasters
   - CRUD inline
   - Verified toggle
   - Connecter à realApi

3. ✅ Créer `/admin/coffees/notes/page.tsx`
   - Liste complète des notes/flavors
   - CRUD inline
   - Category filter
   - Usage count

4. ✅ Créer `/admin/coffees/pending/page.tsx`
   - Réutilise coffees/page avec filter status=PENDING
   - Actions: Approve/Reject

5. ✅ Créer `/admin/coffees/approved/page.tsx`
   - Réutilise coffees/page avec filter status=APPROVED

6. ✅ Créer `/admin/coffees/rejected/page.tsx`
   - Réutilise coffees/page avec filter status=REJECTED

**Fichiers à créer/modifier**:
- `frontend/app/admin/coffees/page.tsx` (REFAIRE)
- `frontend/app/admin/coffees/roasters/page.tsx` (CRÉER)
- `frontend/app/admin/coffees/notes/page.tsx` (CRÉER)
- `frontend/app/admin/coffees/pending/page.tsx` (CRÉER)
- `frontend/app/admin/coffees/approved/page.tsx` (CRÉER)
- `frontend/app/admin/coffees/rejected/page.tsx` (CRÉER)

---

### **Phase 4: Batch Import**

**Durée estimée**: 2-3 jours

**Tâches**:
1. ✅ Créer `lib/api/importApi.ts`
   - Interface TypeScript pour BatchImportRequest
   - Méthode batchImport()
   - Méthode health check

2. ✅ Créer `components/admin/import/JsonUploader.tsx`
   - Drag & drop zone
   - File upload
   - Paste JSON textarea
   - File validation

3. ✅ Créer `components/admin/import/JsonEditor.tsx`
   - Syntax highlighting (react-json-view ou simple)
   - Validation JSON
   - Format button

4. ✅ Créer `components/admin/import/ImportProgress.tsx`
   - Progress bar
   - Real-time status
   - Cancel button (si async)

5. ✅ Créer `components/admin/import/ImportResults.tsx`
   - Summary cards (success/error/skip)
   - Detailed results table
   - Export results CSV

6. ✅ Créer `/admin/import/page.tsx`
   - Upload/Paste JSON
   - Options (continueOnError, autoApprove)
   - Load example button
   - Import button
   - Results display

**Fichiers à créer**:
- `frontend/lib/api/importApi.ts`
- `frontend/components/admin/import/JsonUploader.tsx`
- `frontend/components/admin/import/JsonEditor.tsx`
- `frontend/components/admin/import/ImportProgress.tsx`
- `frontend/components/admin/import/ImportResults.tsx`
- `frontend/app/admin/import/page.tsx`

**Exemple JSON à fournir**:
- Utiliser `/backend/import-examples/batch-import-example.json`

---

### **Phase 5: Section Users**

**Durée estimée**: 1-2 jours

**Tâches**:
1. ✅ Refaire `/admin/users/page.tsx`
   - Liste complète des users
   - Search + filters (role, status)
   - Actions: Ban/Unban/Delete/View profile
   - Connecter à realApi

2. ✅ Créer `components/admin/modals/BanUserModal.tsx`
   - Input pour raison du ban
   - Validation
   - Confirm/Cancel

3. ✅ Créer `/admin/users/banned/page.tsx`
   - Réutilise users/page avec filter banned=true
   - Action principale: Unban

4. ✅ Créer `/admin/users/admins/page.tsx`
   - Réutilise users/page avec filter role=ADMIN

**Fichiers à créer/modifier**:
- `frontend/app/admin/users/page.tsx` (REFAIRE)
- `frontend/components/admin/modals/BanUserModal.tsx` (CRÉER)
- `frontend/app/admin/users/banned/page.tsx` (CRÉER)
- `frontend/app/admin/users/admins/page.tsx` (CRÉER)

---

### **Phase 6: Reports & Reviews**

**Durée estimée**: 2 jours

**Tâches**:
1. ✅ Créer `/admin/reports/page.tsx`
   - Liste complète des reports
   - Search + filters (status)
   - Actions: Resolve/Dismiss
   - Connecter à realApi

2. ✅ Créer `/admin/reports/pending/page.tsx`
   - Filter status=PENDING
   - Priorité haute

3. ✅ Créer `/admin/reports/resolved/page.tsx`
   - Filter status=RESOLVED

4. ✅ Créer `/admin/reports/dismissed/page.tsx`
   - Filter status=DISMISSED

5. ✅ Créer `/admin/reviews/page.tsx`
   - Liste complète des reviews
   - Moderation actions
   - Connecter à realApi (si endpoint existe)

**Fichiers à créer**:
- `frontend/app/admin/reports/page.tsx`
- `frontend/app/admin/reports/pending/page.tsx`
- `frontend/app/admin/reports/resolved/page.tsx`
- `frontend/app/admin/reports/dismissed/page.tsx`
- `frontend/app/admin/reviews/page.tsx`

---

### **Phase 7: Activity & Analytics**

**Durée estimée**: 1-2 jours

**Tâches**:
1. ✅ Créer `/admin/activity/page.tsx`
   - Liste des admin activities
   - Filters (admin, date, action type)
   - Connecter à realApi

2. ✅ Créer `/admin/analytics/page.tsx`
   - Graphiques et stats
   - KPIs
   - Charts (recharts ou similaire)

**Fichiers à créer**:
- `frontend/app/admin/activity/page.tsx`
- `frontend/app/admin/analytics/page.tsx`

---

### **Phase 8: Dashboard & Settings**

**Durée estimée**: 1 jour

**Tâches**:
1. ✅ Modifier `/admin/page.tsx` (Dashboard)
   - Connecter à realApi (remplacer mock)
   - Ajouter stats d'import
   - Quick actions cards

2. ✅ Créer `/admin/settings/page.tsx`
   - Configuration admin
   - User preferences
   - System settings

**Fichiers à modifier/créer**:
- `frontend/app/admin/page.tsx` (MODIFIER)
- `frontend/app/admin/settings/page.tsx` (CRÉER)

---

### **Phase 9: Cleanup**

**Durée estimée**: 1 jour

**Tâches**:
1. ✅ Supprimer `/admin/data` (ancienne data management)
2. ✅ Supprimer `lib/api/adminApi.ts` (mock API)
3. ✅ Supprimer ou fusionner `lib/api/dataManagementApi.ts`
4. ✅ Unifier tout sur `lib/api/realApi.ts`
5. ✅ Cleanup imports inutilisés
6. ✅ Tests de régression

**Fichiers à supprimer**:
- `frontend/app/admin/data/` (dossier complet)
- `frontend/lib/api/adminApi.ts`
- `frontend/lib/api/dataManagementApi.ts` (ou fusionner dans realApi)
- `frontend/mocks/` (si utilisé uniquement par admin)

---

## 🎨 Design Guidelines

### Responsive Breakpoints

```typescript
// Desktop (>1024px) - Sidebar expanded
- Sidebar: 240px fixe
- Content: calc(100vw - 240px)

// Tablet (768px - 1024px) - Sidebar collapsed
- Sidebar: 64px (icônes seulement)
- Content: calc(100vw - 64px)

// Mobile (<768px) - Sidebar overlay
- Sidebar: overlay 280px ou fullscreen
- Hamburger menu
```

### Colors (Suggestion)

```css
/* Sidebar */
--sidebar-bg: #1a1a1a;
--sidebar-text: #e0e0e0;
--sidebar-active: #2563eb;
--sidebar-hover: #2a2a2a;

/* Badges */
--badge-danger: #ef4444;   /* Pending urgent */
--badge-warning: #f59e0b;  /* Warning */
--badge-info: #3b82f6;     /* Info */
--badge-success: #10b981;  /* Success */
```

### Icons

Utiliser **Lucide React** (déjà dans le projet):
- Home: `Home`
- Coffee: `Coffee`
- Users: `Users`
- Import: `Download`
- Reports: `Shield`
- Reviews: `MessageSquare`
- Activity: `Activity`
- Analytics: `BarChart`
- Settings: `Settings`

---

## 📊 Backend APIs Utilisées

### AdminController (`/api/admin`)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/coffees/pending` - Pending coffees
- `PUT /api/admin/coffees/{id}/approve` - Approve coffee
- `PUT /api/admin/coffees/{id}/reject` - Reject coffee
- `GET /api/admin/coffees` - All coffees with filters
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/{id}/ban` - Ban user
- `PUT /api/admin/users/{id}/unban` - Unban user
- `GET /api/admin/reports/pending` - Pending reports
- `GET /api/admin/reports` - All reports
- `PUT /api/admin/reports/{id}/resolve` - Resolve report
- `PUT /api/admin/reports/{id}/dismiss` - Dismiss report
- `GET /api/admin/activity` - Recent activity

### ImportController (`/api/import`)
- `POST /api/import/batch` - Batch import (roasters + coffees)
- `GET /api/import/health` - Health check

### AdminDataController (`/api/admin/data`)
- À remplacer par les endpoints spécifiques ci-dessus

---

## ✅ Checklist de Validation

### Layout & Navigation
- [ ] Sidebar s'affiche correctement sur desktop (240px)
- [ ] Sidebar se rétracte sur tablet (64px icônes)
- [ ] Sidebar devient overlay sur mobile
- [ ] Badges affichent les counts corrects
- [ ] Groupes expandables fonctionnent
- [ ] Active state fonctionne sur la page courante
- [ ] Toggle collapse fonctionne

### Coffees Section
- [ ] All Coffees: liste, search, filter
- [ ] All Coffees: edit inline fonctionne
- [ ] All Coffees: delete avec confirmation
- [ ] All Roasters: CRUD complet
- [ ] All Notes: CRUD complet
- [ ] Pending/Approved/Rejected: filters fonctionnent
- [ ] Approve/Reject coffee fonctionne

### Users Section
- [ ] All Users: liste, search, filter
- [ ] Ban user fonctionne (avec raison)
- [ ] Unban user fonctionne
- [ ] Banned users: filter fonctionne
- [ ] Admins: filter fonctionne

### Import
- [ ] Upload JSON file fonctionne
- [ ] Paste JSON fonctionne
- [ ] Validation JSON fonctionne
- [ ] Options (continueOnError, autoApprove)
- [ ] Progress bar s'affiche
- [ ] Results s'affichent correctement
- [ ] Load example fonctionne

### Reports & Reviews
- [ ] Reports list fonctionne
- [ ] Resolve report fonctionne
- [ ] Dismiss report fonctionne
- [ ] Pending/Resolved/Dismissed filters
- [ ] Reviews moderation fonctionne

### Activity & Analytics
- [ ] Activity log s'affiche
- [ ] Filters fonctionnent
- [ ] Analytics dashboard s'affiche
- [ ] Charts s'affichent correctement

### General
- [ ] Toutes les pages utilisent realApi
- [ ] Aucune référence à adminApi (mock)
- [ ] Pagination fonctionne partout
- [ ] Loading states affichés
- [ ] Error handling correct
- [ ] Responsive sur tous devices

---

## 🐛 Known Issues / TODO

- [ ] Ajouter tests unitaires pour composants
- [ ] Ajouter tests e2e pour workflows critiques
- [ ] Optimiser performance (React.memo, useMemo)
- [ ] Ajouter dark mode toggle
- [ ] Ajouter export CSV pour toutes les tables
- [ ] Ajouter bulk actions (select multiple)
- [ ] Ajouter keyboard shortcuts
- [ ] Ajouter notifications toast

---

## 📚 Ressources

### Documentation Backend
- [IMPORT_FEATURE.md](../IMPORT_FEATURE.md)
- [backend/import-examples/README.md](../backend/import-examples/README.md)

### Design Inspiration
- AWS Console (sidebar groupé)
- Vercel Dashboard (clean design)
- GitHub Admin (tables actions)

### Libraries Recommandées
- **Icons**: Lucide React (déjà installé)
- **Tables**: TanStack Table ou custom
- **Forms**: React Hook Form + Zod
- **Modals**: Headless UI ou Radix UI
- **Charts**: Recharts
- **JSON Editor**: react-json-view ou Monaco Editor

---

## 📝 Notes de Migration

### Changements Breaking
1. URL `/admin/data` supprimée → utiliser URLs spécifiques
2. `adminApi.ts` supprimé → utiliser `realApi.ts`
3. Menu structure changée → mettre à jour tests e2e

### Migration des Données
- Aucune migration BD nécessaire
- Seulement changements frontend

### Rollback Plan
- La branche `master` reste inchangée
- Possibilité de rollback via `git revert`

---

## 🚀 Déploiement

### Pre-deployment Checklist
- [ ] Tous les tests passent
- [ ] Build production réussit
- [ ] Pas de console.log/console.error
- [ ] Pas d'erreurs TypeScript
- [ ] Lighthouse score > 90

### Environment Variables
- Aucune nouvelle variable nécessaire
- Variables existantes:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

---

## 📞 Contact

Pour questions ou suggestions, consulter:
- Backend: [AdminController.java](../backend/src/main/java/com/sipzy/admin/controller/AdminController.java)
- Import: [ImportController.java](../backend/src/main/java/com/sipzy/importer/controller/ImportController.java)

---

**Dernière mise à jour**: 2025-11-06
**Status**: 🟢 En cours d'implémentation
