import assert from "node:assert/strict";
import test from "node:test";

import { autoRedirectId } from "../functions/auto-redirect/model.ts";
import {
  LEGACY_CATEGORY_REDIRECTS,
  assertTargetDataset,
  buildAuditErrors,
  buildDryRunReport,
  buildMigrationPlan,
} from "./migrate-legacy-category-redirects.ts";

function targetCategories() {
  return LEGACY_CATEGORY_REDIRECTS.flatMap((mapping) =>
    "categoryId" in mapping
      ? [
          {
            _id: mapping.categoryId,
            _type: "category",
            slug: { _type: "slug", current: mapping.categorySlug },
          },
        ]
      : [],
  );
}

function inventory(overrides = {}) {
  const categories = targetCategories();
  return {
    blogIndexes: [{ _id: "blogIndex", _type: "blogIndex" }],
    deterministicDocuments: [],
    redirects: [],
    routedDocuments: categories,
    targetCategories: categories,
    ...overrides,
  };
}

function expectedDocuments() {
  return buildMigrationPlan(inventory()).records.map(({ document }) => document);
}

function migratedInventory(overrides = {}) {
  const redirects = expectedDocuments();
  return inventory({
    deterministicDocuments: redirects,
    redirects,
    ...overrides,
  });
}

test("plans five stable createIfNotExists documents and no update path", () => {
  const first = buildMigrationPlan(inventory());
  const second = buildMigrationPlan(inventory());
  assert.deepEqual(first.summary, { create: 5, noOp: 0, fatal: 0 });
  assert.equal(first.fatal.length, 0);
  assert.deepEqual(first.creates, second.creates);

  for (const record of first.records) {
    assert.equal(record.status, "create");
    assert.equal(record.document._id, autoRedirectId(record.document.source.current));
    assert.equal(record.document.status, "active");
    assert.equal(record.document.permanent, "true");
    assert.equal("update" in record, false);
  }
});

test("classifies exact published records as idempotent no-ops", () => {
  const plan = buildMigrationPlan(migratedInventory());
  assert.deepEqual(plan.summary, { create: 0, noOp: 5, fatal: 0 });
  assert.equal(plan.creates.length, 0);
  assert.deepEqual(plan.fatal, []);
});

test("treats every deterministic-id mismatch as fatal", () => {
  const [expected] = expectedDocuments();
  const mismatches = [
    { ...expected, _type: "page" },
    { ...expected, source: { _type: "slug", current: "/different/" } },
    { ...expected, destination: { _type: "slug", current: "/different/" } },
    { ...expected, status: "inactive" },
    { ...expected, permanent: "false" },
  ];

  for (const mismatch of mismatches) {
    const plan = buildMigrationPlan(
      inventory({
        deterministicDocuments: [mismatch],
        redirects: mismatch._type === "redirect" ? [mismatch] : [],
      }),
    );
    assert.equal(plan.records[0].status, "fatal");
    assert.equal(plan.creates.some(({ _id }) => _id === expected._id), false);
  }
});

test("rejects a normalized source owned by any other redirect version", () => {
  const [expected] = expectedDocuments();
  for (const otherId of ["hand-authored", "drafts.hand-authored"]) {
    const plan = buildMigrationPlan(
      inventory({
        redirects: [
          {
            ...expected,
            _id: otherId,
            source: { _type: "slug", current: expected.source.current.slice(0, -1) },
            status: "inactive",
          },
        ],
      }),
    );
    assert.equal(plan.records[0].status, "fatal");
    assert.match(plan.records[0].reason, /already owned/);
  }
});

test("rejects a draft at a deterministic redirect id", () => {
  const [expected] = expectedDocuments();
  const plan = buildMigrationPlan(
    inventory({
      deterministicDocuments: [
        { ...expected, _id: `drafts.${expected._id}` },
      ],
      redirects: [{ ...expected, _id: `drafts.${expected._id}` }],
    }),
  );
  assert.equal(plan.records[0].status, "fatal");
  assert.match(plan.records[0].reason, /could publish over/);
});

test("materializes raw route paths before checking legacy source ownership", () => {
  const [mapping] = LEGACY_CATEGORY_REDIRECTS;
  for (const type of ["page", "post", "category"]) {
    const collision = {
      _id: type === "post" ? "post-1" : `drafts.${type}-1`,
      _type: type,
      slug: {
        _type: "slug",
        current: type === "category" ? "types-of-loans" : mapping.source,
      },
    };
    const plan = buildMigrationPlan(
      inventory({
        routedDocuments: [...targetCategories(), collision],
      }),
    );
    if (type === "category") {
      assert.equal(plan.records[0].status, "create");
    } else {
      assert.equal(plan.records[0].status, "fatal");
      assert.match(plan.records[0].reason, /already owned/);
    }
  }
});

