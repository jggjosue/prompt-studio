import { getPlaceholderImages } from '@/lib/placeholder-images';
import { getPlaceholderVideos } from '@/lib/placeholder-videos';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { getWebPages } from '@/lib/web-pages';

export type ProgrammaticKind = 'image' | 'video' | 'landing';

export type ProgrammaticItem = {
  kind: ProgrammaticKind;
  title: string;
  description: string;
  imageUrl: string;
  url: `/${string}`;
  tags: string[];
  categorySlug: CategorySlug;
  categoryLabel: string;
};

export type CategorySlug = 'image-prompts' | 'video-prompts' | 'landing-pages';

export type ProgrammaticCategory = {
  slug: CategorySlug;
  label: string;
  title: string;
  description: string;
  items: ProgrammaticItem[];
};

export type ProgrammaticTagPage = {
  slug: string;
  label: string;
  title: string;
  description: string;
  items: ProgrammaticItem[];
};

const CATEGORY_META: Record<
  CategorySlug,
  Omit<ProgrammaticCategory, 'items'>
> = {
  'image-prompts': {
    slug: 'image-prompts',
    label: 'Image Prompts',
    title: 'AI Image Prompts',
    description:
      'Browse AI image prompts for portraits, product shots, realistic scenes, fashion visuals, and creative image generation workflows.',
  },
  'video-prompts': {
    slug: 'video-prompts',
    label: 'Video Prompts',
    title: 'AI Video Prompts',
    description:
      'Explore AI video prompts for cinematic shots, motion design, transitions, social videos, and generative video experiments.',
  },
  'landing-pages': {
    slug: 'landing-pages',
    label: 'Landing Pages',
    title: 'Landing Page Templates',
    description:
      'Discover landing page prompts and live HTML templates for SaaS, portfolios, products, events, marketplaces, and 3D web experiences.',
  },
};

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function labelFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function promptDescription(description: string, fallback: string): string {
  try {
    const parsed = JSON.parse(description) as { description?: string };
    return parsed.description || fallback;
  } catch {
    return description || fallback;
  }
}

function uniqueItems(items: ProgrammaticItem[]): ProgrammaticItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export function getProgrammaticItems(
  locale: string = 'en'
): ProgrammaticItem[] {
  const imageItems: ProgrammaticItem[] = getPlaceholderImages(locale).map(
    item => ({
      kind: 'image',
      title: item.title,
      description: promptDescription(item.description, item.title),
      imageUrl: item.imageUrl,
      url: `/gallery/${item.id}`,
      tags: item.tags,
      categorySlug: 'image-prompts',
      categoryLabel: CATEGORY_META['image-prompts'].label,
    })
  );

  const videoItems: ProgrammaticItem[] = getPlaceholderVideos(locale).map(
    item => ({
      kind: 'video',
      title: item.title,
      description: promptDescription(item.description, item.title),
      imageUrl: item.imageUrl,
      url: `/gallery-videos/${item.id}`,
      tags: item.tags,
      categorySlug: 'video-prompts',
      categoryLabel: CATEGORY_META['video-prompts'].label,
    })
  );

  const landingItems: ProgrammaticItem[] = getWebPages(locale)
    .map<ProgrammaticItem | null>(item => {
      const slug = normalizeDemoFolder(item.demoUrl);
      if (!slug) return null;

      return {
        kind: 'landing' as const,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        url: `/landing-pages/${slug}` as `/${string}`,
        tags: item.tags,
        categorySlug: 'landing-pages' as const,
        categoryLabel: CATEGORY_META['landing-pages'].label,
      };
    })
    .filter((item): item is ProgrammaticItem => Boolean(item));

  return [...imageItems, ...videoItems, ...landingItems];
}

export function getProgrammaticCategories(
  locale: string = 'en'
): ProgrammaticCategory[] {
  const items = getProgrammaticItems(locale);
  return Object.values(CATEGORY_META).map(category => ({
    ...category,
    items: items.filter(item => item.categorySlug === category.slug),
  }));
}

export function getProgrammaticCategory(
  slug: string,
  locale: string = 'en'
): ProgrammaticCategory | null {
  if (!(slug in CATEGORY_META)) return null;
  return (
    getProgrammaticCategories(locale).find(category => category.slug === slug) ??
    null
  );
}

export function getIndexableTagPages(
  locale: string = 'en',
  minItems: number = 10
): ProgrammaticTagPage[] {
  return getProgrammaticTagPages(locale, minItems);
}

function getProgrammaticTagPages(
  locale: string = 'en',
  minItems: number = 1
): ProgrammaticTagPage[] {
  const items = getProgrammaticItems(locale);
  const byTag = new Map<string, { label: string; items: ProgrammaticItem[] }>();

  for (const item of items) {
    for (const tag of item.tags) {
      const slug = slugify(tag);
      if (!slug) continue;
      const group = byTag.get(slug) ?? { label: tag, items: [] };
      group.items.push(item);
      byTag.set(slug, group);
    }
  }

  return Array.from(byTag.entries())
    .map(([slug, group]) => ({
      slug,
      label: group.label,
      title: `${group.label} Prompts and Templates`,
      description: `Explore ${group.label} AI prompts, video prompts, and landing page templates from Prompt Studio.`,
      items: uniqueItems(group.items),
    }))
    .filter(page => page.items.length >= minItems)
    .sort((a, b) => b.items.length - a.items.length);
}

export function getProgrammaticTagPage(
  slug: string,
  locale: string = 'en'
): ProgrammaticTagPage | null {
  return getProgrammaticTagPages(locale).find(page => page.slug === slug) ?? null;
}
