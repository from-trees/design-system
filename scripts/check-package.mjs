import { readFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
const root = resolve(import.meta.dirname, "..");
await mkdir(resolve(root, "output"), { recursive: true });
const css = await readFile(
  resolve(root, "packages/ui/dist/styles.css"),
  "utf8",
);
const js = await readFile(resolve(root, "packages/ui/dist/index.js"), "utf8");
if (css.length < 5000 || !css.includes("--"))
  throw new Error("Compiled CSS or theme variables missing");
if (!js.includes("ftui"))
  throw new Error("Package styles must use the isolated ftui prefix");
if (/\.createTheme\(|\.defineVars\(|\.create\(/.test(js))
  throw new Error("Uncompiled StyleX in distribution");
const ui = await import("../packages/ui/dist/index.js");
const html = renderToString(
  createElement(
    ui.ThemeProvider,
    null,
    createElement(ui.Button, { icon: "save" }, "Save"),
  ),
);
if (!html.includes("Save") || !html.includes("class="))
  throw new Error("Public package API failed SSR smoke check");
const [packed] = JSON.parse(
  execFileSync(
    "npm",
    [
      "pack",
      "--workspace",
      "@from-trees/ui",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      resolve(root, "output"),
    ],
    { cwd: root, encoding: "utf8" },
  ),
);
for (const required of ["dist/index.js", "dist/index.d.ts", "dist/styles.css"])
  if (!packed.files.some((f) => f.path === required))
    throw new Error(`Package missing ${required}`);
if (
  packed.files.some(
    (f) => f.path.includes("test") || f.path.includes("node_modules"),
  )
)
  throw new Error("Unexpected files in package");
console.log(
  `Verified ${packed.filename}: compiled CSS, declarations, public exports, SSR, package contents.`,
);
