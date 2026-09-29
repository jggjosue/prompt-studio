'use client';

import { AdUnit } from '@/components/ad-unit';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { OptimizedImage } from '@/components/optimized-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRefactoryLoaderUrl } from '@/lib/refactory-online';
import { rankCatalogItems, type CatalogKind, type CatalogMetrics } from '@/lib/catalog-ranking';
import {
  initialFeedItemCount,
  interleaveFeedGroups,
  nextFeedItemCount,
} from '@/lib/progressive-feed';
import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Download, Eye, Globe, Heart, Image as ImageIcon, MoveUpRight, Search, Sparkles, Star, Video, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';

type Localized = { es?: string; en?: string };
type MediaItem = {
  id?: string | number;
  randomId?: string;
  title?: Localized;
  description?: Localized | Record<string, unknown>;
  imageUrl?: string;
  tags?: string[];
  demoUrl?: string;
  price?: string;
  /** Id con el que el detalle encuentra el elemento; lo calcula la pagina. */
  detailId?: string;
};
type AnimationItem = { id: number; name: Localized; prompt: Localized };
type Filter = 'all' | 'image' | 'video' | 'web' | 'animation';
type FeedItem = MediaItem & {
  key: string;
  contentKey: string;
  contentId: string;
  reviewProductId?: string;
  editorialIndex: number;
  kind: Filter;
  titleText: string;
  prompt: string;
};

const text = (value: LocalizedField | undefined, locale: string) =>
  pickLocalized(value, locale);

function stableCatalogId(value: unknown, fallback: string): string {
  const source = String(value ?? fallback).trim().toLowerCase();
  return source.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/index\.html$/i, '')
    .replace(/\/$/, '').replace(/[^a-z0-9._~-]+/g, '-').slice(0, 180) || fallback;
}

function getDemoHref(item: MediaItem): string {
  const demoUrl = getRefactoryLoaderUrl(item.demoUrl ?? '');
  if (!demoUrl) return '/landing-pages';

  const url = new URL(demoUrl, 'https://prompstudio.com');
  const pageId = String(item.id ?? item.demoUrl ?? '');

  if (item.price) {
    url.searchParams.set('price', item.price);

    const checkoutParams = new URLSearchParams({
      price: item.price,
      client_reference_id: `guest___${pageId}`,
      affiliate_product_id: pageId,
    });
    url.searchParams.set('checkout', `/api/web-page-checkout?${checkoutParams.toString()}`);
  }
  if (pageId) {
    url.searchParams.set('pageId', pageId);
  }

  return /^https?:\/\//i.test(demoUrl)
    ? url.toString()
    : `${url.pathname}${url.search}`;
}

/**
 * Builds the Next.js preview wrapper URL (/landing-pages/[slug]/preview)
 * so the purchase button is visible when the user clicks "Previsualizar".
 */
function getWebPreviewHref(item: MediaItem): string {
  const demoUrl = item.demoUrl ?? '';
  if (!demoUrl) return '/landing-pages';
  const pageId = String(item.id ?? demoUrl);
  const params = new URLSearchParams();
  if (item.price) {
    params.set('price', item.price);
    const checkoutParams = new URLSearchParams({
      price: item.price,
      client_reference_id: `guest___${pageId}`,
      affiliate_product_id: pageId,
    });
    params.set('checkout', `/api/web-page-checkout?${checkoutParams.toString()}`);
  }
  if (pageId) params.set('pageId', pageId);
  const qs = params.toString();
  return `/landing-pages/${encodeURIComponent(demoUrl)}/preview${qs ? `?${qs}` : ''}`;
}

function getPersonalizeHref(item: { kind: Filter; prompt?: string; titleText?: string }): string {
  const prompt = item.prompt || item.titleText || '';
  const route = '/generate';

  return route + '?prompt=' + encodeURIComponent(prompt);
}

const FALLBACK_IMAGE = '/images/product-photography/product-photo-368-advertising-mockups.webp';
const FALLBACK_VIDEO = '/videos/product-reels/product-reel-023.mp4';
// Keep this value in the client module itself. Turbopack can preserve an older
// component closure during HMR, so an imported binding here caused a transient
// `ReferenceError` after the progressive-feed module was replaced.
const INITIAL_FEED_ITEMS = 16;

/**
 * Vista previa de una animacion. No hay fichero que mostrar —son prompts de CSS—,
 * asi que la tarjeta ejecuta la animacion en vez de ilustrarla con un icono.
 * Cuatro variantes deterministas por indice para que el feed no se repita.
 * Se desactiva con `prefers-reduced-motion` via `motion-reduce:*`.
 */
