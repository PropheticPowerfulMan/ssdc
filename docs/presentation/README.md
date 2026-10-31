# Dossier de présentation du projet SSDC-RDC

Initiateur et propriétaire du projet : **LOKALA LOMBOTO Jonathan**.

Dossier préparé le 31 octobre 2026 pour une présentation le lundi 2 novembre 2026. Il reprend la charte du manuel utilisateur, l’emblème fourni et des captures réelles du prototype.

- Texte : `project_content.json`.
- Composition : `scripts/build-project-presentation.py`.
- PDF de sortie : `output/pdf/Presentation_projet_SSDC-RDC_LOKALA_LOMBOTO_Jonathan.pdf`.
- Distribution publique : `apps/frontend/public/presentation/Presentation_projet_SSDC-RDC.pdf`.

La synthèse initiale peut être lue indépendamment du reste du dossier. Le document distingue code livré, démonstration publique, intégrations à vérifier, fonctions restant à réaliser et décisions institutionnelles à prendre. Aucun budget ni agrément n’est inventé.

Régénération sous Windows avec Python, ReportLab, Pillow, pypdf et les polices Segoe UI :

```powershell
python scripts/build-project-presentation.py
```

Rendre le PDF avec Poppler et inspecter toutes les pages avant redistribution. Les captures utilisées sont les originaux réels conservés dans `docs/manual/screenshots/`.
