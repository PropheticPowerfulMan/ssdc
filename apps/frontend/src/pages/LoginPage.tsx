import ProjectDownloads from "../components/ProjectDownloads";
import SoundSettings from "../components/SoundSettings";
import InstallApp from "../components/InstallApp";
import {
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  LockKeyhole,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import { demo } from "../services/api";
import { playSound } from "../services/sounds";
type Props = {
  onEnter: () => void;
  busy: boolean;
  error: string;
  sound: boolean;
  onSound: () => void;
  dark: boolean;
  onTheme: () => void;
};
export default function LoginPage({
  onEnter,
  busy,
  error,
  sound,
  onSound,
  dark,
  onTheme,
}: Props) {
  return (
    <main className="login-page">
      <div className="login-top">
        <span className="login-wordmark">
          SSDC <span>RDC</span>
        </span>
        <div className="login-controls">
          <button
            className="icon-button"
            aria-label={sound ? "Couper les sons" : "Activer les sons"}
            aria-pressed={sound}
            onClick={onSound}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="Changer le thème"
            onClick={onTheme}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      <ProjectDownloads />
      <div className="login-layout">
        <section className="login-story" aria-labelledby="login-mission">
          <span className="login-overline">
            <i />
            PATRIMOINE NUMÉRIQUE & SOUVERAINETÉ
          </span>
          <h1 id="login-mission">
            <span>Protéger l’information.</span>
            <em>Préserver la souveraineté.</em>
          </h1>
          <p>
            Une plateforme pensée pour la protection et la gouvernance du
            patrimoine documentaire institutionnel.
          </p>
          <div className="login-principles">
            <span>
              <ShieldCheck size={19} />
              Accès selon habilitation
            </span>
            <span>
              <Fingerprint size={19} />
              Identité & authentification forte
            </span>
            <span>
              <LockKeyhole size={19} />
              Confidentialité des documents
            </span>
          </div>
          <div className="login-motto">
            JUSTICE <i /> PAIX <i /> TRAVAIL
          </div>
        </section>
        <section className="login-card" aria-labelledby="login-title">
          <div className="emblem-halo">
            <img
              src={import.meta.env.BASE_URL + "assets/embleme-rdc.jpeg"}
              alt="Emblème de la République démocratique du Congo fourni par le porteur du projet"
            />
          </div>
          <div className="login-republic">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</div>
          <div className="login-presidency">PRÉSIDENCE DE LA RÉPUBLIQUE</div>
          <p className="login-secretariat">Secrétariat Général · DANTIC</p>
          <div className="login-card-divider">
            <span>SSDC</span>
          </div>
          <h2 id="login-title">Bienvenue dans votre espace</h2>
          <p className="login-description">
            Système de Sécurité des Données Classifiées
          </p>
          <div className="login-auth-info">
            <Fingerprint size={24} />
            <div>
              <b>Connexion institutionnelle</b>
              <p>
                Identité vérifiée par Keycloak.
                <br />
                Authentification multifacteur requise en mode institutionnel.
              </p>
            </div>
            <LockKeyhole size={16} />
          </div>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="login-enter" onClick={onEnter} disabled={busy}>
            <span>
              {busy
                ? "Connexion en cours…"
                : demo
                  ? "Explorer la démonstration"
                  : "Se connecter avec Keycloak"}
            </span>
            <ArrowRight size={19} />
          </button>
          <p className="login-lockout">
            Mode institutionnel : 3 échecs entraînent une suspension temporaire
            de 5 minutes.
          </p>
          <p className="login-mode">
            {demo
              ? "Version publique · données fictives uniquement"
              : "Connexion via le fournisseur d’identité institutionnel"}
          </p>
          {demo && (
            <details
              className="login-details"
              onToggle={(e) => {
                if (e.currentTarget.open) playSound("notification");
              }}
            >
              <summary>Comment fonctionne la connexion réelle ?</summary>
              <p>
                Le déploiement institutionnel redirige vers Keycloak pour le mot
                de passe et le second facteur. Cette page GitHub Pages ne
                dispose pas de serveur d’identité et ne collecte aucun
                identifiant.
              </p>
            </details>
          )}
          <SoundSettings />
          <InstallApp />
          <div className="login-disclaimer">
            <ShieldCheck size={16} />
            <p>
              Projet proposé, non accrédité.
              <br />
              Aucun système officiel connecté à cette démonstration.
            </p>
          </div>
        </section>
      </div>
      <footer className="login-footer">
        <span>DANTIC · Division Bases de données</span>
        <span>
          SSDC-RDC © 2026 · <span>Conception : LOKALA LOMBOTO Jonathan</span>
        </span>
      </footer>
    </main>
  );
}
