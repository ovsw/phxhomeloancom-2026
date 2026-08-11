import assert from "node:assert/strict";
import test from "node:test";

import { autoRedirectId } from "../functions/auto-redirect/model.ts";
import {
  LEGACY_CATEGORY_REDIRECTS,
  assertTargetDataset,
  buildDryRunReport,
  buildMigrationPlan,
} from "./migrate-legacy-category-redirects.ts";

const CATEGORY_SLUGS = [
  "loan-types",
  "getting-approved",
  "closing-costs",
  "mortgage-rates",
];

function inventory(overrides = {}) {
  return {
    categorySlugs: CATEGORY_SLUGS,
    redirects: [],
    routedDocuments: CATEGORY_SLUGS.map((slug) => ({
      _id: `category-${slug}`,
      _type: "category",
      slug: { _type: "slug", current: slug },
    })),
    ...overrides,
  };
}

function expectedDocuments() {
  return buildMigrationPlan(inventory()).records.map(({ document }) => document);
}

test("plans five creates at deterministic ids", () => {
  const plan = buildMigrationPlan(inventory());
  assert.deepEqual(plan.summary, { create: 5, noOp: 0, fatal: 0 });

  for (const record of plan.records) {
    assert.equal(record.status, "create");
    assert.equal(
      record.document._id,
      autoRedirectId(record.document.source.current),
    );
    assert.equal(record.document.status, "active");
    assert.equal(record.document.permanent, "true");
  }
});

test("re-running against the migrated dataset is all no-ops", () => {
  const plan = buildMigrationPlan(inventory({ redirects: expectedDocuments() }));
  assert.deepEqual(plan.summary, { create: 0, noOp: 5, fatal: 0 });
  assert.equal(plan.creates.length, 0);
});

test("fatal when a destination category slug is missing", () => {
  const plan = buildMigrationPlan(
    inventory({
      categorySlugs: CATEGORY_SLUGS.filter((slug) => slug !== "loan-types"),
    }),
  );
  assert.ok(
    plan.fatal.some(({ reason }) =>
      reason.includes("no published category with slug loan-types"),
    ),
  );
});

test("the /blog/ destination needs no category", () => {
  const plan = buildMigrationPlan(inventory());
  const blogRecord = plan.records.find(
    ({ document }) => document.destination.current === "/blog/",
  );
  assert.equal(blogRecord.status, "create");
});

test("fatal when a live route owns a legacy source", () => {
  const plan = buildMigrationPlan(
    inventory({
      routedDocuments: [
        ...inventory().routedDocuments,
        {
          _id: "page-1",
          _type: "page",
          slug: { _type: "slug", current: "types-of-loans" },
        },
      ],
    }),
  );
  assert.equal(plan.records[0].status, "fatal");
  assert.match(plan.records[0].reason, /live route/);
});

test("fatal when another redirect owns a legacy source", () => {
  const [expected] = expectedDocuments();
  const plan = buildMigrationPlan(
    inventory({
      redirects: [{ ...expected, _id: "hand-authored" }],
    }),
  );
  assert.equal(plan.records[0].status, "fatal");
  assert.match(plan.records[0].reason, /already owned by redirect/);
});

test("fatal when the document at the deterministic id differs", () => {
  const [expected] = expectedDocuments();
  const plan = buildMigrationPlan(
    inventory({
      redirects: [
        { ...expected, destination: { _type: "slug", current: "/different/" } },
      ],
    }),
  );
  assert.equal(plan.records[0].status, "fatal");
  assert.match(plan.records[0].reason, /differs from the expected redirect/);
});

test("reports dry-run mode and enforces the sole target dataset", () => {
  const report = buildDryRunReport(buildMigrationPlan(inventory()));
  assert.equal(report.projectId, "hv0545v9");
  assert.equal(report.dataset, "development");
  assert.equal(report.mode, "dry-run");
  assert.equal(LEGACY_CATEGORY_REDIRECTS.length, 5);

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
