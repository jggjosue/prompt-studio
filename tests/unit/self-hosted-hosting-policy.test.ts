import assert from "node:assert/strict";
import test from "node:test";

import {
  SELF_HOSTED_TEXT_HOSTING_POLICY,
  breakEvenGpuHours,
  gpuRuntimeCostUsd,
  monthlyDedicatedGpuCostUsd,
} from "../../src/lib/generation/self-hosted-hosting-policy.ts";

test("pricing snapshot preserves the approved initial hosting decision", () => {
  assert.equal(SELF_HOSTED_TEXT_HOSTING_POLICY.initialProvider, "modal");
  assert.equal(SELF_HOSTED_TEXT_HOSTING_POLICY.initialGpuClass, "L4");
  assert.equal(
    SELF_HOSTED_TEXT_HOSTING_POLICY.productionDefaultStatus,
    "provisional-pending-benchmark",
  );
});

test("Modal L4 rate converts from per-second to hourly consistently", () => {
  const modal = SELF_HOSTED_TEXT_HOSTING_POLICY.pricingSnapshot.modal;
  assert.equal(modal.l4UsdPerSecond * 3600, modal.l4UsdPerHour);
});

test("compute credit is applied without producing negative cost", () => {
  assert.equal(gpuRuntimeCostUsd(10, 0.7992, 30), 0);
  assert.equal(gpuRuntimeCostUsd(100, 0.7992, 30), 49.92);
});

test("dedicated A5000 planning cost uses a 30-day month", () => {
  const rate =
    SELF_HOSTED_TEXT_HOSTING_POLICY.pricingSnapshot.runpod.secureA5000UsdPerHour;

  assert.equal(monthlyDedicatedGpuCostUsd(rate), 194.4);
});

test("documented serverless-to-dedicated threshold matches pricing snapshot", () => {
  const runpod = SELF_HOSTED_TEXT_HOSTING_POLICY.pricingSnapshot.runpod;
  const dedicatedMonthly = monthlyDedicatedGpuCostUsd(
    runpod.secureA5000UsdPerHour,
  );
  const threshold = breakEvenGpuHours({
    variableHourlyRateUsd: runpod.serverless24GbUsdPerHour,
    fixedMonthlyCostUsd: dedicatedMonthly,
  });

  assert.ok(Math.abs(threshold - 281.7391304347826) < 1e-9);
});
