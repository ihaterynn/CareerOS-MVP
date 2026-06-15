import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3210";
const OUT = "scripts/shots";
mkdirSync(OUT, { recursive: true });

const routes = [
  ["login", "/"],
  ["c-dashboard", "/candidate/dashboard"],
  ["c-dna", "/candidate/dna"],
  ["c-jobs", "/candidate/jobs"],
  ["c-career-path", "/candidate/career-path"],
  ["c-jobby", "/candidate/jobby"],
  ["c-applications", "/candidate/applications"],
  ["e-dashboard", "/employer/dashboard"],
  ["e-career-root", "/employer/career-root"],
  ["e-talent", "/employer/talent"],
  ["e-retention", "/employer/retention"],
  ["e-onboarding", "/employer/onboarding"],
  ["e-heatmap", "/employer/heatmap"],
  ["e-attrition", "/employer/attrition"],
  ["e-review", "/employer/review"]
];

const viewports = [
  ["mobile", 390, 844],
  ["desktop", 1440, 900]
];

// theme/accent combos to spot-check (applied via localStorage before load)
const themes = [
  ["light-gold", "light", "gold"],
  ["dark-gold", "dark", "gold"],
  ["dark-indigo", "dark", "indigo"]
];

const browser = await chromium.launch();
let n = 0;
const errors = [];

for (const [vpName, w, h] of viewports) {
  for (const [themeName, theme, accent] of themes) {
    // dark/indigo only needs one representative-heavy pass per viewport;
    // shoot all routes only for light-gold desktop + mobile, themes on a subset.
    const routeSet =
      themeName === "light-gold"
        ? routes
        : routes.filter(([k]) => ["login", "c-dashboard", "c-jobby", "e-dashboard", "e-heatmap"].includes(k));

    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`[${vpName}/${themeName}] console: ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`[${vpName}/${themeName}] pageerror: ${e.message}`));

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ([t, a]) => {
        localStorage.setItem("cos_theme", t);
        localStorage.setItem("cos_accent", a);
      },
      [theme, accent]
    );

    for (const [key, path] of routeSet) {
      await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${OUT}/${vpName}__${themeName}__${key}.png`, fullPage: true });
      n++;
    }
    await ctx.close();
  }
}

await browser.close();
console.log(`captured ${n} screenshots to ${OUT}`);
if (errors.length) {
  console.log(`\n=== ${errors.length} PAGE/CONSOLE ERRORS ===`);
  for (const e of [...new Set(errors)]) console.log(e);
} else {
  console.log("no page/console errors");
}
