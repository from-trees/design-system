import { mkdir, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
await mkdir(resolve(root, "output"), { recursive: true });
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
for (const path of [
  "src/index.ts",
  "src/tokens.stylex.ts",
  "src/utilities.ts",
  "src/Button.tsx",
  "src/List.tsx",
  "src/InfoTooltip.tsx",
  "src/SwatchPicker.tsx",
  "tooling/vite.mjs",
])
  if (!packed.files.some((file) => file.path === path))
    throw Error(`Missing native source: ${path}`);
if (
  packed.files.some(
    (file) =>
      file.path.endsWith(".css") ||
      file.path.startsWith("dist/") ||
      file.path.includes(".test."),
  )
)
  throw Error(
    "Native package must not contain CSS, compiled distribution or tests",
  );
const manifest = JSON.parse(
  await readFile(resolve(root, "packages/ui/package.json"), "utf8"),
);
if (manifest.exports["./styles.css"])
  throw Error("Remove the compiled CSS entry point");
const index = await readFile(
  resolve(root, "apps/catalog/dist/index.html"),
  "utf8",
);
if (!index.includes('rel="stylesheet"'))
  throw Error("Catalog must load compiler-generated CSS automatically");
console.log(
  `Verified ${packed.filename}: native React/StyleX sources, tokens, shared compiler, no CSS distribution, generated catalog stylesheet.`,
);
