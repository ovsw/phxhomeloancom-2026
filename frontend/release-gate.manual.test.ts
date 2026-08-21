import { expect, test } from "vitest";

test("manual release gate check", () => {
  expect("blocked").toBe("allowed");
});
