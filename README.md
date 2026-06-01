# AERONEXIS Dynamics - ERP Modulaire

Bienvenue sur le dépôt du projet **AERONEXIS Dynamics**, un ERP modulaire conçu avec une architecture orientée services (SOA) en 4 couches.

Ce guide est destiné à toute personne souhaitant tester ou contribuer au projet en local pour la première fois.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :
- **Node.js** (v18 ou v20 recommandé)
- **npm** (inclus avec Node.js)
- **Docker** et **Docker Compose** (pour faire tourner les bases de données et les microservices)
- **Git**

## 🚀 Guide de démarrage rapide (Quickstart)

### 1. Cloner le projet et installer les dépendances

Le projet utilise les "Workspaces" de npm pour gérer les différents paquets et applications dans un seul dépôt (monorepo).

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/aeronexis-modular-erp.git
cd aeronexis-modular-erp

# Installer toutes les dépendances (Front-end, Back-end, Packages partagés)
npm install
```

### 2. Démarrer l'infrastructure et le Back-end (Docker)

Le backend (API Gateway NGINX, Services Express.js, Bases de données PostgreSQL, Redis, RabbitMQ) est entièrement conteneurisé.

```bash
# Se placer dans le dossier de l'infrastructure
cd infrastructure/docker

# Construire et démarrer tous les conteneurs en arrière-plan
docker compose up -d --build

# Revenir à la racine du projet
cd ../..
```

*Note : La première fois, le téléchargement des images et la construction des services peuvent prendre quelques minutes.*

### 3. Initialiser les bases de données (Seed)

Pour que l'ERP soit utilisable, il faut insérer des données de test (utilisateurs, ordres de fabrication, incidents, etc.) dans les bases de données PostgreSQL. Ces bases tournent dans Docker.

Exécutez les commandes suivantes depuis la racine de votre terminal :

```bash
# 1. Créer les utilisateurs de test (Service Authentification)
docker exec erp-auth-service npm run db:seed

# 2. Créer les données de production factices (Service Production)
docker exec erp-production-service npm run db:seed
```

### 4. Démarrer l'application Front-end

Le front-end (React / Vite) se lance localement sur votre machine (hors Docker).

```bash
# Démarrer le front-end depuis la racine (en ciblant le workspace spécifique)
npm run dev -w @aeronexis-dynamics/production-app
```

Le front-end sera accessible à l'adresse : **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Comptes de test et Authentification

Le projet intègre un flux d'authentification complet et sécurisé de bout en bout :
- **Design moderne** : Page de connexion avec effet "Glassmorphism" et retours d'erreurs clairs.
- **Routage intelligent** : Un composant `RoleRedirector` aiguille automatiquement l'utilisateur vers le bon tableau de bord en fonction de son rôle après connexion.
- **Sécurité** : Les requêtes au backend passent par la Gateway NGINX qui valide les jetons JWT de manière centralisée et gère les requêtes CORS.

Une fois sur la page de connexion ([http://localhost:5173](http://localhost:5173)), vous pouvez utiliser l'un de ces comptes de test pour vous connecter. 

| Rôle | Email | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Opérateur** | `operator@aeronexis.com` | `Operateur123!` | Accès au tableau de bord de production, gestion des ordres de fabrication. Permet de tester le bouton de déconnexion. |
| **Administrateur** | `admin@aeronexis.com` | `Admin123!` | Accès complet (redirection vers l'interface admin). |

---

## 🏗️ Architecture du projet

Le projet respecte une architecture stricte en 4 couches (SOA) :
1. **Couche 1 (Front-end Apps)** : `apps/` (ex: `production-app`) - React, Vite, Tailwind.
2. **Couche 2 (Middleware & Partagé)** : `packages/` - Client API normalisé, Types partagés, module d'Authentification.
3. **Couche 3 (API Gateway)** : `services/api-gateway/` - NGINX (Routage, CORS, Validation JWT).
4. **Couche 4 (Microservices)** : `services/` (ex: `auth-service`, `production-service`) - Express.js, Sequelize, PostgreSQL.

Pour plus de détails techniques, consultez le document [ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md).

## 🛠️ Dépannage courant

- **Le Front-end n'arrive pas à se connecter (Failed to fetch) :** Vérifiez que Docker Desktop tourne bien et que la commande `docker compose ps` montre `erp-api-gateway`, `erp-auth-service` et `erp-production-service` en statut "Up".
- **Les données ne s'affichent pas dans le tableau de bord :** Assurez-vous d'avoir bien exécuté l'étape 3 (Seed).
- **Problème de base de données (identifiants invalides) :** Si vous avez déjà fait tourner un conteneur PostgreSQL sur le port 5432, videz les volumes avec `cd infrastructure/docker && docker compose down -v` puis relancez `docker compose up -d`.
