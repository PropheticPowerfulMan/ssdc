import { chromium } from "playwright";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const context = await browser.newContext({ locale: "fr-FR" });
const page = await context.newPage();
await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
try {
  await page.goto("http://127.0.0.1:5175/", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page
    .getByRole("button", { name: "Explorer la démonstration", exact: true })
    .waitFor();
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForFunction(
      () => document.documentElement.scrollWidth <= innerWidth,
      {},
      { timeout: 5000 },
    );
    const value = await page.evaluate(() => ({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    if (value.overflow) throw Error("Login overflow " + width);
    console.log("Login " + width + " OK");
  }
  await page
    .getByRole("button", { name: "Explorer la démonstration", exact: true })
    .click();
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForFunction(
      () => document.documentElement.scrollWidth <= innerWidth,
      {},
      { timeout: 5000 },
    );
    const value = await page.evaluate(() => ({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      sticky:
        getComputedStyle(document.querySelector(".topbar")).position ===
        "sticky",
    }));
    if (value.overflow || !value.sticky)
      throw Error("Dashboard layout failure " + width);
    console.log("Dashboard " + width + " OK");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Ouvrir le menu", exact: true })
    .click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Documents overflow");
  if (await page.locator('a[href*="github.com"]').count())
    throw Error("Repository link remains in interface");
  await page.mouse.wheel(0, 600);
  await page.waitForFunction(() => window.scrollY > 100);
  const header = await page.locator(".topbar").boundingBox();
  if (!header || Math.abs(header.y) > 1)
    throw Error("Header did not stay at top");
  console.log(
    "Mobile documents, sticky behavior and repository-link removal OK",
  );
} finally {
  await browser.close();
}
