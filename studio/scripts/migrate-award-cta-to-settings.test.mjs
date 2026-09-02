import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAwardBlockUnsetPaths,
  createAwardSettings,
  getSealFileArg,
  resolveDataset,
} from "./migrate-award-cta-to-settings.ts";

test("builds approved shared award settings content", () => {
  assert.deepEqual(createAwardSettings("image-ref"), {
    _type: "object",
    eyebrow: "A track record you can verify",
    title: "2026 Scotsman Guide Top Originator",
    description:
      "James Vercellino was listed among Scotsman Guide's 2026 Top Originators.",
    sealImage: {
      _type: "image",
      asset: { _ref: "image-ref", _type: "reference" },
      alt: "Scotsman Guide Top Originators 2026 logo",
    },
    sealSize: "medium",
    proofLink: {
      _type: "object",
      label: "View list",
      accessibleLabel: "View Scotsman Guide Top Originators 2026 ranking list",
      url: {
        _type: "customUrl",
        type: "external",
        external:
          "https://www.scotsmanguide.com/rankings/top-originators/top-originators-rankings-2026/",
        openInNewTab: true,
      },
    },
    ctaButton: {
      _key: "schedule-consult",
      _type: "button",
      text: "Schedule a Consult",
      url: {
        _type: "customUrl",
        type: "internal",
        internal: { _ref: "contactMe", _type: "reference" },
        openInNewTab: false,
      },
    },
  });
});

test("builds old per-page award field cleanup paths by block key", () => {
  assert.deepEqual(
    buildAwardBlockUnsetPaths([
      {
        _id: "homePage",
        _rev: "rev",
        _type: "homePage",
        blocks: [
          { _key: "hero", _type: "homeHero" },
          { _key: "award", _type: "awardCta" },
        ],
      },
    ]),
    [
      { documentId: "homePage", path: 'blocks[_key=="award"].highlight' },
      { documentId: "homePage", path: 'blocks[_key=="award"].title' },
      { documentId: "homePage", path: 'blocks[_key=="award"].description' },
      { documentId: "homePage", path: 'blocks[_key=="award"].buttons' },
    ],
  );
});

test("falls back to array index only when an old block has no key", () => {
  assert.deepEqual(
    buildAwardBlockUnsetPaths([
      {
        _id: "page",
        _rev: "rev",
        _type: "page",
        blocks: [{ _type: "awardCta" }],
      },
    ]).map((item) => item.path),
    [
      "blocks[0].highlight",
      "blocks[0].title",
      "blocks[0].description",
      "blocks[0].buttons",
    ],
  );
});

test("parses optional seal file argument", () => {
  assert.equal(getSealFileArg(["node", "script"]), undefined);
  assert.equal(
    getSealFileArg(["node", "script", "--seal-file", "/tmp/seal.png"]),
    "/tmp/seal.png",
  );
});

test("allows only known Sanity datasets", () => {
  const original = process.env.SANITY_STUDIO_DATASET;
  delete process.env.SANITY_STUDIO_DATASET;
  assert.equal(resolveDataset(), "development");
  process.env.SANITY_STUDIO_DATASET = "production";
  assert.equal(resolveDataset(), "production");
  process.env.SANITY_STUDIO_DATASET = "staging";
  assert.throws(() => resolveDataset(), /Refusing to run/);
  if (original === undefined) {
    delete process.env.SANITY_STUDIO_DATASET;
  } else {
    process.env.SANITY_STUDIO_DATASET = original;
  }
});
