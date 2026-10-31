# SSDC-RDC
Système de Sécurité des Données Classifiées — proposition pour la DANTIC, Secrétariat Général près le Président de la République démocratique du Congo, Division Bases de données, unité Analyse et développement des applications.

**Projet proposé, non accrédité et sans connexion à un système officiel. Données fictives uniquement.**

- Dépôt : https://github.com/PropheticPowerfulMan/ssdc
- Démonstration GitHub Pages : https://propheticpowerfulman.github.io/ssdc/ (après succès du workflow Pages).
- Emblème fourni par le porteur du projet, reproduit sans modification. Son utilisation ne vaut pas agrément institutionnel.

## Ce qui fonctionne
Backend FastAPI, SQLAlchemy, Pydantic et migration Alembic pour PostgreSQL. Identité Keycloak via introspection en ligne à chaque appel. Autorisation serveur RBAC/ABAC avec habilitation expirante, compartiments, département et autorisation nominative expirante. Dépôt PDF/texte limité à 10 Mo avec analyse ClamAV bloquante. Chiffrement AES-256-GCM par document avec enveloppe et contexte authentifié. Fournisseur de clé local pour le développement et adaptateur AWS KMS pour une intégration externe à valider. Métadonnées filtrées, lecture contrôlée, demandes, approbation séparée du demandeur, révocation et journal SQL.

Interface React/TypeScript/Vite/Tailwind en français : tableau de bord, recherche et filtre de documents, consultation du texte, téléchargement PDF contrôlé, formulaire de dépôt, demandes et décisions, classification, audit, thèmes clair/sombre et affichage mobile. La version Pages est une démonstration publique, sans connexion API, sans authentification simulant une session réelle et sans envoi de fichiers.

## Démarrage local
Prérequis : Docker Compose, Node 22+, Python 3.11+ pour les tests.

```powershell
./scripts/setup-dev.ps1
docker compose up --build -d
cd apps/frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Lancer http://localhost:5173. Keycloak : http://localhost:8080, API/OpenAPI : http://localhost:8000/docs. ClamAV doit terminer le chargement des signatures avant un dépôt. Le fichier .env racine contient les secrets locaux générés : ne jamais le committer. Conserver le KEK : sa perte rend les objets locaux irrécupérables.

Créer deux comptes **fictifs** dans le realm `ssdc` via Keycloak, définir leurs mots de passe et terminer l’enrôlement TOTP. Copier leurs UUID puis les provisionner explicitement :

```powershell
docker compose exec backend python -m app.provision UUID_AGENT --name "Agent fictif" --roles reader,uploader,approver --clearance 4 --compartments DANTIC
docker compose exec backend python -m app.provision UUID_LECTEUR --name "Lecteur fictif" --roles reader --clearance 4 --compartments DANTIC
```

Déposer un document avec le premier compte. Communiquer son UUID au lecteur. Le lecteur demande l’accès ; le propriétaire habilité avec rôle approver décide ; le lecteur peut consulter jusqu’à expiration ou révocation. Les administrateurs techniques n’ont pas de droit implicite de lecture.

## Vérification
```powershell
python -m venv .venv
./.venv/Scripts/python -m pip install -e './apps/backend[test]'
./.venv/Scripts/python -m pytest apps/backend/tests
npm --prefix apps/frontend ci
npm --prefix apps/frontend run build
```

Les tests couvrent les refus d’accès, l’IDOR, l’expiration, le refus d’auto-approbation, le contrôle du scan, le chiffrement et l’intégrité. Ils remplacent l’identité et le scanner dans les scénarios API ; ils ne prouvent pas l’intégration réelle avec Keycloak, ClamAV, KMS ou PostgreSQL.

## Architecture et limites
Voir [architecture](docs/architecture.md), [matrice de livraison](docs/delivery-status.md), [sécurité et exploitation](docs/operations.md) et [sources techniques](docs/references.md).

GitHub Pages ne peut héberger ni Python, ni PostgreSQL, ni Keycloak. Le workflow Pages publie exclusivement `apps/frontend/dist` avec `VITE_DEMO_MODE=true`. Pour un déploiement institutionnel, héberger séparément le backend et l’identité sur une infrastructure autorisée, configurer TLS et les variables `VITE_*`, désactiver la démonstration et faire valider la politique et les intégrations. Le Compose livré est destiné au développement local.

## Interface et installation
Connexion institutionnelle centrée sur l’emblème fourni, thème clair blanc cassé, menu repliable, en-tête sticky et effets sonores désactivables. Voir [inventaire des interactions](docs/interaction-sounds.md). La version publiée propose une [installation PWA et un shell hors connexion](docs/pwa.md), sans cache de documents ni de réponses API.

## Conception et propriété du projet
Concepteur et propriétaire du projet et du manuel utilisateur : **LOKALA LOMBOTO Jonathan**. Le projet reste une proposition non accréditée ; la présence de l’emblème fourni n’implique pas d’agrément institutionnel.

Le manuel utilisateur illustré, rédigé en français et signé au nom de LOKALA LOMBOTO Jonathan comme concepteur et propriétaire, est distribué depuis `apps/frontend/public/manual/Manuel_utilisateur_SSDC-RDC.pdf`. Ses sources et captures réelles se trouvent dans `docs/manual/`.
