'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  analyzeReadability,
  readingEaseLabel,
  type ReadabilityGrade,
  type ReadabilityLocale,
} from '@/lib/readability-analysis';
import { cn } from '@/lib/utils';
import { BookOpen, Heading, KeyRound, ListOrdered } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

const GRADE_STYLES: Record<ReadabilityGrade, string> = {
  excellent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  good: 'bg-primary/15 text-primary',
  fair: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  poor: 'bg-destructive/15 text-destructive',
};

type ReadabilityAnalyzerProps = {
  className?: string;
  defaultText?: string;
  defaultHtml?: string;
};

export function ReadabilityAnalyzer({
  className,
  defaultText = '',
  defaultHtml = '',
}: ReadabilityAnalyzerProps) {
  const siteLocale = useLocale() as ReadabilityLocale;
  const t = useTranslations('readability');
  const [text, setText] = useState(defaultText);
  const [html, setHtml] = useState(defaultHtml);
  const [locale, setLocale] = useState<ReadabilityLocale>(
    siteLocale === 'es' ? 'es' : 'en'
  );
  const [focusKeyword, setFocusKeyword] = useState('');

  const debouncedText = useDebouncedValue(text, 400);
  const debouncedHtml = useDebouncedValue(html, 400);

  const report = useMemo(
    () =>
      analyzeReadability({
        text: debouncedText,
        html: debouncedHtml,
        locale,
        focusKeyword: focusKeyword.trim() || undefined,
      }),
    [debouncedText, debouncedHtml, locale, focusKeyword]
  );

  const gradeLabel = t(`grade.${report.grade}`);

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookOpen className="h-5 w-5 text-primary" />
          {t('analyzerTitle')}
        </CardTitle>
        <CardDescription>{t('analyzerDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnalyzerControls
          locale={locale}
          setLocale={setLocale}
          focusKeyword={focusKeyword}
          setFocusKeyword={setFocusKeyword}
          t={t}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="readability-text">{t('bodyLabel')}</Label>
            <Textarea
              id="readability-text"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={10}
              placeholder={t('bodyPlaceholder')}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="readability-html">{t('htmlLabel')}</Label>
            <Textarea
              id="readability-html"
              value={html}
              onChange={e => setHtml(e.target.value)}
              rows={10}
              placeholder={t('htmlPlaceholder')}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {debouncedText.trim().length > 0 ? (
          <ReadabilityResults report={report} gradeLabel={gradeLabel} t={t} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t('emptyState')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyzerControls({
  locale,
  setLocale,
  focusKeyword,
  setFocusKeyword,
  t,
}: {
  locale: ReadabilityLocale;
  setLocale: (l: ReadabilityLocale) => void;
  focusKeyword: string;
  setFocusKeyword: (v: string) => void;
  t: ReturnType<typeof useTranslations<'readability'>>;
}) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-end">
      <div className="space-y-2">
        <Label>{t('localeLabel')}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={locale === 'en' ? 'default' : 'outline'}
            onClick={() => setLocale('en')}
          >
            EN (Flesch)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={locale === 'es' ? 'default' : 'outline'}
            onClick={() => setLocale('es')}
          >
            ES (Fernández-Huerta)
          </Button>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-w-[200px]">
        <Label htmlFor="focus-kw">{t('focusKeyword')}</Label>
        <input
          id="focus-kw"
          type="text"
          value={focusKeyword}
          onChange={e => setFocusKeyword(e.target.value)}
          placeholder={t('focusKeywordPlaceholder')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}

function ReadabilityResults({
  report,
  gradeLabel,
  t,
}: {
  report: ReturnType<typeof analyzeReadability>;
  gradeLabel: string;
  t: ReturnType<typeof useTranslations<'readability'>>;
}) {
  return (
    <div className="space-y-6 rounded-lg border bg-muted/30 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('overallScore')}</p>
          <p className="text-3xl font-bold font-headline">{report.overallScore}/100</p>
        </div>
        <Badge className={cn('text-sm', GRADE_STYLES[report.grade])}>
          {gradeLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Metric
          icon={<ListOrdered className="h-4 w-4" />}
          label={t('readingEase')}
          value={`${report.readingEase}`}
          hint={readingEaseLabel(report.readingEase, report.locale)}
        />
        <Metric
          icon={<ListOrdered className="h-4 w-4" />}
          label={t('gradeLevel')}
          value={`${report.gradeLevel}`}
          hint={t('gradeLevelHint')}
        />
        <Metric
          icon={<ListOrdered className="h-4 w-4" />}
          label={t('avgSentence')}
          value={`${report.avgWordsPerSentence}`}
          hint={t('words')}
        />
        <Metric
          icon={<Heading className="h-4 w-4" />}
          label={t('headingScore')}
          value={`${report.headingScore}`}
          hint={`${report.headings.length} H`}
        />
      </div>

      {report.keywords.length > 0 && (
        <div>
          <p className="text-sm font-semibold flex items-center gap-2 mb-2">
            <KeyRound className="h-4 w-4" />
            {t('keywordDensity')}
          </p>
          <ul className="flex flex-wrap gap-2">
            {report.keywords.map(kw => (
              <li key={kw.word}>
                <Badge
                  variant="secondary"
                  className={cn(
                    kw.density > 3.5 && 'border-destructive text-destructive'
                  )}
                >
                  {kw.word} ({kw.density.toFixed(1)}%)
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.headings.length > 0 && (
        <div>
          <p className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Heading className="h-4 w-4" />
            {t('headingOutline')}
          </p>
          <ol className="text-sm space-y-1 font-mono text-muted-foreground">
            {report.headings.map((h, i) => (
              <li key={`${h.level}-${i}`} style={{ paddingLeft: (h.level - 1) * 12 }}>
                H{h.level}: {h.text}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold mb-2">{t('recommendations')}</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {report.tips.map(tipKey => (
            <li key={tipKey} className="list-disc list-inside">
              {t(tipKey)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-md border bg-background/80 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
