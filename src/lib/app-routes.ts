import { RouteTrie } from '@/lib/route-trie';

/** Grupos de navegación del header (coincidencia por prefijo vía trie). */
export const NAV_GROUPS = {
  library: [
    '/prompts',
    '/image-prompts',
    '/gallery',
    '/image-tags',
    '/video-prompts',
    '/gallery-videos',
    '/video-tags',
    '/landing-pages',
  ],
  tags: ['/video-tags', '/image-tags', '/web-tags'],
} as const;

/** Rutas prioritarias para prefetch en idle (navegación instantánea). */
export const IDLE_PREFETCH_ROUTES = [
  '/',
  '/prompts',
  '/image-prompts',
  '/landing-pages',
  '/prices',
  '/web-tags',
] as const;

let trieSingleton: RouteTrie | null = null;

export function getAppRouteTrie(): RouteTrie {
  if (trieSingleton) return trieSingleton;

  const trie = new RouteTrie();

  trie.insert('/', { groupId: 'home', prefetchPriority: 10 });

  const libraryRoutes: { path: string; priority: number }[] = [
    { path: '/prompts', priority: 9 },
    { path: '/image-prompts', priority: 9 },
    { path: '/video-prompts', priority: 8 },
    { path: '/landing-pages', priority: 9 },
    { path: '/image-tags', priority: 7 },
    { path: '/video-tags', priority: 7 },
    { path: '/gallery', priority: 6 },
    { path: '/gallery/[id]', priority: 5 },
    { path: '/gallery-videos', priority: 6 },
    { path: '/gallery-videos/[id]', priority: 5 },
    { path: '/prompts/[modelId]', priority: 5 },
  ];

  for (const { path, priority } of libraryRoutes) {
    trie.insert(path, { groupId: 'library', prefetchPriority: priority });
  }

  for (const path of NAV_GROUPS.tags) {
    trie.insert(path, { groupId: 'tags', prefetchPriority: 8 });
  }

  trie.insert('/prices', { prefetchPriority: 8 });
  trie.insert('/prompt/edit', { prefetchPriority: 7 });
  trie.insert('/dashboard', { prefetchPriority: 4 });
  trie.insert('/dashboard/profile', { prefetchPriority: 4 });

  trieSingleton = trie;
  return trie;
}

export function isNavActive(
  pathname: string,
  href?: string,
  activePrefixes?: readonly string[]
): boolean {
  const trie = getAppRouteTrie();
  if (activePrefixes?.length) {
    return trie.matchesAnyPrefix(pathname, activePrefixes);
  }
  if (!href) return false;
  if (href === '/') return pathname === '/' || pathname === '';
  return trie.hasPrefix(pathname, href);
}

export function pathnameOnly(href: string): string {
  return href.split('?')[0]?.split('#')[0] ?? href;
}

export function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}
