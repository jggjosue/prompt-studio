'use client';

/**
 * Dashboard de envíos de formularios de un sitio publicado.
 *
 * Solo el dueño del sitio puede acceder (comprobado en la página de servidor y
 * en la API). Permite inspeccionar los envíos y exportarlos a CSV.
 */

import { Download } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Submission = {
  id: string;
  formId: string;
  formVariant: string;
  hostname: string;
  fields: Record<string, string>;
  consent: boolean;
  createdAt: string;
};

export function SubmissionsDashboard({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/page-composer/sites/${siteId}/submissions?limit=100`);
      if (!response.ok) {
        setError('No se pudieron cargar los envíos.');
        return;
      }
      const data = (await response.json()) as { submissions?: Submission[] };
      setSubmissions(data.submissions ?? []);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  }, [siteId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const exportCsv = () => {
    window.location.href = `/api/page-composer/sites/${siteId}/submissions?export=csv`;
  };

  const columns = new Set<string>();
  for (const submission of submissions) for (const key of Object.keys(submission.fields)) columns.add(key);

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Envíos de formularios</h1>
            <p className="text-sm text-muted-foreground">
              {siteName} · {submissions.length} envíos
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Download className="size-3.5" />
            Exportar CSV
          </button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {submissions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Todavía no hay envíos. Publica tu sitio y prueba el formulario.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Formulario</th>
                  {[...columns].map(column => (
                    <th key={column} className="px-3 py-2">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {submissions.map(submission => (
                  <tr key={submission.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{submission.formVariant}</span>
                    </td>
                    {[...columns].map(column => (
                      <td key={column} className="max-w-56 truncate px-3 py-2" title={submission.fields[column] ?? ''}>
                        {submission.fields[column] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}