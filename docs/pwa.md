# Installation SSDC-RDC et mode autonome

Le manifest déclare l’application en mode `standalone`, avec une identité et un périmètre propres à `/ssdc/` sur GitHub Pages. Les icônes PNG 192/512 px et Apple 180 px reprennent exactement l’emblème fourni dans une composition vectorielle, avec un badge SSDC en bas à gauche. Le favicon de l’onglet reprend l’emblème national sans badge.

L’écran de connexion propose une commande d’installation lorsque le navigateur expose son dialogue natif. Sinon, il présente les instructions d’ajout à l’écran d’accueil/Dock. Une installation reste un choix de l’utilisateur, soumis aux possibilités du navigateur et de l’OS ; aucune prise en charge absolue de tous les appareils n’est revendiquée.

Le service worker précharge exclusivement la liste des fichiers statiques produite au build. Il ignore les appels API, les méthodes autres que GET, les autres origines, les requêtes portant Authorization, les URL avec query (notamment le retour OIDC) et tous les chemins absents de la liste statique. Les tokens, documents, réponses API et décisions d’accès ne sont pas stockés dans Cache Storage ou localStorage. Seule la préférence de son est mémorisée.

Hors connexion, une navigation vers la racine peut afficher le shell statique ; la démo synthétique reste utilisable. L’authentification et les opérations institutionnelles exigent la connexion au serveur. Les mises à jour sont proposées explicitement : le nouveau worker attend l’action de l’utilisateur avant de prendre la main et de recharger. Ce rechargement peut fermer un formulaire non transmis ; le bouton porte donc une action explicite.

Les ressources du frontend sont publiques et restent consultables dans le cache après déconnexion. Aucune habilitation n’est décidée par le service worker. Une future fonction de documents hors ligne nécessiterait une conception spécifique, une politique institutionnelle et de nouvelles vérifications de sécurité.

## Validation
`npm run build`, puis `node --test scripts/test-pwa.mjs` depuis apps/frontend. Les tests vérifient le manifest, les icônes, le précache statique et les voies qui doivent contourner le worker. Tester également l’installation réelle sur les appareils cibles avant une recette institutionnelle.

Références : [MDN — installation PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [WebKit — applications web](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/).
