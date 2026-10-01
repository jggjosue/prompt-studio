import {
  SELF_HOSTED_TEXT_HOSTING_POLICY,
  gpuRuntimeCostUsd,
  monthlyDedicatedGpuCostUsd,
} from "../../src/lib/generation/self-hosted-hosting-policy.ts";

const secondsPerGeneration = Number(
  process.env.TEXT_MODEL_SECONDS_PER_GENERATION ?? "10",
);
const volumes = [1_000, 10_000, 100_000, 1_000_000];

if (!Number.isFinite(secondsPerGeneration) || secondsPerGeneration <= 0) {
  throw new Error("TEXT_MODEL_SECONDS_PER_GENERATION must be > 0");
}

const { modal, runpod } =
  SELF_HOSTED_TEXT_HOSTING_POLICY.pricingSnapshot;

const rows = volumes.map((generations) => {
  const gpuHours = (generations * secondsPerGeneration) / 3600;

  return {
    generations,
    secondsPerGeneration,
    gpuHours: round(gpuHours),
    modalL4BeforeCreditUsd: round(gpuHours * modal.l4UsdPerHour),
    modalL4AfterIncludedCreditUsd: round(
      gpuRuntimeCostUsd(
        gpuHours,
        modal.l4UsdPerHour,
        modal.includedComputeUsdPerMonth,
      ),
    ),
    runpodServerless24GbUsd: round(
      gpuRuntimeCostUsd(gpuHours, runpod.serverless24GbUsdPerHour),
    ),
  };
});

console.table(rows);
console.log({
  dedicatedRunpodA5000ThirtyDayCostUsd: monthlyDedicatedGpuCostUsd(
    runpod.secureA5000UsdPerHour,
  ),
  policy: SELF_HOSTED_TEXT_HOSTING_POLICY.migrationThresholds,
});

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
