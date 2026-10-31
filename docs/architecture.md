# Architecture
## Monorepo
- `apps/backend/app` : configuration, identité, politique, cryptographie, intégrations, modèles et API.
- `apps/backend/migrations` : schéma initial figé et environnement Alembic.
- `apps/backend/tests` : politiques, cryptographie, API et identité.
- `apps/frontend` : interface React, adaptateur OIDC, démonstration synthétique.
- `packages/policy-contracts` : niveaux et contrat de décision partagé.
- `infrastructure/keycloak` : realm de développement avec MFA obligatoire.
- `security/policies` : politique proposée.
- `.github/workflows` : compilation Pages et tests backend.

Les modules sont regroupés tant que leur volume ne justifie pas les nombreux fichiers vides de l’arborescence cible. Aucun module vide n’est présenté comme implémenté. Desktop Electron et mobile Flutter sont différés ; le client web est responsive.

## Flux
```mermaid
flowchart LR
  Browser[React : session en mémoire] -->|Code + PKCE S256 et MFA| KC[Keycloak]
  Browser -->|Bearer : TLS requis en production| API[FastAPI]
  API -->|Introspection par requête| KC
  API --> Policy[RBAC + ABAC : refus par défaut]
  Policy --> DB[(PostgreSQL : habilitations et grants)]
  API --> AV[ClamAV : analyse avant publication]
  API --> AEAD[AES-256-GCM : DEK par document]
  AEAD --> KMS[KMS externe : enveloppe DEK]
  AEAD --> Objects[(Objets locaux chiffrés)]
  API --> Audit[Journal SQL : intégrité externe à intégrer]
```

## Modèle livré
```mermaid
erDiagram
  users ||--o{ documents : owns
  documents ||--|| document_versions : has
  users ||--o{ document_permissions : receives
  documents ||--o{ document_permissions : grants
  users ||--o{ access_requests : requests
  documents ||--o{ access_requests : concerns
  users ||--o{ audit_logs : generates
```

Les documents portent titre, propriétaire, département, niveau, compartiments, statut et expiration. Les versions portent seulement l’identifiant opaque de l’objet, son type, sa taille, le nonce, le DEK enveloppé et la référence de clé. Les clés maîtresses ne sont jamais en base. La première version est unique par document dans cette itération ; l’historique multiversion est différé.

Les rôles et compartiments sont pour l’instant des tableaux JSON administrés hors API. La normalisation complète des départements, rôles, permissions, classifications et historiques, ainsi que les autres entités du schéma cible, reste à livrer. Les métadonnées sont filtrées côté serveur, mais ne sont pas chiffrées au niveau applicatif ; PostgreSQL et ses sauvegardes doivent être protégés séparément.
