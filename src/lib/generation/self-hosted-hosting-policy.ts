export const SELF_HOSTED_TEXT_HOSTING_POLICY = {
  decisionDate: "2026-10-01",
  initialProvider: "modal",
  initialGpuClass: "L4",
  productionDefaultStatus: "provisional-pending-benchmark",
  monthlyBudgetUsd: 100,
  alertThresholdsUsd: {
    warning: 50,
    critical: 80,
  },
  pricingSnapshot: {
    modal: {
      includedComputeUsdPerMonth: 30,
      l4UsdPerSecond: 0.000222,
      l4UsdPerHour: 0.7992,
      volumeUsdPerGibMonth: 0.09,
      networkEgressUsdPerGib: 0.04,
      includedNetworkEgressTibPerMonth: 1,
      starterGpuConcurrency: 10,
    },
    runpod: {
      serverless24GbUsdPerHour: 0.69,
      secureA5000UsdPerHour: 0.27,
      standardNetworkStorageUnder1TbUsdPerGbMonth: 0.07,
    },
  },
  migrationThresholds: {
    modalToRunpodServerlessGpuHoursPerMonth: 274.73,
    runpodServerlessToDedicatedGpuHoursPerMonth: 281.74,
    dedicatedUtilizationFractionOfThirtyDayMonth: 0.3913,
    minimumObservedSavingsFractionToMigrate: 0.15,
  },
} as const;

export function gpuRuntimeCostUsd(
  gpuHours: number,
  hourlyRateUsd: number,
  includedCreditUsd = 0,
): number {
  if (gpuHours < 0 || hourlyRateUsd < 0 || includedCreditUsd < 0) {
    throw new Error("GPU hours, rates, and credits must be non-negative");
  }

  return Math.max(0, gpuHours * hourlyRateUsd - includedCreditUsd);
}

export function monthlyDedicatedGpuCostUsd(
  hourlyRateUsd: number,
  hoursInMonth = 720,
): number {
  if (hourlyRateUsd < 0 || hoursInMonth < 0) {
    throw new Error("Rates and hours must be non-negative");
  }

  return hourlyRateUsd * hoursInMonth;
}

export function breakEvenGpuHours(args: {
  variableHourlyRateUsd: number;
  fixedMonthlyCostUsd: number;
  variableIncludedCreditUsd?: number;
}): number {
  if (args.variableHourlyRateUsd <= 0) {
    throw new Error("Variable hourly rate must be greater than zero");
  }

  return (
    (args.fixedMonthlyCostUsd + (args.variableIncludedCreditUsd ?? 0)) /
    args.variableHourlyRateUsd
  );
}
