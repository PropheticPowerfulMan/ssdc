# Sécurité et exploitation
## Identité
Le frontend conserve les tokens uniquement en mémoire via keycloak-js, utilise Authorization Code + PKCE S256 et délègue les mots de passe à Keycloak. Le backend utilise un client confidentiel d’introspection et vérifie active, issuer exact, audience, expiration, sujet provisionné actif et acr=2. En cas de panne IdP, il refuse l’accès.

Le realm de développement exige mot de passe et OTP, sans alternative cookie dans ce flux, et attribue la claim acr=2 au client web après ce flux obligatoire. Cette attribution n’est valable que tant que le flux reste strictement MFA : ne pas réutiliser ce mapper avec un flux faible. Avant exploitation, valider le comportement sur le Keycloak retenu, remplacer ce mécanisme par une politique LoA/acr formellement contrôlée, intégrer WebAuthn/FIDO2 et tester toutes les voies alternatives, enrôlement et récupération inclus.

## Clés
Le fournisseur local refuse une clé autre que 32 octets ; il est interdit hors environnement development. Chaque objet obtient un DEK aléatoire et un nonce 96 bits. Le contenu et l’enveloppe sont liés à `ssdc:v1:UUID` par AAD. Une modification du contenu, de l’enveloppe ou du contexte doit échouer.

AWS KMS nécessite un ARN complet de clé approuvée, des credentials fournis par l’environnement/identité de workload et une politique IAM minimale. Aucun secret KMS en image ni en base. La rotation automatique du matériel d’une même clé KMS conserve le même ARN ; un changement d’ARN requiert un registre d’anciennes clés autorisées et un outil de rewrap à livrer. Ne jamais remplacer le KEK local sans procédure de migration.

## Stockage et antivirus
Les objets sont chiffrés dans un volume privé ; aucun chemin direct n’est exposé dans les réponses. Le scan ClamAV précède chiffrement et insertion. Un fichier refusé ou un scanner indisponible ne créent pas de document consultable. Il n’y a pas encore de quarantaine durable. Le contenu PDF n’est pas exécuté ni rendu inline par l’application ; le téléchargement reste une sortie de données autorisée, impossible à rappeler après remise au client.

## Audit et exploitation
Le journal SQL n’est pas inviolable. Séparer les droits du compte de migration et du compte applicatif, interdire UPDATE/DELETE sur audit_logs au compte applicatif et déployer une collecte externe immuable. Les changements opérateur offline nécessitent une procédure tracée extérieure à l’application. Aucun secret, token, contenu clair ni justification n’est journalisé dans l’audit.

Avant production : TLS sur tous les transports, reverse proxy avec limites de corps et quotas, pagination/recherche SQL, scan isolé et quotas, chiffrement des métadonnées et disques, CSP, dépendances verrouillées et contrôlées, durcissement conteneurs, métriques privées, tests de concurrence PostgreSQL et tests réels des intégrations. Ne pas exposer le Compose de développement à Internet.

## Sauvegarde et restauration
Définir avec l’institution les RPO/RTO, la rétention et les autorités de récupération. Sauvegarder ensemble PostgreSQL et les objets chiffrés ; sauvegarder Keycloak séparément. Chiffrer les sauvegardes par une clé indépendante sous contrôle externe et limiter les comptes de restauration. Conserver les références de clés et leur disponibilité KMS, jamais les clés maîtresses dans les archives applicatives.

Restaurer dans un environnement isolé à partir d’un instant cohérent, appliquer les migrations correspondantes, vérifier les droits et le refus d’accès d’un compte non autorisé, tester le déchiffrement de documents synthétiques et mesurer les temps. Ne déclarer une sauvegarde réussie qu’après cette vérification. Aucun job de sauvegarde n’est actuellement activé.
