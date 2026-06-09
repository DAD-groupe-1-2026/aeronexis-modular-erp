# Architecture Logicielle — Monorepo

Ce document décrit l'architecture SOA/Microservices à 4 couches du projet. Chaque section correspond à une couche définie dans le cahier des charges.

---

## Vue d'ensemble

```mermaid
flowchart TD
    subgraph C1 [Couche 1 — Applications métiers]
        PORTAL[portal-app\nLogin + redirection]
        PA[production-app\nOpérateurs]
        LA[logistics-app\nLogistique]
        SA[sales-app\nCommerciaux]
        AD[admin-dashboard\nDirection / Supervision]
    end

    subgraph C2 [Couche 2 — Middleware applicatif]
        AUTH[auth\nSécurisation + droits accès]
        APICLIENT[api-client\nNormalisation messages + HTTP]
        SHARED[shared-types\nContrats inter-couches]
        UI[ui\nComposants UI React partagés\n(AppLayout, TopHeader, Sidebar...)]
    end

    subgraph C3 [Couche 3 — Plateforme / Gateway]
        NGINX[NGINX\nReverse proxy — port 80]
        VERIFY[auth_request\nValidation JWT → auth-service]
        UPSTREAM[Upstreams\nLoad-balancing vers microservices]
    end

    subgraph C4 [Couche 4 — Microservices + Data]
        AS[auth-service\nExpress + Sequelize]
        PS[production-service\nExpress + Sequelize]
        LS[logistics-service]
        SS[sales-service]
        TS[traceability-service]
        NS[notification-service]
        PG[(PostgreSQL)]
        MG[(MongoDB)]
        RD[(Redis)]
        RB([RabbitMQ])
    end

    C1 -->|"HTTP via api-client\n{ status, data, error }"| C3
    C2 -->|modules partagés| C1
    NGINX --> VERIFY
    VERIFY -->|JWT valide → X-User header| UPSTREAM
    UPSTREAM --> C4
    PS -->|events| RB
    LS -->|events| RB
    SS -->|events| RB
    RB --> TS
    RB --> NS
    AS --> PG
    PS --> PG
    LS --> PG
    SS --> PG
    TS --> MG
    NS --> RD
```

---

## Structure du Monorepo

```
aeronexis-modular-erp/
├── apps/                        # Couche 1 : Applications métiers
│   ├── portal-app/              # Façade UI — login centralisé, AppRedirector par rôle
│   ├── production-app/
│   ├── logistics-app/
│   ├── sales-app/
│   └── admin-dashboard/
├── packages/                    # Couche 2 : Middleware applicatif partagé
│   ├── auth/                    # Sécurisation flux locaux + gestion des droits
│   ├── api-client/              # Normalisation messages + couche HTTP
│   ├── shared-types/            # Contrats inter-couches (types, DTOs, interfaces)
│   └── ui/                      # Composants React UI réutilisables (AppLayout, TopHeader, DataTable, etc.)
├── services/                    # Couches 3 & 4 : Plateforme + Microservices
│   ├── api-gateway/             # Couche 3 : NGINX (nginx.conf + Dockerfile)
│   ├── auth-service/            # Couche 4 : Express + Sequelize — JWT, RBAC
│   ├── production-service/      # Couche 4 : Express + Sequelize — Orders, Lots, Incidents
│   ├── logistics-service/       # Couche 4 : Stocks, réservations, expéditions
│   ├── sales-service/           # Couche 4 : Commandes clients, statistiques
│   ├── traceability-service/    # Couche 4 : Audit trail immuable (consommateur RabbitMQ)
│   └── notification-service/    # Couche 4 : Alertes temps réel (consommateur RabbitMQ)
├── infrastructure/
│   ├── docker/
│   │   └── docker-compose.yml
│   └── monitoring/
│       └── prometheus.yml
└── docs/
    └── architecture/
```

---

## Couche 1 — Applications métiers (`apps/`)

Chaque application correspond à un rôle métier de l'entreprise.

| Application | Rôle | Utilisateurs |
|---|---|---|
| `production-app` | Suivi des ordres de fabrication, lots, incidents | Opérateurs |
| `logistics-app` | Stocks, réservations matières, expéditions | Responsables logistique |
| `sales-app` | Commandes clients, livraisons, KPIs | Commerciaux |
| `admin-dashboard` | Supervision globale, gestion utilisateurs, reporting | Direction |

