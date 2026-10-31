import Keycloak from "keycloak-js";
export const demo = import.meta.env.VITE_DEMO_MODE !== "false";
export const identity = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: "ssdc",
  clientId: "ssdc-web",
});
export async function connect() {
  const authenticated = await identity.init({
    pkceMethod: "S256",
    checkLoginIframe: false,
  });
  if (!authenticated)
    await identity.login({ acr: { essential: true, values: ["2"] } });
  return authenticated;
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (demo) throw new Error("Action réservée au serveur institutionnel.");
  await identity.updateToken(30);
  const response = await fetch(
    (import.meta.env.VITE_API_URL || "") + "/api/v1" + path,
    {
      ...init,
      headers: { ...init.headers, Authorization: "Bearer " + identity.token },
    },
  );
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Session expirée : reconnectez-vous."
        : "Opération refusée ou service indisponible.",
    );
  return response.json();
}
export async function content(id: string) {
  await identity.updateToken(30);
  const r = await fetch(
    (import.meta.env.VITE_API_URL || "") +
      "/api/v1/documents/" +
      id +
      "/content",
    { headers: { Authorization: "Bearer " + identity.token } },
  );
  if (!r.ok) throw new Error("Consultation refusée.");
  return r.blob();
}
