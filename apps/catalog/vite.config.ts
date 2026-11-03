import { defineConfig } from "vite";
import stylex from "@stylexjs/unplugin";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      classNamePrefix: "ftcatalog",
      unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
    }),
    react(),
  ],
  resolve: { dedupe: ["react", "react-dom"] },
});
