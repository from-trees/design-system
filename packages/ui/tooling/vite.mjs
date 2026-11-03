import stylex from "@stylexjs/unplugin";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
/** Compile app + library sources together; load generated CSS without a CSS import. */
export function fromTreesStylex({ rootDir, prefix, test = false }) {
  const options = {
    classNamePrefix: prefix,
    useCSSLayers: false,
    runtimeInjection: false,
    externalPackages: ["@from-trees/ui"],
    unstable_moduleResolution: { type: "commonJS", rootDir },
  };
  const compiler = stylex[test ? "rollup" : "vite"](options);
  const sourceConfig = {
    name: "from-trees-stylex-source",
    config() {
      return {
        esbuild: { jsx: "automatic" },
        ssr: { noExternal: ["@from-trees/ui"] },
        optimizeDeps: {
          exclude: ["@from-trees/ui"],
          include: [
            "@from-trees/ui > react-aria-components",
            "@from-trees/ui > lucide-react",
          ],
        },
      };
    },
  };
  if (test) return [sourceConfig, compiler];
  let base = "./";
  return [
    sourceConfig,
    compiler,
    {
      name: "from-trees-stylex-output",
      apply: "build",
      configResolved(config) {
        base = config.base;
      },
      writeBundle: {
        order: "post",
        sequential: true,
        async handler(options, bundle) {
          if (!options.dir) return;
          // With no CSS input, the pinned compiler emits this generated fallback asset.
          if (!existsSync(resolve(options.dir, "assets/stylex.css"))) return;
          for (const asset of Object.values(bundle))
            if (asset.type === "asset" && asset.fileName.endsWith(".html")) {
              const path = resolve(options.dir, asset.fileName);
              const html = await readFile(path, "utf8");
              if (!html.includes("assets/stylex.css"))
                await writeFile(
                  path,
                  html.replace(
                    "</head>",
                    `<link rel="stylesheet" href="${base}assets/stylex.css"></head>`,
                  ),
                );
            }
        },
      },
    },
  ];
}
