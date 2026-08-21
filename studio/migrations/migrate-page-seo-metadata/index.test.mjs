import assert from "node:assert/strict";
import test from "node:test";

import { planPageSeoMigration } from "./index.ts";

test("preserves the legacy SEO values exactly", () => {
  const plan = planPageSeoMigration({
    _id: "page-id",
    _rev: "revision",
    _type: "page",
    meta: {},
    seoTitle: "FHA Mortgage Loan in Phoenix | Phoenix Mortgage Lenders",
    seoDescription: "Legacy description.",
  });

  assert.deepEqual(plan, {
    title: "FHA Mortgage Loan in Phoenix | Phoenix Mortgage Lenders",
    description: "Legacy description.",
    issues: [],
  });
});

test("treats legacy values as authoritative over canonical metadata", () => {
  const plan = planPageSeoMigration({
    _id: "page-id",
    _rev: "revision",
    _type: "page",
    meta: {
      title: "Different new title",
      description: "Different new description.",
      noindex: false,
    },
    seoTitle: "Legacy title",
    seoDescription: "Legacy description.",
  });

  assert.equal(plan.title, "Legacy title");
  assert.equal(plan.description, "Legacy description.");
  assert.deepEqual(plan.issues, []);
});

test("rejects malformed source or destination fields before writes", () => {
  const plan = planPageSeoMigration({
    _id: "page-id",
    _rev: "revision",
    _type: "page",
    meta: "invalid",
    seoTitle: 42,
    seoDescription: { text: "invalid" },
  });

  assert.equal(plan.issues.length, 3);
  assert.match(plan.issues[0], /meta must be an object/);
  assert.match(plan.issues[1], /seoTitle must be a string/);
  assert.match(plan.issues[2], /seoDescription must be a string/);
});
