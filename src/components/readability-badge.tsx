'use client';

import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  readingEaseLabel,
  type ReadabilityGrade,
  type ReadabilityReport,
} from '@/lib/readability-analysis';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

const GRADE_STYLES: Record<ReadabilityGrade, string> = {
  excellent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  good: 'bg-primary/15 text-primary',
  fair: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  poor: 'bg-destructive/15 text-destructive',
};

export type ReadabilityBadgeReport = Pick<
  ReadabilityReport,
  | 'overallScore'
  | 'grade'
  | 'readingEase'
  | 'gradeLevel'
  | 'avgWordsPerSentence'
  | 'headingScore'
  | 'wordCount'
  | 'locale'
  | 'tips'
>;

type ReadabilityBadgeProps = {
  report: ReadabilityBadgeReport | null | undefined;
  /** Muestra solo el número si hay poco espacio */
  compact?: boolean;
  className?: string;
  savedAt?: string;
};

export function ReadabilityBadge({
  report,
  compact = false,
  className,
  savedAt,
}: ReadabilityBadgeProps) {
  const t = useTranslations('readability');

  if (!report) return null;

  const gradeLabel = t(`grade.${report.grade}`);

  const trigger = (
    <Badge
      className={cn(
        'gap-1 tabular-nums cursor-default',
        GRADE_STYLES[report.grade],
        className
      )}
      variant="secondary"
    >
      <BookOpen className="h-3 w-3" aria-hidden />
      {compact ? report.overallScore : `${report.overallScore}/100`}
      {!compact ? ` · ${gradeLabel}` : null}
    </Badge>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" align="start">
        <p className="font-semibold mb-2">{t('overallScore')}</p>
        <ul className="space-y-1.5 text-muted-foreground">
          <li>
            {t('readingEase')}: {report.readingEase} (
            {readingEaseLabel(report.readingEase, report.locale)})
          </li>
          <li>
            {t('gradeLevel')}: {report.gradeLevel}
          </li>
          <li>
            {t('avgSentence')}: {report.avgWordsPerSentence} ({report.wordCount}{' '}
            {t('words')})
          </li>
          <li>
            {t('headingScore')}: {report.headingScore}/100
          </li>
        </ul>
        {report.tips.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
            {t(report.tips[0]!)}
          </p>
        ) : null}
        {savedAt ? (
          <p className="mt-2 text-[10px] text-muted-foreground">
            {new Date(savedAt).toLocaleString()}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
