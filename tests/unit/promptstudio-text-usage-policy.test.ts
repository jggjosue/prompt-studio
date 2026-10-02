import assert from "node:assert/strict";
import test from "node:test";

import {
  getPromptStudioTextPlanLimit,
  utcMonthWindow,
} from "../../src/lib/generation/promptstudio-text-usage-policy.ts";

test("initial monthly generation limits increase by paid plan", () => {
  const free = getPromptStudioTextPlanLimit("free", {});
  const creator = getPromptStudioTextPlanLimit("creator", {});
  const pro = getPromptStudioTextPlanLimit("pro", {});
  const studio = getPromptStudioTextPlanLimit("studio", {});

  assert.equal(free.monthlyGenerations, 25);
  assert.equal(creator.monthlyGenerations, 250);
  assert.equal(pro.monthlyGenerations, 1_000);
  assert.equal(studio.monthlyGenerations, 5_000);
  assert.ok(free.monthlyGenerations < creator.monthlyGenerations);
  assert.ok(creator.monthlyGenerations < pro.monthlyGenerations);
  assert.ok(pro.monthlyGenerations < studio.monthlyGenerations);
});

test("plan limits can be changed entirely through environment configuration", () => {
  const limit = getPromptStudioTextPlanLimit("pro", {
    PROMPTSTUDIO_TEXT_PRO_MONTHLY_GENERATIONS: "2222",
    PROMPTSTUDIO_TEXT_PRO_CREDITS_PER_GENERATION: "1.5",
  });

  assert.equal(limit.monthlyGenerations, 2_222);
  assert.equal(limit.reservedCreditsPerGeneration, 1.5);
});

test("usage window is a stable UTC calendar month", () => {
  const window = utcMonthWindow(new Date("2026-10-15T12:30:00Z"));
  assert.equal(window.key, "2026-10");
  assert.equal(window.start.toISOString(), "2026-10-01T00:00:00.000Z");
  assert.equal(window.end.toISOString(), "2026-11-01T00:00:00.000Z");
});
