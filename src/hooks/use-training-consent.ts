'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { setTrainingConsentGranted } from '@/lib/training/client-events';

/**
 * Training-consent state for /generate, shared by the inline notice and the
 * settings toggle. The server is the source of truth (TrainingConsentRecord);
 * this store only mirrors it and keeps the event emitter in sync.
 */
export type TrainingConsentState = {
  status: 'unknown' | 'loading' | 'granted' | 'declined' | 'error';
  policyVersion: string | null;
  saving: boolean;
};

let state: TrainingConsentState = { status: 'unknown', policyVersion: null, saving: false };
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

function update(next: Partial<TrainingConsentState>) {
  state = { ...state, ...next };
  setTrainingConsentGranted(state.status === 'granted');
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function load() {
  if (inflight) return inflight;
  update({ status: 'loading' });
  inflight = fetch('/api/ai/training-consent', { credentials: 'same-origin' })
    .then(async (response) => {
      if (response.status === 401) return update({ status: 'declined' });
      if (!response.ok) throw new Error(String(response.status));
      const body = await response.json() as { training?: boolean; policyVersion?: string };
      update({ status: body.training ? 'granted' : 'declined', policyVersion: body.policyVersion ?? null });
    })
    .catch(() => update({ status: 'error' }))
    .finally(() => { inflight = null; });
  return inflight;
}

async function save(training: boolean, source: 'generate' | 'settings') {
  update({ saving: true });
  try {
    const response = await fetch('/api/ai/training-consent', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ training, source }),
    });
    if (!response.ok) throw new Error(String(response.status));
    const body = await response.json() as { training: boolean; policyVersion?: string };
    update({ status: body.training ? 'granted' : 'declined', policyVersion: body.policyVersion ?? state.policyVersion, saving: false });
    return true;
  } catch {
    update({ saving: false });
    return false;
  }
}

export function useTrainingConsent() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => {
    if (state.status === 'unknown') void load();
  }, []);
  const grant = useCallback((source: 'generate' | 'settings' = 'generate') => save(true, source), []);
  const revoke = useCallback((source: 'generate' | 'settings' = 'settings') => save(false, source), []);
  return { ...snapshot, grant, revoke, reload: load };
}
