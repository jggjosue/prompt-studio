import type { TextUnitEconomics } from "@/lib/generation/text-unit-economics";

export type TextEconomicsAlert = {
  severity: "warning" | "critical";
  code: "FAILURE_RATE" | "P95_LATENCY" | "MONTHLY_SPEND";
  message: string;
  value: number;
  threshold: number;
};

export type TextEconomicsThresholds = {
  warningFailureRate: number;
  criticalFailureRate: number;
  warningP95LatencyMs: number;
  criticalP95LatencyMs: number;
  warningMonthlySpendUsd: number;
  criticalMonthlySpendUsd: number;
};

export function getTextEconomicsThresholds(
  env: NodeJS.ProcessEnv = process.env,
): TextEconomicsThresholds {
  return {
    warningFailureRate: number(env.PROMPTSTUDIO_TEXT_ALERT_FAILURE_RATE_WARNING, 0.03),
    criticalFailureRate: number(env.PROMPTSTUDIO_TEXT_ALERT_FAILURE_RATE_CRITICAL, 0.08),
    warningP95LatencyMs: number(env.PROMPTSTUDIO_TEXT_ALERT_P95_LATENCY_MS_WARNING, 15_000),
    criticalP95LatencyMs: number(env.PROMPTSTUDIO_TEXT_ALERT_P95_LATENCY_MS_CRITICAL, 30_000),
    warningMonthlySpendUsd: number(env.PROMPTSTUDIO_TEXT_ALERT_SPEND_USD_WARNING, 50),
    criticalMonthlySpendUsd: number(env.PROMPTSTUDIO_TEXT_ALERT_SPEND_USD_CRITICAL, 80),
  };
}

export function evaluateTextEconomicsAlerts(
  metrics: TextUnitEconomics,
  thresholds = getTextEconomicsThresholds(),
): TextEconomicsAlert[] {
  const alerts: TextEconomicsAlert[] = [];
  const failureRate = metrics.generations === 0 ? 0 : 1 - metrics.successRate;

  pushThresholdAlert(alerts, {
    code: "FAILURE_RATE",
    value: failureRate,
    warning: thresholds.warningFailureRate,
    critical: thresholds.criticalFailureRate,
    label: "Failure rate",
  });

  if (metrics.p95LatencyMs !== null) {
    pushThresholdAlert(alerts, {
      code: "P95_LATENCY",
      value: metrics.p95LatencyMs,
      warning: thresholds.warningP95LatencyMs,
      critical: thresholds.criticalP95LatencyMs,
      label: "p95 latency",
    });
  }

  pushThresholdAlert(alerts, {
    code: "MONTHLY_SPEND",
    value: metrics.spendUsd,
    warning: thresholds.warningMonthlySpendUsd,
    critical: thresholds.criticalMonthlySpendUsd,
    label: "Monthly self-hosted spend",
  });

  return alerts;
}

function pushThresholdAlert(
  alerts: TextEconomicsAlert[],
  input: {
    code: TextEconomicsAlert["code"];
    value: number;
    warning: number;
    critical: number;
    label: string;
  },
): void {
  if (input.value >= input.critical) {
    alerts.push({
      severity: "critical",
      code: input.code,
      message: `${input.label} exceeded critical threshold.`,
      value: input.value,
      threshold: input.critical,
    });
  } else if (input.value >= input.warning) {
    alerts.push({
      severity: "warning",
      code: input.code,
      message: `${input.label} exceeded warning threshold.`,
      value: input.value,
      threshold: input.warning,
    });
  }
}

function number(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
