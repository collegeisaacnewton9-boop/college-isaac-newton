# Collège Isaac Newton — Nouveau Site Officiel

> **« Savoir aujourd'hui, réussir demain »**  
> Établissement scolaire d'excellence, de discipline et d'innovation technologique.  
> Du préscolaire au secondaire (Nouveau Secondaire NS1 à NS4) & Laboratoire numérique.

---

## 1. Vue d’Ensemble & Choix d’Architecture

Ce projet est une plateforme web moderne, rapide, accessible et sécurisée conçue pour le **Collège Isaac Newton**. Il remplace l'ancienne maquette par une application fullstack répondant aux standards internationaux des établissements scolaires d'élite.

### Architecture Technique
- **Front-End :** React 19 / Vite avec TypeScript, architecture modulaire par composants, Tailwind CSS v4, polices institutionnelles (`Playfair Display`, `Cinzel`, `Plus Jakarta Sans`).
- **Back-End :** Node.js / Express avec API REST structurée (`/api/admissions`, `/api/auth`, `/api/news`, `/api/events`, `/api/gallery`, `/api/documents`, `/api/contact`).
- **Base de Données & Modélisation :** Schéma PostgreSQL via **Prisma ORM** (`prisma/schema.prisma`), incluant contrôle d'accès par rôle (RBAC), hachage des mots de passe et journalisation d'audit.
- **Validation :** Schémas de validation stricts avec **Zod** pour toutes les entrées utilisateur (préinscription, contact, auth).
- **Internationalisation :** Architecture prête pour le trilinguisme (Français `FR`, Kreyòl Ayisyen `HT`, Anglais `EN`).
- **Sécurité :** Authentification par jetons JWT, protection anti-brute force, assainissement des entrées, aucune donnée sensible exposée côté client, politique stricte pour les données des mineurs.

---

## 2. Arborescence du Projet

```text
├── .env.example                    # Modèle des variables d'environnement (DB, JWT, Storage)
├── index.html                      # SEO optimisé, polices Google Fonts, Schema.org EducationalOrganization
├── metadata.json                   # Métadonnées du projet AI Studio
├── package.json                    # Dépendances front et back-end
├── prisma/
│   └── schema.prisma               # Modèle relationnel PostgreSQL (User, Admission, News, Event, etc.)
├── server.ts                       # Serveur Node.js / Express avec routes REST et middleware Vite
├── src/
│   ├── assets/
│   │   ├── images.ts               # Export des visuels authentiques du campus
│   │   └── images/                 # Photos générées et fidèles au campus réel
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.tsx       # Modale d'authentification et basculeur de rôles (Admin, Éditeur, Parent, Élève)
│   │   ├── layout/
│   │   │   ├── TopUtilityBar.tsx   # Barre supérieure : téléphone, email, horaires, sélecteur de langue
│   │   │   ├── Header.tsx          # En-tête fixe avec logo typographique, navigation à tiroirs et CTA
│   │   │   └── Footer.tsx          # Pied de page institutionnel complet et coordonnées
│   │   └── ui/
│   │       └── SchoolLogo.tsx      # Logo typographique vectoriel (livre ouvert + toque académique)
│   ├── data/
│   │   └── mockData.ts             # Données réalistes vérifiées du Collège Isaac Newton
│   ├── pages/
│   │   ├── HomePage.tsx            # Page d'accueil : Hero, piliers, programmes, lab info, news, galerie
│   │   ├── AboutPage.tsx           # Le Collège : Histoire, mission, vision, gouvernance, infrastructures
│   │   ├── ProgramsPage.tsx        # Programmes : Préscolaire, Fondamental (1e-9e AF), Secondaire (NS1-NS4), Pôle Numérique
│   │   ├── AdmissionsPage.tsx      # Admissions : Critères, étapes, constitution du dossier, FAQ
│   │   ├── PreRegistrationPage.tsx # Formulaire de préinscription multi-étapes avec validation et code CIN-2026-XXXX
│   │   ├── SchoolLifePage.tsx      # Vie scolaire : Cérémonie civique, rassemblement, clubs, uniforme
│   │   ├── NewsPage.tsx            # Actualités : Filtrage par catégorie et lecture intégrale
│   │   ├── EventsPage.tsx          # Calendrier académique officiel et rencontres
│   │   ├── GalleryPage.tsx         # Galerie photos haute résolution avec lightbox
│   │   ├── ResourcesPage.tsx       # Règlements, listes de fournitures à télécharger, portail
│   │   ├── ContactPage.tsx         # Formulaire de contact sécurisé, coordonnées, plan
│   │   ├── LegalPage.tsx           # Mentions légales conformes
│   │   ├── PrivacyPage.tsx         # Protection des données scolaires des mineurs
│   │   └── AdminDashboardPage.tsx  # Espace /admin protégé : métriques, suivi admissions, CMS
│   ├── services/
│   │   └── api.ts                  # Service client REST avec persistance locale résiliente
│   ├── types/
│   │   └── index.ts                # Contrats TypeScript et schémas Zod
│   ├── App.tsx                     # Routeur principal SPA et gestion d'état global
│   ├── index.css                   # Configuration Tailwind CSS v4 et variables de thème
│   └── main.tsx                    # Point d'entrée React
└── tsconfig.json
```

