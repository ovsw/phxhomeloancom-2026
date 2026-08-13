import assert from "node:assert/strict";
import test from "node:test";
import {
  convertLegacyLinkMark,
  planPortableTextLinkMigration,
} from "./index.ts";

test("converts an internal link without changing its key or reference", () => {
  const reference = { _type: "reference", _ref: "page-id", _weak: true };
  assert.deepEqual(
    convertLegacyLinkMark({
      _key: "internal-key",
      _type: "link",
      internalLink: reference,
      isExternal: false,
      target: false,
    }),
    {
      _key: "internal-key",
      _type: "customLink",
      customLink: {
        _type: "customUrl",
        type: "internal",
        openInNewTab: false,
        internal: reference,
      },
    },
  );
});

test("converts an external link and preserves its exact URL", () => {
  assert.deepEqual(
    convertLegacyLinkMark({
      _key: "external-key",
      _type: "link",
      href: "https://example.com/path?q=1",
      isExternal: true,
      target: true,
    }),
    {
      _key: "external-key",
      _type: "customLink",
      customLink: {
        _type: "customUrl",
        type: "external",
        openInNewTab: true,
        external: "https://example.com/path?q=1",
      },
    },
  );
});

test("matches the legacy external fallback when isExternal is absent", () => {
  const converted = convertLegacyLinkMark({
    _key: "fallback-key",
    _type: "link",
    href: "/relative-path/",
  });

  assert.equal(converted.customLink.type, "external");
  assert.equal(converted.customLink.external, "/relative-path/");
});

test("finds nested Portable Text links and audits invalid destinations", () => {
  const plan = planPortableTextLinkMigration({
    _id: "drafts.faq-id",
    _rev: "revision",
    _type: "faq",
    nested: {
      body: [
        {
          _key: "block-key",
          _type: "block",
          markDefs: [
            {
              _key: "empty-link",
              _type: "link",
              isExternal: false,
            },
          ],
        },
      ],
    },
  });

  assert.equal(plan.replacements.length, 1);
  assert.deepEqual(plan.replacements[0].path, [
    "nested",
    "body",
    0,
    "markDefs",
  ]);
  assert.equal(plan.audit.legacyLinks, 1);
  assert.equal(plan.audit.missingDestinations, 1);
  assert.deepEqual(plan.issues, []);
});

test("is idempotent for canonical links", () => {
  const canonical = {
    _key: "canonical-key",
    _type: "customLink",
    customLink: {
      _type: "customUrl",
      type: "internal",
      internal: { _type: "reference", _ref: "page-id" },
    },
  };

  assert.equal(convertLegacyLinkMark(canonical), canonical);
});

test("rejects unfamiliar legacy fields before any writes", () => {
  const plan = planPortableTextLinkMigration({
    _id: "faq-id",
    _rev: "revision",
    _type: "faq",
    body: [
      {
        _key: "block-key",
        _type: "block",
        markDefs: [
          {
            _key: "link-key",
            _type: "link",
            internalLink: { _type: "reference", _ref: "page-id" },
            legacyLabel: "unexpected",
          },
        ],
      },
    ],
  });

  assert.match(plan.issues[0], /unexpected link fields legacyLabel/);
});
