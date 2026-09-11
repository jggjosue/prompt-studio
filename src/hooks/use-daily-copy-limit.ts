'use client';

import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { DAILY_FREE_COPY_LIMIT, localDateKey, normalizeDailyCopyUsage } from '@/lib/daily-copy-limit';

const COPY_USAGE_STORAGE_KEY = 'prompt_studio_daily_component_copies';

export type CopyLimitResult = 'copied' | 'failed' | 'limit-reached';

function getLocalDateKey(): string {
  return localDateKey();
}

function readUsage() {
  const today = getLocalDateKey();

  try {
    const stored = window.localStorage.getItem(COPY_USAGE_STORAGE_KEY);
    return normalizeDailyCopyUsage(stored, today);
  } catch {
    return { date: today, count: 0 };
  }
}

function saveUsage(usage: { date: string; count: number }): void {
  try {
    window.localStorage.setItem(
      COPY_USAGE_STORAGE_KEY,
      JSON.stringify(usage)
    );
  } catch {
    // Copying should still work when storage is unavailable.
  }
}

export function useDailyCopyLimit() {
  const { plan } = useStripeSubscription();
  const router = useRouter();
  const hasUnlimitedCopies = plan === 'premium' || plan === 'startup';
  const copyWithDailyLimit = useCallback(
    async (copyAction: () => Promise<boolean>): Promise<CopyLimitResult> => {
      if (hasUnlimitedCopies) {
        return (await copyAction()) ? 'copied' : 'failed';
      }

      const usage = readUsage();
      if (usage.count >= DAILY_FREE_COPY_LIMIT) {
        router.push('/prices');
        return 'limit-reached';
      }

      const copied = await copyAction();
      if (!copied) return 'failed';

      const nextCount = usage.count + 1;
      saveUsage({ date: usage.date, count: nextCount });
      return 'copied';
    },
    [hasUnlimitedCopies, router]
  );

  return {
    dailyLimit: DAILY_FREE_COPY_LIMIT,
    hasUnlimitedCopies,
    copyWithDailyLimit,
  };
}
