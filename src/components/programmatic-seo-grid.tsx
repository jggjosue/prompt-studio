import { Badge } from '@/components/ui/badge';
import type { ProgrammaticItem } from '@/lib/seo/programmatic-seo';
import Link from 'next/link';

type ProgrammaticSeoGridProps = {
  items: ProgrammaticItem[];
};

export function ProgrammaticSeoGrid({ items }: ProgrammaticSeoGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <article
          key={item.url}
          className="overflow-hidden rounded-lg border bg-card"
        >
          <Link href={item.url} className="group block h-full">
            <div className="aspect-video overflow-hidden bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{item.categoryLabel}</Badge>
                {item.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">
                {item.title}
              </h2>
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
