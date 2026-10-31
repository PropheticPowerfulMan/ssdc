import { useEffect, useState } from "react";
import { Download, RefreshCw, WifiOff, CheckCircle2 } from "lucide-react";
import { playSound } from "../services/sounds";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
let promptEvent: InstallPrompt | null = null;
let registration: Promise<ServiceWorkerRegistration> | undefined;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  promptEvent = event as InstallPrompt;
  window.dispatchEvent(new Event("ssdc-install-ready"));
});
export default function InstallApp() {
  const [available, setAvailable] = useState(!!promptEvent),
    [installed, setInstalled] = useState(
      window.matchMedia("(display-mode: standalone)").matches,
    ),
    [offline, setOffline] = useState(!navigator.onLine),
    [waiting, setWaiting] = useState<ServiceWorker | null>(null),
    [help, setHelp] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const ready = () => setAvailable(!!promptEvent),
      done = () => {
        setInstalled(true);
        setAvailable(false);
        promptEvent = null;
        playSound("installSuccess");
      },
      network = () => setOffline(!navigator.onLine);
    window.addEventListener("ssdc-install-ready", ready);
    window.addEventListener("appinstalled", done);
    window.addEventListener("online", network);
    window.addEventListener("offline", network);
    let cancelled = false;
    let observed: ServiceWorkerRegistration | undefined;
    let installing: ServiceWorker | null = null;
    const stateChanged = () => {
      if (
        !cancelled &&
        installing?.state === "installed" &&
        navigator.serviceWorker.controller
      )
        setWaiting(observed?.waiting ?? installing);
    };
    const updateFound = () => {
      installing = observed?.installing ?? null;
      installing?.addEventListener("statechange", stateChanged);
    };
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      registration ??= navigator.serviceWorker.register(
        import.meta.env.BASE_URL + "sw.js",
        { scope: import.meta.env.BASE_URL },
      );
      void registration
        .then((reg) => {
          if (cancelled) return;
          observed = reg;
          setWaiting(reg.waiting);
          reg.addEventListener("updatefound", updateFound);
          updateFound();
        })
        .catch(() => {
          if (!cancelled)
            setError("Le mode hors connexion n’a pas pu être activé.");
        });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("ssdc-install-ready", ready);
      window.removeEventListener("appinstalled", done);
      window.removeEventListener("online", network);
      window.removeEventListener("offline", network);
      observed?.removeEventListener("updatefound", updateFound);
      installing?.removeEventListener("statechange", stateChanged);
    };
  }, []);
  async function install() {
    playSound("installStart");
    if (!promptEvent) {
      setHelp(!help);
      return;
    }
    try {
      const current = promptEvent;
      await current.prompt();
      const choice = await current.userChoice;
      promptEvent = null;
      setAvailable(false);
      if (choice.outcome === "accepted") setInstalled(true);
    } catch {
      setError("Utilisez le menu d’installation de votre navigateur.");
      playSound("error");
    }
  }
  function update() {
    playSound("update");
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    waiting?.postMessage({ type: "ACTIVATE_UPDATE" });
  }
  return (
    <div className="install-app">
      {offline && (
        <p className="offline-state" role="status">
          <WifiOff size={14} />
          Hors connexion · interface et démonstration uniquement
        </p>
      )}
      {waiting ? (
        <button className="install-button" onClick={update}>
          <RefreshCw size={15} />
          Mettre à jour l’application
        </button>
      ) : installed ? (
        <p className="installed-state">
          <CheckCircle2 size={14} />
          Application installée / mode autonome
        </p>
      ) : (
        <button
          className="install-button"
          onClick={() => void install()}
          aria-expanded={help}
        >
          <Download size={15} />
          {available
            ? "Installer SSDC sur cet appareil"
            : "Installer l’application"}
        </button>
      )}
      {help && !installed && (
        <div className="install-help">
          <p>
            <b>iPhone / iPad :</b> dans Safari, ouvrez Partager puis « Sur
            l’écran d’accueil » et activez l’ouverture comme application si
            proposée.
          </p>
          <p>
            <b>Android :</b> ouvrez le menu du navigateur puis « Installer
            l’application ».
          </p>
          <p>
            <b>Ordinateur :</b> utilisez l’icône d’installation ou le menu de
            Chrome/Edge ; dans Safari compatible, « Ajouter au Dock ».
          </p>
          <p>
            L’installation dépend du navigateur. Les opérations
            institutionnelles exigent une connexion au serveur.
          </p>
        </div>
      )}
      {error && (
        <p className="install-error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