---

## 3. Instructions d'Installation et d'Exécution

### Prérequis
- Node.js version 20 ou supérieure
- Gestionnaire de paquets `npm` ou `bun`

### Installation
```bash
# Cloner le dépôt
git clone <votre-repo>
cd college-isaac-newton

# Installer les dépendances
npm install
```

### Configuration des variables d'environnement
Copiez le fichier `.env.example` en `.env` et adaptez les valeurs selon votre environnement :
```bash
cp .env.example .env
```

### Initialisation de la Base de Données Prisma (Optionnel pour PostgreSQL local/distant)
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init
```

### Lancement en Développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000` avec le serveur Express et le middleware Vite.

---

## 4. Comptes de Démonstration (Espace `/admin` & Portail)

Pour tester immédiatement les différents niveaux de privilèges (RBAC), cliquez sur **« Connexion »** ou **« Portail Sécurisé »** en haut à droite :
- 👑 **Direction Pédagogique (Admin) :** `admin@collegeisaacnewton.edu`
  - Accès complet aux métriques, changement de statut des préinscriptions, validation, refus, rédaction d'actualités et ajout d'événements.
- ✏️ **Secrétariat & Communication (Éditeur) :** `redaction@collegeisaacnewton.edu`
  - Gestion des publications du blog, documents téléchargeables et calendrier.
- 👨‍👩‍👧 **Espace Parent :** `parent.demo@collegeisaacnewton.edu`
  - Consultation des circulaires et suivi du dossier.
- 🎓 **Espace Élève :** `eleve.demo@collegeisaacnewton.edu`
  - Consultation de l'agenda et des ressources pédagogiques.

---

## 5. Déploiement VPS (Coolify / Railway / Dokploy / Docker)

### Message « Nixpacks is deprecated » sur votre VPS ?
Si votre interface VPS (ex: Coolify, Railway) affiche :
> *"Nixpacks is deprecated and is in maintenance mode upstream. We recommend Railpack, the successor of Nixpacks, for new and existing applications. Switch to Railpack in General settings."*

**Rassurez-vous : Votre application fonctionne parfaitement.**
Ce message informe simplement que le compilateur d'images système (Nixpacks) est remplacé par son successeur plus performant (**Railpack**).

Deux méthodes simples pour déployer sans accroc :

#### Option A — Basculer sur Railpack (Recommandé en 1 clic)
1. Cliquez sur le lien dans le bandeau : **« Switch to Railpack in General settings »** (ou rendez-vous dans l'onglet **General** de votre application).
2. Vérifiez que le **Build Pack** est configuré sur **Railpack**.
3. Lancez un **Redeploy**. Railpack détecte automatiquement notre stack Node.js / Vite / Express et compile en quelques secondes.

#### Option B — Utiliser le Dockerfile officiel (Indépendance totale)
1. Dans l'onglet **General** de votre projet VPS, réglez le **Build Pack** sur **Dockerfile**.
2. Le fichier `Dockerfile` à la racine du projet gère la compilation complète :
   - Node.js 22 Alpine
   - Build automatique des assets Vite et des images dans `dist/`
   - Démarrage via `npm start` (port `3000`)
3. Vous n'aurez plus jamais d'alerte liée aux outils tiers de build.

---

## 6. Checklist de Déploiement Sécurisé

1. **Variables d'environnement :**
   - Remplacer `JWT_SECRET` par une clé cryptographique aléatoire de 64 octets.
   - Configurer `DATABASE_URL` avec SSL activé si vous utilisez une base PostgreSQL distante.
2. **Gestion des Fichiers et Uploads :**
   - Stockage local sécurisé ou connecteur cloud pour les pièces jointes des candidats.
3. **Sécurité Réseau & Headers :**
   - Forcer le protocole HTTPS / certificat Let's Encrypt automatique (géré par votre VPS / reverse proxy).
4. **Surveillance & Journalisation :**
   - Examiner régulièrement les logs de santé (`/api/health`) pour vérifier l'état du serveur.
