import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { demo, initializeIdentity } from "./services/api";
async function start() {
  let startupError = "";
  if (!demo) {
    try {
      await initializeIdentity();
    } catch {
      startupError =
        "Connexion indisponible. Vérifiez le service d’identité puis rechargez la page.";
    }
  }
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App startupError={startupError} />
    </React.StrictMode>,
  );
}
void start();
