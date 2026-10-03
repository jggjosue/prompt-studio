'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, MailCheck, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

type SyncResult = {
  message: string;
  total: number;
  successCount: number;
  errorCount: number;
};

export default function EmailSyncClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');

  async function synchronize() {
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/api/sync-registered-users-to-resend', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const body = (await response.json().catch(() => null)) as SyncResult | { error?: string } | null;

      if (!response.ok) {
        throw new Error(
          body && 'error' in body && body.error
            ? body.error
            : 'No se pudo completar la sincronización.'
        );
      }

      setResult(body as SyncResult);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'No se pudo completar la sincronización.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/20 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <MailCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold">MongoDB → Resend</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La operación es repetible: crea los contactos faltantes y actualiza
              el estado de los existentes sin reactivar usuarios dados de baja.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <Button onClick={synchronize} disabled={loading} size="lg" className="min-w-56">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando…
            </>
          ) : (
            <>
              <MailCheck className="mr-2 h-4 w-4" />
              Actualizar usuarios en Resend
            </>
          )}
        </Button>

        {error ? (
          <div role="alert" className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {result ? (
          <div role="status" className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Sincronización terminada
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <Result label="Usuarios encontrados" value={result.total} />
              <Result label="Actualizados" value={result.successCount} />
              <Result label="Con error" value={result.errorCount} />
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Result({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-black">{value.toLocaleString()}</dd>
    </div>
  );
}
