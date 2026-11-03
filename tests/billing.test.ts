import { test } from "node:test";
import assert from "node:assert/strict";

const { mapPolarStatus } = await import("../lib/billing-status.ts");

test("Polar statuses map to PayNudge access states", () => {
  assert.equal(mapPolarStatus("active"), "active");
  assert.equal(mapPolarStatus("trialing"), "active");
  assert.equal(mapPolarStatus("past_due"), "on_hold");
  assert.equal(mapPolarStatus("unpaid"), "on_hold");
  assert.equal(mapPolarStatus("canceled"), "cancelled");
  assert.equal(mapPolarStatus("incomplete"), "pending");
});
