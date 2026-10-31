import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../../..");
const output = path.join(root, "docs/manual/screenshots");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  locale: "fr-FR",
  timezoneId: "Africa/Lagos",
  serviceWorkers: "block",
});
const page = await context.newPage();
const records = [];
await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
page.setDefaultTimeout(60000);
async function shot(name, title, fullPage = true) {
  await page.screenshot({ path: path.join(output, name + ".png"), fullPage });
  records.push({
    file: name + ".png",
    title,
    url: page.url(),
    viewport: page.viewportSize(),
    capturedAt: new Date().toISOString(),
  });
  console.log("Captured " + name);
}
try {
  await page.goto(process.env.SSDC_CAPTURE_URL || "http://127.0.0.1:5175/", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page
    .getByRole("heading", { name: "Bienvenue dans votre espace" })
    .waitFor();
  await shot(
    "01-connexion-clair",
    "Accueil et connexion - thème aube minérale",
  );
  await page.getByText("Sons & volume", { exact: true }).click();
  await page
    .getByRole("button", { name: "Tester le son", exact: true })
    .click();
  await page.getByRole("status").waitFor();
  await shot("02-reglages-audio", "Réglages audio et test manuel");
  await page.getByText("Sons & volume", { exact: true }).click();
  await page
    .getByRole("button", { name: "Installer l’application", exact: true })
    .click();
  await shot("03-installation", "Aide à l’installation PWA");
  await page
    .getByRole("button", { name: "Installer l’application", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Explorer la démonstration", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Tableau de bord", exact: true })
    .waitFor();
  await shot("04-tableau-de-bord", "Tableau de bord - données fictives");
  await page
    .getByRole("button", { name: "Replier le menu", exact: true })
    .click();
  await shot("05-menu-replie", "Menu réduit sur ordinateur");
  await page
    .getByRole("button", { name: "Ouvrir le menu", exact: true })
    .click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await shot("06-documents", "Répertoire documentaire");
  await page
    .getByRole("textbox", { name: "Rechercher un document", exact: true })
    .fill("continuité");
  await shot("07-recherche", "Recherche sur les documents visibles");
  await page
    .getByRole("textbox", { name: "Rechercher un document", exact: true })
    .fill("zzzz aucun résultat");
  await shot("08-recherche-vide", "Recherche sans résultat");
  await page
    .getByRole("textbox", { name: "Rechercher un document", exact: true })
    .fill("");
  await page
    .getByLabel("Filtrer par classification", { exact: true })
    .selectOption("2");
  await shot("09-filtre", "Filtre par classification");
  await page
    .getByLabel("Filtrer par classification", { exact: true })
    .selectOption("all");
  await page
    .getByRole("button", {
      name: "Consulter Plan de modernisation des services numériques",
      exact: true,
    })
    .click();
  await shot(
    "10-consultation",
    "Consultation contrôlée et filigrane nominatif",
    false,
  );
  await page.getByRole("button", { name: "Télécharger", exact: true }).click();
  await page.getByRole("status").waitFor();
  await shot(
    "11-telechargement-demo",
    "Téléchargement indisponible dans la démonstration",
    false,
  );
  await page
    .getByRole("button", { name: "Fermer la consultation", exact: true })
    .click();
  if (
    await page
      .getByRole("button", { name: "Fermer la notification", exact: true })
      .count()
  )
    await page
      .getByRole("button", { name: "Fermer la notification", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Déposer un document", exact: true })
    .click();
  await shot("12-depot", "Formulaire de dépôt", false);
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Titre", { exact: true })
    .fill("Note fictive pour le manuel");
  await dialog.getByLabel("Compartiments", { exact: true }).fill("DANTIC");
  await dialog
    .getByLabel("Fichier", { exact: true })
    .setInputFiles({
      name: "note-fictive.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Document entièrement synthétique - manuel SSDC."),
    });
  await dialog
    .getByRole("button", { name: "Vérifier le parcours", exact: true })
    .click();
  await page.getByRole("status").waitFor();
  await shot("13-depot-demo", "Dépôt fictif : aucun fichier envoyé", false);
  await page
    .getByRole("button", { name: "Fermer le formulaire", exact: true })
    .click();
  if (
    await page
      .getByRole("button", { name: "Fermer la notification", exact: true })
      .count()
  )
    await page
      .getByRole("button", { name: "Fermer la notification", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Classification", exact: true })
    .click();
  await shot("14-classifications", "Niveaux de classification proposés");
  await page
    .getByRole("button", { name: "Demandes d’accès", exact: true })
    .click();
  await shot("15-demandes", "Demande d’accès et liste autorisée");
  await page
    .getByLabel("Identifiant du document", { exact: true })
    .fill("00000000-0000-4000-8000-000000000001");
  await page
    .getByLabel("Justification du besoin d’en connaître", { exact: true })
    .fill("Consultation fictive dans le cadre du manuel utilisateur.");
  await page
    .getByRole("button", { name: "Transmettre la demande", exact: true })
    .click();
  await page.getByRole("status").waitFor();
  await shot("16-demande-demo", "Demande fictive : session réelle nécessaire");
  if (
    await page
      .getByRole("button", { name: "Fermer la notification", exact: true })
      .count()
  )
    await page
      .getByRole("button", { name: "Fermer la notification", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Journal d’audit", exact: true })
    .click();
  await shot("17-audit", "Journal d’événements synthétiques");
  await page
    .getByRole("button", { name: "Administration", exact: true })
    .click();
  await shot("18-administration", "Configuration et limites de la version");
  await page
    .getByRole("button", { name: "Changer le thème", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tableau de bord", exact: true })
    .click();
  await shot("19-mode-sombre", "Tableau de bord en thème sombre");
  await page
    .getByRole("button", { name: "Changer le thème", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("20-mobile-tableau", "Tableau de bord mobile", false);
  await page
    .getByRole("button", { name: "Ouvrir le menu", exact: true })
    .click();
  await shot("21-mobile-menu", "Tiroir de navigation mobile", false);
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await shot("22-mobile-documents", "Documents en cartes sur téléphone", false);
  await page.getByRole("button", { name: "Déconnexion", exact: true }).click();
  await shot("23-mobile-connexion", "Page de connexion mobile", false);
  await page.setViewportSize({ width: 768, height: 1024 });
  await shot("24-tablette-connexion", "Page de connexion sur tablette", false);
  await writeFile(
    path.join(output, "captures.json"),
    JSON.stringify(records, null, 2),
  );
} finally {
  await browser.close();
}
