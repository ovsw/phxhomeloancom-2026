import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    env: {
      NEXT_PUBLIC_SANITY_API_VERSION: "2026-08-02",
      NEXT_PUBLIC_SANITY_DATASET: "test",
      NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project",
    },
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
