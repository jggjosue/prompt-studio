import { cacheHeaders } from '@/lib/cache-policy';
import { extractSearchIntent, getSearchKeywords, normalizeSearchText, scoreIntentText } from '@/lib/search-intent';
import { fuzzyScoreFields } from '@/lib/fuzzy-search';
import { getWebPages } from '@/lib/web-pages';
import { NextResponse } from 'next/server';
import { enforceIpRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const limited = await enforceIpRateLimit(request, 'search-intent', RATE_LIMITS.publicRead);
  if (limited) return limited;

  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim().slice(0, 240) ?? '';
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';
  if (!query) return NextResponse.json({ intent: [], items: [] }, { headers: cacheHeaders('public-catalog') });
  const intent = extractSearchIntent(query);
  const words = getSearchKeywords(query);
  const budget = Number(intent.find(facet => facet.dimension === 'presupuesto')?.value ?? Number.POSITIVE_INFINITY);
  const items = getWebPages(locale).map(page => {
    // Incluye cada atributo indexable del JSON. Así una búsqueda puede acertar
    // por título, descripción, tags, stack, membresía, precio o metadatos.
    const text = JSON.stringify(page);
    const scored = scoreIntentText(text, intent);
    const wordScore = words.reduce((sum, word) => sum + (normalizeSearchText(text).includes(word) ? 3 : 0), 0);
    const fuzzyScore = fuzzyScoreFields(query, [page.title, page.description, page.imageHint, ...page.tags, ...page.stack], { minScore: 0.48 });
    const price = Number.parseFloat(page.price) || 0;
    const budgetMatch = price <= budget;
    return {
      id: page.id,
      title: page.title,
      description: page.imageHint,
      demoUrl: page.demoUrl,
      stack: page.stack,
      tags: page.tags,
      membership: page.membership,
      price: page.price,
      score: scored.score + wordScore + Math.round(fuzzyScore * 18) + (Number.isFinite(budget) && budgetMatch ? 10 : 0),
      reasons: [...scored.reasons, ...(Number.isFinite(budget) && budgetMatch ? [`≤ $${budget}`] : [])],
    };
  }).filter(item => item.score > 0 && (Number.isFinite(budget) ? Number.parseFloat(item.price) <= budget : true)).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 36);
  return NextResponse.json({ intent, items }, { headers: cacheHeaders('public-catalog') });
}
