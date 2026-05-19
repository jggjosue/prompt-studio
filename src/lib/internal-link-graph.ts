/**
 * Grafo de enlaces internos inspirado en PageRank:
 * la home distribuye autoridad hacia hubs (tier 1) y estos hacia secciones (tier 2).
 */

export type LinkTier = 0 | 1 | 2 | 3;

export type InternalLinkNode = {
  path: string;
  /** Peso relativo 0–1 (sitemap y prominencia visual). */
  rank: number;
  tier: LinkTier;
  /** Clave i18n (p. ej. nav.library). */
  labelKey: string;
  descKey?: string;
  /** Padre en el grafo (ruta que transfiere autoridad). */
  parent?: string;
};

/** Nodos estáticos del sitio (ordenados por rank descendente). */
export const INTERNAL_LINK_NODES: InternalLinkNode[] = [
  { path: '/', rank: 1, tier: 0, labelKey: 'nav.home' },
  {
    path: '/prompts',
    rank: 0.92,
    tier: 1,
    labelKey: 'nav.library',
    descKey: 'nav.libraryDesc',
    parent: '/',
  },
  {
    path: '/image-prompts',
    rank: 0.9,
    tier: 1,
    labelKey: 'nav.images',
    descKey: 'nav.imageTagsDesc',
    parent: '/',
  },
  {
    path: '/video-prompts',
    rank: 0.9,
    tier: 1,
    labelKey: 'nav.videos',
    descKey: 'nav.videoTagsDesc',
    parent: '/',
  },
  {
    path: '/landing-pages',
    rank: 0.88,
    tier: 1,
    labelKey: 'nav.webs',
    descKey: 'nav.webTagsDesc',
    parent: '/',
  },
  {
    path: '/prices',
    rank: 0.75,
    tier: 1,
    labelKey: 'nav.prices',
    parent: '/',
  },
  {
    path: '/prompt/edit',
    rank: 0.7,
    tier: 1,
    labelKey: 'footer.promptGenerator',
    parent: '/',
  },
  {
    path: '/image-tags',
    rank: 0.65,
    tier: 2,
    labelKey: 'nav.imageTags',
    descKey: 'nav.imageTagsDesc',
    parent: '/image-prompts',
  },
  {
    path: '/video-tags',
    rank: 0.65,
    tier: 2,
    labelKey: 'nav.videoTags',
    descKey: 'nav.videoTagsDesc',
    parent: '/video-prompts',
  },
  {
    path: '/web-tags',
    rank: 0.65,
    tier: 2,
    labelKey: 'nav.webTags',
    descKey: 'nav.webTagsDesc',
    parent: '/landing-pages',
  },
  {
    path: '/web-tags?tag=music',
    rank: 0.45,
    tier: 3,
    labelKey: 'footer.music',
    parent: '/web-tags',
  },
  {
    path: '/web-tags?tag=portfolio',
    rank: 0.45,
    tier: 3,
    labelKey: 'footer.portfolio',
    parent: '/web-tags',
  },
  {
    path: '/web-tags?tag=gaming',
    rank: 0.45,
    tier: 3,
    labelKey: 'footer.gaming',
    parent: '/web-tags',
  },
  {
    path: '/web-tags?tag=travel',
    rank: 0.45,
    tier: 3,
    labelKey: 'footer.travel',
    parent: '/web-tags',
  },
  {
    path: '/image-prompts?tag=nano%20banana',
    rank: 0.4,
    tier: 3,
    labelKey: 'footer.nanoBanana',
    parent: '/image-prompts',
  },
];

const NODE_BY_PATH = new Map(
  INTERNAL_LINK_NODES.map(node => [node.path, node])
);

/** Hubs de primer nivel (máxima autoridad desde /). */
export function getTier1Hubs(): InternalLinkNode[] {
  return INTERNAL_LINK_NODES.filter(n => n.tier === 1).sort(
    (a, b) => b.rank - a.rank
  );
}

/** Enlaces hijos directos de una ruta (autoridad descendente). */
export function getChildLinks(parentPath: string): InternalLinkNode[] {
  return INTERNAL_LINK_NODES.filter(n => n.parent === parentPath).sort(
    (a, b) => b.rank - a.rank
  );
}

