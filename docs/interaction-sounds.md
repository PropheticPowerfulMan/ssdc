# Inventaire des interactions et effets sonores

Les sons sont synthétisés localement par Web Audio (sinusoïdes courtes, volume faible), sans téléchargement audio ni transfert de données. Ils commencent seulement après un geste utilisateur, selon les restrictions du navigateur. La commande « Couper les sons »/« Activer les sons » reste disponible dans l’en-tête et mémorise le choix sur cet appareil lorsque le stockage est disponible. Les informations visuelles restent toujours présentes.

| Action implémentée | Signal |
|---|---|
| Entrer dans la démonstration / lancer la connexion OIDC | Trois notes 349–523–698 Hz |
| Ouvrir/déplier le menu | Deux notes ascendantes 330–440 Hz |
| Replier/fermer le menu, fond extérieur, Échap | Deux notes descendantes 440–294 Hz |
| Changer de rubrique ou accéder au répertoire/audit | Note brève 523 Hz |
| Ouvrir un document | Deux notes 392–587 Hz |
| Fermer une fenêtre ou une notification | Deux notes 349–262 Hz |
| Ouvrir le formulaire de dépôt | Trois notes 440–554–659 Hz |
| Choisir un fichier | Deux notes 415–622 Hz |
| Démarrer un dépôt réel | Trois notes 262–330–392 Hz |
| Dépôt réellement réussi | Trois notes 523–659–784 Hz |
| Démarrer une demande réelle | Deux notes 370–494 Hz |
| Demande enregistrée | Deux notes 494–622 Hz |
| Décision d’approbation réussie | Trois notes 587–740–880 Hz |
| Décision de refus réussie | Deux notes 392–311 Hz |
| Téléchargement autorisé obtenu | Trois notes descendantes 784–659–523 Hz |
| Recherche, après 350 ms sans saisie | Note légère 660 Hz |
| Changer un filtre ou une classification | Deux notes 554–740 Hz |
| Changer de thème | Trois notes 294–440–349 Hz |
| Information/notification | Deux notes 698–880 Hz |
| Erreur technique ou opération refusée | Trois notes graves 220–185–165 Hz |
| Action indisponible dans la démonstration | Deux notes graves 311–233 Hz |
| Ouvrir un lien externe | Deux notes 466–698 Hz |
| Déconnexion | Trois notes 440–330–220 Hz |
| Réactiver les sons | Deux notes 440–660 Hz |
| Couper les sons | Silence immédiat |
| Ouvrir le dialogue ou l’aide d’installation | Trois notes 392–523–659 Hz |
| Installation confirmée par le navigateur | Trois notes 523–784–1047 Hz |
| Activer une mise à jour | Trois notes 440–587–740 Hz |

Les champs ordinaires ne sonnent pas à chaque caractère. Les sons de réussite ne sont jamais utilisés pour simuler un dépôt, une demande ou un téléchargement dans la démo. Les modules non livrés ne produisent pas de fausses confirmations. Les demandes de permissions du navigateur ne sont pas contournées et aucune lecture automatique n’est garantie si l’appareil ou le navigateur interdit l’audio.

# Adaptation des écrans

À partir de 1024 px : panneau latéral réductible en rail d’icônes. Sous 1024 px : tiroir avec bouton de fermeture, fond extérieur, Échap, verrouillage du défilement et gestion du focus clavier. Sous 600 px : documents sous forme de cartes, sans débordement horizontal du tableau. Sous 360 px : espacements, titres et illustration plus compacts. Formulaires à 16 px sur téléphone pour limiter le zoom automatique iOS. Prise en compte des zones sûres et des hauteurs de fenêtre dynamiques.

Le thème clair « aube minérale » utilise un fond gris-bleu `#d7e1e7`, des surfaces nacrées `#e7eef1`, un en-tête bleu nuit et des accents bronze ; le thème sombre reste disponible. Les tailles CSS sont fluides ; une compatibilité absolue avec tous les téléphones et versions de navigateurs n’est pas garantie.

La page de connexion est la porte d’entrée initiale, avec emblème fourni et identification institutionnelle. La démonstration permet une exploration sans identifiants ; la configuration réelle utilise uniquement Keycloak (aucun mot de passe collecté par React). Le bouton de déconnexion permet de revenir à l’accueil dans la démo.

L’en-tête institutionnel reste sticky pendant le défilement et affiche la rubrique courante. Il reste sous les fenêtres de consultation et le tiroir de navigation.

Les effets utilisent désormais une onde triangulaire et un volume par défaut de 55 % (gain de crête 0,1925). Le panneau « Sons & volume » fournit un test manuel et un réglage mémorisé. L’activation accepte les gestes réels même sur les navigateurs sans navigator.userActivation. Le volume système ou une interdiction audio du navigateur peut encore empêcher l’écoute ; le panneau affiche l’état du moteur, pas une promesse de son entendu.