### Structure interne d'une application (pattern simplifié)

```
apps/<nom>-app/src/
├── components/            # Composants React spécifiques à l'application
│   ├── LotProgressCard.tsx # Ex: Composant métier spécifique
│   └── IncidentBadge.tsx   # Ex: Composant métier spécifique
├── pages/                 # Écrans — UI + React Query inline (useQuery / useMutation)
│   ├── DashboardPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── IncidentPage.tsx
│   ├── IncidentDetailPage.tsx
│   └── HistoryPage.tsx
├── routes/
│   └── index.tsx          # createBrowserRouter + lazy loading + ProtectedRoute
├── api/                   # Couche d'abstraction vers le gateway
│   ├── orders.ts
│   ├── incidents.ts
│   └── users.ts
├── lib/
│   └── utils.ts          # Utilitaires (cn, etc.)
├── AppLayout.tsx          # Wrapper utilisant SharedAppLayout, Sidebar et TopHeader de @aeronexis-dynamics/ui
├── App.tsx                # Providers : QueryClientProvider + RouterProvider
├── main.tsx
└── index.css
```

**Principes de la structure simplifiée :**
- Les composants d'interface génériques (boutons, tables, modales) et les structures globales (Sidebar, TopHeader, AppLayout) **doivent** être importés depuis `@aeronexis-dynamics/ui` pour éviter la redondance et garantir l'uniformité du Glassmorphism.
- Pas de sous-dossiers dans `components/` — ce dossier ne contient que les composants **métier** très spécifiques à l'app.
- Pas de dossier `hooks/` — `useQuery` / `useMutation` sont appelés directement dans le composant page
- Nomenclature claire : les noms de fichiers sont explicites (ex: `OrderDetailPage.tsx`)
- `AppLayout.tsx` à la racine de `src/` (configure et injecte la configuration spécifique dans le layout partagé)
- Séparation claire : `pages/` (UI + React Query) → `api/` (HTTP)

**Règle de dépendance** : `pages/` → `api/` → `@aeronexis-dynamics/api-client`.
Une page ne doit jamais appeler directement `fetch` ou `apiClient`. Les queries partagées (même `queryKey`) peuvent être dupliquées inline dans plusieurs pages — React Query partage le cache.

**Pattern page** (lecture + erreur) :
```tsx
import { useQuery } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getOrders } from '@/api/orders'

export function OrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })

  if (isLoading) return <div>Chargement...</div>
  if (isError) return <QueryErrorAlert error={error} onRetry={() => refetch()} title="..." />
  // ...
}
```

**Pattern page** (mutation + invalidation) :
```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrderById, updateLotStatus } from '@/api/orders'

export function OrderDetailPage() {
  const { orderId = '' } = useParams()
  const queryClient = useQueryClient()
  const { data: workOrder } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
  })
  const updateLot = useMutation({
    mutationFn: ({ lotId, status, completionPercent }) =>
      updateLotStatus(lotId, status, completionPercent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
  // updateLot.mutate(...)
}
```

**Structure de `api/`** :
```typescript
export async function getOrders(): Promise<WorkOrder[]> {
  const res = await apiClient.get<WorkOrder[]>('/api/production/orders')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
```

---

## Couche 2 — Middleware applicatif (`packages/`)

Modules partagés entre toutes les applications.

| Package | Rôle dans la couche 2 |
|---|---|
| `auth` | Sécurisation des flux locaux : `LoginPage`, `ProtectedRoute`, `RoleRoute`, `AppRedirector`, `useAuthStore` (JWT), `logoutAndRedirect`, `isAuthBypassed` (bypass dev) |
| `api-client` | Normalisation des messages `{ status, data, error }` + injection JWT + gestion des erreurs réseau |
| `shared-types` | Contrats TypeScript inter-couches : entités métier (`WorkOrder`, `Lot`, `User`...), `ApiResponse<T>`, `ApiError`, `ApiStatus` |
| `ui` | Composants React partagés entre les apps : `AppLayout`, `Sidebar`, `TopHeader`, `DataTable` (TanStack Table), `ToastProvider` (Sonner), UI générique (`Input`, `Select`, `Modal`, `StatusBadge`), et `QueryErrorAlert` |

