import { defineConfig } from "vite";
import stylex from "@stylexjs/unplugin";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      classNamePrefix: "ftui",
      unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
    }),
    react(),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-dom/client",
        "@stylexjs/stylex",
        "react-aria-components",
        "lucide-react",
      ],
    },
    sourcemap: true,
  },
});
