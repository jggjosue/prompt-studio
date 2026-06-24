import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pickLocalized } from '@/lib/localized-string';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { getRawWebPages } from '@/lib/web-pages';
import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

type RelatedTemplatesProps = {
  currentSlug: string;
  category: string;
  limit?: number;
};

type RelatedTemplate = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
};

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function getTemplateCategory(page: {
  tags: string[];
  stack: string[];
}): string {
  return page.tags[0] || page.stack[0] || 'Landing Page';
}

function truncateDescription(description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).trim()}...`;
}

export async function RelatedTemplates({
  currentSlug,
  category,
  limit = 6,
}: RelatedTemplatesProps) {
  const locale = await getLocale();
  const normalizedCurrentSlug = normalizeCategory(currentSlug);
  const normalizedCategory = normalizeCategory(category);

  const templates: RelatedTemplate[] = getRawWebPages()
    .map(page => {
      const slug = normalizeDemoFolder(page.demoUrl ?? '');
      if (!slug) return null;

      const templateCategory =
        (page as { category?: string }).category?.trim() ||
        getTemplateCategory(page);

      return {
        slug,
        title: pickLocalized(page.title, locale),
        description: truncateDescription(pickLocalized(page.description, locale)),
        imageUrl: resolveWebPageImageUrl(page.imageUrl),
        category: templateCategory,
        tags: page.tags,
      };
    })
    .filter((template): template is RelatedTemplate => {
      if (!template) return false;
      if (normalizeCategory(template.slug) === normalizedCurrentSlug) {
        return false;
      }
      return normalizeCategory(template.category) === normalizedCategory;
    })
    .slice(0, limit);

  if (templates.length === 0) return null;

  return (
    <section
      aria-labelledby="related-templates-heading"
      className="mt-14 border-t pt-10"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Related templates
          </p>
          <h2
            id="related-templates-heading"
            className="text-2xl font-bold tracking-tight font-headline"
          >
            More {category} templates
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/web-tags?tag=${encodeURIComponent(category)}`}>
            View category
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <article
            key={template.slug}
            className="group overflow-hidden rounded-lg border bg-card"
          >
            <Link
              href={`/landing-pages/${encodeURIComponent(template.slug)}`}
              className="block"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {template.imageUrl ? (
                  <Image
                    src={template.imageUrl}
                    alt={template.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index < 2}
                  />
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
                  {template.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
