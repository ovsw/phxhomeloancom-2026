import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { onTestFinished, test } from "vitest";

import { buildPresentationUrl, resolveStudioPort } from "./presentation-url.mjs";

async function temporaryProjectRoot() {
  const root = await mkdtemp(resolve(tmpdir(), "presentation-url-"));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("builds the Presentation URL from the shared route resolver", () => {
  assert.equal(
    buildPresentationUrl(3333, "page", "about"),
    "http://localhost:3333/presentation?preview=%2Fabout%2F",
  );
  assert.equal(
    buildPresentationUrl(4102, "category", "loan-types"),
    "http://localhost:4102/presentation?preview=%2Fblog%2Fcategory%2Floan-types%2F",
  );
  assert.equal(
    buildPresentationUrl(3333, "blogIndex"),
    "http://localhost:3333/presentation?preview=%2Fblog%2F",
  );
  assert.equal(
    buildPresentationUrl(3333, "homePage"),
    "http://localhost:3333/presentation?preview=%2F",
  );
});

test("rejects documents that have no Presentation route", () => {
  assert.throws(() => buildPresentationUrl(3333, "page"), /Pass the document's slug/);
  assert.throws(() => buildPresentationUrl(3333, "author", "jane"), /No Presentation route/);
});

test("falls back to the plain `pnpm dev` Studio port", async () => {
  const projectRoot = await temporaryProjectRoot();
  assert.deepEqual(await resolveStudioPort({ projectRoot, studioOverride: "" }), {
    port: 3333,
    source: "default",
  });
});

test("reads the Studio port assigned by `pnpm dev:worktree`", async () => {
  const projectRoot = await temporaryProjectRoot();
  const portFile = resolve(projectRoot, ".worktree-ports.json");
  await writeFile(portFile, JSON.stringify({ frontend: 3104, studio: 4104 }));

  assert.deepEqual(await resolveStudioPort({ projectRoot, studioOverride: "" }), {
    port: 4104,
    source: portFile,
  });
});

test("rejects a saved Studio port outside the usable range", async () => {
  const projectRoot = await temporaryProjectRoot();
  await writeFile(
    resolve(projectRoot, ".worktree-ports.json"),
    JSON.stringify({ frontend: 3104, studio: 80 }),
  );

  await assert.rejects(
    resolveStudioPort({ projectRoot, studioOverride: "" }),
    /Studio port in .*worktree-ports\.json must be an integer/,
  );
});

test("STUDIO_PORT overrides the saved worktree port", async () => {
  const projectRoot = await temporaryProjectRoot();
  await writeFile(
    resolve(projectRoot, ".worktree-ports.json"),
    JSON.stringify({ frontend: 3104, studio: 4104 }),
  );

  assert.deepEqual(await resolveStudioPort({ projectRoot, studioOverride: "4109" }), {
    port: 4109,
    source: "STUDIO_PORT",
  });
  await assert.rejects(
    resolveStudioPort({ projectRoot, studioOverride: "80" }),
    /STUDIO_PORT must be an integer/,
  );
});
