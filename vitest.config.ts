import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
// Exercise the compiled public package, exactly as consumers and the catalog do.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["packages/ui/src/test-setup.ts"],
    include: ["packages/ui/src/**/*.test.{ts,tsx}"],
  },
});
