import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PromptValidationReport } from '@/lib/prompt-validation';
import { Activity, CheckCircle2, Clock3, DollarSign, History, ShieldCheck } from 'lucide-react';

const copy = {
  es: {
    title: 'Validación del prompt', verified: 'Comprobado', review: 'Requiere revisión',
    checked: 'Última comprobación', consistency: 'Consistencia estimada', models: 'Modelos compatibles',
    time: 'Tiempo estimado', cost: 'Costo estimado', changes: 'Cambios de modelo', result: 'Resultado disponible',
    disclosure: 'Compatibilidad, tiempo, costo y consistencia son estimaciones automáticas; pueden variar según proveedor, plan y configuración.',
    disclosureWithoutEstimates: 'La compatibilidad y la consistencia son estimaciones automáticas; pueden variar según el proveedor, el modelo y la configuración.',
  },
  en: {
    title: 'Prompt validation', verified: 'Checked', review: 'Review needed',
    checked: 'Last checked', consistency: 'Estimated consistency', models: 'Compatible models',
    time: 'Estimated time', cost: 'Estimated cost', changes: 'Model changes', result: 'Result available',
    disclosure: 'Compatibility, time, cost, and consistency are automated estimates; they vary by provider, plan, and settings.',
    disclosureWithoutEstimates: 'Compatibility and consistency are automated estimates; they may vary by provider, model, and configuration.',
  },
} as const;

export function PromptValidationCard({
  report,
  locale,
  showEstimates = true,
}: {
  report: PromptValidationReport;
  locale: string;
  showEstimates?: boolean;
}) {
  const t = locale.startsWith('es') ? copy.es : copy.en;
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl"><ShieldCheck className="size-5 text-emerald-500" />{t.title}</CardTitle>
          <Badge variant={report.status === 'verified' ? 'default' : 'secondary'} className="gap-1">
            <CheckCircle2 className="size-3" />{report.status === 'verified' ? t.verified : t.review}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{t.checked}: <time dateTime={report.checkedAt}>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${report.checkedAt}T00:00:00Z`))}</time> · {report.algorithmVersion}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium"><Activity className="size-4" />{t.consistency}</span><strong>{report.consistencyScore}/100</strong></div>
          <Progress value={report.consistencyScore} aria-label={`${t.consistency}: ${report.consistencyScore}/100`} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t.models}</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {report.compatibleModels.map(model => (
              <div key={model.id} className="rounded-lg border bg-background/80 p-3">
                <div className="font-semibold">{model.name}</div><div className="mb-2 text-xs text-muted-foreground">{model.provider}</div>
                {showEstimates ? <div className="space-y-1 text-xs"><p className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{t.time}: {model.estimatedSeconds.min}–{model.estimatedSeconds.max}s</p><p className="flex items-center gap-1.5"><DollarSign className="size-3.5" />{t.cost}: ${model.estimatedCostUsd.min.toFixed(2)}–${model.estimatedCostUsd.max.toFixed(2)}</p></div> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-background/80 p-3"><p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-emerald-500" />{t.result}</p><p className="mt-1 text-xs text-muted-foreground">{report.consistencyBasis.join(' · ')}</p></div>
          <div className="rounded-lg border bg-background/80 p-3"><p className="flex items-center gap-2 text-sm font-semibold"><History className="size-4" />{t.changes}</p>{report.changes.map(change => <p key={`${change.model}-${change.detectedOn}`} className="mt-1 text-xs text-muted-foreground"><strong>{change.model}:</strong> {change.summary}</p>)}</div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{showEstimates ? t.disclosure : t.disclosureWithoutEstimates}</p>
      </CardContent>
    </Card>
  );
}
