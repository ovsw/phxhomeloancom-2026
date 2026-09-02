import assert from "node:assert/strict";
import { test } from "vitest";

test("next config allows the hosts discovered by the worktree launcher", async () => {
  const original = process.env.NEXT_ALLOWED_DEV_ORIGINS;
  process.env.NEXT_ALLOWED_DEV_ORIGINS =
    "192.168.100.233, forge.example-tailnet.ts.net,192.168.100.233";

  try {
    // Each vitest file gets a fresh module graph, so a plain import sees the env above.
    const { default: nextConfig } = await import("./next.config.mjs");

    assert.deepEqual(nextConfig.allowedDevOrigins, [
      "192.168.100.233",
      "forge.example-tailnet.ts.net",
    ]);
  } finally {
    if (original === undefined) {
      delete process.env.NEXT_ALLOWED_DEV_ORIGINS;
    } else {
      process.env.NEXT_ALLOWED_DEV_ORIGINS = original;
    }
  }
});