### Normalisation des messages

Toute communication inter-couches utilise le format `ApiResponse<T>` :

```typescript
// packages/shared-types
export interface ApiResponse<T> {
  status: 'success' | 'failure' | 'pending'
  data: T
  error?: { code: string; message: string }
}
```

Le `api-client` (couche 2) retourne systématiquement ce format, que l'appel réseau réussisse ou échoue.

---

## Couche 3 — API Gateway (`services/api-gateway/`)

L'API Gateway est le **point d'entrée unique** à port 80, implémenté avec **NGINX**.
Il n'exécute aucune logique applicative : il route, valide les JWT via `auth_request`, et transmet.

services/api-gateway/
├── nginx.conf       # Configuration unique : upstreams API + serve des assets statiques (/ , /production/ , /logistics/)
├── nginx.dev.conf   # (Optionnel) Développement avec hot-reloading : proxy Vite (4000, 4001, 4002) + routes API
├── Dockerfile       # Multi-stage : build front-end + image NGINX
└── .env             # Documentation des hosts/ports des microservices
```

### Double façade

| Façade | Rôle | Chemins |
|---|---|---|
| **API** | Reverse proxy + JWT (`auth_request`) | `/auth/*`, `/api/*` |
| **UI** | Portail + apps métier sous un même domaine | `/` (portail), `/production/`, `/logistics/` |

```mermaid
flowchart LR
    browser[Navigateur]
    nginx[NGINX :80]
    portal[portal-app]
    prod[production-app]
    log[logistics-app]
    auth[auth-service]
    api[Microservices API]

    browser --> nginx
    nginx -->|"/"| portal
    nginx -->|"/production/"| prod
    nginx -->|"/logistics/"| log
    nginx -->|"/auth/*"| auth
    nginx -->|"/api/*"| api
    portal -->|POST /auth/login| auth
    prod --> api
    log --> api
```

**Flux login portail → app métier :**
1. Utilisateur ouvre `GET /` → portail (`AppRedirector` ou redirect `/login`)
2. Login via `POST /auth/login` → JWT stocké (`localStorage`, clé partagée `aeronexis-auth`)
3. `AppRedirector` redirige par rôle (`window.location.assign`) vers l'URL métier configurée (`VITE_APP_URL_*`)
4. Apps métier : `ProtectedRoute redirectToPortal` si pas de token ; `RoleRoute` sur logistics (`logistics`, `admin`, `director`)

### Routage API (nginx.conf)

| Location | Accès | Service cible |
|---|---|---|
| `/auth/login` | Public | `auth-service:3001` |
| `/auth/register` | Public | `auth-service:3001` |
| `/auth/verify` | Interne (auth_request) | `auth-service:3001` |
| `/api/production/*` | JWT requis | `production-service:3002` |
| `/api/logistics/*` | JWT requis | `logistics-service:3003` |
| `/api/sales/*` | JWT requis | `sales-service:3004` |
| `/api/traceability/*` | JWT requis | `traceability-service:3005` |
| `/api/notifications/*` | JWT requis | `notification-service:3006` |
| `/` | Public (portail) | Assets `portal-app` ou proxy Vite `:5170` |
| `/production/*` | Front-end métier | Assets `production-app` ou proxy Vite `:5173` |
| `/logistics/*` | Front-end métier | Assets `logistics-app` ou proxy Vite `:5174` |

### Mécanisme d'authentification

```
[Client] → GET /api/production/orders
               │
               ↓ NGINX : auth_request /_jwt_verify
               │
               ↓ GET http://auth-service:3001/auth/verify
                       (avec Authorization: Bearer <token>)
               │
               ├── 401 → NGINX retourne { status: "failure", error: "UNAUTHORIZED" }
               │
               └── 200 + header X-User: {"userId","email","role",...}
                       → NGINX injecte X-User dans la requête en aval
                       → proxy_pass http://production-service:3002/api/production/orders
```

Les microservices **ne valident pas eux-mêmes le JWT** : ils lisent simplement le header `X-User` injecté par NGINX.

---

## Couche 4 — Microservices + Data (`services/` + `infrastructure/`)

### Structure interne d'un microservice (pattern Express + Sequelize)

```
services/<nom>-service/
├── src/
│   ├── index.js              # Bootstrap Express : connexion Sequelize, montage des routes
│   ├── db/
│   │   ├── sequelize.js      # Instance Sequelize (DATABASE_URL + schéma SQL)
│   │   └── migrate.js        # Création du schéma SQL + sync des modèles (node src/db/migrate.js)
│   ├── models/
│   │   └── index.js          # Définition des modèles Sequelize + associations
│   ├── controllers/          # Logique métier — retournent { status, data, error }
│   ├── routes/               # Déclaration des routes Express + authenticate middleware
│   └── middlewares/
│       └── authenticate.js   # Lit le header X-User injecté par NGINX → req.user
├── package.json              # Dépendances : express, sequelize, pg, dotenv, cors
├── Dockerfile
└── .env
```

**Référence** : `auth-service` pour l'authentification, `production-service` pour un domaine métier.

### Middlewares Express

- **`authenticate.js`** : lit le header `X-User` (JSON stringifié) injecté par NGINX et l'attache à `req.user`. Toutes les routes métiers l'utilisent.
- **`auth-service/src/middlewares/authenticate.js`** : exception — vérifie lui-même le JWT Bearer car il gère aussi la route `/auth/verify` utilisée par NGINX.

### Microservices

| Service | Port | Base de données | Rôle |
|---|---|---|---|
| `auth-service` | 3001 | PostgreSQL (`schema: auth`) | Login, register, verify JWT, RBAC |
| `production-service` | 3002 | PostgreSQL (`schema: production`) | WorkOrder, Lot, Material, Incident, HistoryEntry |
| `logistics-service` | 3003 | PostgreSQL | StockItem, Shipment, réservations |
| `sales-service` | 3004 | PostgreSQL | SalesOrder, Client, statistiques |
| `traceability-service` | 3005 | MongoDB | Audit trail immuable — consommateur RabbitMQ |
| `notification-service` | 3006 | Redis | WebSocket temps réel — consommateur RabbitMQ |

### Modèles Sequelize

Les schémas SQL sont isolés par microservice (option `schema` de Sequelize) :
- `auth-service` → schéma SQL `auth` → tables `users`
- `production-service` → schéma SQL `production` → tables `work_orders`, `lots`, `materials`, `incidents`, `history_entries`

Pour initialiser ou mettre à jour les tables : `node src/db/migrate.js`

### Communication asynchrone (RabbitMQ)

```
[production-service / logistics-service / sales-service]
        │ publish(event)
        ↓
   [RabbitMQ :5672]
        │
   ┌────┴────┐
   ↓         ↓
[traceability-service]   [notification-service]
  → MongoDB (audit trail)  → Redis → WebSocket → [clients]
```

### Infrastructure

| Composant | Port | Usage |
|---|---|---|
| NGINX (api-gateway) | 80 | Façade unique, reverse proxy, validation JWT |
| PostgreSQL | 5432 | Données métiers structurées |
| MongoDB | 27017 | Audit trail et documents |
| Redis | 6379 | Cache, sessions, WebSocket |
| RabbitMQ | 5672 / 15672 | Broker événements asynchrones |
| Prometheus | 9090 | Scraping métriques `/metrics` |
| Grafana | 3000 | Dashboards de supervision |

---

## Flux de Communication

### Synchrone (HTTP/REST)

```
[App] → NormalizedMessage → api-client → NGINX:80 (api-gateway)
                                              → auth_request → auth-service /auth/verify
                                              → proxy_pass (+ X-User header)
                                              → [microservice cible] :300x
                                              → authenticate middleware (lit X-User)
                                              → controller → Sequelize → PostgreSQL
                                       ← { status, data, error } ←
```

### Asynchrone (Événements RabbitMQ)

```
[microservice métier] → publish(event) → RabbitMQ
                                              → traceability-service → MongoDB
                                              → notification-service → Redis → WebSocket
```

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Couche 1 — Front-end | React 18 + TypeScript + Vite + Tailwind CSS |
| Couche 2 — Packages | TypeScript, Zustand, React Query, React Router |
| Couche 3 — Gateway | **NGINX 1.25** (reverse proxy, auth_request, load-balancing) |
| Couche 4 — Microservices | **Node.js + Express.js** (routes, controllers, middlewares) |
| ORM | **Sequelize 6** (multi-schema PostgreSQL) |
| Base SQL | PostgreSQL 15 |
| Base NoSQL | MongoDB 6 |
| Cache / Temps réel | Redis 7 |
| Message broker | RabbitMQ 3 |
| Sécurité | JWT (jsonwebtoken) + bcrypt |
| Monitoring | Prometheus + Grafana |
| Conteneurisation | Docker + Docker Compose |

---

## Guide de contribution

### A. Ajouter un type ou une entité métier

**Fichier :** `packages/shared-types/src/index.ts`

Déclarer l'interface et ses types de statuts. Importable dans toute app ou service :
```typescript
import type { MonType } from '@aeronexis-dynamics/shared-types'
```

---

### B. Ajouter un endpoint back-end et l'exposer au front

1. **Service** (couche 4) — ajouter dans `services/<nom>-service/src/` :
   - Modèle Sequelize dans `src/models/index.js`
   - Controller dans `src/controllers/<domaine>.controller.js`
   - Route dans `src/routes/<domaine>.routes.js`
2. **Gateway** (couche 3) — la route est automatiquement routée si le préfixe `/api/<service>/` est déjà déclaré dans `nginx.conf`. Sinon, ajouter un nouveau bloc `location` dans `services/api-gateway/nginx.conf`
3. **Fonction API** (couche 2→1) — ajouter dans `apps/<app>/src/api/<domaine>.ts` :
```typescript
export async function getMaDonnee(): Promise<MaType[]> {
  const res = await apiClient.get<MaType[]>('/api/<service>/ma-route')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
```
4. **Page** — créer ou mettre à jour `apps/<app>/src/pages/MaPage.tsx` avec `useQuery` / `useMutation` dans le composant (pas de dossier `hooks/`) :
```tsx
import { useQuery } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getMaDonnee } from '@/api/ma-donnee'

export function MaPage() {
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ma-donnee'],
    queryFn: getMaDonnee,
  })
  if (isLoading) return <div>Chargement...</div>
  if (isError) return <QueryErrorAlert error={error} onRetry={() => refetch()} title="..." />
  // ...
}
```
Ne jamais appeler `apiClient` directement depuis la page.

---

### C. Ajouter une page dans une application

1. Créer `apps/<app>/src/pages/MaPage.tsx` avec les appels `useQuery` / `useMutation` inline (voir pattern ci-dessus)
2. Si besoin, ajouter les fonctions HTTP dans `apps/<app>/src/api/`
3. Ajouter avec lazy loading dans `apps/<app>/src/routes/index.tsx` :
```tsx
const MaPage = lazy(() => import('@/pages/MaPage').then((m) => ({ default: m.MaPage })))
{ path: '/ma-route', element: <Suspense fallback={<Loading />}><MaPage /></Suspense> }
```

---

### D. Ajouter un composant

L'ERP utilise un **Design System partagé** basé sur TailwindCSS (Glassmorphism, thèmes sombres). 

- **Composants UI génériques et Layouts** : Ils vivent et doivent être ajoutés/modifiés dans `packages/ui/components/`. Exemples : `DataTable`, `Sidebar`, `TopHeader`, `Modal`, `DateRangePicker`. 
- **Composant métier spécifique** : Ils vivent dans `apps/<app>/src/components/` au même niveau. Exemples : `LotProgressCard.tsx`, `IncidentBadge.tsx`.

Nomenclature claire pour éviter les conflits : capitaliser les noms (ex: `Button.tsx`, pas `button.tsx`).

**Note :** `AppLayout.tsx` est à la racine de `src/` de chaque app car il se charge de lier la `Sidebar` générique (avec le menu de l'app) au `SharedAppLayout`.

**Erreurs de requêtes :** utiliser `QueryErrorAlert` depuis `@aeronexis-dynamics/ui` lorsque `isError` est vrai sur une requête React Query :

```tsx
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'

if (isError) {
  return <QueryErrorAlert error={error} onRetry={() => refetch()} title="..." />
}
```

---

### E. Ajouter un microservice (couche 4)

1. Créer `services/<nom>-service/` en copiant la structure de `production-service`
2. Adapter `src/models/index.js` (nouveaux modèles Sequelize)
3. Mettre à jour `src/db/sequelize.js` avec le bon `DB_SCHEMA`
4. Ajouter dans `docker-compose.yml` (build, ports, envs, réseau `aeronexis-network`)
5. Ajouter un bloc `upstream` et un bloc `location` dans `services/api-gateway/nginx.conf`
6. Ajouter les types dans `packages/shared-types/src/index.ts`
7. Ajouter la cible dans `infrastructure/monitoring/prometheus.yml`

---

### F. Ajouter une nouvelle application (couche 1)

1. Ajouter le rôle dans `packages/shared-types/src/index.ts` → type `Role`
2. Créer `apps/<nom>-app/` en copiant la structure de `production-app` (sans dossier `hooks/`, React Query inline dans les pages)
3. Déclarer les dépendances `@aeronexis-dynamics/auth`, `api-client`, `shared-types`, `ui`
4. Créer `.env.development` avec `VITE_AUTH_BYPASS=true`
5. Ajouter le rôle dans la logique RBAC de `services/auth-service/src/models/User.js`

---

### G. Configuration de développement

Les variables d'environnement sont centralisées à la racine du monorepo (`/.env.development` et `/.env.production`) pour garantir la cohérence réseau.

**Fichier :** `/.env.development` (à la racine)

```env
VITE_APP_URL_OPERATOR=/production/
VITE_APP_URL_LOGISTICS=/logistics/
VITE_APP_URL_SALES=/sales/
VITE_APP_URL_ADMIN=/admin/
VITE_PORTAL_URL=/
```

Toutes les routes utilisent des chemins relatifs, ce qui confie le routage dynamique directement à NGINX.

Si vous souhaitez développer une app métier de manière isolée sans flux login, vous pouvez ajouter `VITE_AUTH_BYPASS=true` — cela injecte un utilisateur mock et ignore la vérification de session.

---

## Développement local

L'approche privilégiée pour le développement local est le mode "production-like" avec Docker complet. NGINX sert directement les assets statiques front-end compilés à l'intérieur du conteneur, ce qui garantit une fidélité totale avec le déploiement final et évite les problèmes de CORS ou d'isolation de `localStorage`.

| Variable | Valeur | Effet |
|---|---|---|
| `VITE_AUTH_BYPASS=true` | `.env.development` | Accès direct aux routes protégées ; utilisateur mock injecté |
| `VITE_AUTH_BYPASS=false` | test du flux login | Apps métier : redirect portail `/` si pas de token ; portail : page login réelle |

```bash
# Démarrer l'infrastructure complète (Front-ends compilés + DBs + RabbitMQ + NGINX + Microservices)
cd infrastructure/docker
docker compose up -d --build

# Point d'entrée utilisateur (NGINX écoute sur le port 80)
# http://localhost/  (portail via NGINX)

# Initialiser la base (à faire une fois par service pour le schéma et les données)
docker exec erp-auth-service npm run db:migrate && docker exec erp-auth-service npm run db:seed
docker exec erp-production-service npm run db:migrate && docker exec erp-production-service npm run db:seed
docker exec erp-logistics-service npm run db:migrate && docker exec erp-logistics-service npm run db:seed
```

> **Hot-Reloading (Optionnel)** : Si vous travaillez intensivement sur le front-end et avez besoin du rafraîchissement en temps réel, vous pouvez utiliser la commande `npm run dev:front` à la racine (qui lance Vite sur les ports 4000, 4001, 4002) et monter le fichier `nginx.dev.conf` dans `docker-compose.yml` en remplacement de `nginx.conf`.

---

## Sécurité et Scalabilité

- Les microservices ne sont **jamais exposés directement** : toutes les requêtes passent par NGINX (port 80)
- L'authentification repose sur des **JWT** validés par `auth-service /auth/verify` via le mécanisme `auth_request` de NGINX
- Les droits sont contrôlés par **RBAC** (rôles : `operator`, `logistics`, `sales`, `director`, `admin`) — le champ `role` du payload JWT est transmis via le header `X-User`
- Chaque service est **conteneurisé indépendamment** et peut être scalé horizontalement (NGINX assure le load-balancing)
- Le découplage via **RabbitMQ** absorbe les pics de charge sans blocage synchrone
- Les mots de passe sont hashés avec **bcrypt** — jamais stockés en clair
- Les secrets sont gérés exclusivement par **variables d'environnement**, jamais versionnés
