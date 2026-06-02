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
├── apps/                        # Couche 1 : Applications métiers (ex: production-app)
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
├── hooks/               # Tous les custom hooks - un seul niveau
│   ├── useOrders.ts
│   ├── useIncidents.ts
│   ├── useHistory.ts
│   ├── useLotDetail.ts
│   ├── useReportIncident.ts
│   └── useUpdateLotStatus.ts
├── pages/               # Vues routees (DashboardPage, OrdersPage, etc.)
├── routes/              # Configuration React Router
├── api/                 # Fonctions HTTP pures (appellent api-client)
├── lib/                 # Utilitaires (utils.ts)
├── AppLayout.tsx        # Structure globale de l'app (sidebar + outlet)
├── App.tsx              # Point d'entree (providers)
├── main.tsx
└── index.css
```

**Principes :**
- Pas de sous-dossiers dans `components/` ou `hooks/` - tous les fichiers au même niveau
- Nomenclature claire : les noms de fichiers sont explicites (ex: `useUpdateLotStatus` vs `useLotDetail`)
- Imports courts : `import { Button } from '@/components/Button'`
- `AppLayout.tsx` à la racine de `src/` (composant de structure globale)
- Séparation claire : `api/` (HTTP) → `hooks/` (React Query) → `pages/` (UI)
- Composants réutilisables entre apps : `@aeronexis-dynamics/ui` (`QueryErrorAlert`, `getErrorMessage`)

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
- **Administrateur** : `admin@aeronexis.com` / `Admin123!`
- **Opérateur** : `operator@aeronexis.com` / `Operateur123!` (Redirige vers le Dashboard Production)

### 4. Démarrage de l'application Front-end
```bash
cd apps/production-app
npm run dev
```
L'application `production-app` sera accessible à l'adresse : [http://localhost:5173](http://localhost:5173).  
*(Toutes les requêtes d'API seront envoyées vers la passerelle NGINX fonctionnant sur le port 80 de `localhost`).*

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
Par défaut, le flux de connexion (Login flow) nécessite l'API Gateway. 
Si vous souhaitez développer le front-end de manière isolée sans la couche Docker, modifiez le fichier `apps/production-app/.env.development` :
```env
VITE_AUTH_BYPASS=true
```
Cela activera un bypass simulant un utilisateur authentifié et injectera un "Mock Token".

---

## 🤝 Conventions
Le projet suit les normes suivantes :
- **Commits** : Standard de "Conventional Commits" (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- **Architecture** : Strict respect de la séparation des 4 couches et interdiction de communication asynchrone directe non justifiée.
