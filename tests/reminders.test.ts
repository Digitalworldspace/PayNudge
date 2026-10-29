import { test } from "node:test";
import assert from "node:assert/strict";
import { autoStageToSend, daysLate, balance, buildEmail, suggestedStage } from "../lib/reminders.ts";

const today = new Date("2026-10-29T15:00:00Z");

test("daysLate counts calendar days in UTC", () => {
  assert.equal(daysLate("2026-10-29", today), 0);
  assert.equal(daysLate("2026-10-19", today), 10);
  assert.equal(daysLate("2026-11-01", today), -3);
});

test("automatic stages follow the schedule", () => {
  assert.equal(autoStageToSend(-5, []), null);
  assert.equal(autoStageToSend(-3, []), "upcoming");
  assert.equal(autoStageToSend(0, []), null);
  assert.equal(autoStageToSend(1, []), "friendly");
  assert.equal(autoStageToSend(9, ["friendly"]), null);
  assert.equal(autoStageToSend(10, ["upcoming", "friendly"]), "firm");
  assert.equal(autoStageToSend(30, ["firm"]), "final");
  assert.equal(autoStageToSend(45, ["final"]), null);
});

test("a missed run catches up with the current stage only", () => {
  assert.equal(autoStageToSend(15, []), "firm");
});

test("an earlier stage is never sent after a later one", () => {
  assert.equal(autoStageToSend(5, ["firm"]), null);
});

test("balance subtracts the deposit and never goes negative", () => {
  assert.equal(balance({ amount: 1000, deposit: 250 }), 750);
  assert.equal(balance({ amount: 100, deposit: 500 }), 0);
});

test("suggested tone for the composer", () => {
  assert.equal(suggestedStage(-2), "upcoming");
  assert.equal(suggestedStage(3), "friendly");
  assert.equal(suggestedStage(12), "firm");
  assert.equal(suggestedStage(40), "final");
});

test("email shows the balance and the deposit note", () => {
  const e = buildEmail(
    { invoice_number: "INV-7", contact_name: "Sam", amount: 1000, deposit: 400, due_date: "2026-10-01" },
    "firm",
    { full_name: "Alex", business_name: "Alex Studio", payment_link: "https://pay.example/alex" },
    today,
  );
  assert.match(e.subject, /28 days past due/);
  assert.match(e.body, /\$600/);
  assert.match(e.body, /\$400 deposit/);
  assert.match(e.body, /https:\/\/pay\.example\/alex/);
  assert.match(e.body, /Nov 5, 2026/);
});
