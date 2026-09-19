/**
 * Grafo de enlaces internos inspirado en PageRank:
 * la home distribuye autoridad hacia hubs (tier 1) y estos hacia secciones (tier 2).
 */
import {
  rankInternalLinks,
  type InternalLinkDocument,
  type InternalLinkKind,
  type SearchIntent,
} from '@/lib/seo/internal-link-engine';

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
    path: '/ask',
    rank: 0.72,
    tier: 1,
    labelKey: 'nav.about',
    parent: '/',
  },
  {
    path: '/generate',
    rank: 0.88,
    tier: 1,
    labelKey: 'nav.createWeb',
    parent: '/',
  },
  {
    path: '/generate',
    rank: 0.88,
    tier: 1,
    labelKey: 'nav.generateImages',
    parent: '/',
  },
  {
    path: '/generate',
    rank: 0.88,
    tier: 1,
    labelKey: 'nav.generateVideos',
    parent: '/',
  },
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
    labelKey: 'nav.templates',
    descKey: 'nav.templatesDesc',
    parent: '/',
  },
  {
    path: '/web-animations',
    rank: 0.87,
    tier: 1,
    labelKey: 'nav.animations',
    descKey: 'nav.animationsDesc',
    parent: '/',
  },
  {
    path: '/component-builder',
    rank: 0.78,
    tier: 2,
    labelKey: 'nav.componentBuilder',
    parent: '/landing-pages',
  },
  {
    path: '/component-kits',
    rank: 0.7,
    tier: 2,
    labelKey: 'nav.componentKits',
    parent: '/landing-pages',
  },
  {
    path: '/prices',
    rank: 0.75,
    tier: 1,
    labelKey: 'nav.prices',
    parent: '/',
  },
  {
    path: '/affiliate-program',
    rank: 0.68,
    tier: 1,
    labelKey: 'footer.affiliateProgram',
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

/** Enlaces editoriales según la siguiente intención útil del visitante. */
const INTENT_RELATED_PATHS: Record<string, string[]> = {
  '/': ['/image-prompts', '/video-prompts', '/landing-pages', '/generate'],
  '/prompts': ['/image-prompts', '/video-prompts', '/generate'],
  '/image-prompts': ['/generate', '/image-tags', '/prompts'],
  '/image-tags': ['/image-prompts', '/generate'],
  '/generate': ['/image-prompts', '/image-tags', '/prompts', '/video-prompts', '/video-tags', '/landing-pages', '/web-tags', '/component-builder', '/component-kits'],
  '/video-prompts': ['/generate', '/video-tags', '/prompts'],
  '/video-tags': ['/video-prompts', '/generate'],
  '/landing-pages': ['/generate', '/web-tags', '/component-builder', '/component-kits'],
  '/web-tags': ['/landing-pages', '/generate', '/component-builder'],
};

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

  if (pathOnly === '/landing-pages') {
    return [
      { href: '/', labelKey: 'nav.home' },
      { href: '/landing-pages', labelKey: 'nav.webs' },
      { href: '/landing-pages', labelKey: 'nav.landingPages' },
    ];
  }

  if (pathOnly === '/web-animations') {
    return [
      { href: '/', labelKey: 'nav.home' },
      { href: '/landing-pages', labelKey: 'nav.webs' },
      { href: '/web-animations', labelKey: 'nav.webAnimations' },
    ];
  }

  if (pathOnly === '/video-prompts') {
    return [
      { href: '/', labelKey: 'nav.home' },
      { href: '/video-prompts', labelKey: 'nav.multimedia' },
      { href: '/video-prompts', labelKey: 'nav.videos' },
    ];
  }

  if (pathOnly === '/image-prompts') {
    return [
      { href: '/', labelKey: 'nav.home' },
      { href: '/image-prompts', labelKey: 'nav.multimedia' },
      { href: '/image-prompts', labelKey: 'nav.images' },
    ];
  }

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
  const editorial = (INTENT_RELATED_PATHS[pathOnly] ?? [])
    .map(path => NODE_BY_PATH.get(path))
    .filter((node): node is InternalLinkNode => Boolean(node));
  if (editorial.length > 0) return editorial.slice(0, limit);
  const node =
    NODE_BY_PATH.get(currentPath) ?? NODE_BY_PATH.get(pathOnly);

  if (!node) {
    return getTier1Hubs().filter(h => h.path !== pathOnly).slice(0, limit);
  }

  const context = nodeToDocument(node);
  const ranked = rankInternalLinks({
    context,
    candidates: INTERNAL_LINK_NODES.map(nodeToDocument),
    editorialPaths: [
      ...(node.parent ? [node.parent] : []),
      ...getChildLinks(node.path).map(link => link.path),
      ...INTERNAL_LINK_NODES.filter(link => link.parent === node.parent).map(link => link.path),
    ],
    limits: { total: limit, perKind: { category: limit, tool: limit } },
  });
  const byPath = new Map(INTERNAL_LINK_NODES.map(link => [link.path, link]));
  const related = ranked
    .map(link => byPath.get(link.document.path))
    .filter((link): link is InternalLinkNode => Boolean(link));

  if (related.length >= limit) return related.slice(0, limit);
  const seen = new Set([node.path, ...related.map(link => link.path)]);
  return [
    ...related,
    ...getTier1Hubs().filter(link => !seen.has(link.path)),
  ].slice(0, limit);
}

function nodeToDocument(node: InternalLinkNode): InternalLinkDocument {
  const path = node.path.split('?')[0] ?? node.path;
  const text = `${path} ${node.labelKey} ${node.descKey ?? ''}`.replace(/[./_-]+/g, ' ');
  const tool = path.startsWith('/generate-') || path.includes('builder') ? path.slice(1) : undefined;
  const kind: InternalLinkKind = tool
    ? 'tool'
    : path.includes('tags') || path === '/prompts' || path.endsWith('-prompts')
      ? 'category'
      : path === '/landing-pages' || path === '/component-kits'
        ? 'template'
        : 'guide';
  const intents: SearchIntent[] = path === '/prices'
    ? ['transactional']
    : tool
      ? ['commercial']
      : ['informational', 'commercial'];
  const topics = [
    path.includes('image') ? 'image' : '',
    path.includes('video') ? 'video' : '',
    path.includes('web') || path.includes('landing') || path.includes('component') ? 'web' : '',
    path.includes('prompt') ? 'prompt' : '',
  ].filter(Boolean);
  return {
    id: node.path,
    path: node.path,
    title: text,
    kind,
    category: node.parent,
    topics,
    tags: text.split(' '),
    tool,
    intents,
    popularity: node.rank,
    indexable: !node.path.includes('?'),
  };
}
