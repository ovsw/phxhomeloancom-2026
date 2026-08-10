import assert from "node:assert/strict";
import test from "node:test";

import {
  autoRedirectId,
  planAutoRedirect,
  shouldWriteAutoRedirect,
} from "./model.ts";
import { CODE_OWNED_GONE_ROUTE_PATHS } from "../../schemas/validation/redirect-rules.ts";

test("prevents writes during local Sanity Function tests", () => {
  assert.equal(shouldWriteAutoRedirect(true), false);
  assert.equal(shouldWriteAutoRedirect(false), true);
  assert.equal(shouldWriteAutoRedirect(undefined), true);
});

test("creates a permanent redirect for a routed slug change", () => {
  assert.deepEqual(
    planAutoRedirect({
      event: {
        beforeSlug: "old-page",
        documentId: "page-id",
        documentType: "page",
        slug: "/new-page/",
      },
      liveRoutes: [],
      redirects: [],
    }),
    {
      action: "apply",
      create: true,
      destination: "/new-page/",
      retarget: [],
      source: "/old-page/",
    },
  );
});

test("does not treat the published document as its own route collision", () => {
  assert.equal(
    planAutoRedirect({
      event: {
        beforeSlug: "/old-page/",
        documentId: "page-id",
        documentType: "page",
        slug: "/new-page/",
      },
      liveRoutes: [{ _id: "page-id", path: "/new-page/" }],
      redirects: [],
    }).action,
    "apply",
  );
});

test("flattens incoming redirects when a slug changes repeatedly", () => {
  assert.deepEqual(
    planAutoRedirect({
      event: { beforeSlug: "/b", documentType: "post", slug: "/c" },
      liveRoutes: [],
      redirects: [
        {
          _id: "redirect-a",
          _rev: "rev-a",
          source: "/a",
          destination: "/b",
          status: "active",
        },
      ],
    }),
    {
      action: "apply",
      create: true,
      destination: "/c/",
      retarget: [{ _id: "redirect-a", _rev: "rev-a" }],
      source: "/b/",
    },
  );
});

test("is idempotent when the direct redirect already exists", () => {
  assert.deepEqual(
    planAutoRedirect({
      event: { beforeSlug: "/old", documentType: "page", slug: "/new" },
      liveRoutes: [],
      redirects: [
        {
          _id: "redirect-id",
          source: "/old/",
          destination: "/new/",
          status: "active",
        },
      ],
    }),
    {
      action: "apply",
      create: false,
      destination: "/new/",
      retarget: [],
      source: "/old/",
    },
  );
});

test("does not create a duplicate when an inactive redirect owns the source", () => {
  const plan = planAutoRedirect({
    event: { beforeSlug: "/old", documentType: "page", slug: "/new" },
    liveRoutes: [],
    redirects: [
      {
        _id: "inactive-redirect",
        source: "/old/",
        destination: "/somewhere-else/",
        status: "inactive",
      },
    ],
  });

  assert.equal(plan.action, "skip");
  assert.match(plan.reason, /inactive redirect already uses/);
});

test("skips slug changes containing backslashes", () => {
  assert.equal(
    planAutoRedirect({
      event: {
        beforeSlug: "/bad\\source",
        documentType: "page",
        slug: "/new",
      },
      liveRoutes: [],
      redirects: [],
    }).action,
    "skip",
  );
});

test("blocks route collisions and redirect chains", () => {
  assert.equal(
    planAutoRedirect({
      event: { beforeSlug: "/old", documentType: "page", slug: "/new" },
      liveRoutes: [{ _id: "other-page", path: "/old" }],
      redirects: [],
    }).action,
    "skip",
  );
  assert.match(
    planAutoRedirect({
      event: { beforeSlug: "/old", documentType: "page", slug: "/new" },
      liveRoutes: [],
      redirects: [{ source: "/new", destination: "/later", status: "active" }],
    }).reason,
    /already a redirect source/,
  );
});

test("ignores unsupported document types and first publications", () => {
  assert.equal(
    planAutoRedirect({
      event: { beforeSlug: "/old", documentType: "category", slug: "/new" },
      liveRoutes: [],
      redirects: [],
    }).action,
    "skip",
  );
  assert.equal(
    planAutoRedirect({
      event: { documentType: "post", slug: "/new" },
      liveRoutes: [],
      redirects: [],
    }).action,
    "skip",
  );
});

test("reserves every code-owned Gone route from automatic slug redirects", () => {
  for (const route of CODE_OWNED_GONE_ROUTE_PATHS) {
    assert.match(
      planAutoRedirect({
        event: { beforeSlug: route, documentType: "page", slug: "/new" },
        liveRoutes: [],
        redirects: [],
      }).reason,
      /reserved/,
    );
  }

  assert.match(
    planAutoRedirect({
      event: {
        beforeSlug: "/old",
        documentType: "page",
        slug: CODE_OWNED_GONE_ROUTE_PATHS[0],
      },
      liveRoutes: [],
      redirects: [],
    }).reason,
    /reserved/,
  );
});

test("derives a stable redirect id from the source path", () => {
  // At-least-once delivery means the same publish can arrive twice; the id has
  // to match so the second write is a no-op rather than a conflicting source.
  assert.equal(autoRedirectId("/old-path/"), autoRedirectId("/old-path/"));
  assert.notEqual(autoRedirectId("/old-path/"), autoRedirectId("/other-path/"));
  assert.match(autoRedirectId("/old-path/"), /^redirect-[0-9a-f]{24}$/);
});
