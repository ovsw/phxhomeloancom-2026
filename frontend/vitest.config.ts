import path from "node:path";
import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(__dirname, "..");

// Only component tests (.tsx) pay for a jsdom environment; it dominated CI
// time (33s of environment setup for 5s of tests). Logic tests run in node.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "server-only": path.resolve(__dirname, "test/server-only-stub.ts"),
    },
  },
  test: {
    env: {
      NEXT_PUBLIC_SANITY_API_VERSION: "2026-08-02",
      NEXT_PUBLIC_SITE_URL: "https://phxhomeloan.test",
      NEXT_PUBLIC_SANITY_DATASET: "test",
      NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project",
      OG_IMAGE_SECRET: "test-only-og-image-secret",
    },
    projects: [
      {
        extends: true,
        test: {
          name: "dom",
          include: ["**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "node",
          include: ["**/*.test.ts"],
          environment: "node",
        },
      },
      {
        // Repo-wide script/schema tests, formerly run by `node --test`.
        test: {
          name: "scripts",
          root: repoRoot,
          include: ["frontend/**/*.test.mjs", "studio/**/*.test.mjs", "scripts/*.test.mjs"],
          environment: "node",
        },
      },
    ],
  },
});
