# Conventions Git & Git Flow

> Guide de référence pour les conventions Git et la gestion des branches en équipe.

---

## Table des matières

1. [Conventions de commits](#1-conventions-de-commits)
2. [Convention de nommage des branches](#2-convention-de-nommage-des-branches)
3. [Git Flow](#3-git-flow)
4. [Pull Requests & Code Review](#4-pull-requests--code-review)
5. [Bonnes pratiques générales](#5-bonnes-pratiques-générales)

---

## 1. Conventions de commits

### Format du message de commit

On suit la spécification **Conventional Commits** :

```
<type>(<scope>): <description courte>

[corps optionnel]

[footer optionnel]
```

### Types de commits

| Type | Description | Exemple |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | `feat(auth): add JWT login` |
| `fix` | Correction de bug | `fix(cart): fix item count on reload` |
| `docs` | Documentation uniquement | `docs(readme): update setup guide` |
| `style` | Formatage, espaces (sans impact logique) | `style: reformat with prettier` |
| `refactor` | Refactorisation sans bug fix ni feature | `refactor(api): simplify error handling` |
| `perf` | Amélioration de performance | `perf(query): add index on user_id` |
| `test` | Ajout ou modification de tests | `test(auth): add unit tests for login` |
| `build` | Système de build, dépendances | `build: upgrade webpack to v5` |
| `ci` | Configuration CI/CD | `ci: add GitHub Actions workflow` |
| `chore` | Tâches diverses sans impact code | `chore: update .gitignore` |
| `revert` | Annulation d'un commit précédent | `revert: feat(auth): add JWT login` |

### Règles d'écriture

- **Description courte** : impératif présent, en anglais, sans majuscule initiale, sans point final, max 72 caractères
- **Scope** (optionnel) : module ou domaine concerné entre parenthèses
- **Corps** : séparé par une ligne vide, explique le *pourquoi*, pas le *quoi*
- **Footer** : références aux tickets (`Closes #42`, `Refs #12`), breaking changes (`BREAKING CHANGE: ...`)

### Exemples complets

```
feat(user-profile): add avatar upload functionality

Users can now upload a profile picture in JPEG or PNG format.
File size is limited to 2MB.

Closes #87
```

```
fix(payment): prevent duplicate transaction on retry

The retry button was not disabled after the first click,
causing multiple charges. Added a loading state to block
further submissions.

Fixes #102
```

```
refactor(api): replace axios with fetch

BREAKING CHANGE: removed the `baseURL` config option.
Consumers must now pass the full URL in each request.
```

---

## 2. Convention de nommage des branches

### Format

```
<type>/<ticket-id>-<description-courte>
```

> La description est en **kebab-case**, en anglais, concise.

### Types de branches

| Type | Usage | Exemple |
|---|---|---|
| `feature/` | Nouvelle fonctionnalité | `feature/AUTH-42-google-oauth` |
| `fix/` | Correction de bug | `fix/CART-17-quantity-reset` |
| `hotfix/` | Correction urgente en production | `hotfix/PAY-5-double-charge` |
| `release/` | Préparation d'une release | `release/2.4.0` |
| `refactor/` | Refactorisation de code | `refactor/DB-8-query-optimization` |
| `docs/` | Documentation | `docs/readme-setup-guide` |
| `chore/` | Maintenance, config | `chore/update-dependencies` |
| `test/` | Ajout de tests | `test/auth-unit-tests` |

### Règles

- Tout en **minuscules**
- Séparateur **tiret `-`** uniquement (pas d'underscore ni d'espace)
- Préfixer par le **numéro de ticket** si applicable
- Pas de noms génériques (`test`, `wip`, `fix2`)

---

## 3. Git Flow

Git Flow est un modèle de branches structuré adapté aux projets avec des cycles de release définis.

### Vue d'ensemble des branches

```
main (production)
  └── hotfix/*
develop (intégration)
  ├── feature/*
  ├── fix/*
  └── refactor/*
        └── release/*
```

### Branches permanentes

#### `main`
- Représente le code **en production**
- Toujours stable et deployable
- **Jamais de commit direct** — uniquement via merge de `release/*` ou `hotfix/*`
- Chaque merge sur `main` est **tagué** avec la version (`v1.2.0`)

#### `develop`
- Branche d'**intégration continue**
- Contient les dernières fonctionnalités validées
- Base de création pour toutes les branches `feature/*`
- **Jamais de commit direct** — uniquement via merge de branches enfants

---

### Branches temporaires

#### `feature/*`

Développement d'une **nouvelle fonctionnalité**.

```bash
# Créer une feature
git checkout develop
git pull origin develop
git checkout -b feature/AUTH-42-google-oauth

# ... développement ...

# Merger dans develop
git checkout develop
git merge --no-ff feature/AUTH-42-google-oauth
git push origin develop
git branch -d feature/AUTH-42-google-oauth
```

- Créée depuis : `develop`
- Mergée dans : `develop`
- Durée de vie : le temps du développement de la fonctionnalité

---

#### `release/*`

Préparation d'une **mise en production** (corrections mineures, bump de version, changelog).

```bash
# Créer une release
git checkout develop
git pull origin develop
git checkout -b release/2.4.0

# ... corrections mineures, mise à jour de version ...

# Merger dans main ET develop
git checkout main
git merge --no-ff release/2.4.0
git tag -a v2.4.0 -m "Release 2.4.0"

git checkout develop
git merge --no-ff release/2.4.0

git branch -d release/2.4.0
```

- Créée depuis : `develop`
- Mergée dans : `main` **et** `develop`
- Durée de vie : quelques jours max

---

#### `hotfix/*`

Correction **urgente d'un bug critique** en production.

```bash
# Créer un hotfix
git checkout main
git pull origin main
git checkout -b hotfix/PAY-5-double-charge

# ... correction ...

# Merger dans main ET develop
git checkout main
git merge --no-ff hotfix/PAY-5-double-charge
git tag -a v2.4.1 -m "Hotfix 2.4.1"

git checkout develop
git merge --no-ff hotfix/PAY-5-double-charge

git branch -d hotfix/PAY-5-double-charge
```

- Créée depuis : `main`
- Mergée dans : `main` **et** `develop`
- Durée de vie : quelques heures à 1-2 jours max

---

#### `fix/*`

Correction de bug **non urgente**, planifiée dans un sprint.

```bash
git checkout develop
git checkout -b fix/CART-17-quantity-reset

# ... correction ...

git checkout develop
git merge --no-ff fix/CART-17-quantity-reset
git branch -d fix/CART-17-quantity-reset
```

- Créée depuis : `develop`
- Mergée dans : `develop`

---

### Cycle de vie complet

```
develop ──────────────────────────────────────────►
   │                                    ▲
   │ git checkout -b feature/X          │ merge --no-ff
   ▼                                    │
feature/X ──────── commits ────────────┘

develop ──────────────────────────────────────────►
   │                         ▲         ▲
   │ git checkout -b          │         │
   ▼  release/2.4.0           │         │
release/2.4.0 ── corrections ─┘         │
   │                                    │
   │ merge --no-ff                      │
   ▼                                    │
main (tag v2.4.0) ──────────────────────┘
```

---

### Versionnement sémantique (SemVer)

Les tags sur `main` suivent la convention `vMAJOR.MINOR.PATCH` :

| Incrément | Quand | Exemple |
|---|---|---|
| **MAJOR** | Breaking change, refonte majeure | `v1.0.0` → `v2.0.0` |
| **MINOR** | Nouvelle fonctionnalité rétrocompatible | `v2.3.0` → `v2.4.0` |
| **PATCH** | Bug fix, hotfix | `v2.4.0` → `v2.4.1` |

```bash
# Créer un tag annoté
git tag -a v2.4.0 -m "Release 2.4.0 - Add Google OAuth and payment improvements"
git push origin v2.4.0

# Lister les tags
git tag -l

# Pousser tous les tags
git push origin --tags
```

---

## 4. Pull Requests & Code Review

### Template de Pull Request

```markdown
## Description
<!-- Décris les changements effectués et leur raison -->

## Type de changement
- [ ] feat – nouvelle fonctionnalité
- [ ] fix – correction de bug
- [ ] refactor – refactorisation
- [ ] docs – documentation
- [ ] chore – maintenance

## Ticket lié
Closes #[numéro]

## Checklist
- [ ] Le code compile et les tests passent
- [ ] J'ai ajouté/mis à jour les tests correspondants
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Les migrations de base de données sont incluses si besoin
- [ ] Pas de secrets ou credentials dans le code
```

### Règles de code review

- **Taille** : une PR ne doit pas dépasser ~400 lignes modifiées (hors fichiers générés)
- **Durée** : une PR ouverte depuis plus de 3 jours doit être rebasée sur `develop`
- **Approbations** : minimum **1 reviewer** pour les branches `feature/fix`, **2** pour `release/hotfix`
- **Discussions** : toute discussion doit être résolue avant le merge
- **Merge** : toujours avec `--no-ff` (merge commit) pour garder l'historique lisible

---

## 5. Bonnes pratiques générales

### Commits

- **Atomicité** : un commit = une modification logique (pas de "fix stuff + new feature + refactor")
- **Fréquence** : commiter souvent, des petits commits valent mieux qu'un gros commit en fin de journée
- **Ne jamais commiter** : secrets, credentials, fichiers de build, dépendances (`node_modules/`, `dist/`, `.env`)
- **Ne jamais réécrire l'historique** sur `main` ou `develop` (pas de `rebase -i`, `force push` sur branches partagées)

### Branches

- **Mettre à jour régulièrement** sa branche feature depuis `develop` :
  ```bash
  git fetch origin
  git rebase origin/develop
  # ou
  git merge origin/develop
  ```
- **Supprimer les branches** fusionnées localement et sur le remote
- **Ne pas travailler directement** sur `main` ou `develop`

### `.gitignore`

Toujours ignorer au minimum :

```gitignore
# Dépendances
node_modules/
vendor/

# Build
dist/
build/
*.min.js

# Environnement
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.suo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
```

### Configuration Git recommandée

```bash
# Identité
git config --global user.name "Prénom Nom"
git config --global user.email "prenom.nom@exemple.com"

# Éditeur
git config --global core.editor "code --wait"

# Affichage des conflits
git config --global merge.conflictstyle diff3

# Rebase par défaut sur git pull
git config --global pull.rebase true

# Alias utiles
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.st "status -sb"
git config --global alias.co "checkout"
```

---

> **Référence** : [Conventional Commits](https://www.conventionalcommits.org) · [Git Flow (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) · [SemVer](https://semver.org)
