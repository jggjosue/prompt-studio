'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export type KeysetPaginationProps = {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Primera página (cursor nulo; evita OFFSET profundo). */
  onFirst?: () => void;
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  /** Optional label, e.g. "1–18 de 240" */
  rangeLabel?: string;
  firstPageLabel?: string;
  className?: string;
};

export function formatKeysetRange(
  rangeStart: number,
  rangeEnd: number,
  totalCount: number
): string {
  if (totalCount === 0) return '';
  return `${rangeStart}–${rangeEnd} de ${totalCount}`;
}

export function KeysetPagination({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onFirst,
  rangeStart,
  rangeEnd,
  totalCount,
  rangeLabel,
  firstPageLabel = 'Inicio',
  className,
}: KeysetPaginationProps) {
  if (!hasPrev && !hasNext) {
    return null;
  }

  const label =
    rangeLabel ?? formatKeysetRange(rangeStart, rangeEnd, totalCount);

  return (
    <div className={cn('mt-12 flex flex-col items-center gap-3', className)}>
      {label ? (
        <p className="text-sm text-muted-foreground tabular-nums">{label}</p>
      ) : null}
      {hasPrev && onFirst && rangeStart > 1 ? (
        <button
          type="button"
          onClick={onFirst}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {firstPageLabel}
        </button>
      ) : null}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                onPrev();
              }}
              aria-disabled={!hasPrev}
              className={cn(!hasPrev && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                onNext();
              }}
              aria-disabled={!hasNext}
              className={cn(!hasNext && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
