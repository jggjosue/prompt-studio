import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ProgrammaticSeoGrid } from '@/components/programmatic-seo-grid';
import { Badge } from '@/components/ui/badge';
import {
  getIndexableTagPages,
  getProgrammaticTagPage,
} from '@/lib/seo/programmatic-seo';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getIndexableTagPages('en').map(tag => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const tagPage = getProgrammaticTagPage(slug, locale);

  if (!tagPage) {
    return {
      title: 'Tag Not Found | Prompt Studio',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${tagPage.title} | Prompt Studio`,
    description: `${tagPage.description} Browse ${tagPage.items.length} related resources.`,
    alternates: {
      canonical: `/tags/${tagPage.slug}`,
    },
    openGraph: {
      title: `${tagPage.title} | Prompt Studio`,
      description: tagPage.description,
      url: `/tags/${tagPage.slug}`,
      type: 'website',
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const tagPage = getProgrammaticTagPage(slug, locale);

  if (!tagPage) notFound();

  const categories = Array.from(
    new Map(
      tagPage.items.map(item => [
        item.categorySlug,
        { slug: item.categorySlug, label: item.categoryLabel },
      ])
    ).values()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-14">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>{' '}
          /{' '}
          <Link href="/web-tags" className="hover:text-foreground">
            Tags
          </Link>{' '}
          / <span className="text-foreground">{tagPage.label}</span>
        </nav>

        <header className="mb-8 max-w-4xl space-y-4">
          <Badge variant="secondary">{tagPage.items.length} resources</Badge>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            {tagPage.title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            {tagPage.description}
          </p>
        </header>

        <section className="mb-8" aria-labelledby="tag-categories-heading">
          <h2 id="tag-categories-heading" className="mb-3 text-lg font-semibold">
            Browse this tag by category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Link key={category.slug} href={`/category/${category.slug}`}>
                <Badge variant="outline">{category.label}</Badge>
              </Link>
            ))}
          </div>
        </section>

        <ProgrammaticSeoGrid items={tagPage.items} showDescription={false} />
      </main>
      <Footer />
    </div>
  );
}
