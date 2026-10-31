import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { demo, connect } from "./services/api";
async function start() {
  if (!demo) {
    try {
      await connect();
    } catch {
      document.getElementById("root")!.textContent =
        "Connexion indisponible. Vérifiez le service d’identité.";
      return;
    }
  }
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
void start();
