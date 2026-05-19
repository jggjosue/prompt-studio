/**
 * Análisis de legibilidad (Flesch-Kincaid / Fernández-Huerta) para copy web.
 * Evalúa longitud de oraciones, sílabas, densidad de keywords y estructura de encabezados.
 */

export type ReadabilityLocale = 'en' | 'es';

export type HeadingNode = {
  level: number;
  text: string;
};

export type KeywordStat = {
  word: string;
  count: number;
  density: number;
};

export type ReadabilityGrade = 'excellent' | 'good' | 'fair' | 'poor';

export type ReadabilityReport = {
  locale: ReadabilityLocale;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  /** 0–100: mayor = más fácil de leer. */
  readingEase: number;
  /** Nivel educativo aproximado (años de escolaridad). */
  gradeLevel: number;
  keywords: KeywordStat[];
  headings: HeadingNode[];
  headingScore: number;
  /** 0–100 puntuación compuesta para humanos + crawlers. */
  overallScore: number;
  grade: ReadabilityGrade;
  tips: string[];
};

const STOPWORDS: Record<ReadabilityLocale, Set<string>> = {
  en: new Set(
    'a an the and or but if in on at to for of with by from as is are was were be been being have has had do does did will would can could should may might this that these those it its they them we you your our'.split(
      ' '
    )
  ),
  es: new Set(
    'el la los las un una unos unas y o pero si en de del al lo le les que con por para como más muy sin sobre entre cuando donde este esta estos estas ese esa esos esas aquí allí ya no sí también nos vosotros ustedes ellos ellas yo tú tu su sus mi mis es son fue fueron ser estar haber'.split(
      ' '
    )
  ),
};

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractHeadingsFromHtml(html: string): HeadingNode[] {
  const headings: HeadingNode[] = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const level = Number.parseInt(match[1]!, 10);
    const text = stripHtml(match[2] ?? '').trim();
    if (text) headings.push({ level, text });
  }
  return headings;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+/u)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function tokenizeWords(text: string, locale: ReadabilityLocale): string[] {
  const pattern =
    locale === 'es'
      ? /[a-záéíóúüñ0-9]+/giu
      : /[a-z0-9]+/giu;
  return (text.match(pattern) ?? []).map(w => w.toLowerCase());
}

/** Heurística de sílabas (EN/ES) — suficiente para métricas de legibilidad web. */
export function countSyllables(word: string, locale: ReadabilityLocale): number {
  const w = word
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;

  if (locale === 'es') {
    const groups = w.match(/[aeiouy]+/g);
    let count = groups?.length ?? 1;
    if (w.endsWith('es') || w.endsWith('as')) count = Math.max(1, count - 1);
    return Math.max(1, count);
  }

  const vowels = 'aeiouy';
  let count = 0;
  let prevVowel = false;
  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]!);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith('e') && count > 1 && !w.endsWith('le')) count--;
  return Math.max(1, count);
}

function computeReadingEase(
  words: number,
  sentences: number,
  syllables: number,
  locale: ReadabilityLocale
): number {
  if (words === 0 || sentences === 0) return 0;
  const asl = words / sentences;
  const asw = syllables / words;

  if (locale === 'es') {
    const p = asw * 100;
    const f = asl * 100;
    return clamp(206.84 - 0.6 * p - 1.02 * f, 0, 100);
  }

  return clamp(206.835 - 1.015 * asl - 84.6 * asw, 0, 100);
}

