# Protection contre les tentatives de connexion

Politique proposée : après 3 échecs, Keycloak impose une attente de 300 secondes (5 minutes). Le calcul par multiples peut augmenter l’attente lors de nouvelles séries d’échecs, avec un plafond de 900 secondes (15 minutes). Il n’y a pas de verrouillage permanent automatique. Le compteur expire après une période d’inactivité de 3600 secondes. La protection rapide additionnelle est désactivée (`quickLoginCheckMilliSeconds=0`) pour que le seuil demandé reste explicite.

Cette politique est appliquée par Keycloak, pas par un compteur JavaScript contournable. La démo publique ne collecte aucun identifiant. Les accès API restent soumis à une session IdP active et aux habilitations côté serveur.

Les recommandations NIST SP 800-63B-4 demandent une limitation effective des échecs ; elles n’imposent pas universellement « 3 échecs puis 5 minutes ». Ce seuil est un choix plus restrictif demandé pour le projet, nécessitant une validation institutionnelle. Les blocages par compte doivent être associés à une limitation des débits et à une supervision pour réduire le risque de blocage malveillant d’utilisateurs légitimes.

Références : [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html), [documentation Keycloak](https://www.keycloak.org/docs/latest/server_admin/index.html#password-guess-brute-force-attacks).

Le realm importé configure ces valeurs pour une installation neuve. L’import au démarrage ne met pas automatiquement à jour un realm déjà existant : l’opérateur doit appliquer et vérifier ces paramètres dans Realm settings / Security defenses / Brute force detection, via la console ou l’API d’administration autorisée. Tester 3 mauvais mots de passe, la durée de blocage et une connexion légitime après expiration sur le Keycloak retenu avant recette ; Docker n’était pas disponible pour ce test d’intégration local.
