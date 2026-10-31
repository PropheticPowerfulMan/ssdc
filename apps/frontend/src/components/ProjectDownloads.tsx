import { Download, FileText } from "lucide-react";

export default function ProjectDownloads() {
  return (
    <section className="project-downloads" aria-label="Documents à télécharger">
      <div className="project-downloads-heading">
        <FileText size={20} aria-hidden="true" />
        <div>
          <h2>Documents à télécharger</h2>
          <p>Les deux documents publics du projet SSDC-RDC, au format PDF.</p>
        </div>
      </div>
      <div className="project-downloads-links">
        <a
          href={
            import.meta.env.BASE_URL + "manual/Manuel_utilisateur_SSDC-RDC.pdf"
          }
          download="Manuel_utilisateur_SSDC-RDC.pdf"
          data-sound="download"
        >
          <Download size={19} aria-hidden="true" />
          <span>
            <strong>Télécharger le manuel utilisateur</strong>
            <small>PDF · 35 pages · Guide d’utilisation</small>
          </span>
        </a>
        <a
          href={
            import.meta.env.BASE_URL +
            "presentation/Presentation_projet_SSDC-RDC.pdf"
          }
          download="Presentation_projet_SSDC-RDC.pdf"
          data-sound="download"
        >
          <Download size={19} aria-hidden="true" />
          <span>
            <strong>Télécharger la présentation du projet</strong>
            <small>
              PDF · 25 pages · Vision, architecture et feuille de route
            </small>
          </span>
        </a>
      </div>
    </section>
  );
}
