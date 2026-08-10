import assert from "node:assert/strict";
import test from "node:test";

import { compileNextRedirects } from "./redirects.mjs";

test("maps permanent and temporary redirects to explicit status codes", () => {
  assert.deepEqual(
    compileNextRedirects([
      { source: { current: "/old" }, destination: { current: "/new" }, permanent: "true", status: "active" },
      { source: { current: "/temp/" }, destination: { current: "/later" }, permanent: "false", status: "active" },
    ]),
    [
      { source: "/old", destination: "/new/", statusCode: 301 },
      { source: "/old/", destination: "/new/", statusCode: 301 },
      { source: "/temp", destination: "/later/", statusCode: 302 },
      { source: "/temp/", destination: "/later/", statusCode: 302 },
    ],
  );
});

test("allows many sources to share one destination and ignores inactive records", () => {
  assert.equal(
    compileNextRedirects([
      { source: "/one", destination: "/target", permanent: true },
      { source: "/two", destination: "/target", permanent: true },
      { source: "/off", destination: "/target", permanent: true, status: "inactive" },
    ]).length,
    4,
  );
});

test("deduplicates equivalent rules", () => {
  assert.equal(
    compileNextRedirects([
      { source: "/old", destination: "/new", permanent: true },
      { source: "/old/", destination: "/new/", permanent: "true" },
    ]).length,
    2,
  );
});

test("rejects conflicting normalized sources", () => {
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/old", destination: "/one", permanent: true },
        { source: "/old/", destination: "/two", permanent: true },
      ]),
    /Conflicting redirects share the source \/old/,
  );
});

test("rejects self redirects, chains, and cycles", () => {
  assert.throws(
    () => compileNextRedirects([{ source: "/same", destination: "/same/", permanent: true }]),
    /source and destination are the same/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/a", destination: "/b", permanent: true },
        { source: "/b", destination: "/c", permanent: true },
      ]),
    /chain or cycle/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/a", destination: "/b", permanent: true },
        { source: "/b", destination: "/a", permanent: true },
      ]),
    /chain or cycle/,
  );
});

test("rejects backslashes in redirect paths", () => {
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/bad\\source", destination: "/target", permanent: true },
      ]),
    /missing a valid internal source or destination/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/source", destination: "/bad\\target", permanent: true },
      ]),
    /missing a valid internal source or destination/,
  );
});

test("rejects a CMS redirect that conflicts with the code-owned index rule", () => {
  assert.throws(
    () =>
      compileNextRedirects(
        [{ source: "/index/", destination: "/other", permanent: true }],
        { reservedSources: ["/index/"] },
      ),
    /reserved by a code-owned rule/,
  );
});
