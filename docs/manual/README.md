# Manuel utilisateur SSDC-RDC

Concepteur et propriétaire du projet et du document : **LOKALA LOMBOTO Jonathan**.

- Texte source : `manual_content.json`.
- Captures réelles : `screenshots/`, avec leur provenance et leurs dimensions dans `captures.json`.
- Composition : `scripts/build-user-manual.py` à la racine.
- Version distribuée : `apps/frontend/public/manual/Manuel_utilisateur_SSDC-RDC.pdf`.

Le document explique les opérations disponibles, leurs étapes, les erreurs et les limites du prototype. Les écrans sont photographiés dans un profil Chromium isolé, sur données fictives. Aucun écran de connexion Keycloak ou d’approbation en production n’est inventé.

## Régénération

Sous Windows, disposer de Python avec ReportLab/Pillow/pypdf, de Chrome et des polices Segoe UI. Installer les dépendances frontend, servir l’application puis exécuter :

```powershell
npm --prefix apps/frontend run dev -- --port 5175
# Dans une autre console :
node apps/frontend/scripts/capture-manual.mjs
python scripts/build-user-manual.py
```

Le script de capture utilise une instance headless isolée de Chrome ; aucun profil personnel n’est ouvert. Il empêche le chargement des polices externes pour un rendu reproductible sur les polices de repli. Le PDF doit être rendu avec Poppler et inspecté visuellement avant chaque redistribution.

La version publique de démonstration ne permet aucun dépôt institutionnel réel. Consulter la matrice de livraison et les limites d’exploitation avant d’adapter ce manuel à un environnement autorisé.
