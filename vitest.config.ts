import { defineConfig } from "vitest/config";
import { fromTreesStylex } from "./packages/ui/tooling/vite.mjs";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    ...fromTreesStylex({
      rootDir: process.cwd(),
      prefix: "fttest",
      test: true,
    }),
    react(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["packages/ui/test/test-setup.ts"],
    include: [
      "packages/ui/test/**/*.test.{ts,tsx}",
      "apps/catalog/test/**/*.test.{ts,tsx}",
    ],
  },
});
