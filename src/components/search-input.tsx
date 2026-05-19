'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Search, X } from 'lucide-react';

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** true mientras el valor debounced aún no alcanza al input (usuario escribiendo). */
  isPending?: boolean;
  clearLabel?: string;
};

/**
 * Input de búsqueda con indicador de debounce (filtrado pendiente).
 */
export function SearchInput({
  value,
  onValueChange,
  placeholder,
  className,
  inputClassName,
  isPending = false,
  clearLabel = 'Clear search',
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={placeholder}
        className={cn('pl-9', (value || isPending) && 'pr-9', inputClassName)}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        aria-busy={isPending}
      />
      {isPending && (
        <Loader2
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none"
          aria-hidden
        />
      )}
      {value && !isPending && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={clearLabel}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

