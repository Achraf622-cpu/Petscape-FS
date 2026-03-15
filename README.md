# File Rouge — PetsCape

**Projet de fin d’année** — Plateforme web de gestion d’adoptions animales, signalements perdus/trouvés et dons pour refuges.

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d’environnement](#variables-denvironnement)
- [Lancement](#lancement)
- [Structure du projet](#structure-du-projet)
- [Documentation technique](#documentation-technique)
- [Auteur & licence](#auteur--licence)

---

## Présentation

**File Rouge** (nom de dépôt) contient **PetsCape** : une application full-stack de type **refuge virtuel** permettant de :

- **Parcourir et adopter** des animaux (chiens, chats) avec demande d’adoption et prise de rendez-vous.
- **Signaler** des animaux perdus ou trouvés (avec photo, lieu, carte).
- **Faire des dons** via Stripe pour soutenir l’association.
- **Gérer** le tout côté administration (utilisateurs, animaux, adoptions, rendez-vous, dons, journaux d’audit).

Le backend expose une **API REST** sécurisée (JWT) et des **notifications en temps réel** (WebSocket STOMP). Le frontend est une **SPA Angular** responsive (Bootstrap, Tailwind, Leaflet pour les cartes).

---

## Fonctionnalités

| Domaine | Détail |
|--------|--------|
| **Authentification** | Inscription, connexion, JWT + refresh token, vérification email (optionnel). |
| **Animaux** | Liste, filtres, détail, statuts (disponible, réservé, adopté). |
| **Adoptions** | Demande d’adoption avec message ; admin : approuver / refuser. |
| **Rendez-vous** | Réservation de créneaux pour rencontrer un animal ; admin : confirmer / annuler ; notifications temps réel (user ↔ admin). |
| **Lost & Found** | Création de rapport (perdu/trouvé), photo, localisation (carte), contact ; marquer comme résolu (propriétaire). |
| **Notifications** | Notifications en temps réel (WebSocket) + liste et compteur dans l’API REST. |
| **Dons** | Paiement Stripe (Checkout Session), page succès/annulation. |
| **Admin** | Tableau de bord, CRUD animaux/espèces, gestion adoptions/rendez-vous/utilisateurs (ban), dons, journaux d’audit. |
| **Public** | Page d’accueil, stats, quiz, carte des signalements. |

---

## Stack technique

| Couche | Technologies |
|--------|--------------|
| **Backend** | Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, WebSocket (STOMP), PostgreSQL, Stripe, JavaMail. |
| **Frontend** | Angular 21, TypeScript 5.9, Bootstrap 5, Tailwind CSS, Leaflet, Chart.js, STOMP (WebSocket). |
| **Infra** | Docker & Docker Compose (PostgreSQL, API, frontend Nginx). |

---

## Prérequis

- **Java 17+** (pour lancer le backend en local)
- **Node.js 18+** et **npm** (pour le frontend)
- **PostgreSQL 14+** (ou utilisation exclusive de Docker)
- **Docker** et **Docker Compose** (recommandé pour tout faire tourner d’un coup)

---

## Installation

### Cloner le dépôt

```bash
git clone <url-du-repo>
cd "File Rouge"
```

### Avec Docker (recommandé)

Aucune installation de Java/Node/PostgreSQL sur la machine : tout tourne dans des conteneurs.

1. Créer un fichier `.env` à la racine (voir [Variables d’environnement](#variables-denvironnement)).
2. Lancer les services :

```bash
docker-compose up --build -d
```

L’application est accessible sur **http://localhost** (frontend) et l’API sur **http://localhost:8080** (ex. Swagger : `http://localhost:8080/swagger-ui.html`).

### Sans Docker (développement local)

1. **Base de données**  
   Créer une base PostgreSQL (ex. `petscape`) et noter l’URL, l’utilisateur et le mot de passe.

2. **Backend**  
   Dans `Petscape-Java/` :
   - Configurer `src/main/resources/application.properties` (ou un profil) avec l’URL JDBC, JWT, Stripe, SMTP si besoin.
   - Lancer : `mvn spring-boot:run`.

3. **Frontend**  
   Dans `PetScape-Angular/` :
   - `npm install`
   - Vérifier `src/environments/environment.ts` (ex. `apiUrl: 'http://localhost:8080/api'`).
   - Lancer : `npm start` (ou `ng serve`).  
   L’app est sur **http://localhost:4200**.

---

## Variables d’environnement

Utilisées par `docker-compose` pour l’API. Créer un fichier **`.env`** à la racine du projet :

```env
# Base de données
DB_PASSWORD=votre_mot_de_passe_postgres

# JWT
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
JWT_EXPIRATION_MS=900000
REFRESH_TOKEN_EXPIRATION_DAYS=7

# Stripe (dons)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_SUCCESS_URL=http://localhost/donate/success
STRIPE_CANCEL_URL=http://localhost/donate/cancel

# Email (optionnel, pour envoi de mails)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email
MAIL_PASSWORD=mot_de_passe_application

# App
APP_BASE_URL=http://localhost
```

En local (sans Docker), ces valeurs peuvent être définies dans les fichiers de configuration Spring ou dans les variables d’environnement du système.

---

## Lancement

| Mode | Commande | Accès |
|------|----------|--------|
| **Docker** | `docker-compose up -d` (ou `--build` si besoin) | Frontend : http://localhost — API : http://localhost:8080 |
| **Backend seul** | `cd Petscape-Java && mvn spring-boot:run` | API : http://localhost:8080 |
| **Frontend seul** | `cd PetScape-Angular && npm start` | http://localhost:4200 (à utiliser avec une API déjà lancée) |

Arrêter les conteneurs : `docker-compose down`.

---

## Structure du projet

```
File Rouge/
├── Petscape-Java/          # Backend Spring Boot
│   ├── src/main/java/      # Contrôleurs, services, entités, config, sécurité
│   ├── src/main/resources/ # application.properties, static
│   └── Dockerfile
├── PetScape-Angular/       # Frontend Angular
│   ├── src/app/            # Composants, services, guards, routes
│   ├── src/environments/
│   └── Dockerfile
├── docs/
│   └── UML-and-UseCases.md # Diagrammes de classes (Mermaid) et cas d’usage (PlantUML)
├── docker-compose.yml
└── README.md
```

---

## Documentation technique

- **Diagramme de classes (UML)** et **cas d’usage** : voir le fichier **`docs/UML-and-UseCases.md`**.  
  Il contient du code Mermaid (pour le diagramme de classes) et du PlantUML (pour les use cases), à coller dans [Mermaid Live](https://mermaid.live) ou [PlantUML](https://www.plantuml.com/plantuml/uml/).
- **API REST** : une fois le backend démarré, la documentation Swagger/OpenAPI est disponible sur `/swagger-ui.html` (ex. http://localhost:8080/swagger-ui.html).

---

## Auteur & licence

**Projet de fin d’année** — File Rouge / PetsCape.

Pour toute question ou réutilisation du code, contacter l’auteur du dépôt.  
Le projet peut être soumis à une licence spécifique (à indiquer ici le cas échéant).
