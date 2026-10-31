# Matrice de livraison
| Domaine | Livré | Reste à implémenter ou vérifier |
|---|---|---|
| Identité | Keycloak OIDC, PKCE, introspection, realm password+TOTP, révocation vérifiée par introspection | Test réel du realm, événements IdP, gestion WebAuthn et console des sessions |
| Utilisateurs | Provisionnement opérateur, habilitation expirante, statut actif | Hiérarchie normalisée, administration et revues d’accès |
| Classification | 5 niveaux proposés, compartiments, politique serveur | Configuration persistée, historique et reclassification approuvée |
| Documents | Dépôt PDF/texte, scan bloquant, chiffrement, métadonnées filtrées, recherche locale sur liste autorisée | Quarantaine persistante, versions multiples, S3 privé et scan asynchrone |
| Chiffrement | DEK par document, AES-GCM, AAD, enveloppe, dev KEK, adaptateur AWS KMS | Validation HSM/KMS, rewrap opérationnel et exercice de récupération |
| Autorisation | Refus par défaut, rôle, habilitation, compartiments, département, besoin d’en connaître, expiration | Politiques contextuelles supplémentaires validées par institution |
| Demandes | Justification, propriétaire approbateur, interdiction auto-approbation, grant temporaire, révocation | Routage multiple, notifications et registre de décisions séparé |
| Dashboard | Compteurs issus des documents autorisés, événements accessibles | Sessions, sauvegardes et santé détaillée : non configurés, sans valeurs inventées |
| Audit | Événements SQL pour parcours documentaires et décisions | Collecteur externe append-only, corrélation, changements opérateur et événements IdP |
| Monitoring/incidents | Limites explicites dans interface et docs | SIEM, alertes, incidents, affectations et notes |
| Viewer | Texte contrôlé, bandeau de classification, filigrane nominatif ; PDF par téléchargement réautorisé | Service de rendu PDF isolé, expirations de preview dédiées et politique de téléchargement fine |
| Rétention | Champs expiration et legal_hold ; aucune suppression API | Politiques, archivage, approbation de suppression et conservation légale |
| Sauvegardes | Procédure de validation documentée | Jobs chiffrés, restauration vérifiée et supervision |
| Rapports | Comptage limité au périmètre de l’utilisateur | Exports autorisés et rapports opérationnels |
| Administration | Statut et configuration visible, provisionnement offline | Console de changements sensibles avec double contrôle |
| Clients | Web responsive, français, clair/sombre | Anglais, Electron et Flutter |

Ce dépôt constitue une première tranche fonctionnelle et testable, pas la réalisation complète des quinze modules du cahier de référence. Aucune donnée sensible réelle n’est autorisée dans la démo publique.