function AnimationPreview({ index }: { index: number }) {
  const variant = index % 4;
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,.45),transparent_35%),linear-gradient(135deg,#171923,#090a0d)]">
      {variant === 0 ? (
        <motion.div
          aria-hidden
          animate={{ y: [-10, 10, -10], rotate: [-3, 3, -3] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-16 w-24 rounded-lg border border-blue-400/40 bg-blue-500/20 shadow-lg shadow-blue-950/40 motion-reduce:animate-none"
        />
      ) : variant === 1 ? (
        <div aria-hidden className="w-2/3 space-y-2">
          {[0, 1, 2].map(row => (
            <motion.div
              key={row}
              animate={{ scaleX: [0.25, 1, 0.25] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: row * 0.35 }}
              className="h-2.5 origin-left rounded-full bg-gradient-to-r from-blue-400 to-violet-400 motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : variant === 2 ? (
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="h-20 w-20 rounded-full border-2 border-dashed border-violet-400/60 motion-reduce:animate-none"
        />
      ) : (
        <div aria-hidden className="flex items-end gap-1.5">
          {[0, 1, 2, 3, 4].map(bar => (
            <motion.span
              key={bar}
              animate={{ height: [10, 38, 10] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: bar * 0.12 }}
              className="w-2.5 rounded-sm bg-blue-400/80 motion-reduce:animate-none"
            />
          ))}
        </div>
      )}
      <Wand2 className="absolute bottom-3 right-3 h-4 w-4 text-blue-300/70" />
    </div>
  );
}

function VirtualFeedItem({ item, index, metric, onTrack, onToggleLike }: {
  item: FeedItem;
  index: number;
  metric?: CatalogMetrics;
  onTrack: (item: FeedItem, action: 'view' | 'click') => void;
  onToggleLike: (item: FeedItem, liked: boolean) => void;
}) {
  const t = useTranslations('discover');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "300px 0px" });
  const [height, setHeight] = useState<number | null>(null);
  const fallbackMedia = item.kind === 'video' ? FALLBACK_VIDEO : FALLBACK_IMAGE;
  const [mediaSrc, setMediaSrc] = useState<string>(item.imageUrl || fallbackMedia);

  useEffect(() => {
    setMediaSrc(item.imageUrl || fallbackMedia);
  }, [item.imageUrl, fallbackMedia]);

  useEffect(() => {
    if (isInView && containerRef.current) {
      setHeight(containerRef.current.getBoundingClientRect().height);
    }
  }, [isInView]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        onTrack(item, 'view');
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [item, onTrack]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax and 3D effects
  const direction = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [direction * 40, direction * -40]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [direction * 5, 0, direction * -5]);

  const animationDetailsHref = item.detailId || item.id
    ? `/web-animations?id=${encodeURIComponent(String(item.detailId || item.id))}`
    : `/web-animations?q=${encodeURIComponent(item.titleText)}`;

  const href =
    item.kind === 'video'
      ? `/gallery-videos/${item.detailId}`
      : item.kind === 'web'
        ? getDemoHref(item)
        : item.kind === 'animation'
          ? animationDetailsHref
          : `/gallery/${item.detailId}`;
  // For web items, the "Previsualizar" button must go through the Next.js
  // preview wrapper so the purchase button is rendered.
  // For animation items, redirect to the web-animations details page.
  const previewHref =
    item.kind === 'web'
      ? getWebPreviewHref(item)
      : item.kind === 'animation'
        ? animationDetailsHref
        : href;
  const personalizeHref = getPersonalizeHref(item);

  return (
    <div ref={containerRef} style={{ height: (height && !isInView) ? height : 'auto' }} className="mb-4 break-inside-avoid [perspective:1400px]">
      {isInView ? (
        <motion.article
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ y, rotateX, rotateY }}
          whileHover={{ scale: 1.02, rotateY: direction * 2, y: -5 }}
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-xl shadow-black/20 transform-gpu [transform-style:preserve-3d] motion-reduce:transform-none"
        >
          {item.kind === 'video' ? (
            <video src={mediaSrc} muted loop playsInline preload="none" onError={() => { if (mediaSrc !== FALLBACK_VIDEO) setMediaSrc(FALLBACK_VIDEO); }} onMouseEnter={(event) => event.currentTarget.play().catch(() => { })} onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; }} className="aspect-[4/5] w-full bg-zinc-950 object-cover" />
          ) : item.kind === 'animation' ? (
            <AnimationPreview index={index} />
          ) : (
            <div className={`relative w-full overflow-hidden ${index % 3 === 0 ? 'aspect-[4/5]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[16/10]'}`}><OptimizedImage src={mediaSrc} alt={item.titleText} fill lazyAdaptive sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" onError={() => { if (mediaSrc !== FALLBACK_IMAGE) setMediaSrc(FALLBACK_IMAGE); }} className="object-cover transition duration-500 group-hover:scale-[1.03]" /></div>
          )}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">{item.kind}</span><span className="text-[10px] text-zinc-500">{item.tags?.[0]}</span></div>
            <h3 className="line-clamp-2 font-bold leading-snug">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrack(item, 'click')}
                className="inline-flex items-center gap-1.5 transition hover:text-blue-400"
              >
                {item.titleText}
                <MoveUpRight className="h-3.5 w-3.5 shrink-0" />
              </a>
            </h3>
            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
              <button
                type="button"
                aria-label={metric?.likedByMe
                  ? t('removeLike', { title: item.titleText })
                  : t('like', { title: item.titleText })}
                aria-pressed={metric?.likedByMe ?? false}
                onClick={() => onToggleLike(item, metric?.likedByMe ?? false)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 transition ${metric?.likedByMe ? 'border-rose-400/50 bg-rose-500/15 text-rose-300' : 'border-white/10 bg-white/[0.04] hover:border-rose-400/40 hover:text-rose-300'}`}
              >
                <Heart className={`h-4 w-4 ${metric?.likedByMe ? 'fill-current' : ''}`} />
                <span>{metric?.likes ?? 0}</span>
              </button>
              {(metric?.ratingCount ?? 0) > 0 ? (
                <span className="inline-flex items-center gap-1" title={t('verifiedRatings', { count: metric?.ratingCount ?? 0 })}>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {metric?.rating.toFixed(1)}
                </span>
              ) : null}
              <span className="ml-auto inline-flex items-center gap-1" title={t('views')}><Eye className="h-3.5 w-3.5" /> {metric?.views ?? 0}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
              <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-500">
                <Link href={personalizeHref} onClick={() => onTrack(item, 'click')}>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  {t('customize')}
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <a href={previewHref} target="_blank" rel="noopener noreferrer" onClick={() => onTrack(item, 'click')}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  {t('preview')}
                </a>
              </Button>
            </div>
            <AdUnit />
          </div>
        </motion.article>
      ) : null}
    </div>
  );
}

export default function DiscoverClient({
  images,
  videos,
  webPages,
  animations,
}: {
  images: MediaItem[];
  videos: MediaItem[];
  webPages: MediaItem[];
  animations: AnimationItem[];
}) {
  const locale = useLocale();
  const t = useTranslations('discover');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [metrics, setMetrics] = useState<Map<string, CatalogMetrics>>(new Map());
  const [rankingMetrics, setRankingMetrics] = useState<Map<string, CatalogMetrics>>(new Map());
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(
      INITIAL_FEED_ITEMS,
      initialFeedItemCount(images.length + videos.length + webPages.length + animations.length)
    )
  );
  const pageRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, isNearView: shouldLoadMore } = useIntersectionInView({
    kind: 'image',
    once: false,
    rootMargin: '500px',
  });
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 150]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.35], [0, -4]);
  const orbOneY = useTransform(scrollYProgress, [0, 1], [0, 460]);
  const orbTwoY = useTransform(scrollYProgress, [0, 1], [180, -260]);
  const journeySteps = useMemo(() => [
    { label: t('journey.discover'), detail: t('journey.discoverDetail'), icon: Search },
    { label: t('journey.customize'), detail: t('journey.customizeDetail'), icon: Wand2 },
    { label: t('journey.preview'), detail: t('journey.previewDetail'), icon: Eye },
    { label: t('journey.get'), detail: t('journey.getDetail'), icon: Download },
  ], [t]);

  const baseItems = useMemo(() => {
    const imageItems: FeedItem[] =
      // `detailId` viene de la pagina (posicion en el catalogo). El indice del
      // feed solo sirve de respaldo: aqui el orden ya esta filtrado y mezclado.
      images.map((item, index) => {
        const contentId = stableCatalogId(item.detailId, `img-${index + 1}`);
        return { ...item, key: `image-${contentId}`, contentKey: `image:${contentId}`, contentId, editorialIndex: index, kind: 'image' as const, detailId: item.detailId ?? `img-${index + 1}`, titleText: text(item.title, locale), prompt: typeof item.description === 'object' ? text(item.description as LocalizedField, locale) : '' };
      });
    const videoItems: FeedItem[] = videos.map((item, index) => {
      const contentId = stableCatalogId(item.detailId, `v-${index + 1}`);
      return { ...item, key: `video-${contentId}`, contentKey: `video:${contentId}`, contentId, editorialIndex: index, kind: 'video', detailId: item.detailId ?? `v-${index + 1}`, titleText: text(item.title, locale), prompt: text(item.description as LocalizedField, locale) };
    });
    const webReviewIdCounts = new Map<string, number>();
    for (const page of webPages) {
      if (page.id != null) webReviewIdCounts.set(String(page.id), (webReviewIdCounts.get(String(page.id)) ?? 0) + 1);
    }
    const webItems: FeedItem[] = webPages.map((item, index) => {
      const contentId = stableCatalogId(item.demoUrl, `web-${index + 1}`);
      const productId = item.id ? String(item.id) : '';
      // IDs duplicados del JSON no deben mezclar la valoración de productos distintos.
      const reviewProductId = productId && webReviewIdCounts.get(productId) === 1 ? productId : undefined;
      return { ...item, key: `web-${contentId}`, contentKey: `web:${contentId}`, contentId, reviewProductId, editorialIndex: index, kind: 'web', titleText: text(item.title, locale), prompt: text(item.description as LocalizedField, locale) || text(item.title, locale) };
    });
    const animationItems: FeedItem[] = animations.map((item, index) => {
      const contentId = stableCatalogId(item.id, `animation-${index + 1}`);
      return { id: item.id, detailId: String(item.id), key: `animation-${contentId}`, contentKey: `animation:${contentId}`, contentId, editorialIndex: index, kind: 'animation', titleText: text(item.name, locale), prompt: text(item.prompt, locale), tags: ['CSS', 'Motion', 'Interactive'], imageUrl: undefined, demoUrl: undefined };
    });
    return interleaveFeedGroups<FeedItem>([imageItems, videoItems, webItems, animationItems])
      .map((item, editorialIndex) => ({ ...item, editorialIndex }));
  }, [animations, images, locale, videos, webPages]);

  const items = useMemo(() => {
    return rankCatalogItems(baseItems, rankingMetrics).filter((item) => {
      const matchesType = filter === 'all' || item.kind === filter;
      const haystack = `${item.titleText} ${item.tags?.join(' ') || ''}`.toLowerCase();
      return matchesType && haystack.includes(query.toLowerCase());
    });
  }, [baseItems, filter, rankingMetrics, query]);

  useEffect(() => {
    if (!baseItems.length) return;
    const controller = new AbortController();
    const keys = baseItems.map(item => item.contentKey).join(',');
    fetch(`/api/catalog-engagement?${new URLSearchParams({ keys })}`, {
      credentials: 'same-origin', signal: controller.signal,
    })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('metrics unavailable')))
      .then((data: { metrics?: CatalogMetrics[] }) => {
        if (Array.isArray(data.metrics)) {
          const map = new Map(data.metrics.map(metric => [metric.contentKey, metric]));
          setMetrics(map);
          setRankingMetrics(map);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [baseItems]);

  const postEngagement = useCallback(async (item: FeedItem, action: 'view' | 'click' | 'like' | 'unlike') => {
    const response = await fetch('/api/catalog-engagement', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      keepalive: action === 'view' || action === 'click',
      body: JSON.stringify({ action, contentKey: item.contentKey, contentId: item.contentId, kind: item.kind as CatalogKind, reviewProductId: item.reviewProductId }),
    });
    return response.ok ? response.json() : null;
  }, []);

  const track = useCallback((item: FeedItem, action: 'view' | 'click') => {
    const storageKey = `catalog:${action}:${item.contentKey}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
    } catch { /* El evento funciona aunque el navegador bloquee sessionStorage. */ }
    void postEngagement(item, action);
  }, [postEngagement]);

  const toggleLike = useCallback(async (item: FeedItem, currentlyLiked: boolean) => {
    const result = await postEngagement(item, currentlyLiked ? 'unlike' : 'like');
    if (!result) return;
    setMetrics(current => {
      const next = new Map(current);
      const previous = current.get(item.contentKey);
      next.set(item.contentKey, {
        contentKey: item.contentKey,
        views: Number(result.views ?? previous?.views ?? 0), clicks: Number(result.clicks ?? previous?.clicks ?? 0),
        likes: Number(result.likes ?? previous?.likes ?? 0), rating: previous?.rating ?? 0,
        ratingCount: previous?.ratingCount ?? 0, likedByMe: Boolean(result.likedByMe),
      });
      return next;
    });
  }, [postEngagement]);

  useEffect(() => {
    setVisibleCount(initialFeedItemCount(items.length));
  }, [filter, items.length, query]);

  useEffect(() => {
    if (!shouldLoadMore) return;
    setVisibleCount(current => nextFeedItemCount(current, items.length));
  }, [items.length, shouldLoadMore]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMoreItems = visibleItems.length < items.length;

  // Sin esta comprobacion, una web sin `imageUrl` dejaba el destacado sin renderizar.
  const featured = useMemo(() => webPages.find((page) => page.imageUrl) ?? webPages[0], [webPages]);

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-clip bg-[#08090b] text-white [perspective:1400px]">
      <Header />
      <motion.div aria-hidden style={{ y: orbOneY }} className="pointer-events-none fixed -left-40 top-28 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl motion-reduce:hidden" />
      <motion.div aria-hidden style={{ y: orbTwoY }} className="pointer-events-none fixed -right-32 top-1/2 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl motion-reduce:hidden" />
      <main>
        <section className="border-b border-white/10 px-4 py-12 sm:py-16">
          <motion.div style={{ y: heroY, rotateX: heroRotate }} className="mx-auto grid max-w-7xl origin-top gap-8 transform-gpu lg:grid-cols-[1.05fr_.95fr] lg:items-center motion-reduce:transform-none">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-blue-400">Prompt Studio Discover</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">{t('title')}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">{t('subtitle')}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500">
                  <a href="#inspiration-feed">
                    {t('startWithIdea')} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-emerald-400" /> {t('noBlankPage')}
                </p>
              </div>
              <div className="relative mt-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} className="h-14 rounded-xl border-white/15 bg-white/5 pl-12 text-white placeholder:text-zinc-500" />
              </div>
            </motion.div>
            {featured?.imageUrl && (
              <motion.div initial={{ opacity: 0, x: 50, rotateY: -8 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.8 }} whileHover={{ rotateY: -3, rotateX: 2, scale: 1.015 }} className="transform-gpu [transform-style:preserve-3d]">
                <Link href={getDemoHref(featured)} className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-blue-950/30">
                  <OptimizedImage src={featured.imageUrl} alt={text(featured.title, locale)} fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <div><span className="text-xs font-bold uppercase tracking-widest text-blue-400">{t('featuredWeb')}</span><h2 className="mt-1 text-2xl font-black">{text(featured.title, locale)}</h2></div>
                    <MoveUpRight className="h-6 w-6" />
                  </div>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </section>

        <section aria-labelledby="creative-journey-title" className="border-b border-white/10 px-4 py-7">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">{t('journeyLabel')}</p>
                <h2 id="creative-journey-title" className="mt-1 text-xl font-black sm:text-2xl">{t('journeyTitle')}</h2>
              </div>
              <p className="max-w-md text-sm text-zinc-400">{t('journeySubtitle')}</p>
            </div>
            <ol className="grid gap-2 md:grid-cols-4">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.label} className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t('step', { number: index + 1 })}</p>
                      <p className="font-bold">{step.label}</p>
                      <p className="text-xs text-zinc-500">{step.detail}</p>
                    </div>
                    {index < journeySteps.length - 1 ? <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-blue-500 md:block" aria-hidden="true" /> : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="sticky top-0 z-20 border-b border-white/10 bg-[#08090b]/90 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {([
              ['all', t('filters.all'), Sparkles],
              ['image', t('filters.images'), ImageIcon],
              ['video', t('filters.videos'), Video],
              ['web', 'Webs', Globe],
              ['animation', t('filters.animations'), Wand2],
            ] as const).map(([value, label, Icon]) => (
              <Button key={value} type="button" variant="ghost" onClick={() => setFilter(value)} className={`shrink-0 gap-2 rounded-full border px-5 ${filter === value ? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-600' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>
        </section>

        <section id="inspiration-feed" className="scroll-mt-24 px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">{t('feedStep')}</p><h2 className="mt-1 text-3xl font-black">{t('feedTitle')}</h2></div><span className="text-sm text-zinc-500">{t('results', { count: items.length })}</span></div>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">

              {visibleItems.map((item, index) => (
                <VirtualFeedItem
                  key={item.key}
                  item={item}
                  index={index}
                  metric={metrics.get(item.contentKey)}
                  onTrack={track}
                  onToggleLike={toggleLike}
                />
              ))}

            </div>
            {hasMoreItems ? (
              <div
                ref={loadMoreRef as React.RefObject<HTMLDivElement>}
                className="mt-8 flex min-h-16 items-center justify-center"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setVisibleCount(current => nextFeedItemCount(current, items.length))}
                >
                  {t('loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
