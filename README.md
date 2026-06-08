# AERONEXIS Dynamics - ERP Modulaire

AERONEXIS Dynamics est un système ERP modulaire conçu avec une architecture Orientée Services (SOA) / Microservices à 4 couches. Le projet est organisé en monorepo (npm workspaces) pour centraliser la gestion des dépendances tout en isolant chaque domaine métier.

---

## 🏗 Architecture (SOA / Microservices)

L'application est découpée en 4 couches distinctes :

1. **Couche 1 : Applications Front-end** (React 18, Vite, TypeScript, Tailwind CSS, React Query)
   - Interface utilisateur par profil (Production, Logistique, Commercial, Admin).
2. **Couche 2 : Middleware Applicatif (Packages partagés)**
   - Composants d'interface utilisateur, gestion de l'authentification (`@aeronexis-dynamics/auth`), typages partagés, et client API HTTP centralisé.
3. **Couche 3 : API Gateway (NGINX)**
   - Point d'entrée unique (Port 80) servant de reverse proxy, vérifiant les jetons JWT (via `auth_request` vers le service d'authentification) et distribuant le trafic vers les microservices concernés.
4. **Couche 4 : Microservices Back-end (Node.js, Express.js, Sequelize)**
   - Services isolés par domaine (Auth, Production, Logistics, etc.) utilisant PostgreSQL pour les données structurées.

*Consultez [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) pour plus de détails sur les choix d'architecture, les flux de données et la stack technique complète.*

---

## 📂 Structure du Monorepo

```text
aeronexis-modular-erp/
├── portal/                      # Point d'entrée UI (Shell) — login centralisé + redirection
├── apps/                        # Couche 1 : Applications métiers (ex: production-app)
│   ├── production-app/
│   └── logistics-app/
├── packages/                    # Couche 2 : Modules partagés (auth, api-client, ui, shared-types)
├── services/                    # Couche 3 & 4 : Microservices
│   ├── api-gateway/             # Configuration NGINX et Dockerfile
│   ├── auth-service/            # Microservice d'authentification et gestion JWT (Express/Sequelize)
│   └── production-service/      # Microservice métier Production (Express/Sequelize)
├── infrastructure/
│   └── docker/                  # Fichier docker-compose.yml global
└── docs/                        # Documentation détaillée (architecture, conventions)
```

---

## 📱 Structure Frontend Simplifiée

Chaque application frontend (dans `apps/`) suit une organisation plate pour une navigation et maintenance facilitées :

```text
production-app/src/
├── components/          # Tous les composants React (UI + metier) - un seul niveau
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Form.tsx
│   ├── Progress.tsx
│   ├── Sidebar.tsx
│   ├── LotProgressCard.tsx
│   └── IncidentBadge.tsx
├── pages/               # Vues routees (UI + React Query inline)
│   ├── DashboardPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── IncidentPage.tsx
│   ├── IncidentDetailPage.tsx
│   └── HistoryPage.tsx
├── routes/              # Configuration React Router
├── api/                 # Fonctions HTTP pures (appellent api-client)
│   ├── orders.ts
│   ├── incidents.ts
│   └── users.ts
├── lib/                 # Utilitaires (utils.ts)
├── AppLayout.tsx        # Structure globale de l'app (sidebar + outlet)
├── App.tsx              # Point d'entree (providers)
├── main.tsx
└── index.css
```

**Principes :**
- Pas de sous-dossiers dans `components/` - tous les fichiers au même niveau
- Pas de dossier `hooks/` - `useQuery` / `useMutation` sont appelés directement dans le composant page
- Nomenclature claire : les noms de fichiers sont explicites (ex: `OrderDetailPage.tsx`)
- Imports courts : `import { Button } from '@/components/Button'`
- `AppLayout.tsx` à la racine de `src/` (composant de structure globale)
- Séparation claire : `pages/` (UI + React Query) → `api/` (HTTP) → `@aeronexis-dynamics/api-client`
- Queries partagées : même `queryKey` dupliquée dans plusieurs pages si besoin (cache React Query partagé)
- Composants réutilisables entre apps : `@aeronexis-dynamics/ui` (`QueryErrorAlert`, `getErrorMessage`)

**Exemple minimal** (`OrdersPage.tsx`) :
```tsx
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/orders'

export function OrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })
  // ...
}
```

---

## 🚀 Démarrage Rapide (Développement Local)

