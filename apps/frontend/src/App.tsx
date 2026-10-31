import SoundSettings from "./components/SoundSettings";
import InstallApp from "./components/InstallApp";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Files,
  Layers3,
  KeyRound,
  Users,
  ScrollText,
  Settings,
  Search,
  Bell,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Clock3,
  LockKeyhole,
  CheckCircle2,
  Activity,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Download,
  Eye,
  FolderLock,
  ExternalLink,
  Volume2,
  VolumeX,
  PanelLeftClose,
} from "lucide-react";
import { api, content, demo, identity, connect } from "./services/api";
import {
  documents as samples,
  events as sampleEvents,
  levels,
  type Document,
} from "./demo";
import {
  playSound,
  soundsEnabled,
  setSoundsEnabled,
  type Sound,
} from "./services/sounds";
import LoginPage from "./pages/LoginPage";
type Event = { action: string; allowed: boolean; created_at: string };
type Access = {
  id: string;
  document_id: string;
  user_id: string;
  justification: string;
  status: string;
};
const navigation = [
  { name: "Tableau de bord", icon: LayoutDashboard },
  { name: "Documents", icon: Files },
  { name: "Classification", icon: Layers3 },
  { name: "Demandes d’accès", icon: KeyRound },
  { name: "Journal d’audit", icon: ScrollText },
  { name: "Administration", icon: Settings },
];
const actions: Record<string, string> = {
  "document.read": "Consultation de document",
  "document.upload": "Nouveau document déposé",
  "access.approved": "Demande d’accès approuvée",
  "document.list": "Consultation du répertoire",
  "document.metadata": "Consultation des métadonnées",
};
function Badge({ level }: { level: number }) {
  return (
    <span className={"badge level-" + level}>
      <i />
      {levels[level]}
    </span>
  );
}
export default function App({ startupError = "" }: { startupError?: string }) {
  const [entered, setEntered] = useState(!demo && !!identity.authenticated);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState(startupError);
  async function enter() {
    playSound("loginStart");
    if (demo) {
      setEntered(true);
      return;
    }
    setLoginBusy(true);
    setLoginError("");
    try {
      if (await connect()) setEntered(true);
    } catch {
      setLoginError(
        "Connexion indisponible. Vérifiez le service d’identité puis rechargez la page.",
      );
      playSound("error");
    } finally {
      setLoginBusy(false);
    }
  }
  const [page, setPage] = useState("Tableau de bord"),
    [docs, setDocs] = useState<Document[]>(demo ? samples : []),
    [events, setEvents] = useState<Event[]>(demo ? sampleEvents : []),
    [requests, setRequests] = useState<Access[]>([]),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [viewer, setViewer] = useState<Document | null>(null),
    [preview, setPreview] = useState(""),
    [notice, setNotice] = useState(""),
    [upload, setUpload] = useState(false),
    [busy, setBusy] = useState(!demo),
    [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [compact, setCompact] = useState(
      () => window.matchMedia("(max-width: 1023px)").matches,
    ),
    [sound, setSound] = useState(soundsEnabled),
    [dark, setDark] = useState(false),
    [name, setName] = useState(demo ? "Agent de démonstration" : ""),
    [roles, setRoles] = useState<string[]>([]);
  const notify = (message: string, cue: Sound = "notification") => {
    setNotice(message);
    playSound(cue);
  };
  function toggleMenu() {
    const opening = compact ? !mobile : collapsed;
    playSound(opening ? "menuOpen" : "menuClose");
    if (compact) setMobile(!mobile);
    else setCollapsed(!collapsed);
  }
  function closeMenu() {
    if (mobile) playSound("menuClose");
    setMobile(false);
  }
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      setCompact(media.matches);
      setMobile(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!compact || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = document.getElementById("main-navigation");
    drawer?.querySelector<HTMLButtonElement>(".drawer-close")?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(
        drawer?.querySelectorAll<HTMLElement>("button,a[href]") ?? [],
      );
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
        e.preventDefault();
        items[0]?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [compact, mobile]);
  useEffect(() => {
    if (!search) return;
    const timer = setTimeout(() => playSound("search"), 350);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const changed = () => setSound(soundsEnabled());
    window.addEventListener("ssdc-sounds-change", changed);
    return () => window.removeEventListener("ssdc-sounds-change", changed);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page, entered]);
  async function refresh() {
    setBusy(true);
    try {
      const me = await api<{ name: string; roles: string[] }>("/me");
      setName(me.name);
      setRoles(me.roles);
      setDocs(await api<Document[]>("/documents"));
      setRequests(await api<Access[]>("/access-requests"));
      if (me.roles.includes("auditor")) setEvents(await api<Event[]>("/audit"));
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!demo && entered) void refresh();
  }, [entered]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewer || upload) playSound("close");
        else if (mobile) playSound("menuClose");
        setViewer(null);
        setUpload(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, upload, mobile]);
  useEffect(() => {
    if (!viewer && !upload) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>(".modal");
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modal) return;
      const elements = Array.from(
        modal.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input,select,textarea,a[href]",
        ),
      );
      const first = elements[0],
        last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [viewer, upload]);
  const filtered = docs.filter(
    (d) =>
      d.title
        .toLocaleLowerCase("fr")
        .includes(search.toLocaleLowerCase("fr")) &&
      (filter === "all" || String(d.classification) === filter),
  );
  async function open(doc: Document) {
    setPreview("");
    if (demo) {
      setPreview(
        "EXERCICE DE DÉMONSTRATION\n\nCe document est entièrement fictif. Il illustre le parcours de consultation du SSDC-RDC.\n\nAucune information institutionnelle réelle n’est présente sur cette page publique.",
      );
      setViewer(doc);
      playSound("viewerOpen");
      return;
    }
    try {
      const blob = await content(doc.id);
      if (blob.type.startsWith("text/plain")) {
        setPreview(await blob.text());
        setViewer(doc);
        playSound("viewerOpen");
      } else {
        notify("PDF disponible par téléchargement contrôlé.");
        setViewer(doc);
        playSound("viewerOpen");
      }
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }
  async function download() {
    if (!viewer) return;
    if (demo) {
      notify(
        "Téléchargement désactivé dans la démonstration publique.",
        "blocked",
      );
      return;
    }
    try {
      const blob = await content(viewer.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "document" + (blob.type === "application/pdf" ? ".pdf" : ".txt");
      a.click();
      playSound("download");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }
  async function submitUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      notify(
        "Le dépôt nécessite le backend institutionnel. Aucun fichier n’a été envoyé.",
        "blocked",
      );
      return;
    }
    const form = new FormData(e.currentTarget);
    playSound("uploadStart");
    setBusy(true);
    try {
      await api("/documents", { method: "POST", body: form });
      setUpload(false);
      notify("Document analysé, chiffré et enregistré.", "uploadSuccess");
      await refresh();
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }
  async function requestAccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      notify(
        "Les demandes réelles nécessitent une session Keycloak.",
        "blocked",
      );
      return;
    }
    const form = new FormData(e.currentTarget);
    playSound("requestStart");
    try {
      await api("/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: form.get("document_id"),
          justification: form.get("justification"),
        }),
      });
      notify("Demande enregistrée.", "requestSuccess");
      await refresh();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }
  async function decide(id: string, approve: boolean) {
    try {
      await api("/access-requests/" + id + "/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve, hours: 24 }),
      });
      await refresh();
      notify("Décision enregistrée.", approve ? "approve" : "reject");
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }
  const documentTable = (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Nom du document</th>
            <th>Classification</th>
            <th>Modifié le</th>
            <th>Statut</th>
            <th>
              <span className="sr-only">Consulter</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, page === "Tableau de bord" ? 4 : 100).map((d) => (
            <tr key={d.id}>
              <td>
                <button className="document-name" onClick={() => void open(d)}>
                  <span className="file-icon">
                    <Files size={19} />
                  </span>
                  <span>
                    {d.title}
                    <small>
                      {d.compartments.join(" · ") || "Diffusion générale"} ·{" "}
                      {demo ? "Fichier fictif" : "Document protégé"}
                    </small>
                  </span>
                </button>
              </td>
              <td data-label="Classification">
                <Badge level={d.classification} />
              </td>
              <td className="date" data-label="Modifié le">
                {new Date(d.created_at).toLocaleDateString("fr-FR")}
              </td>
              <td data-label="Statut">
                <span className="status">
                  <i />
                  Disponible
                </span>
              </td>
              <td>
                <button
                  className="icon-button"
                  aria-label={"Consulter " + d.title}
                  onClick={() => void open(d)}
                >
                  <Eye size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filtered.length && (
        <div className="empty">
          Aucun document accessible ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
  if (!entered)
    return (
      <LoginPage
        onEnter={() => void enter()}
        busy={loginBusy}
        error={loginError}
        sound={sound}
        onSound={() => {
          const next = !sound;
          setSound(next);
          setSoundsEnabled(next);
          if (next) playSound("soundOn");
        }}
        dark={dark}
        onTheme={() => {
          playSound("theme");
          setDark(!dark);
        }}
      />
    );
  return (
    <div
      className={"app " + (collapsed ? "menu-collapsed" : "")}
      onClickCapture={(event) => {
        const control = (event.target as Element).closest<HTMLElement>(
          "button,a",
        );
        if (!control || control.dataset.sound === "none") return;
        const cue = control.dataset.sound as Sound | undefined;
        if (cue) playSound(cue);
        else if (control.tagName === "A") playSound("external");
      }}
      onChangeCapture={(event) => {
        const input = event.target as HTMLInputElement;
        if (input.type === "file" && input.files?.length) playSound("file");
        else if (input.tagName === "SELECT") playSound("filter");
      }}
    >
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      {compact && mobile && (
        <div className="scrim" onClick={closeMenu} aria-hidden="true" />
      )}
      <aside
        id="main-navigation"
        className={"sidebar " + (mobile ? "opened" : "")}
        inert={compact && !mobile}
        aria-label="Menu principal"
      >
        <button
          className="icon-button drawer-close"
          aria-label="Fermer le menu"
          onClick={closeMenu}
        >
          <X size={18} />
        </button>
        <div className="brand">
          <img
            src={import.meta.env.BASE_URL + "assets/embleme-rdc.jpeg"}
            alt="Emblème de la République démocratique du Congo fourni par le porteur du projet"
          />
          <div>
            <b>
              SSDC<span>RDC</span>
            </b>
            <small>PRÉSIDENCE DE LA RÉPUBLIQUE</small>
          </div>
        </div>
        <div className="sidebar-rule" />
        <div className="workspace-label">ESPACE INSTITUTIONNEL</div>
        <nav aria-label="Navigation principale">
          {navigation.map((n) => (
            <button
              key={n.name}
              title={n.name}
              aria-label={n.name}
              aria-current={page === n.name ? "page" : undefined}
              data-sound="navigation"
              className={page === n.name ? "nav-item active" : "nav-item"}
              onClick={() => {
                setPage(n.name);
                setMobile(false);
                setSearch("");
              }}
            >
              <n.icon size={19} />
              <span>{n.name}</span>
              {n.name === "Demandes d’accès" && (
                <span className="nav-count">
                  {demo
                    ? "2"
                    : requests.filter((r) => r.status === "pending").length}
                </span>
              )}
              {page === n.name && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <SoundSettings />
          <InstallApp />
          <div className="shield-box">
            <ShieldCheck size={25} />
            <b>
              La souveraineté commence
              <br />
              par la protection.
            </b>
            <p>
              Protéger l’information, préserver
              <br />
              la souveraineté nationale.
            </p>
            <span>
              <i />
              {demo
                ? "ENVIRONNEMENT DE DÉMONSTRATION"
                : "SESSION INSTITUTIONNELLE"}
            </span>
          </div>

          <div className="sidebar-foot">
            DANTIC · Division Bases de données
            <small>SSDC-RDC © 2026 · Version 0.1</small>
          </div>
        </div>
      </aside>
      <div className="shell" inert={compact && mobile}>
        <header className="topbar">
          <button
            className="icon-button menu-toggle"
            aria-label={
              (compact ? mobile : !collapsed)
                ? "Replier le menu"
                : "Ouvrir le menu"
            }
            aria-controls="main-navigation"
            aria-expanded={compact ? mobile : !collapsed}
            onClick={toggleMenu}
          >
            {!compact && !collapsed ? (
              <PanelLeftClose size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
          <div className="institution">
            <span>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
            <b>Secrétariat Général près le Président de la République</b>
            <span className="header-location">
              SSDC <ChevronRight size={10} /> {page}
            </span>
          </div>
          <div className="top-actions">
            <button
              className="icon-button sound-toggle"
              aria-label={sound ? "Couper les sons" : "Activer les sons"}
              aria-pressed={sound}
              title={sound ? "Couper les sons" : "Activer les sons"}
              onClick={() => {
                const next = !sound;
                setSound(next);
                setSoundsEnabled(next);
                if (next) playSound("soundOn");
              }}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <span className="environment">
              <i />
              {demo ? "DÉMONSTRATION" : "CONNECTÉ"}
            </span>
            <button
              className="icon-button"
              aria-label="Changer le thème"
              data-sound="theme"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button notification"
              aria-label="Informations"
              onClick={() =>
                notify(
                  "Projet proposé, non accrédité. Les niveaux de classification restent à valider.",
                )
              }
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="avatar">
              {demo ? "AD" : name.slice(0, 2).toUpperCase()}
            </div>
            <div className="account">
              <b>{name || "Connexion…"}</b>
              <small>
                {demo ? "Visiteur · données fictives" : "Compte institutionnel"}
              </small>
            </div>
            {
              <button
                className="icon-button"
                aria-label="Déconnexion"
                data-sound="logout"
                onClick={() => {
                  if (demo) {
                    setEntered(false);
                    setPage("Tableau de bord");
                    setMobile(false);
                    setSearch("");
                    setViewer(null);
                    setUpload(false);
                  } else
                    void identity.logout({
                      redirectUri:
                        window.location.origin + import.meta.env.BASE_URL,
                    });
                }}
              >
                <LogOut size={17} />
              </button>
            }
          </div>
        </header>
        <main id="main">
          <div className="breadcrumb">
            Espace institutionnel <ChevronRight size={13} /> <span>{page}</span>
          </div>
          <div className="page-heading">
            <div>
              <div className="eyebrow">DIRECTION DANTIC / SSDC</div>
              <h1>{page}</h1>
              <p>
                {page === "Tableau de bord"
                  ? "Une vision claire de votre patrimoine informationnel."
                  : "Gérez les informations dans le respect du besoin d’en connaître."}
              </p>
            </div>
            <button
              className="primary"
              data-sound="uploadOpen"
              onClick={() => setUpload(true)}
            >
              <Plus size={18} />
              Déposer un document
            </button>
          </div>
          {demo && (
            <div className="demo-strip">
              <ShieldCheck size={16} />
              <span>
                <b>Prototype institutionnel.</b> Données entièrement fictives ·
                Aucun système officiel connecté.
              </span>
              <button
                className="project-info"
                onClick={() =>
                  notify(
                    "SSDC-RDC : projet proposé, non accrédité. Concepteur et propriétaire : LOKALA LOMBOTO Jonathan.",
                  )
                }
              >
                À propos du projet <ShieldCheck size={14} />
              </button>
            </div>
          )}
          {busy ? (
            <div className="skeleton" aria-label="Chargement" />
          ) : (
            <>
              {page === "Tableau de bord" && (
                <>
                  <section className="welcome">
                    <div>
                      <span className="welcome-kicker">
                        <i />
                        {demo
                          ? "APERÇU DU SYSTÈME — DONNÉES FICTIVES"
                          : "VOTRE ESPACE DOCUMENTAIRE"}
                      </span>
                      <h2>
                        Protéger l’information.
                        <br />
                        <em>Préserver la souveraineté.</em>
                      </h2>
                      <p>
                        Un accès maîtrisé. Des échanges tracés.
                        <br />
                        Un patrimoine documentaire sous contrôle.
                      </p>
                      <button
                        data-sound="navigation"
                        onClick={() => setPage("Documents")}
                      >
                        Accéder aux documents <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="welcome-art" aria-hidden="true">
                      <div className="orbit one" />
                      <div className="orbit two" />
                      <div className="orbit three" />
                      <div className="shield-mark">
                        <ShieldCheck size={94} strokeWidth={1} />
                      </div>
                      <span className="art-label top">
                        <LockKeyhole size={13} />
                        Chiffrement AES-256-GCM
                      </span>
                      <span className="art-label bottom">
                        <CheckCircle2 size={13} />
                        Accès selon habilitation
                      </span>
                      <span className="star">★</span>
                    </div>
                    <div className="national-line" />
                  </section>
                  <section className="stats" aria-label="Indicateurs">
                    <article>
                      <span className="stat-icon blue">
                        <Files size={21} />
                      </span>
                      <span>Documents accessibles</span>
                      <strong>{docs.length.toString().padStart(2, "0")}</strong>
                      <small>
                        <span className="green-dot" />
                        Dans votre périmètre
                      </small>
                    </article>
                    <article>
                      <span className="stat-icon gold">
                        <FolderLock size={21} />
                      </span>
                      <span>Documents classifiés</span>
                      <strong>
                        {docs
                          .filter((d) => d.classification > 0)
                          .length.toString()
                          .padStart(2, "0")}
                      </strong>
                      <small>Restreint à Très secret</small>
                    </article>
                    <article>
                      <span className="stat-icon violet">
                        <Clock3 size={21} />
                      </span>
                      <span>Demandes en attente</span>
                      <strong>
                        {demo
                          ? "02"
                          : requests
                              .filter((r) => r.status === "pending")
                              .length.toString()
                              .padStart(2, "0")}
                      </strong>
                      <small>
                        {demo
                          ? "Scénario de démonstration"
                          : "Demandes visibles"}
                      </small>
                    </article>
                    <article>
                      <span className="stat-icon teal">
                        <ShieldCheck size={21} />
                      </span>
                      <span>État des services</span>
                      <strong className="stat-word">
                        {demo ? "Aperçu" : "Connecté"}
                      </strong>
                      <small>
                        {demo
                          ? "Aucune supervision réelle"
                          : "API accessible · sauvegarde non configurée"}
                      </small>
                    </article>
                  </section>
                  <div className="dashboard-grid">
                    <section className="panel classification-panel">
                      <div className="panel-heading">
                        <h3>Répartition par classification</h3>
                        <Layers3 size={18} />
                      </div>
                      <p className="panel-subtitle">
                        Documents dans votre périmètre d’accès
                      </p>
                      <div className="classification-content">
                        <div
                          className="donut"
                          style={{
                            background: docs.length
                              ? `conic-gradient(#397ad3 0 ${(docs.filter((d) => d.classification === 0).length / docs.length) * 100}%,#5aace7 0 ${(docs.filter((d) => d.classification < 2).length / docs.length) * 100}%,#e5b957 0 ${(docs.filter((d) => d.classification < 3).length / docs.length) * 100}%,#ed8b56 0 ${(docs.filter((d) => d.classification < 4).length / docs.length) * 100}%,#cb4e58 0)`
                              : "#e7edf4",
                          }}
                        >
                          <div>
                            <strong>{docs.length}</strong>
                            <span>documents</span>
                          </div>
                        </div>
                        <div className="legend">
                          {[4, 3, 2, 1, 0].map((i) => (
                            <div key={i}>
                              <span>
                                <i className={"dot dot-" + i} />
                                {levels[i]}
                              </span>
                              <b>
                                {
                                  docs.filter((d) => d.classification === i)
                                    .length
                                }
                              </b>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="panel-note">
                        <LockKeyhole size={13} /> Les habilitations seules ne
                        donnent pas accès.
                      </div>
                    </section>
                    <section className="panel activity-panel">
                      <div className="panel-heading">
                        <h3>Activités récentes</h3>
                        <button
                          data-sound="navigation"
                          onClick={() => setPage("Journal d’audit")}
                        >
                          Tout voir <ArrowUpRight size={14} />
                        </button>
                      </div>
                      <p className="panel-subtitle">
                        {demo
                          ? "Événements synthétiques de démonstration"
                          : roles.includes("auditor")
                            ? "Derniers événements autorisés"
                            : "Journal réservé au rôle auditeur"}
                      </p>
                      <div className="timeline">
                        {events.slice(0, 4).map((event, i) => (
                          <div className="timeline-item" key={i}>
                            <span
                              className={
                                "event-icon " + (!event.allowed ? "denied" : "")
                              }
                            >
                              <Activity size={16} />
                            </span>
                            <div>
                              <b>
                                {!event.allowed
                                  ? "Tentative d’accès refusée"
                                  : actions[event.action] || event.action}
                              </b>
                              <small>
                                {demo
                                  ? "Scénario fictif"
                                  : "Journal applicatif"}{" "}
                                ·{" "}
                                {new Date(event.created_at).toLocaleTimeString(
                                  "fr-FR",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </small>
                            </div>
                            <span
                              className={
                                "event-state " + (!event.allowed ? "red" : "")
                              }
                            >
                              {event.allowed ? "Autorisé" : "Refusé"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                  <section className="panel documents-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Documents récents</h3>
                        <p className="panel-subtitle">
                          Votre espace documentaire, selon vos autorisations.
                        </p>
                      </div>
                      <button
                        data-sound="navigation"
                        onClick={() => setPage("Documents")}
                      >
                        Tous les documents <ArrowUpRight size={15} />
                      </button>
                    </div>
                    {documentTable}
                  </section>
                </>
              )}
              {page === "Documents" && (
                <section className="panel documents-panel">
                  <div className="toolbar">
                    <label className="search">
                      <Search size={18} />
                      <input
                        aria-label="Rechercher un document"
                        placeholder="Rechercher un document…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filtrer par classification"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Toutes les classifications</option>
                      {levels.map((l, i) => (
                        <option key={l} value={i}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  {documentTable}
                </section>
              )}
              {page === "Classification" && (
                <section className="panel policy-list">
                  <h3>Niveaux de classification proposés</h3>
                  <p>
                    Ces libellés et leurs règles nécessitent une validation
                    institutionnelle.
                  </p>
                  {[4, 3, 2, 1, 0].map((i) => (
                    <article key={i}>
                      <Badge level={i} />
                      <p>
                        {
                          [
                            "Informations non classifiées ; le besoin d’en connaître reste appliqué.",
                            "Diffusion limitée aux destinataires autorisés.",
                            "Informations sensibles soumises à une habilitation appropriée.",
                            "Informations à fort enjeu ; accès nominatif et compartimenté.",
                            "Niveau le plus élevé de la politique proposée.",
                          ][i]
                        }
                      </p>
                      <span>
                        {docs.filter((d) => d.classification === i).length}{" "}
                        documents visibles
                      </span>
                    </article>
                  ))}
                </section>
              )}
              {page === "Demandes d’accès" && (
                <section className="panel policy-list">
                  <h3>Demander une autorisation nominative</h3>
                  <p>
                    L’identifiant du document doit être communiqué par son
                    propriétaire. Aucun répertoire de documents non autorisés
                    n’est exposé.
                  </p>
                  <form onSubmit={requestAccess}>
                    <label>
                      Identifiant du document
                      <input
                        name="document_id"
                        required
                        placeholder="UUID communiqué par le propriétaire"
                      />
                    </label>
                    <label>
                      Justification du besoin d’en connaître
                      <textarea
                        name="justification"
                        required
                        minLength={20}
                        maxLength={2000}
                      />
                    </label>
                    <button className="primary">Transmettre la demande</button>
                  </form>
                  <h3 className="mt-8">Demandes visibles</h3>
                  {!requests.length ? (
                    <div className="empty">
                      {demo
                        ? "Les décisions réelles seront disponibles après connexion au backend."
                        : "Aucune demande."}
                    </div>
                  ) : (
                    requests.map((r) => (
                      <article key={r.id}>
                        <div>
                          <b>{r.status}</b>
                          <p>{r.justification}</p>
                        </div>
                        {r.status === "pending" &&
                          r.user_id !== identity.subject && (
                            <div>
                              <button onClick={() => void decide(r.id, true)}>
                                Approuver 24 h
                              </button>
                              <button onClick={() => void decide(r.id, false)}>
                                Refuser
                              </button>
                            </div>
                          )}
                      </article>
                    ))
                  )}
                </section>
              )}
              {page === "Journal d’audit" && (
                <section className="panel policy-list">
                  <h3>Journal des événements {demo ? "· fictifs" : ""}</h3>
                  <p>
                    Le journal SQL n’est pas une archive immuable. Un stockage
                    externe append-only est requis avant une exploitation
                    institutionnelle.
                  </p>
                  {events.map((e, i) => (
                    <article key={i}>
                      <Activity size={20} />
                      <b>{actions[e.action] || e.action}</b>
                      <span>{e.allowed ? "Autorisé" : "Refusé"}</span>
                      <time>
                        {new Date(e.created_at).toLocaleString("fr-FR")}
                      </time>
                    </article>
                  ))}
                  {!events.length && (
                    <div className="empty">
                      Journal réservé aux comptes autorisés.
                    </div>
                  )}
                </section>
              )}
              {page === "Administration" && (
                <section className="panel policy-list">
                  <h3>Configuration du projet</h3>
                  <article>
                    <ShieldCheck />
                    <b>Statut institutionnel</b>
                    <span>Proposition · non accréditée</span>
                  </article>
                  <article>
                    <KeyRound />
                    <b>Identité</b>
                    <span>Keycloak · OIDC · MFA · PKCE S256</span>
                  </article>
                  <article>
                    <LockKeyhole />
                    <b>Chiffrement</b>
                    <span>AES-256-GCM · clés par document</span>
                  </article>
                  <article>
                    <Users />
                    <b>Provisionnement</b>
                    <span>
                      Réservé à l’opérateur, via le script administrateur
                    </span>
                  </article>
                  <article>
                    <Clock3 />
                    <b>Sauvegardes et supervision</b>
                    <span>À intégrer et à valider avant déploiement</span>
                  </article>
                  <p>
                    Les paramètres de sécurité sont gérés côté serveur. Aucun
                    secret n’est intégré à cette interface.
                  </p>
                </section>
              )}
            </>
          )}
          <footer>
            <span>
              <LockKeyhole size={13} />
              SSDC · Système de Sécurité des Données Classifiées
            </span>
            <span>
              JUSTICE <i /> PAIX <i /> TRAVAIL
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <ShieldCheck size={20} />
          {notice}
          <button
            aria-label="Fermer la notification"
            data-sound="close"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {viewer && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-title"
          >
            <div className="modal-top">
              <Badge level={viewer.classification} />
              <button
                autoFocus
                className="icon-button"
                aria-label="Fermer la consultation"
                data-sound="close"
                onClick={() => setViewer(null)}
              >
                <X />
              </button>
            </div>
            <h2 id="viewer-title">{viewer.title}</h2>
            <div className="watermark">
              {name} · {new Date().toLocaleString("fr-FR")} ·{" "}
              {demo ? "FICTIF" : "CONSULTATION NOMINATIVE"}
            </div>
            {preview ? (
              <pre className="preview">{preview}</pre>
            ) : (
              <p>
                Pour consulter ce PDF dans un lecteur local, utilisez le
                téléchargement contrôlé.
              </p>
            )}
            <p className="muted">
              Le filigrane ne peut empêcher les captures d’écran ou la
              photographie.
            </p>
            <button className="primary" onClick={() => void download()}>
              <Download size={17} />
              Télécharger
            </button>
          </section>
        </div>
      )}
      {upload && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
          >
            <div className="modal-top">
              <span className="eyebrow">RÉPERTOIRE DOCUMENTAIRE</span>
              <button
                className="icon-button"
                aria-label="Fermer le formulaire"
                data-sound="close"
                onClick={() => setUpload(false)}
              >
                <X />
              </button>
            </div>
            <h2 id="upload-title">Déposer un document</h2>
            <p className="muted">
              PDF ou texte UTF-8 · 10 Mo maximum · Analyse antivirus avant
              publication.
            </p>
            {demo && (
              <p className="demo-strip">
                Démonstration publique : aucun fichier ne sera envoyé.
              </p>
            )}
            <form onSubmit={submitUpload}>
              <label>
                Titre
                <input
                  autoFocus
                  name="title"
                  minLength={3}
                  maxLength={200}
                  required
                />
              </label>
              <label>
                Classification
                <select name="classification">
                  {levels.map((l, i) => (
                    <option key={l} value={i}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Compartiments
                <input
                  name="compartments"
                  placeholder="Séparés par des virgules"
                />
              </label>
              <label>
                Fichier
                <input
                  type="file"
                  name="file"
                  accept="application/pdf,text/plain"
                  required
                />
              </label>
              <button className="primary" disabled={busy}>
                <LockKeyhole size={16} />
                {demo ? "Vérifier le parcours" : "Analyser et chiffrer"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
