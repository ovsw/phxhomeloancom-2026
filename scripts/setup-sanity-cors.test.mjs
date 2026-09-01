import assert from "node:assert/strict";
import test from "node:test";

import {
  desiredCorsOrigins,
  planCorsChanges,
} from "./setup-sanity-cors.mjs";

test("desiredCorsOrigins enables credentials for every Next.js and Studio origin", () => {
  const origins = desiredCorsOrigins();

  assert.equal(origins.length, 20);
  assert.ok(origins.every(({ credentials }) => credentials));
  assert.deepEqual(
    origins.map(({ origin }) => origin),
    Array.from({ length: 10 }, (_, offset) => [
      `http://localhost:${3100 + offset}`,
      `http://localhost:${4100 + offset}`,
    ]).flat(),
  );
});

test("planCorsChanges adds missing origins and replaces incorrect credential modes", () => {
  const desired = [
    { origin: "http://localhost:3100", credentials: true },
    { origin: "http://localhost:4100", credentials: true },
    { origin: "http://localhost:3101", credentials: true },
  ];
  const existing = [
    { id: "frontend", origin: "http://localhost:3100", allowCredentials: false },
    { id: "studio", origin: "http://localhost:4100", allowCredentials: true },
  ];

  assert.deepEqual(planCorsChanges(existing, desired), [
    {
      action: "replace",
      desired: desired[0],
      existing: existing[0],
    },
    { action: "add", desired: desired[2] },
  ]);
});

test("planCorsChanges does nothing when origins and credential modes match", () => {
  const desired = desiredCorsOrigins();
  const existing = desired.map(({ origin, credentials }, index) => ({
    id: String(index),
    origin,
    allowCredentials: credentials,
  }));

  assert.deepEqual(planCorsChanges(existing, desired), []);
});