/** Grupos para el footer (jerarquía PageRank). */
export function getFooterLinkGroups(): {
  primary: InternalLinkNode[];
  discovery: InternalLinkNode[];
  topical: InternalLinkNode[];
} {
  return {
    primary: getTier1Hubs(),
    discovery: INTERNAL_LINK_NODES.filter(n => n.tier === 2).sort(
      (a, b) => b.rank - a.rank
    ),
    topical: INTERNAL_LINK_NODES.filter(n => n.tier === 3).sort(
      (a, b) => b.rank - a.rank
    ),
  };
}

/** Prioridad sitemap alineada con el grafo. */
export function getSitemapPriority(path: string): number {
  const node = NODE_BY_PATH.get(path);
  if (node) return node.rank;
  if (path.startsWith('/gallery/') || path.startsWith('/gallery-videos/')) {
    return 0.55;
  }
  if (path.startsWith('/prompts/')) return 0.6;
  return 0.5;
}

type Crumb = { href: string; labelKey: string };

const ROUTE_PARENTS: { pattern: RegExp; parents: Crumb[] }[] = [
  {
    pattern: /^\/prompts\/[^/]+$/,
    parents: [
      { href: '/', labelKey: 'nav.home' },
      { href: '/prompts', labelKey: 'nav.library' },
    ],
  },
  {
    pattern: /^\/gallery\/[^/]+$/,
    parents: [
      { href: '/', labelKey: 'nav.home' },
      { href: '/image-prompts', labelKey: 'nav.images' },
    ],
  },
  {
    pattern: /^\/gallery-videos\/[^/]+$/,
    parents: [
      { href: '/', labelKey: 'nav.home' },
      { href: '/video-prompts', labelKey: 'nav.videos' },
    ],
  },
];

/** Migas de pan según el grafo (enlaces internos ascendentes). */
export function getBreadcrumbTrail(pathname: string): Crumb[] {
  const pathOnly = pathname.split('?')[0] ?? '/';
  if (pathOnly === '/') return [];

  const dynamic = ROUTE_PARENTS.find(r => r.pattern.test(pathOnly));
  if (dynamic) return dynamic.parents;

  const node = NODE_BY_PATH.get(pathname) ?? NODE_BY_PATH.get(pathOnly);
  const trail: Crumb[] = [{ href: '/', labelKey: 'nav.home' }];

  if (node?.parent && node.parent !== '/') {
    const parentNode = NODE_BY_PATH.get(node.parent);
    if (parentNode) {
      trail.push({ href: parentNode.path, labelKey: parentNode.labelKey });
    }
  }

  if (node && pathOnly !== '/') {
    trail.push({ href: node.path, labelKey: node.labelKey });
  } else if (!node) {
    const segments = pathOnly.split('/').filter(Boolean);
    let acc = '';
    for (const seg of segments) {
      acc += `/${seg}`;
      const n = NODE_BY_PATH.get(acc);
      if (n) trail.push({ href: n.path, labelKey: n.labelKey });
    }
  }

  return trail;
}

/** Enlaces relacionados sugeridos desde la página actual (interlinking lateral). */
export function getRelatedHubLinks(
  currentPath: string,
  limit = 6
): InternalLinkNode[] {
  const pathOnly = currentPath.split('?')[0] ?? currentPath;
  const node =
    NODE_BY_PATH.get(currentPath) ?? NODE_BY_PATH.get(pathOnly);

  if (!node) {
    return getTier1Hubs().filter(h => h.path !== pathOnly).slice(0, limit);
  }

  const siblings = INTERNAL_LINK_NODES.filter(
    n => n.parent === node.parent && n.path !== node.path && n.tier <= 2
  );
  const children = getChildLinks(node.path);
  const parentHub = node.parent
    ? NODE_BY_PATH.get(node.parent)
    : undefined;

  const out: InternalLinkNode[] = [];
  if (parentHub && parentHub.tier > 0) out.push(parentHub);
  out.push(...children, ...siblings);

  const seen = new Set<string>([node.path]);
  const unique: InternalLinkNode[] = [];
  for (const link of out) {
    if (seen.has(link.path)) continue;
    seen.add(link.path);
    unique.push(link);
  }

  if (unique.length < limit) {
    for (const hub of getTier1Hubs()) {
      if (unique.length >= limit) break;
      if (!seen.has(hub.path)) {
        seen.add(hub.path);
        unique.push(hub);
      }
    }
  }

  return unique.slice(0, limit);
}
