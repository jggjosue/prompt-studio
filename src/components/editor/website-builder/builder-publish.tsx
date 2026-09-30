'use client';

/**
 * Publicación del sitio.
 *
 * El editor siempre trabaja sobre el borrador; la versión publicada es inmutable
 * y solo cambia al pulsar "Publicar" (que valida schema + assets, crea la versión
 * y apunta el sitio atómicamente). Muestra la versión publicada y permite
 * publicar/republish y despublicar.
 */

import { Eye, Globe, Rocket } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useBuilder } from './builder-context';
import { BuilderDomains } from './builder-domains';

type Publication = { subdomain: string | null; publishedVersion: number | null; publishedAt: string | null; unpublishedAt: string | null };
type ErrorResponse = { error?: string };

export function BuilderPublish() {
  const builder = useBuilder();
  const siteId = builder.siteId;
  const [publication, setPublication] = useState<Publication | null>(null);
  const [subdomain, setSubdomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDomains, setShowDomains] = useState(false);

  const refresh = useCallback(async () => {
    if (!siteId) return;
    try {
      const response = await fetch(`/api/page-composer/sites/${siteId}/publication`);
      if (response.ok) {
        const data = (await response.json()) as Publication;
        setPublication(data);
        setSubdomain(current => (data.subdomain ? current || data.subdomain : current));
      }
    } catch {
      // silencioso: la barra muestra "sin guardar" si no hay sitio todavía.
    }
  }, [siteId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!siteId) return null;

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/page-composer/sites/${siteId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomain.trim() || undefined }),
      });
      const data = (await response.json()) as { publishedVersion?: number } | ErrorResponse;
      if (!response.ok) {
        setError((data as ErrorResponse).error ?? 'No se pudo publicar.');
        return;
      }
      await refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/page-composer/sites/${siteId}/unpublish`, { method: 'POST' });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ErrorResponse | null;
        setError(data?.error ?? 'No se pudo despublicar.');
        return;
      }
      await refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  const published = publication?.publishedVersion != null;
  const publishedHref = `/page-composer/website/published/${siteId}`;

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="hidden text-[11px] text-destructive lg:inline">{error}</span> : null}
      <span
        className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] md:flex ${
          published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
        }`}
      >
        <Globe className="size-3" />
        {published ? `Publicado v${publication?.publishedVersion}` : 'No publicado'}
      </span>
      {published ? (
        <>
          <a
            href={publishedHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            title="Ver sitio publicado (versión inmutable)"
          >
            <Eye className="size-3.5" />
            Ver publicado
          </a>
          <button
            type="button"
            onClick={unpublish}
            disabled={busy}
            className="rounded-md border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
          >
            Despublicar
          </button>
        </>
      ) : null}
      <label className="hidden items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground md:flex">
        <span className="shrink-0">Subdominio</span>
        <input
          value={subdomain}
          onChange={event => setSubdomain(event.target.value)}
          placeholder="tu-sitio"
          className="w-24 bg-transparent text-foreground focus-visible:outline-none"
          aria-label="Subdominio público"
        />
        <span className="shrink-0 font-mono text-[10px]">.prompstudio.com</span>
      </label>
      <button
        type="button"
        onClick={() => setShowDomains(true)}
        className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        title="Dominios personalizados"
      >
        <Globe className="size-3.5" />
        Dominios
      </button>
      <button
        type="button"
        onClick={publish}
        disabled={busy || builder.isDirty === false}
        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
        title={published ? 'Republish con el borrador actual' : 'Publicar el borrador actual'}
      >
        <Rocket className="size-3.5" />
        {busy ? 'Publicando…' : published ? 'Republish' : 'Publicar'}
      </button>
      {showDomains ? <BuilderDomains onClose={() => setShowDomains(false)} /> : null}
    </div>
  );
}