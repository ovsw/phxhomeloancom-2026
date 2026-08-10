import assert from "node:assert/strict";
import test from "node:test";

import { getRedirectValidationIssues } from "./redirect-rules.ts";

function issues(current, redirects = [], liveRoutes = []) {
  return getRedirectValidationIssues({ current, redirects, liveRoutes });
}

test("allows many redirects to share a destination", () => {
  assert.deepEqual(
    issues(
      { source: "/new-source", destination: "/target", status: "active" },
      [{ source: "/another", destination: "/target/", status: "active" }],
      [{ path: "/target", type: "page" }],
    ),
    { destinationWarning: undefined, errors: {} },
  );
});

test("normalizes slash variants when detecting duplicate sources", () => {
  assert.match(
    issues(
      { source: "/same/", destination: "/target", status: "active" },
      [{ source: "/same", destination: "/other", status: "active" }],
      [{ path: "/target", type: "page" }],
    ).errors.source,
    /already uses this source/,
  );
});

test("rejects redirect chains in either direction", () => {
  assert.match(
    issues(
      { source: "/b", destination: "/c", status: "active" },
      [{ source: "/a", destination: "/b", status: "active" }],
      [{ path: "/c", type: "post" }],
    ).errors.source,
    /destination of another redirect/,
  );
  assert.match(
    issues(
      { source: "/a", destination: "/b", status: "active" },
      [{ source: "/b", destination: "/c", status: "active" }],
    ).errors.destination,
    /create a chain/,
  );
});

test("rejects self redirects and sources that shadow routes", () => {
  assert.match(
    issues({ source: "/same", destination: "/same/" }).errors.destination,
    /cannot be the same/,
  );
  assert.match(
    issues(
      { source: "/about", destination: "/target" },
      [],
      [{ path: "about", type: "page" }],
    ).errors.source,
    /already used by a page/,
  );
  assert.match(
    issues({ source: "/index/", destination: "/" }).errors.source,
    /reserved/,
  );
});

test("warns instead of blocking when a destination has no published route", () => {
  assert.deepEqual(
    issues({ source: "/old", destination: "/missing", status: "active" }),
    {
      destinationWarning: "No published page or post currently uses this destination",
      errors: {},
    },
  );
});

test("inactive redirects do not participate in active topology", () => {
  assert.equal(
    issues(
      { source: "/a", destination: "/target", status: "active" },
      [{ source: "/a/", destination: "/other", status: "inactive" }],
      [{ path: "/target", type: "page" }],
    ).errors.source,
    undefined,
  );
});

test("rejects backslashes in source and destination paths", () => {
  assert.match(
    issues({ source: "/bad\\source", destination: "/target" }).errors.source,
    /internal path/,
  );
  assert.match(
    issues({ source: "/source", destination: "/bad\\target" }).errors
      .destination,
    /internal path/,
  );
});
