export type ProjectBudget = {
  limitCredits: number | null;
  limitUsd: number | null;
  warningPercent: number;
  approvalCredits: number | null;
  approvalUsd: number | null;
};

export type BudgetJob = {
  id?: string;
  kind: string;
  provider: string;
  status: string;
  creditsState: string;
  creditCost: number;
  estimatedCostUsd: number;
  actualCostUsd: number | null;
};

const money = (value: number) => Math.round(value * 10000) / 10000;
const percent = (value: number, limit: number | null) => limit && limit > 0 ? Math.round(value / limit * 100) : null;

export function projectBudgetSnapshot(budget: ProjectBudget, jobs: BudgetJob[]) {
  const active = jobs.filter(job => job.creditsState !== 'refunded');
  const consumed = active.filter(job => job.creditsState === 'captured');
  const consumedCredits = consumed.reduce((sum, job) => sum + job.creditCost, 0);
  const reservedCredits = active.filter(job => job.creditsState === 'pending' || job.creditsState === 'reserved').reduce((sum, job) => sum + job.creditCost, 0);
  const actualUsd = money(consumed.reduce((sum, job) => sum + (job.actualCostUsd ?? 0), 0));
  const projectedUsd = money(active.reduce((sum, job) => sum + (job.actualCostUsd ?? job.estimatedCostUsd), 0));
  const projectedCredits = consumedCredits + reservedCredits;
  const creditPercent = percent(projectedCredits, budget.limitCredits);
  const usdPercent = percent(projectedUsd, budget.limitUsd);
  const warnings = [
    creditPercent !== null && creditPercent >= budget.warningPercent ? `El presupuesto de créditos está al ${creditPercent}%.` : null,
    usdPercent !== null && usdPercent >= budget.warningPercent ? `El presupuesto monetario está al ${usdPercent}%.` : null,
  ].filter((value): value is string => Boolean(value));
  return { consumedCredits, reservedCredits, projectedCredits, actualUsd, projectedUsd, creditPercent, usdPercent, warnings };
}

export function evaluateBudgetOperation(budget: ProjectBudget, jobs: BudgetJob[], operation: { credits: number; estimatedUsd: number }, approved: boolean) {
  const snapshot = projectBudgetSnapshot(budget, jobs);
  const nextCredits = snapshot.projectedCredits + operation.credits;
  const nextUsd = money(snapshot.projectedUsd + operation.estimatedUsd);
  const exceedsCredits = budget.limitCredits !== null && nextCredits > budget.limitCredits;
  const exceedsUsd = budget.limitUsd !== null && nextUsd > budget.limitUsd;
  const costly = (budget.approvalCredits !== null && operation.credits >= budget.approvalCredits) || (budget.approvalUsd !== null && operation.estimatedUsd >= budget.approvalUsd);
  return { allowed: !exceedsCredits && !exceedsUsd && (!costly || approved), exceedsCredits, exceedsUsd, approvalRequired: costly && !approved && !exceedsCredits && !exceedsUsd, nextCredits, nextUsd, snapshot };
}

export function budgetNumber(value: unknown, max: number) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.min(max, Math.round(number * 100) / 100) : null;
}