### Prérequis
- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/) (v10+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ou Docker Engine & Docker Compose

### 1. Installation des dépendances
À la racine du projet, exécutez la commande suivante pour installer toutes les dépendances dans l'ensemble des workspaces :
```bash
npm install
```

### 2. Démarrage de l'infrastructure Docker
Lancez les services backend (Bases de données, RabbitMQ, Redis, NGINX Gateway, Auth Service, Production Service) via Docker Compose :
```bash
cd infrastructure/docker
docker compose up -d --build
```
*Le flag `--build` assure que l'image NGINX (API Gateway) et les microservices Node.js sont construits avec les dernières sources de votre code local.*

### 3. Initialisation et Peuplement de la Base de Données (Seeding)
Pour que l'authentification et les tableaux de bord fonctionnent, il faut exécuter les scripts de migration (pour créer les schémas et tables) et de seeding (pour insérer les données de démonstration) dans la base PostgreSQL conteneurisée :
```bash
# Service d'authentification (Schéma auth, utilisateurs de test)
docker exec erp-auth-service npm run db:migrate
docker exec erp-auth-service npm run db:seed

# Service de production (Schéma production, ordres de fabrication, lots, incidents)
docker exec erp-production-service npm run db:migrate
docker exec erp-production-service npm run db:seed

# Service de logistique (Schéma logistics, stocks, réservations, expéditions)
docker exec erp-logistics-service npm run db:migrate
docker exec erp-logistics-service npm run db:seed

# Service des ventes (Schéma sales, clients, commandes)
docker exec erp-sales-service npm run db:migrate
docker exec erp-sales-service npm run db:seed
```

**Comptes de test disponibles :**
- **Administrateur** : `admin@aeronexis.com` / `Admin123!` (Redirige vers `/admin/` — stub)
- **Opérateur** : `operator@aeronexis.com` / `Operateur123!` (Redirige vers `/production/dashboard`)
- **Logistique** : `logistics@aeronexis.com` / `Logistique123!` (Redirige vers `/logistics/`)

### 4. Accès aux applications (Front-end)

Le **portail** (`src/`) est le point d'entrée utilisateur unique. Les apps métier n'ont plus de page `/login` locale : toute session non authentifiée est renvoyée vers le portail.

Grâce à la commande Docker lancée à l'étape 2, **toutes les applications front-end ont déjà été compilées et sont servies par NGINX** en mode production (fichier `nginx.conf`). 

Vous n'avez pas besoin de lancer de serveur Vite (plus besoin de `npm run dev:front`).

**Accès natif (via NGINX sur le port 80) :**
- Portail / login : [http://localhost/](http://localhost/)
- Production : [http://localhost/production/](http://localhost/production/)
- Logistique : [http://localhost/logistics/](http://localhost/logistics/)

*(Le `localStorage` est naturellement partagé entre toutes les applications car elles tournent toutes sur le même domaine `localhost`, ce qui évite les boucles de redirection au login).*

> **Note de développement** : Si vous souhaitez développer en local avec le hot-reloading (Vite), vous pouvez utiliser `npm run dev:front` (qui lance les serveurs sur les ports 4000, 4001, 4002) et modifier le `docker-compose.yml` pour monter le fichier `nginx.dev.conf` en volume.

---

## 🛠 Commandes utiles

- **Arrêter les conteneurs Docker** : 
  ```bash
  cd infrastructure/docker
  docker compose down
  ```
  *(Ajoutez `-v` pour détruire également les volumes de bases de données)*
  
- **Vérifier les logs de la passerelle API** :
  ```bash
  docker logs -f erp-api-gateway
  ```

- **Re-builder un service spécifique après une modification de code** :
  ```bash
  cd infrastructure/docker
  docker compose up -d --build auth-service
  ```

---

## 🔐 Configuration de l'environnement Front-end

Les variables d'environnement sont centralisées à la racine du monorepo pour garantir que toutes les applications partagent la même configuration réseau.

### Variables partagées (`.env.development` / `.env.production`)
```env
VITE_APP_URL_OPERATOR=/production/
VITE_APP_URL_LOGISTICS=/logistics/
VITE_APP_URL_SALES=/sales/
VITE_APP_URL_ADMIN=/admin/
VITE_PORTAL_URL=/
```

Toutes les routes utilisent désormais des chemins relatifs. Cela permet à NGINX de gérer le routage dynamiquement sans se soucier des ports (fini les `http://localhost:4000/...`), reproduisant ainsi fidèlement l'environnement de production.

---

## 🤝 Conventions
Le projet suit les normes suivantes :
- **Commits** : Standard de "Conventional Commits" (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- **Architecture** : Strict respect de la séparation des 4 couches et interdiction de communication asynchrone directe non justifiée.
