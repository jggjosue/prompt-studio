export type InternalLinkKind =
  | 'prompt'
  | 'tool'
  | 'template'
  | 'category'
  | 'guide';

export type SearchIntent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'navigational';

export type InternalLinkDocument = {
  id: string;
  path: string;
  title: string;
  kind: InternalLinkKind;
  category?: string;
  tags?: string[];
  topics?: string[];
  promptType?: string;
  tool?: string;
  intents?: SearchIntent[];
  /** Señal normalizada entre 0 y 1 (vistas, usos, conversiones o rank editorial). */
  popularity?: number;
  /** Solo se recomiendan URLs canónicas e indexables. */
  indexable?: boolean;
};

export type InternalLinkContext = Omit<InternalLinkDocument, 'id' | 'kind'> & {
  id?: string;
  kind?: InternalLinkKind;
};

export type InternalLinkReason =
  | 'editorial'
  | 'same-category'
  | 'shared-topic'
  | 'shared-tag'
  | 'same-prompt-type'
  | 'same-tool'
  | 'same-intent'
  | 'semantic-context'
  | 'popular';

export type RankedInternalLink = {
  document: InternalLinkDocument;
  score: number;
  reasons: InternalLinkReason[];
};

export type InternalLinkLimits = {
  total: number;
  perKind: Record<InternalLinkKind, number>;
};

export const DEFAULT_INTERNAL_LINK_LIMITS: InternalLinkLimits = {
  total: 18,
  perKind: {
    prompt: 6,
    tool: 3,
    template: 6,
    category: 3,
    guide: 3,
  },
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'de', 'del', 'el', 'en', 'for', 'la', 'las', 'los',
  'of', 'para', 'the', 'to', 'un', 'una', 'with', 'y',
]);

function normalize(value?: string): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizedSet(values: string[] = []): Set<string> {
  return new Set(values.map(normalize).filter(Boolean));
}

function overlap(left: string[] = [], right: string[] = []): number {
  const rightSet = normalizedSet(right);
  return [...normalizedSet(left)].filter(value => rightSet.has(value)).length;
}

function tokens(document: Pick<InternalLinkDocument, 'title' | 'category' | 'tags' | 'topics' | 'promptType' | 'tool'>): Set<string> {
  const text = [
    document.title,
    document.category,
    document.promptType,
    document.tool,
    ...(document.tags ?? []),
    ...(document.topics ?? []),
  ].filter(Boolean).join(' ');
  return new Set(normalize(text).split(' ').filter(token => token.length > 2 && !STOP_WORDS.has(token)));
}

function semanticSimilarity(left: InternalLinkContext, right: InternalLinkDocument): number {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / new Set([...a, ...b]).size;
}

function canonicalPath(path: string): string {
  return path.split('#')[0]?.split('?')[0]?.replace(/\/$/, '') || '/';
}

function boundedPopularity(value?: number): number {
  return Math.max(0, Math.min(1, value ?? 0));
}

export function rankInternalLinks(params: {
  context: InternalLinkContext;
  candidates: InternalLinkDocument[];
  editorialPaths?: string[];
  limits?: Omit<Partial<InternalLinkLimits>, 'perKind'> & {
    perKind?: Partial<Record<InternalLinkKind, number>>;
  };
}): RankedInternalLink[] {
  const { context, candidates, editorialPaths = [] } = params;
  const editorial = new Set(editorialPaths.map(canonicalPath));
  const limits: InternalLinkLimits = {
    total: Math.max(1, params.limits?.total ?? DEFAULT_INTERNAL_LINK_LIMITS.total),
    perKind: { ...DEFAULT_INTERNAL_LINK_LIMITS.perKind, ...params.limits?.perKind },
  };
  const currentPath = canonicalPath(context.path);
  const seen = new Set<string>();

  const ranked = candidates.flatMap((candidate): RankedInternalLink[] => {
    const path = canonicalPath(candidate.path);
    if (
      candidate.indexable === false ||
      candidate.path.includes('?') ||
      candidate.path.includes('#') ||
      path === currentPath ||
      seen.has(path)
    ) return [];
    seen.add(path);

    let score = 0;
    let relevanceSignals = 0;
    const reasons: InternalLinkReason[] = [];
    const add = (points: number, reason: InternalLinkReason, relevant = true) => {
      score += points;
      if (!reasons.includes(reason)) reasons.push(reason);
      if (relevant) relevanceSignals += 1;
    };

    if (editorial.has(path)) add(100, 'editorial');
    if (normalize(context.category) && normalize(context.category) === normalize(candidate.category)) add(32, 'same-category');

    const topicMatches = overlap(context.topics, candidate.topics);
    if (topicMatches) add(Math.min(36, topicMatches * 18), 'shared-topic');

    const tagMatches = overlap(context.tags, candidate.tags);
    if (tagMatches) add(Math.min(24, tagMatches * 8), 'shared-tag');

    if (normalize(context.promptType) && normalize(context.promptType) === normalize(candidate.promptType)) add(18, 'same-prompt-type');
    if (normalize(context.tool) && normalize(context.tool) === normalize(candidate.tool)) add(14, 'same-tool');

    const intentMatches = overlap(context.intents, candidate.intents);
    if (intentMatches) add(Math.min(20, intentMatches * 10), 'same-intent');

    const semantic = semanticSimilarity(context, candidate);
    if (semantic >= 0.12) add(Math.min(20, Math.round(semantic * 40)), 'semantic-context');

    const popularity = boundedPopularity(candidate.popularity);
    if (popularity > 0) add(Math.round(popularity * 10), 'popular', false);

    // La popularidad nunca convierte un resultado irrelevante en recomendación.
    if (relevanceSignals === 0) return [];
    return [{ document: candidate, score, reasons }];
  }).sort((a, b) =>
    b.score - a.score ||
    boundedPopularity(b.document.popularity) - boundedPopularity(a.document.popularity) ||
    a.document.path.localeCompare(b.document.path)
  );

  const counts: Record<InternalLinkKind, number> = {
    prompt: 0, tool: 0, template: 0, category: 0, guide: 0,
  };
  const selected: RankedInternalLink[] = [];
  for (const link of ranked) {
    if (selected.length >= limits.total) break;
    const kind = link.document.kind;
    if (counts[kind] >= limits.perKind[kind]) continue;
    counts[kind] += 1;
    selected.push(link);
  }
  return selected;
}

export function groupInternalLinks(links: RankedInternalLink[]): Record<InternalLinkKind, RankedInternalLink[]> {
  return links.reduce<Record<InternalLinkKind, RankedInternalLink[]>>(
    (groups, link) => {
      groups[link.document.kind].push(link);
      return groups;
    },
    { prompt: [], tool: [], template: [], category: [], guide: [] }
  );
}
