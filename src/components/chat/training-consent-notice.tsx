'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTrainingConsent } from '@/hooks/use-training-consent';

const DISMISSED_KEY = 'ps-training-consent-dismissed:';

function readDismissed(policyVersion: string | null) {
  if (!policyVersion) return false;
  try {
    return localStorage.getItem(DISMISSED_KEY + policyVersion) === '1';
  } catch {
    return false;
  }
}

/**
 * Explicit opt-in for using /generate activity to improve models. Nothing is
 * pre-selected: declining or dismissing keeps the user out of training data.
 * The prompt reappears only when the consent policy version changes.
 */
export function TrainingConsentNotice() {
  const consent = useTrainingConsent();
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => setDismissed(readDismissed(consent.policyVersion)), [consent.policyVersion]);

  if (consent.status !== 'declined' || dismissed || !consent.policyVersion) return null;

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(DISMISSED_KEY + consent.policyVersion, '1'); } catch { /* ignore */ }
  }

  return (
    <section aria-labelledby="training-consent-title" className="mx-auto mb-4 w-full max-w-3xl rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 text-left">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
        <div className="space-y-2">
          <h2 id="training-consent-title" className="text-sm font-semibold">¿Nos ayudas a mejorar Prompt Studio?</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Si lo permites, tus prompts, resultados y valoraciones en esta página podrán usarse, tras eliminar datos
            personales y secretos, para entrenar y evaluar nuestros modelos. Es opcional, no afecta a tus créditos y
            puedes retirarlo cuando quieras desde los ajustes; lo ya generado antes de aceptar nunca se usa.{' '}
            <Link href="/privacy" className="underline underline-offset-2">Política de privacidad</Link>.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={consent.saving} onClick={() => void consent.grant('generate')} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
              Permitir
            </button>
            <button type="button" onClick={dismiss} className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Settings switch to grant or revoke training consent at any time. */
export function TrainingConsentToggle() {
  const consent = useTrainingConsent();
  const granted = consent.status === 'granted';
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3">
      <div>
        <p id="training-consent-toggle-label" className="text-xs font-semibold">Usar mis generaciones para mejorar modelos</p>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          {granted
            ? 'Activado. Al desactivarlo, tus datos dejan de usarse en nuevas versiones de los datasets.'
            : 'Desactivado. No se usa nada de lo que generas.'}
        </p>
      </div>
      <Switch
        aria-labelledby="training-consent-toggle-label"
        checked={granted}
        disabled={consent.saving || consent.status === 'loading' || consent.status === 'unknown'}
        onCheckedChange={(checked) => void (checked ? consent.grant('settings') : consent.revoke('settings'))}
      />
    </div>
  );
}
