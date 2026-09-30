import type { WebPageEntry } from '@/lib/web-pages';

type GeneratorWebPage = Pick<
  WebPageEntry,
  'title' | 'description' | 'imageHint' | 'stack' | 'tags'
>;

/** Complete structured prompt handed from the landing catalog to the web chat. */
export function buildWebPageGeneratorPrompt(page: GeneratorWebPage): string {
  return JSON.stringify(
    {
      title: page.title,
      description: page.description,
      imageHint: page.imageHint,
      type: 'web',
      stack: page.stack,
      tags: page.tags,
    },
    null,
    2
  );
}
