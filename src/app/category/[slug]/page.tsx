import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ProgrammaticSeoGrid } from '@/components/programmatic-seo-grid';
import { Badge } from '@/components/ui/badge';
import {
  getProgrammaticCategories,
  getProgrammaticCategory,
  slugify,
} from '@/lib/seo/programmatic-seo';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getProgrammaticCategories('en').map(category => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const category = getProgrammaticCategory(slug, locale);

  if (!category) {
    return {
      title: 'Category Not Found | Prompt Studio',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.title} | Prompt Studio`,
    description: `${category.description} Browse ${category.items.length} curated resources.`,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.title} | Prompt Studio`,
      description: category.description,
      url: `/category/${category.slug}`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const category = getProgrammaticCategory(slug, locale);

  if (!category) notFound();

  const topTags = Array.from(
    new Set(category.items.flatMap(item => item.tags))
  ).slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-14">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>{' '}
          /{' '}
          <span className="text-foreground">{category.label}</span>
        </nav>

        <header className="mb-8 max-w-4xl space-y-4">
          <Badge variant="secondary">{category.items.length} resources</Badge>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            {category.title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            {category.description}
          </p>
        </header>

        <section className="mb-8" aria-labelledby="category-tags-heading">
          <h2 id="category-tags-heading" className="mb-3 text-lg font-semibold">
            Popular tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map(tag => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(slugify(tag))}`}
              >
                <Badge variant="outline">{tag}</Badge>
              </Link>
            ))}
          </div>
        </section>

        <ProgrammaticSeoGrid items={category.items} />
      </main>
      <Footer />
    </div>
  );
}
