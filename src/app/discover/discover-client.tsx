'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, Wand2, Globe, Image as ImageIcon, Video, MoveUpRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { getRefactoryLoaderUrl } from '@/lib/refactory-online';

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
};
type AnimationItem = { id: number; name: Localized; prompt: Localized };
type Filter = 'all' | 'image' | 'video' | 'web' | 'animation';

const text = (value?: Localized) => value?.es || value?.en || '';

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

function VirtualFeedItem({ item, index }: { item: any, index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "1500px 0px" });
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (isInView && containerRef.current) {
      setHeight(containerRef.current.getBoundingClientRect().height);
    }
  }, [isInView]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax and 3D effects
  const direction = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [direction * 40, direction * -40]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [direction * 5, 0, direction * -5]);

  const href =
    item.kind === 'video'
      ? `/gallery-videos/${item.detailId}`
      : item.kind === 'web'
        ? getDemoHref(item)
        : item.kind === 'animation'
          ? `/generate-webs?prompt=${encodeURIComponent(item.prompt)}`
          : `/gallery/${item.detailId}`;

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
          {item.kind === 'video' && item.imageUrl ? (
            <video src={item.imageUrl} muted loop playsInline preload="metadata" onMouseEnter={(event) => event.currentTarget.play().catch(() => {})} onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; }} className="aspect-[4/5] w-full object-cover" />
          ) : item.imageUrl ? (
            <img src={item.imageUrl} alt={item.titleText} loading="lazy" className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${index % 3 === 0 ? 'aspect-[4/5]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[16/10]'}`} />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,.35),transparent_35%),linear-gradient(135deg,#171923,#090a0d)]"><Wand2 className="h-12 w-12 text-blue-400" /></div>
          )}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">{item.kind}</span><span className="text-[10px] text-zinc-500">{item.tags?.[0]}</span></div>
            <h3 className="line-clamp-2 font-bold leading-snug">{item.titleText}</h3>
            <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 transition hover:text-blue-400">Usar prompt <MoveUpRight className="h-3.5 w-3.5" /></a>
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
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 150]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.35], [0, -4]);
  const orbOneY = useTransform(scrollYProgress, [0, 1], [0, 460]);
  const orbTwoY = useTransform(scrollYProgress, [0, 1], [180, -260]);

  const items = useMemo(() => {
    const normalized = [
      ...images.map((item, index) => ({ ...item, key: `image-${item.id ?? item.randomId ?? index}`, kind: 'image' as const, detailId: `img-${index + 1}`, titleText: text(item.title), prompt: typeof item.description === 'object' ? text(item.description as Localized) : '' })),
      ...videos.map((item, index) => ({ ...item, key: `video-${item.randomId ?? index}`, kind: 'video' as const, detailId: `v-${index + 1}`, titleText: text(item.title), prompt: text(item.description as Localized) })),
      ...webPages.map((item, index) => ({ ...item, key: `web-${item.id ?? index}`, kind: 'web' as const, titleText: text(item.title), prompt: JSON.stringify(item) })),
      ...animations.map((item) => ({ key: `animation-${item.id}`, kind: 'animation' as const, titleText: text(item.name), prompt: text(item.prompt), tags: ['CSS', 'Motion', 'Interactive'], imageUrl: undefined, demoUrl: undefined })),
    ];
    return normalized.filter((item) => {
      const matchesType = filter === 'all' || item.kind === filter;
      const haystack = `${item.titleText} ${item.tags?.join(' ') || ''}`.toLowerCase();
      return matchesType && haystack.includes(query.toLowerCase());
    });
  }, [animations, filter, images, query, videos, webPages]);

  const featured = webPages[0];

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
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Descubre lo que puedes crear con IA.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">Imágenes, videos, experiencias web y animaciones seleccionadas desde nuestros catálogos reales.</p>
              <div className="relative mt-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ideas, estilos o tecnologías..." className="h-14 rounded-xl border-white/15 bg-white/5 pl-12 text-white placeholder:text-zinc-500" />
              </div>
            </motion.div>
            {featured && (
              <motion.div initial={{ opacity: 0, x: 50, rotateY: -8 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.8 }} whileHover={{ rotateY: -3, rotateX: 2, scale: 1.015 }} className="transform-gpu [transform-style:preserve-3d]">
              <Link href={getDemoHref(featured)} className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-blue-950/30">
                <img src={featured.imageUrl} alt={text(featured.title)} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div><span className="text-xs font-bold uppercase tracking-widest text-blue-400">Web destacada</span><h2 className="mt-1 text-2xl font-black">{text(featured.title)}</h2></div>
                  <MoveUpRight className="h-6 w-6" />
                </div>
              </Link>
              </motion.div>
            )}
          </motion.div>
        </section>

        <section className="sticky top-0 z-20 border-b border-white/10 bg-[#08090b]/90 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {([
              ['all', 'Todo', Sparkles],
              ['image', 'Imágenes', ImageIcon],
              ['video', 'Videos', Video],
              ['web', 'Webs', Globe],
              ['animation', 'Animaciones', Wand2],
            ] as const).map(([value, label, Icon]) => (
              <Button key={value} type="button" variant="ghost" onClick={() => setFilter(value)} className={`shrink-0 gap-2 rounded-full border px-5 ${filter === value ? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-600' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>
        </section>

        <section className="px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">Selección creativa</p><h2 className="mt-1 text-3xl font-black">Explora el feed</h2></div><span className="text-sm text-zinc-500">{items.length} resultados</span></div>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              
              {items.map((item, index) => (
                <VirtualFeedItem key={item.key} item={item} index={index} />
              ))}

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
