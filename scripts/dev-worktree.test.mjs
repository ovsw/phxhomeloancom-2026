import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { derivePortPair, selectPortPair } from "./dev-worktree.mjs";

test("derivePortPair returns a stable pair in separate ranges", () => {
  const first = derivePortPair("/work/dev/.t3/worktrees/example/feature-a");
  const second = derivePortPair("/work/dev/.t3/worktrees/example/feature-a");

  assert.deepEqual(first, second);
  assert.ok(first.frontend >= 3100 && first.frontend < 3110);
  assert.ok(first.studio >= 4100 && first.studio < 4110);
  assert.equal(first.studio - first.frontend, 1000);
});

test("selectPortPair replaces a saved pair from the old wide range", async (context) => {
  const worktreePath = await mkdtemp(resolve(tmpdir(), "dev-worktree-test-"));
  const portFile = resolve(worktreePath, ".worktree-ports.json");

  context.after(() => rm(worktreePath, { force: true, recursive: true }));
  await writeFile(portFile, '{"frontend":3923,"studio":4923}\n');

  const selected = await selectPortPair({
    worktreePath,
    checkPort: async () => true,
  });
  const saved = JSON.parse(await readFile(portFile));

  assert.deepEqual(selected.pair, derivePortPair(worktreePath));
  assert.deepEqual(saved, selected.pair);
});

test("selectPortPair skips occupied pairs and remembers its choice", async (context) => {
  const worktreePath = await mkdtemp(resolve(tmpdir(), "dev-worktree-test-"));
  const firstPair = derivePortPair(worktreePath);
  const occupiedPorts = new Set([firstPair.frontend, firstPair.studio]);
  const checkPort = async (port) => !occupiedPorts.has(port);

  context.after(() => rm(worktreePath, { force: true, recursive: true }));

  const selected = await selectPortPair({ worktreePath, checkPort });
  const saved = JSON.parse(await readFile(resolve(worktreePath, ".worktree-ports.json")));

  assert.deepEqual(selected.pair, derivePortPair(worktreePath, 1));
  assert.deepEqual(saved, selected.pair);

  const selectedAgain = await selectPortPair({ worktreePath, checkPort });
  assert.deepEqual(selectedAgain.pair, selected.pair);
});

test("selectPortPair requires both explicit port overrides", async () => {
  await assert.rejects(
    selectPortPair({
      worktreePath: "/worktree",
      frontendOverride: "3200",
      checkPort: async () => true,
    }),
    /Set FRONTEND_PORT and STUDIO_PORT together/,
  );
});

test("selectPortPair uses a complete explicit override without saving it", async () => {
  const selected = await selectPortPair({
    worktreePath: "/worktree",
    frontendOverride: "3200",
    studioOverride: "4200",
    checkPort: async () => true,
  });

  assert.deepEqual(selected, {
    pair: { frontend: 3200, studio: 4200 },
    source: "environment",
  });
});