function computeGradeLevel(
  words: number,
  sentences: number,
  syllables: number,
  locale: ReadabilityLocale
): number {
  if (words === 0 || sentences === 0) return 0;
  const asl = words / sentences;
  const asw = syllables / words;

  if (locale === 'es') {
    return clamp(0.39 * asl + 11.8 * asw - 15.59, 0, 18);
  }

  return clamp(0.39 * asl + 11.8 * asw - 15.59, 0, 18);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function analyzeKeywords(
  words: string[],
  locale: ReadabilityLocale,
  topN = 8
): KeywordStat[] {
  const stop = STOPWORDS[locale];
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3 || stop.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const total = words.length || 1;
  return [...freq.entries()]
    .map(([word, count]) => ({
      word,
      count,
      density: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

function scoreHeadings(headings: HeadingNode[]): {
  score: number;
  tips: string[];
} {
  const tips: string[] = [];
  if (headings.length === 0) {
    tips.push('tipNoHeadings');
    return { score: 40, tips };
  }

  let score = 100;
  const h1 = headings.filter(h => h.level === 1);
  if (h1.length === 0) {
    score -= 25;
    tips.push('tipMissingH1');
  } else if (h1.length > 1) {
    score -= 20;
    tips.push('tipMultipleH1');
  }

  let prev = 0;
  for (const h of headings) {
    if (prev > 0 && h.level > prev + 1) {
      score -= 12;
      tips.push('tipSkippedHeading');
      break;
    }
    prev = h.level;
  }

  const h2plus = headings.filter(h => h.level >= 2);
  if (h2plus.length === 0 && headings.length > 0) {
    score -= 15;
    tips.push('tipNoSubheadings');
  }

  if (headings.some(h => h.text.length > 80)) {
    score -= 8;
    tips.push('tipLongHeadings');
  }

  return { score: clamp(score, 0, 100), tips };
}

function buildTips(
  locale: ReadabilityLocale,
  avgWordsPerSentence: number,
  readingEase: number,
  keywords: KeywordStat[],
  headingTips: string[]
): string[] {
  const tips = [...headingTips];

  if (avgWordsPerSentence > 24) {
    tips.push('tipLongSentences');
  } else if (avgWordsPerSentence < 8 && avgWordsPerSentence > 0) {
    tips.push('tipChoppySentences');
  }

  if (readingEase < 45) {
    tips.push('tipLowEase');
  } else if (readingEase > 85) {
    tips.push('tipVeryEasy');
  }

  const stuffed = keywords.find(k => k.density > 3.5);
  if (stuffed) {
    tips.push('tipKeywordStuffing');
  }

  if (keywords.length > 0 && keywords[0]!.density < 0.5) {
    tips.push('tipWeakFocus');
  }

  if (tips.length === 0) {
    tips.push('tipGood');
  }

  return [...new Set(tips)];
}

function overallGrade(score: number): ReadabilityGrade {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export type AnalyzeReadabilityInput = {
  text: string;
  html?: string;
  locale?: ReadabilityLocale;
  focusKeyword?: string;
};

/**
 * Analiza texto plano y, opcionalmente, HTML con encabezados.
 */
export function analyzeReadability(input: AnalyzeReadabilityInput): ReadabilityReport {
  const locale = input.locale ?? 'en';
  const plain = stripHtml(input.text);
  const headings = input.html ? extractHeadingsFromHtml(input.html) : [];

  const sentences = splitSentences(plain);
  const sentenceCount = Math.max(1, sentences.length);
  const words = tokenizeWords(plain, locale);
  const wordCount = words.length;

  let syllableCount = 0;
  for (const w of words) {
    syllableCount += countSyllables(w, locale);
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;
  const readingEase = computeReadingEase(
    wordCount,
    sentenceCount,
    syllableCount,
    locale
  );
  const gradeLevel = computeGradeLevel(
    wordCount,
    sentenceCount,
    syllableCount,
    locale
  );

  const keywords = analyzeKeywords(words, locale);
  if (input.focusKeyword) {
    const focus = input.focusKeyword.toLowerCase().trim();
    const count = words.filter(w => w === focus).length;
    const existing = keywords.find(k => k.word === focus);
    if (existing) {
      existing.count = count;
      existing.density = wordCount ? (count / wordCount) * 100 : 0;
    } else if (focus) {
      keywords.unshift({
        word: focus,
        count,
        density: wordCount ? (count / wordCount) * 100 : 0,
      });
    }
  }

  const { score: headingScore, tips: headingTips } = scoreHeadings(headings);

  const easeScore = clamp(readingEase, 0, 100);
  const sentenceScore =
    avgWordsPerSentence <= 20
      ? 100
      : clamp(100 - (avgWordsPerSentence - 20) * 4, 40, 100);
  const lengthScore =
    wordCount >= 120 ? 100 : clamp((wordCount / 120) * 100, 30, 100);
  const keywordScore =
    keywords.some(k => k.density > 4)
      ? 50
      : keywords.some(k => k.density >= 0.8 && k.density <= 2.5)
        ? 100
        : 75;

  const overallScore = Math.round(
    easeScore * 0.35 +
      sentenceScore * 0.25 +
      headingScore * 0.2 +
      lengthScore * 0.1 +
      keywordScore * 0.1
  );

  const tips = buildTips(
    locale,
    avgWordsPerSentence,
    readingEase,
    keywords,
    headingTips
  );

  return {
    locale,
    wordCount,
    sentenceCount,
    syllableCount,
    avgWordsPerSentence: round(avgWordsPerSentence, 1),
    avgSyllablesPerWord: round(avgSyllablesPerWord, 2),
    readingEase: round(readingEase, 1),
    gradeLevel: round(gradeLevel, 1),
    keywords,
    headings,
    headingScore,
    overallScore,
    grade: overallGrade(overallScore),
    tips,
  };
}

function round(n: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

/** Etiqueta legible del índice Flesch / Fernández-Huerta. */
export function readingEaseLabel(
  score: number,
  locale: ReadabilityLocale
): string {
  if (score >= 80) return locale === 'es' ? 'Muy fácil' : 'Very easy';
  if (score >= 60) return locale === 'es' ? 'Estándar' : 'Standard';
  if (score >= 45) return locale === 'es' ? 'Algo difícil' : 'Fairly difficult';
  return locale === 'es' ? 'Difícil' : 'Difficult';
}