test("binds category destinations to published ids and matching drafts", () => {
  const [mapping] = LEGACY_CATEGORY_REDIRECTS;
  assert.ok("categoryId" in mapping);
  const withoutPublished = targetCategories().filter(
    ({ _id }) => _id !== mapping.categoryId,
  );
  assert.ok(
    buildMigrationPlan(inventory({ targetCategories: withoutPublished })).fatal.some(
      ({ reason }) => reason.includes("no published category"),
    ),
  );

  const wrongPublished = targetCategories().map((category) =>
    category._id === mapping.categoryId
      ? { ...category, slug: { _type: "slug", current: "old-slug" } }
      : category,
  );
  assert.ok(
    buildMigrationPlan(inventory({ targetCategories: wrongPublished })).fatal.some(
      ({ reason }) => reason.includes("published target slug"),
    ),
  );

  const staleDraft = {
    _id: `drafts.${mapping.categoryId}`,
    _type: "category",
    slug: { _type: "slug", current: "old-slug" },
  };
  assert.ok(
    buildMigrationPlan(
      inventory({ targetCategories: [...targetCategories(), staleDraft] }),
    ).fatal.some(({ reason }) => reason.includes("draft target slug")),
  );

  const matchingDraft = {
    ...staleDraft,
    slug: { _type: "slug", current: mapping.categorySlug },
  };
  assert.equal(
    buildMigrationPlan(
      inventory({ targetCategories: [...targetCategories(), matchingDraft] }),
    ).fatal.length,
    0,
  );
});

test("requires the published blog index route", () => {
  const missing = buildMigrationPlan(inventory({ blogIndexes: [] }));
  assert.ok(missing.fatal.some(({ reason }) => reason.includes("does not resolve")));

  const wrongId = buildMigrationPlan(
    inventory({ blogIndexes: [{ _id: "other", _type: "blogIndex" }] }),
  );
  assert.ok(wrongId.fatal.some(({ reason }) => reason.includes("does not resolve")));

  const draftOnly = buildMigrationPlan(
    inventory({ blogIndexes: [{ _id: "drafts.blogIndex", _type: "blogIndex" }] }),
  );
  assert.ok(draftOnly.fatal.some(({ reason }) => reason.includes("does not resolve")));
});

test("rejects a chain against the full active redirect topology", () => {
  const [expected] = expectedDocuments();
  const plan = buildMigrationPlan(
    inventory({
      redirects: [
        {
          _id: "upstream",
          _type: "redirect",
          source: { _type: "slug", current: "/upstream/" },
          destination: expected.source,
          permanent: "true",
          status: "active",
        },
      ],
    }),
  );
  assert.ok(plan.fatal.some(({ id }) => id === "redirect-topology"));
  assert.ok(plan.fatal.some(({ reason }) => /chain or cycle/i.test(reason)));
});

test("post-write audit requires five exact records and one raw owner per source", () => {
  assert.deepEqual(buildAuditErrors(migratedInventory()), []);

  const redirects = expectedDocuments();
  const duplicate = {
    ...redirects[0],
    _id: "drafts.duplicate-source",
  };
  const errors = buildAuditErrors(
    migratedInventory({ redirects: [...redirects, duplicate] }),
  );
  assert.ok(errors.some((error) => error.includes("exactly one owner")));
});

test("reports dry-run mode and enforces the sole target dataset", () => {
  const report = buildDryRunReport(buildMigrationPlan(inventory()));
  assert.equal(report.projectId, "hv0545v9");
  assert.equal(report.dataset, "development");
  assert.equal(report.mode, "dry-run");

  assert.doesNotThrow(() =>
    assertTargetDataset({ projectId: "hv0545v9", dataset: "development" }),
  );
  assert.throws(
    () => assertTargetDataset({ projectId: "other", dataset: "development" }),
    /Refusing to run outside hv0545v9\/development/,
  );
  assert.throws(
    () => assertTargetDataset({ projectId: "hv0545v9", dataset: "other" }),
    /Refusing to run outside hv0545v9\/development/,
  );
});
