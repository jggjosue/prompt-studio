export const DAILY_FREE_COPY_LIMIT = 5;
export type DailyCopyUsage = { date: string; count: number };

export function localDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDailyCopyUsage(raw: string | null, today = localDateKey()): DailyCopyUsage {
  if (!raw) return { date: today, count: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<DailyCopyUsage>;
    if (parsed.date !== today || !Number.isFinite(parsed.count)) return { date: today, count: 0 };
    return { date: today, count: Math.max(0, Math.floor(parsed.count ?? 0)) };
  } catch { return { date: today, count: 0 }; }
}

export function hasDailyCopyAllowance(usage: DailyCopyUsage, unlimited = false) {
  return unlimited || usage.count < DAILY_FREE_COPY_LIMIT;
}
