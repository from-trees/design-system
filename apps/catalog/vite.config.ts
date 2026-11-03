import { defineConfig } from "vite";
import { fromTreesStylex } from "@from-trees/ui/vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [
    ...fromTreesStylex({ rootDir: process.cwd(), prefix: "ftcatalog" }),
    react(),
  ],
  resolve: { dedupe: ["react", "react-dom"] },
});
