'use client';

/**
 * Gestión de dominios personalizados del sitio publicado.
 *
 * Flujo: conectar (entregar instrucciones DNS) → verificar → activar (solo tras
 * verificación con éxito) → publicar. Muestra el estado del state machine y los
 * errores de SSL/DNS del proveedor.
 */

import { Globe, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useBuilder } from './builder-context';

type Domain = {
  hostname: string;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'disabled';
  sslStatus: string;
  verificationStatus: string;
  error: string | null;
  dns: { host: string; recordType: string; target: string } | null;
};
type ErrorResponse = { error?: string };

const STATUS_LABEL: Record<Domain['status'], string> = {
  pending: 'Pendiente',
  verifying: 'Verificando',
  active: 'Activo',
  failed: 'Fallido',
  disabled: 'Deshabilitado',
};

export function BuilderDomains({ onClose }: { onClose: () => void }) {
  const builder = useBuilder();
  const siteId = builder.siteId;
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hostname, setHostname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!siteId) return;
    const response = await fetch(`/api/page-composer/sites/${siteId}/domains`);
    if (response.ok) {
      const data = (await response.json()) as { domains?: Domain[] };
      setDomains(data.domains ?? []);
    }
  }, [siteId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!siteId) return null;

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/page-composer/sites/${siteId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname }),
      });
      const data = (await response.json()) as { domain?: Domain } | ErrorResponse;
      if (!response.ok) {
        setError((data as ErrorResponse).error ?? 'No se pudo conectar el dominio.');
        return;
      }
      setHostname('');
      await refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  const act = async (host: string, action: 'verify' | 'activate' | 'disable') => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/page-composer/sites/${siteId}/domains/${encodeURIComponent(host)}/${action}`, {
        method: 'POST',
      });
      const data = (await response.json()) as { domain?: Domain } | ErrorResponse;
      if (!response.ok) {
        setError((data as ErrorResponse).error ?? 'La acción falló.');
        return;
      }
      await refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-2xl bg-background shadow-2xl"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-label="Dominios personalizados"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <strong className="flex items-center gap-2">
            <Globe className="size-4 text-emerald-600" />
            Dominios personalizados
          </strong>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              value={hostname}
              onChange={event => setHostname(event.target.value)}
              placeholder="example.com"
              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label="Dominio a conectar"
            />
            <button
              type="button"
              onClick={connect}
              disabled={busy || !hostname.trim()}
              className="h-9 rounded-md bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            >
              Conectar
            </button>
          </div>

          {domains.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Conecta tu propio dominio. Al conectar recibirás las instrucciones DNS; un dominio solo se activa
              cuando la verificación tiene éxito.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {domains.map(domain => (
                <li key={domain.hostname} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{domain.hostname}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        domain.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : domain.status === 'failed'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {STATUS_LABEL[domain.status]} · SSL {domain.sslStatus}
                    </span>
                  </div>

                  {domain.dns ? (
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                      DNS: {domain.dns.recordType} {domain.dns.host} → {domain.dns.target}
                    </p>
                  ) : null}
                  {domain.error ? (
                    <p className="mt-1 text-[11px] text-destructive">{domain.error}</p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => act(domain.hostname, 'verify')}
                      disabled={busy}
                      className="rounded-md border border-border px-2 py-1 text-[11px] text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                    >
                      Verificar
                    </button>
                    {domain.status === 'verifying' || domain.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => act(domain.hostname, 'activate')}
                        disabled={busy}
                        className="rounded-md border border-emerald-500/40 px-2 py-1 text-[11px] text-emerald-600 hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                      >
                        Activar
                      </button>
                    ) : null}
                    {domain.status !== 'disabled' ? (
                      <button
                        type="button"
                        onClick={() => act(domain.hostname, 'disable')}
                        disabled={busy}
                        className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}