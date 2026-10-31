import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "dist");
const emblem = await readFile(
  path.join(root, "public/assets/embleme-rdc.jpeg"),
);
const embedded = "data:image/jpeg;base64," + emblem.toString("base64");
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><clipPath id="emblem"><circle cx="256" cy="232" r="167"/></clipPath></defs><rect width="512" height="512" rx="94" fill="#061A35"/><circle cx="256" cy="232" r="171" fill="#D5AE60"/><image href="${embedded}" x="89" y="65" width="334" height="334" clip-path="url(#emblem)"/><rect x="102" y="330" width="144" height="86" rx="18" fill="#061A35" stroke="#D5AE60" stroke-width="4"/><text x="174" y="382" text-anchor="middle" font-family="Arial,sans-serif" font-size="35" font-weight="700" fill="#F0D496">SSDC</text></svg>`;
await mkdir(path.join(out, "icons"), { recursive: true });
await writeFile(path.join(out, "icons/ssdc.svg"), icon);
for (const size of [192, 512])
  await sharp(Buffer.from(icon))
    .resize(size, size)
    .png()
    .toFile(path.join(out, `icons/ssdc-${size}.png`));
await sharp(Buffer.from(icon))
  .resize(180, 180)
  .png()
  .toFile(path.join(out, "icons/apple-touch-icon.png"));
// Favicon uses the owner's unmodified emblem, without the application badge.
await sharp(emblem)
  .resize(32, 32)
  .png()
  .toFile(path.join(out, "icons/favicon-32.png"));
await sharp(emblem)
  .resize(64, 64)
  .png()
  .toFile(path.join(out, "icons/favicon-64.png"));
const manifest = {
  id: "./",
  name: "SSDC — République Démocratique du Congo",
  short_name: "SSDC RDC",
  description:
    "Plateforme documentaire SSDC-RDC — proposition institutionnelle, non accréditée.",
  lang: "fr",
  start_url: "./",
  scope: "./",
  display: "standalone",
  display_override: ["standalone", "minimal-ui"],
  background_color: "#061A35",
  theme_color: "#061A35",
  orientation: "any",
  categories: ["productivity", "business"],
  icons: [
    {
      src: "icons/ssdc-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "icons/ssdc-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};
await writeFile(
  path.join(out, "manifest.webmanifest"),
  JSON.stringify(manifest, null, 2),
);
async function walk(directory, prefix = "") {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const name = prefix + item.name;
    if (item.isDirectory())
      result.push(...(await walk(path.join(directory, item.name), name + "/")));
    else if (!name.endsWith(".map") && name !== "sw.js") result.push(name);
  }
  return result;
}
const assets = (await walk(out)).sort();
const hash = createHash("sha256");
for (const asset of assets)
  hash.update(asset).update(await readFile(path.join(out, asset)));
const version = hash.digest("hex").slice(0, 16);
const worker = `/* Static application shell only. Never cache API, tokens or documents. */
const ROOT = new URL('./', self.location.href);
const PREFIX = 'ssdc-shell-' + ROOT.pathname + '-';
const CACHE = PREFIX + '${version}';
const FILES = ${JSON.stringify(assets)};
const URLS = new Set(FILES.map(file => new URL(file, ROOT).href));
self.addEventListener('install', event => event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll([...URLS]);})()));
self.addEventListener('activate', event => event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('message', event => {if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch', event => {
 const request=event.request, url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==ROOT.origin||request.headers.has('authorization')||url.search||!url.pathname.startsWith(ROOT.pathname))return;
 // HTML is reused only for the application entry, without OAuth callback/query parameters.
 if(request.mode==='navigate'&&(url.pathname===ROOT.pathname||url.pathname===ROOT.pathname+'index.html')){
  event.respondWith(fetch(request).catch(async()=>{const cached=await (await caches.open(CACHE)).match(new URL('index.html',ROOT).href);return cached||Response.error();}));return;
 }
 if(!URLS.has(url.href)||url.pathname.endsWith('/index.html'))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(request)||fetch(request);})());
});`;
await writeFile(path.join(out, "sw.js"), worker);
console.log(`PWA: ${assets.length} static assets, version ${version}.`);
