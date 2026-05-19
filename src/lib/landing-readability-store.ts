import fs from 'fs/promises';
import path from 'path';
import type { ReadabilityGrade, ReadabilityReport } from '@/lib/readability-analysis';
import { cacheGetOrSet, cacheSet } from '@/lib/server-cache';

export type LandingReadabilitySnapshot = {
  pageId: string;
  locale: 'en' | 'es';
  demoSlug?: string;
  updatedAt: string;
  updatedBy?: string;
  title?: string;
  wordCount: number;
  overallScore: number;
  grade: ReadabilityGrade;
  readingEase: number;
  gradeLevel: number;
  headingScore: number;
  avgWordsPerSentence: number;
  tips: string[];
  report: ReadabilityReport;
};

type ReadabilityIndexFile = {
  version: 1;
  records: Record<string, LandingReadabilitySnapshot>;
};

const INDEX_PATH = path.join(process.cwd(), 'data/landing-readability.json');
const CACHE_NS = 'catalog' as const;
const INDEX_CACHE_KEY = '__readability-index__';

/** Payload ligero para listados (sin `report` completo). */
export type LandingReadabilityPublicSnapshot = {
  pageId: string;
  locale: 'en' | 'es';
  updatedAt: string;
  overallScore: number;
  grade: ReadabilityGrade;
  readingEase: number;
  gradeLevel: number;
  headingScore: number;
  avgWordsPerSentence: number;
  wordCount: number;
  tips: string[];
};

function storageKey(pageId: string, locale: string): string {
  return `readability:${pageId}:${locale}`;
}

function indexKey(pageId: string, locale: string): string {
  return `${pageId}:${locale}`;
}

async function readFileIndex(): Promise<ReadabilityIndexFile> {
  try {
    const raw = await fs.readFile(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw) as ReadabilityIndexFile;
    if (parsed?.version === 1 && parsed.records) return parsed;
  } catch {
    /* missing or invalid */
  }
  return { version: 1, records: {} };
}

async function writeFileIndex(index: ReadabilityIndexFile): Promise<void> {
  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
}

async function loadIndexRecords(): Promise<
  Record<string, LandingReadabilitySnapshot>
> {
  const index = await cacheGetOrSet(
    CACHE_NS,
    INDEX_CACHE_KEY,
    async () => readFileIndex(),
    { ttlMs: 5 * 60 * 1000 }
  );
  return index.records;
}

async function persistIndexRecords(
  records: Record<string, LandingReadabilitySnapshot>
): Promise<void> {
  const index: ReadabilityIndexFile = { version: 1, records };
  await cacheSet(CACHE_NS, INDEX_CACHE_KEY, index, {
    ttlMs: 365 * 24 * 60 * 60 * 1000,
  });
  try {
    await writeFileIndex(index);
  } catch (error) {
    console.warn(
      '[landing-readability] No se pudo escribir índice en disco.',
      error
    );
  }
}

export function toPublicReadabilitySnapshot(
  snapshot: LandingReadabilitySnapshot
): LandingReadabilityPublicSnapshot {
  return {
    pageId: snapshot.pageId,
    locale: snapshot.locale,
    updatedAt: snapshot.updatedAt,
    overallScore: snapshot.overallScore,
    grade: snapshot.grade,
    readingEase: snapshot.readingEase,
    gradeLevel: snapshot.gradeLevel,
    headingScore: snapshot.headingScore,
    avgWordsPerSentence: snapshot.avgWordsPerSentence,
    wordCount: snapshot.wordCount,
    tips: snapshot.tips,
  };
}

/** Mapa pageId → snapshot guardado para un locale (grid del catálogo). */
export async function listLandingReadabilityByLocale(
  locale: 'en' | 'es'
): Promise<Record<string, LandingReadabilityPublicSnapshot>> {
  const records = await loadIndexRecords();
  const out: Record<string, LandingReadabilityPublicSnapshot> = {};

  for (const record of Object.values(records)) {
    if (record.locale === locale) {
      out[record.pageId] = toPublicReadabilitySnapshot(record);
    }
  }

  return out;
}

export async function getLandingReadabilitySnapshot(
  pageId: string,
  locale: 'en' | 'es'
): Promise<LandingReadabilitySnapshot | null> {
  const records = await loadIndexRecords();
  return records[indexKey(pageId, locale)] ?? null;
}

export async function saveLandingReadabilitySnapshot(
  snapshot: LandingReadabilitySnapshot
): Promise<LandingReadabilitySnapshot> {
  const key = storageKey(snapshot.pageId, snapshot.locale);
  const record: LandingReadabilitySnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };

  const records = await loadIndexRecords();
  records[indexKey(snapshot.pageId, snapshot.locale)] = record;
  await persistIndexRecords(records);

  return record;
}

export async function listLandingReadabilityForPage(
  pageId: string
): Promise<LandingReadabilitySnapshot[]> {
  const locales: Array<'en' | 'es'> = ['en', 'es'];
  const results: LandingReadabilitySnapshot[] = [];
  for (const locale of locales) {
    const snap = await getLandingReadabilitySnapshot(pageId, locale);
    if (snap) results.push(snap);
  }
  return results;
}

export function summarizeReport(
  pageId: string,
  locale: 'en' | 'es',
  report: ReadabilityReport,
  meta: {
    demoSlug?: string;
    title?: string;
    updatedBy?: string;
  }
): LandingReadabilitySnapshot {
  return {
    pageId,
    locale,
    demoSlug: meta.demoSlug,
    title: meta.title,
    updatedBy: meta.updatedBy,
    updatedAt: new Date().toISOString(),
    wordCount: report.wordCount,
    overallScore: report.overallScore,
    grade: report.grade,
    readingEase: report.readingEase,
    gradeLevel: report.gradeLevel,
    headingScore: report.headingScore,
    avgWordsPerSentence: report.avgWordsPerSentence,
    tips: report.tips,
    report,
  };
}
