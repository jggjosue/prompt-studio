'use client';

import { Button } from '@/components/ui/button';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  DollarSign,
  FileText,
  Gift,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  MousePointerClick,
  Play,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ChangeEvent, type FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import {
  AFFILIATE_COMMISSION_PERCENT,
  AFFILIATE_FIRST_REF_STORAGE_KEY,
  AFFILIATE_OWNER_STORAGE_KEY,
  AFFILIATE_REF_STORAGE_KEY,
} from '@/lib/affiliate';

type ModalContent = {
  title: string;
  body: string;
  items?: string[];
};

type FormState = {
  name: string;
  email: string;
  profile: string;
  audience: string;
  channel: string;
  experience: string;
  plan: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionHeader({
  id,
  title,
  subtitle,
  align = 'center',
}: {
  id?: string;
  title: string;
  subtitle: string;
  align?: 'center' | 'left';
}) {
  return (
    <div
      id={id}
      className={'mx-auto mb-14 max-w-3xl scroll-mt-28 ' + (align === 'center' ? 'text-center' : 'text-left')}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
        {subtitle}
      </p>
    </div>
  );
}

function GlowCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className={'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ' + className}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
        <div className="absolute -right-24 top-8 h-24 w-72 -rotate-12 bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent blur-2xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function ParallaxSection({
  children,
  className = '',
  tone = 'cyan',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'cyan' | 'blue' | 'amber';
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const railY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-70, 70]);
  const gridY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [46, -46]);
  const shimmerX = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-18%', '18%']);

  const toneClass = {
    cyan: 'from-cyan-300/20 via-transparent to-cyan-300/10',
    blue: 'from-blue-500/20 via-transparent to-blue-500/10',
    amber: 'from-amber-200/18 via-transparent to-amber-200/10',
  }[tone];

  return (
    <section ref={ref} className={'relative overflow-hidden px-6 py-24 md:py-36 ' + className}>
      <motion.div
        style={{ y: gridY }}
        className="pointer-events-none absolute inset-x-0 top-10 h-[82%] opacity-[0.18]"
      >
        <div className="h-full bg-[linear-gradient(rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]" />
      </motion.div>
      <motion.div
        style={{ y: railY, x: shimmerX }}
        className={'pointer-events-none absolute left-1/2 top-0 h-full w-[min(80rem,92vw)] -translate-x-1/2 bg-gradient-to-br ' + toneClass + ' opacity-60 blur-2xl'}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function ParallaxFloat({
  children,
  className = '',
  distance = 70,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [distance, -distance]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-2, 2]);

  return (
    <motion.div ref={ref} style={{ y, rotate }} className={className}>
      {children}
    </motion.div>
  );
}

function EarningsSimulator() {
  const plans = [
    { id: 'creator', name: 'Creator', monthly: 9, annual: 90, accent: 'text-cyan-300' },
    { id: 'premium', name: 'Premium', monthly: 15, annual: 150, accent: 'text-emerald-300' },
    { id: 'pro', name: 'Pro', monthly: 19, annual: 190, accent: 'text-blue-300' },
    { id: 'studio', name: 'Studio', monthly: 39, annual: 390, accent: 'text-violet-300' },
  ] as const;
  const [users, setUsers] = useState(10);
  const [planId, setPlanId] = useState<(typeof plans)[number]['id']>('creator');
  const [annual, setAnnual] = useState(false);
  const plan = plans.find(item => item.id === planId) ?? plans[0];
  const price = annual ? plan.annual : plan.monthly;
  const commission = Math.round(price * (AFFILIATE_COMMISSION_PERCENT / 100) * 100) / 100;
  const monthlyTotal = Math.round(users * commission * 100) / 100;
  const annualTotal = Math.round(monthlyTotal * (annual ? 1 : 12) * 100) / 100;
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <GlowCard className="mx-auto mt-12 max-w-6xl overflow-visible border-cyan-300/20 bg-slate-950/55 p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Calculadora interactiva</p>
              <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Descubre tu potencial</h3>
            </div>
          </div>
          <p className="mb-7 max-w-xl leading-7 text-slate-300">Simula cuánto podrías ganar según el número de usuarios que refieras y el programa que elijan.</p>

          <label className="block text-sm font-semibold text-white" htmlFor="affiliate-users">Usuarios referidos</label>
          <div className="mt-3 flex items-center gap-4">
            <input id="affiliate-users" type="range" min="1" max="500" step="1" value={users} onChange={event => setUsers(Number(event.target.value))} className="h-2 w-full accent-cyan-300" />
            <input aria-label="Número de usuarios referidos" type="number" min="1" max="500" value={users} onChange={event => setUsers(Math.max(1, Math.min(500, Number(event.target.value) || 1)))} className="w-24 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center font-bold text-white outline-none focus:border-cyan-300" />
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map(item => (
              <button key={item.id} type="button" onClick={() => setPlanId(item.id)} className={`rounded-2xl border p-4 text-left transition ${planId === item.id ? 'border-cyan-300 bg-cyan-300/10 shadow-[0_0_24px_rgba(103,232,249,0.12)]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}>
                <span className={`block text-sm font-bold ${item.accent}`}>{item.name}</span>
                <span className="mt-1 block text-xs text-slate-400">${item.monthly}/mes · ${item.annual}/año</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex w-full max-w-sm rounded-full border border-white/15 bg-white/[0.04] p-1">
            {([false, true] as const).map(value => (
              <button key={String(value)} type="button" onClick={() => setAnnual(value)} className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${annual === value ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:text-white'}`}>
                {value ? 'Plan anual' : 'Plan mensual'}
              </button>
            ))}
          </div>
        </div>

        <motion.div key={`${planId}-${annual}-${users}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-blue-500/10 to-violet-500/10 p-6 sm:p-8">
          <p className="text-sm text-slate-300">Con {users} {users === 1 ? 'usuario referido' : 'usuarios referidos'} en {plan.name}</p>
          <p className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">{formatter.format(monthlyTotal)}</p>
          <p className="mt-2 text-sm text-cyan-200">{annual ? 'por año' : 'por mes'} en comisiones estimadas</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs text-slate-400">Por usuario</p><p className="mt-1 text-xl font-bold text-white">{formatter.format(commission)}</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs text-slate-400">Proyección anual</p><p className="mt-1 text-xl font-bold text-white">{formatter.format(annualTotal)}</p></div>
          </div>
          <p className="mt-6 text-xs leading-5 text-slate-400">Estimación basada en una comisión del {AFFILIATE_COMMISSION_PERCENT}%. Las comisiones reales dependen de ventas calificadas, pagos completados y posibles reembolsos.</p>
        </motion.div>
      </div>
    </GlowCard>
  );
}

function CounterMetric({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 42;
    const tick = () => {
      frame += 1;
      setDisplay(Math.round((value * frame) / total));
      if (frame < total) requestAnimationFrame(tick);
    };
    tick();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function HeroCanvas() {
  const t = useTranslations('affiliate.canvas');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let tVal = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawPanel = (x: number, y: number, w: number, h: number, title: string, color: string) => {
      roundedRect(x, y, w, h, 22);
      ctx.fillStyle = 'rgba(9, 20, 36, 0.82)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 229, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '700 13px Inter, system-ui, sans-serif';
      ctx.fillText(title, x + 22, y + 28);
    };

    const render = () => {
      tVal += 0.012;
      ctx.clearRect(0, 0, width, height);

      const scroll = Math.min(window.scrollY / 900, 1);
      const cx = width / 2;
      const cy = height / 2 + Math.sin(tVal) * 8 - scroll * 28;

      const bg = ctx.createRadialGradient(cx, cy, 60, cx, cy, width * 0.68);
      bg.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
      bg.addColorStop(0.42, 'rgba(34, 211, 238, 0.12)');
      bg.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(tVal * 0.7) * 0.035);

      const bookW = Math.min(width * 0.28, 190);
      const bookH = bookW * 1.32;
      const bookX = -bookW * 0.62;
      const bookY = -bookH * 0.5;
      roundedRect(bookX, bookY, bookW, bookH, 24);
      const cover = ctx.createLinearGradient(bookX, bookY, bookX + bookW, bookY + bookH);
      cover.addColorStop(0, '#0f766e');
      cover.addColorStop(0.45, '#0ea5e9');
      cover.addColorStop(1, '#111827');
      ctx.fillStyle = cover;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '800 18px Inter, system-ui, sans-serif';
      ctx.fillText('DIGITAL', bookX + 24, bookY + 60);
      ctx.fillText('GROWTH', bookX + 24, bookY + 86);
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(219,244,255,0.82)';
      ctx.fillText('PLAYBOOK', bookX + 24, bookY + 116);
      ctx.fillStyle = 'rgba(250,204,21,0.95)';
      ctx.beginPath();
      ctx.arc(bookX + bookW - 38, bookY + 40, 16 + Math.sin(tVal) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#08111f';
      ctx.font = '800 11px Inter';
      ctx.fillText('20$', bookX + bookW - 50, bookY + 44);

      ctx.restore();

      drawPanel(width * 0.05, height * 0.2 + Math.sin(tVal * 1.2) * 10, 170, 96, 'Referral link', '#67e8f9');
      ctx.fillStyle = 'rgba(148, 163, 184, 0.72)';
      ctx.font = '500 11px Inter';
      ctx.fillText('share.link/go/partner', width * 0.05 + 22, height * 0.2 + 58 + Math.sin(tVal * 1.2) * 10);

      drawPanel(width * 0.62, height * 0.18 + Math.cos(tVal) * 12, 190, 126, 'Sales dashboard', '#34d399');
      for (let i = 0; i < 5; i += 1) {
        const barH = 16 + Math.sin(tVal + i) * 7 + i * 9;
        ctx.fillStyle = i % 2 ? 'rgba(34,211,238,0.7)' : 'rgba(52,211,153,0.8)';
        roundedRect(width * 0.62 + 24 + i * 29, height * 0.18 + 100 - barH + Math.cos(tVal) * 12, 14, barH, 6);
        ctx.fill();
      }

      drawPanel(width * 0.15, height * 0.66 + Math.cos(tVal * 1.1) * 9, 160, 82, 'Commission', '#facc15');
      ctx.fillStyle = '#86efac';
      ctx.font = '800 25px Inter';
      ctx.fillText('+$384', width * 0.15 + 22, height * 0.66 + 60 + Math.cos(tVal * 1.1) * 9);

      ctx.strokeStyle = 'rgba(103,232,249,0.28)';
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.27, height * 0.28);
      ctx.quadraticCurveTo(cx, cy - 80, width * 0.62, height * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width * 0.62, height * 0.34);
      ctx.quadraticCurveTo(cx, cy + 110, width * 0.28, height * 0.7);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 28; i += 1) {
        const px = (Math.sin(tVal * 0.45 + i * 8.1) * 0.5 + 0.5) * width;
        const py = (Math.cos(tVal * 0.35 + i * 5.7) * 0.5 + 0.5) * height;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(52,211,153,0.5)' : 'rgba(125,211,252,0.38)';
        ctx.beginPath();
        ctx.arc(px, py, i % 3 === 0 ? 2.2 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 shadow-[0_40px_140px_rgba(8,47,73,0.45)]">
      <canvas ref={canvasRef} className="h-full min-h-[460px] w-full" aria-label={t('ariaLabel')} />
      <div className="pointer-events-none absolute inset-x-8 bottom-8 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-200">
          <span className="inline-flex items-center gap-2">
            <Copy className="h-4 w-4 text-cyan-300" />
            {t('share')}
          </span>
          <ArrowRight className="h-4 w-4 text-slate-500" />
          <span className="inline-flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-blue-400" />
            {t('sale')}
          </span>
          <ArrowRight className="h-4 w-4 text-slate-500" />
          <span className="inline-flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-300" />
            {t('commission')}
          </span>
        </div>
      </div>
    </div>
  );
}

function Modal({
  content,
  onClose,
  gotItLabel,
}: {
  content: ModalContent | null;
  onClose: () => void;
  gotItLabel: string;
}) {
  if (!content) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-slate-950 p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-white">{content.title}</h3>
            <p className="mt-4 leading-7 text-slate-300">{content.body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {content.items ? (
          <ul className="mt-6 space-y-3">
            {content.items.map(item => (
              <li key={item} className="flex gap-3 text-sm text-slate-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <Button onClick={onClose} className="mt-8 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
          {gotItLabel}
        </Button>
      </motion.div>
    </div>
  );
}

export default function AffiliateClient() {
  const t = useTranslations('affiliate');
  const [, setAffiliateRef] = useState<string | null>(null);
  const apply = t.raw('apply') as {
    title: string;
    subtitle: string;
    fieldName: string;
    fieldEmail: string;
    fieldProfile: string;
    fieldAudience: string;
    fieldChannel: string;
    fieldExperience: string;
    fieldPlan: string;
    fieldMessage: string;
    submitBtn: string;
    submitting: string;
    successMsg: string;
    errorRequired: string;
    errorEmail: string;
  };

  // Build modal content from translations
  const modalCopy = useMemo(() => ({
    product: {
      title: t('modal.productTitle'),
      body: t('modal.productBody'),
      items: (t.raw('modal.productItems') as string[]),
    },
    dashboard: {
      title: t('modal.dashboardTitle'),
      body: t('modal.dashboardBody'),
      items: (t.raw('modal.dashboardItems') as string[]),
    },
    tracking: {
      title: t('modal.trackingTitle'),
      body: t('modal.trackingBody'),
      items: (t.raw('modal.trackingItems') as string[]),
    },
    guidelines: {
      title: t('modal.guidelinesTitle'),
      body: t('modal.guidelinesBody'),
      items: (t.raw('modal.guidelinesItems') as string[]),
    },
  }), [t]);

  const tier2Name = t('commissions.tier2Name');
  const tier3Name = t('commissions.tier3Name');

  // Beneficios y recursos se mantienen traducidos para que el contenido comercial sea consistente en toda la página.
  const benefits = useMemo(() => [
    [t('benefits.easy.title'), t('benefits.easy.desc'), BookOpen],
    [t('benefits.commission.title'), t('benefits.commission.desc'), DollarSign],
    [t('benefits.link.title'), t('benefits.link.desc'), LinkIcon],
    [t('benefits.assets.title'), t('benefits.assets.desc'), Gift],
    [t('benefits.payouts.title'), t('benefits.payouts.desc'), ShieldCheck],
    [t('benefits.dashboard.title'), t('benefits.dashboard.desc'), LayoutDashboard],
  ], [t]);

  const resourceItems = t.raw('resources.items') as { title: string; desc: string }[];
  const resourceIcons = [Mail, MessageSquare, LayoutDashboard, Play, FileText, MousePointerClick, BookOpen, BarChart3];

  const audienceItems = t.raw('audiences.items') as { title: string; desc: string }[];
  const audienceIcons = [Users, FileText, Play, Mail, GraduationCap, BookOpen, Globe2, TrendingUp];

  const promotionItems = t.raw('promotion.items') as { title: string; difficulty: string; potential: string; example: string }[];

  const trustItems = t.raw('trust.items') as string[];

  const testimonialItems = t.raw('testimonials.items') as { quote: string; name: string; role: string }[];

  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  // Esta mini tabla resume la oferta del plan actual; la primera fila se reemplaza por la comisión del tier seleccionado.

  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] });
  const reduceMotion = useReducedMotion();
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const bgScale = useTransform(scrollYProgress, [0, 0.45, 1], [1, 1.06, 1.12]);
  const railY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-120, 140]);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroTextY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, -90]);
  const heroVisualY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, 120]);
  const heroRibbonY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, -180]);
  const heroRibbonX = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, 80]);
  const heroCanvasScale = useTransform(heroProgress, [0, 1], reduceMotion ? [1, 1] : [1, 0.94]);

  const [modal, setModal] = useState<ModalContent | null>(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    profile: '',
    audience: '',
    channel: '',
    experience: '',
    plan: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref')?.trim();
    if (!ref) return;
    setAffiliateRef(ref);
    localStorage.setItem(AFFILIATE_REF_STORAGE_KEY, ref);
    localStorage.setItem(AFFILIATE_OWNER_STORAGE_KEY, ref);
    if (!localStorage.getItem(AFFILIATE_FIRST_REF_STORAGE_KEY)) {
      localStorage.setItem(AFFILIATE_FIRST_REF_STORAGE_KEY, ref);
    }
  }, []);

  const trackAffiliateInterest = (_source: string) => {
    // Removed Loops event
  };

  const metricsData = [
    { label: t('metrics.commission'), value: AFFILIATE_COMMISSION_PERCENT, suffix: t('metrics.suffixCommission'), Icon: DollarSign },
    { label: t('metrics.cookie'), value: 60, suffix: t('metrics.suffixCookie'), Icon: MousePointerClick },
    { label: t('metrics.product'), value: 1, suffix: t('metrics.suffixProduct'), Icon: BookOpen },
    { label: t('metrics.payouts'), value: 12, suffix: t('metrics.suffixPayouts'), Icon: TrendingUp },
  ];

  const stepsData = [
    { num: '01', title: t('steps.s1Title'), text: t('steps.s1Desc') },
    { num: '02', title: t('steps.s2Title'), text: t('steps.s2Desc') },
    { num: '03', title: t('steps.s3Title'), text: t('steps.s3Desc') },
    { num: '04', title: t('steps.s4Title'), text: t('steps.s4Desc') },
  ];

  // Cada tarjeta de tier usa el mismo esquema: nombre, porcentaje y descripción de negocio.
  const tiersData = [
    { name: t('commissions.tier1Name'), rate: t('commissions.tier1Rate'), desc: t('commissions.tier1Desc') },
    { name: tier2Name, rate: t('commissions.tier2Rate'), desc: t('commissions.tier2Desc') },
    { name: tier3Name, rate: t('commissions.tier3Rate'), desc: t('commissions.tier3Desc') },
  ];

  /**
   * Vista de EJEMPLO del panel, no resultados del programa.
   *
   * Estas cifras son inventadas. Se muestran para que un candidato entienda qué
   * verá en su panel, y por eso van bajo una etiqueta explícita: presentarlas
   * sin ella equivale a afirmar que el programa ha pagado 18 940 dólares y
   * convierte al 7,8 %, lo que no es cierto.
   *
   * Mismo criterio que `product-social-proof.ts`, cuyo registro se mantiene
   * vacío con la nota «mantener vacío es preferible a mostrar datos de ejemplo».
   */
  const trackingStats = [
    [t('tracking.clicks'), '8,420'],
    [t('tracking.conversion'), '7.8%'],
    [t('tracking.sales'), '312'],
    [t('tracking.pending'), '$4,180'],
    [t('tracking.paid'), '$18,940'],
    [t('tracking.topSource'), t('tracking.topSourceValue')],
  ];

  const handleApplyChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setFormState(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (formStatus.type === 'error') {
      setFormStatus({ type: 'idle', message: '' });
    }
  };

  const submitAffiliateApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requiredFields: (keyof FormState)[] = [
      'name',
      'email',
      'profile',
      'audience',
      'channel',
      'experience',
      'plan',
      'message',
    ];
    const errors: FormErrors = {};

    for (const field of requiredFields) {
      if (!formState[field].trim()) {
        errors[field] = apply.errorRequired;
      }
    }

    if (formState.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = apply.errorEmail;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormStatus({ type: 'error', message: apply.errorRequired });
      const firstInvalidField = requiredFields.find(field => errors[field]);
      if (firstInvalidField) {
        document.getElementById(`affiliate-${firstInvalidField}`)?.focus();
      }
      return;
    }

    setFormErrors({});
    setFormStatus({ type: 'loading', message: '' });

    try {
      const response = await fetch('/api/affiliate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formState.name,
          email: formState.email,
          profile: formState.profile,
          audience: formState.audience,
          channel: formState.channel,
          experience: formState.experience,
          plan: formState.plan,
          message: formState.message,
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo enviar la solicitud.');
      }

      setFormStatus({ type: 'success', message: apply.successMsg });
      setFormErrors({});
      setFormState({
        name: '',
        email: '',
        profile: '',
        audience: '',
        channel: '',
        experience: '',
        plan: '',
        message: '',
      });
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo enviar la solicitud.',
      });
    }
  };

  const applyFieldClass = (field: keyof FormState, multiline = false) =>
    `${multiline ? 'rounded-3xl px-4 py-4' : 'h-12 rounded-2xl px-4'} border bg-slate-950/70 text-white outline-none transition ${
      formErrors[field]
        ? 'border-rose-400/70 focus:border-rose-300 focus:ring-2 focus:ring-rose-400/15'
        : 'border-white/10 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10'
    }`;

  const fieldError = (field: keyof FormState) =>
    formErrors[field] ? (
      <span id={`affiliate-${field}-error`} className="text-xs font-medium text-rose-300" role="alert">
        {formErrors[field]}
      </span>
    ) : null;

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#020816] text-white">
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#020816_0%,#07111f_44%,#030712_100%)]"
      />
      <motion.div
        style={{ y: railY }}
        className="pointer-events-none fixed left-1/2 top-0 z-0 h-[140vh] w-[min(72rem,100vw)] -translate-x-1/2 opacity-30 [mask-image:linear-gradient(180deg,transparent,black_16%,black_82%,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(115deg,transparent_0%,rgba(34,211,238,0.13)_18%,transparent_34%,transparent_54%,rgba(52,211,153,0.12)_70%,transparent_86%)]" />
      </motion.div>

      <main id="top" className="relative z-10 scroll-mt-0">
        {/* Hero */}
        <section ref={heroRef} className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-28 lg:pt-36">
          <motion.div
            style={{ y: heroRibbonY, x: heroRibbonX }}
            className="pointer-events-none absolute left-[-8rem] top-24 hidden h-56 w-[34rem] rotate-[-14deg] rounded-full border border-cyan-200/15 bg-cyan-300/5 blur-sm lg:block"
          />
          <motion.div
            style={{ y: heroVisualY }}
            className="pointer-events-none absolute bottom-12 right-8 hidden h-40 w-[28rem] rotate-[18deg] rounded-full border border-blue-500/15 bg-blue-500/5 blur-sm lg:block"
          />
          <motion.div
            style={{ y: heroTextY }}
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {t('hero.title')}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-9 text-slate-300">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button
                onClick={() => {
                  trackAffiliateInterest('hero-cta-affiliate');
                  scrollToSection('commissions');
                }}
                className="h-14 rounded-full bg-blue-600 px-8 text-base font-semibold text-slate-950 shadow-[0_0_36px_rgba(37,99,235,0.22)] hover:bg-blue-500 text-white"
              >
                {t('hero.ctaAffiliate')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => {
                  trackAffiliateInterest('hero-cta-commissions');
                  scrollToSection('commissions');
                }}
                variant="outline"
                className="h-14 rounded-full border-white/15 bg-white/5 px-8 text-base text-white hover:bg-white/10"
              >
                {t('hero.ctaCommissions')}
              </Button>
              <Button
                onClick={() => {
                  trackAffiliateInterest('hero-cta-how-it-works');
                  scrollToSection('steps');
                }}
                variant="ghost"
                className="h-14 rounded-full px-8 text-base text-cyan-200 hover:bg-cyan-300/10 hover:text-cyan-100"
              >
                {t('hero.ctaHowItWorks')}
              </Button>
            </div>
          </motion.div>
          <motion.div
            style={{ y: heroVisualY, scale: heroCanvasScale }}
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.15 }}
          >
            <HeroCanvas />
          </motion.div>
        </section>

        {/* Metrics */}
        <ParallaxSection className="py-24 md:py-32" tone="blue">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metricsData.map(({ label, value, suffix, Icon }, index) => (
              <ParallaxFloat key={label} distance={15 + index * 10} className="h-full">
                <GlowCard className="h-full">
                  <Icon className="mb-8 h-8 w-8 text-cyan-300" />
                  <p className="text-4xl font-semibold text-white">
                    <CounterMetric value={value} suffix={suffix} />
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{label}</p>
                </GlowCard>
              </ParallaxFloat>
            ))}
          </div>
        </ParallaxSection>

        {/* Benefits */}
        <ParallaxSection tone="cyan">
          <SectionHeader
            id="program"
            title={t('benefits.title')}
            subtitle={t('benefits.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(([title, text, Icon], index) => (
              <motion.div
                key={title as string}
                initial={{ opacity: 0, y: 34, rotateX: -8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="h-full"
              >
                <ParallaxFloat distance={15 + (index % 3) * 15} className="h-full">
                  <GlowCard className="h-full p-8">
                    <Icon className="mb-8 h-8 w-8 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">{title as string}</h3>
                    <p className="mt-4 leading-7 text-slate-300">{text as string}</p>
                  </GlowCard>
                </ParallaxFloat>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* Product */}
        <ParallaxSection tone="blue">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeader
                title={t('product.title')}
                subtitle={t('product.subtitle')}
                align="left"
              />
              <div className="space-y-5 text-slate-300">
                {(['benefit1', 'benefit2', 'benefit3', 'benefit4'] as const).map(key => (
                  <p key={key} className="flex gap-3 leading-7">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-blue-400" />
                    {t(`product.${key}`)}
                  </p>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={() => {
                    trackAffiliateInterest('product-preview');
                    setModal(modalCopy.product);
                  }}
                  className="h-14 rounded-full bg-cyan-400 px-7 text-slate-950 hover:bg-cyan-300"
                >
                  {t('product.ctaPreview')}
                </Button>
                <Button
                  onClick={() => {
                    trackAffiliateInterest('product-link');
                    scrollToSection('commissions');
                  }}
                  variant="outline"
                  className="h-14 rounded-full border-white/15 bg-white/5 px-7 text-white hover:bg-white/10"
                >
                  {t('product.ctaLink')}
                </Button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 42, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              className="relative min-h-[520px]"
            >
              <ParallaxFloat distance={95} className="absolute left-4 top-16 h-72 w-48 rotate-[-8deg] rounded-[1.75rem] border border-cyan-200/25 bg-gradient-to-br from-cyan-400 via-blue-500 to-slate-950 p-7 shadow-[0_36px_100px_rgba(34,211,238,0.22)]">
                <p className="text-sm font-bold text-slate-950">{t('product.ebookLabel')}</p>
                <p className="mt-10 text-3xl font-black text-white">{t('product.ebookTitle')}</p>
              </ParallaxFloat>
              <ParallaxFloat distance={55} className="absolute right-0 top-6 w-72 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <LayoutDashboard className="mb-8 h-8 w-8 text-cyan-300" />
                <p className="text-sm text-slate-300">{t('product.dashboardLabel')}</p>
                <div className="mt-5 space-y-3">
                  {[82, 64, 92].map((width, index) => (
                    <div key={width} className="h-3 rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: width + '%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: index * 0.15 }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </ParallaxFloat>
              <ParallaxFloat distance={120} className="absolute bottom-14 right-14 rounded-3xl border border-amber-200/20 bg-amber-300/10 p-6 backdrop-blur-xl">
                <Star className="mb-4 h-7 w-7 text-amber-200" />
                <p className="text-2xl font-bold text-white">{t('product.templatesTitle')}</p>
                <p className="mt-2 text-sm text-slate-300">{t('product.templatesDesc')}</p>
              </ParallaxFloat>
            </motion.div>
          </div>
        </ParallaxSection>

        {/* Steps */}
        <ParallaxSection tone="cyan">
          <SectionHeader
            id="steps"
            title={t('steps.title')}
            subtitle={t('steps.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-4">
            {stepsData.map(({ num, title, text }, index) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 50, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="relative"
              >
                <GlowCard className="h-full min-h-72 p-8">
                  <p className="text-5xl font-black text-cyan-300/30">{num}</p>
                  <h3 className="mt-10 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-5 leading-7 text-slate-300">{text}</p>
                </GlowCard>
                {index < 3 ? (
                  <div className="absolute left-[calc(100%-0.5rem)] top-1/2 hidden h-px w-8 bg-gradient-to-r from-cyan-300/60 to-transparent lg:block" />
                ) : null}
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* Commissions */}
        <ParallaxSection tone="blue">
          <SectionHeader
            id="commissions"
            title={t('commissions.title')}
            subtitle={t('commissions.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            {tiersData.map(({ name, rate, desc }, index) => (
              <ParallaxFloat key={name} distance={20 + index * 15} className="h-full">
                <GlowCard className="p-8 h-full">
                  {/* Nombre del plan de afiliado, por ejemplo Startup, para que el usuario identifique el tier al instante. */}
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">{name}</p>
                  {/* Porcentaje principal de comisión que destaca visualmente dentro de la tarjeta. */}
                  <p className="mt-8 text-6xl font-semibold text-blue-400">{rate}</p>
                  {/* Descripción corta del perfil ideal para este nivel de afiliado. */}
                  <p className="mt-5 min-h-16 leading-7 text-slate-300">{desc}</p>
                  {/* Lista de beneficios comunes para mantener el mensaje comercial consistente entre tiers. */}
                  <ul className="mt-8 space-y-3 text-sm text-slate-300">
                    {[
                      t('commissions.featureQualified'),
                      t('commissions.featurePayout'),
                      t('commissions.featureCookie'),
                      t('commissions.featureResources'),
                    ].map(item => (
                      <li key={item} className="flex gap-3">
                        <Check className="h-4 w-4 text-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlowCard>
              </ParallaxFloat>
            ))}
          </div>
          <EarningsSimulator />
        </ParallaxSection>

        {/* Tracking */}
        <ParallaxSection tone="cyan">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeader
                title={t('tracking.title')}
                subtitle={t('tracking.subtitle')}
                align="left"
              />
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={() => { trackAffiliateInterest('tracking-dashboard'); setModal(modalCopy.dashboard); }} className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  {t('tracking.ctaDashboard')}
                </Button>
                <Button onClick={() => { trackAffiliateInterest('tracking-metrics'); setModal(modalCopy.tracking); }} variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  {t('tracking.ctaTracking')}
                </Button>
              </div>
            </div>
            <ParallaxFloat distance={80}>
              <GlowCard className="p-7">
                <p className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">
                  {t('tracking.sampleBadge')}
                </p>
                <p className="mb-5 text-sm text-slate-400">{t('tracking.sampleNote')}</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  {trackingStats.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex h-48 items-end gap-4 rounded-3xl border border-white/10 bg-slate-950/45 p-6">
                  {[44, 66, 52, 88, 74, 98, 82].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      whileInView={{ height: height + '%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: index * 0.08 }}
                      className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-500 to-cyan-300"
                    />
                  ))}
                </div>
              </GlowCard>
            </ParallaxFloat>
          </div>
        </ParallaxSection>

        {/* Resources */}
        <ParallaxSection tone="amber">
          <SectionHeader
            id="resources"
            title={t('resources.title')}
            subtitle={t('resources.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {resourceItems.map((item, index) => {
              const Icon = resourceIcons[index] ?? Mail;
              return (
                <GlowCard key={item.title} className="p-6">
                  <Icon className="mb-6 h-7 w-7 text-cyan-300" />
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">{item.desc}</p>
                </GlowCard>
              );
            })}
          </div>
        </ParallaxSection>

        {/* Audiences */}
        <ParallaxSection tone="blue">
          <SectionHeader
            title={t('audiences.title')}
            subtitle={t('audiences.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audienceItems.map((item, index) => {
              const Icon = audienceIcons[index] ?? Users;
              return (
                <GlowCard key={item.title} className="p-6">
                  <Icon className="mb-5 h-7 w-7 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
                </GlowCard>
              );
            })}
          </div>
        </ParallaxSection>

        {/* Promotion */}
        <ParallaxSection tone="cyan">
          <SectionHeader
            title={t('promotion.title')}
            subtitle={t('promotion.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {promotionItems.map(item => (
              <GlowCard key={item.title} className="p-6">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <div className="mt-5 flex gap-3 text-xs">
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-cyan-200">{item.difficulty}</span>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">{item.potential}</span>
                </div>
                <p className="mt-5 min-h-20 text-sm leading-6 text-slate-300">{item.example}</p>
                <Button
                  size="sm"
                  onClick={() => setModal({ title: item.title, body: item.example })}
                  className="mt-6 rounded-full bg-white/10 text-white hover:bg-white/15"
                >
                  {t('promotion.viewExample')}
                </Button>
              </GlowCard>
            ))}
          </div>
        </ParallaxSection>

        {/* Trust */}
        <ParallaxSection tone="amber">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeader
                title={t('trust.title')}
                subtitle={t('trust.subtitle')}
                align="left"
              />
              <Button onClick={() => { trackAffiliateInterest('trust-guidelines'); setModal(modalCopy.guidelines); }} className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                {t('trust.ctaGuidelines')}
              </Button>
            </div>
            <GlowCard className="p-8">
              <div className="grid gap-5 md:grid-cols-2">
                {trustItems.map(item => (
                  <p key={item} className="flex gap-3 text-slate-200">
                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                    {item}
                  </p>
                ))}
              </div>
              <div className="mt-8 rounded-3xl border border-amber-200/15 bg-amber-300/10 p-6 text-sm leading-7 text-amber-50/90">
                {t('trust.termsNote')}
              </div>
            </GlowCard>
          </div>
        </ParallaxSection>

        {/* Testimonials */}
        <ParallaxSection tone="blue">
          <SectionHeader
            title={t('testimonials.title')}
            subtitle={t('testimonials.subtitle')}
          />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            {testimonialItems.map(item => (
              <GlowCard key={item.name} className="p-8">
                <p className="text-lg leading-8 text-slate-100">&quot;{item.quote}&quot;</p>
                <div className="mt-8">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.role}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </ParallaxSection>

        {/* Apply */}
        <ParallaxSection tone="cyan">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <GlowCard className="p-8 md:p-10">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">{apply.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">{apply.subtitle}</p>
              <form onSubmit={submitAffiliateApplication} noValidate className="mt-10 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldName}</span>
                  <input
                    id="affiliate-name"
                    value={formState.name}
                    onChange={handleApplyChange('name')}
                    required
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={formErrors.name ? 'affiliate-name-error' : undefined}
                    className={applyFieldClass('name')}
                    placeholder={apply.fieldName}
                  />
                  {fieldError('name')}
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldEmail}</span>
                  <input
                    id="affiliate-email"
                    type="email"
                    value={formState.email}
                    onChange={handleApplyChange('email')}
                    required
                    aria-invalid={Boolean(formErrors.email)}
                    aria-describedby={formErrors.email ? 'affiliate-email-error' : undefined}
                    className={applyFieldClass('email')}
                    placeholder={apply.fieldEmail}
                  />
                  {fieldError('email')}
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldProfile}</span>
                  <input
                    id="affiliate-profile"
                    value={formState.profile}
                    onChange={handleApplyChange('profile')}
                    required
                    aria-invalid={Boolean(formErrors.profile)}
                    aria-describedby={formErrors.profile ? 'affiliate-profile-error' : undefined}
                    className={applyFieldClass('profile')}
                    placeholder={apply.fieldProfile}
                  />
                  {fieldError('profile')}
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldAudience}</span>
                  <input
                    id="affiliate-audience"
                    value={formState.audience}
                    onChange={handleApplyChange('audience')}
                    required
                    aria-invalid={Boolean(formErrors.audience)}
                    aria-describedby={formErrors.audience ? 'affiliate-audience-error' : undefined}
                    className={applyFieldClass('audience')}
                    placeholder={apply.fieldAudience}
                  />
                  {fieldError('audience')}
                </label>
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldChannel}</span>
                  <input
                    id="affiliate-channel"
                    value={formState.channel}
                    onChange={handleApplyChange('channel')}
                    required
                    aria-invalid={Boolean(formErrors.channel)}
                    aria-describedby={formErrors.channel ? 'affiliate-channel-error' : undefined}
                    className={applyFieldClass('channel')}
                    placeholder={apply.fieldChannel}
                  />
                  {fieldError('channel')}
                </label>
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldExperience}</span>
                  <textarea
                    id="affiliate-experience"
                    value={formState.experience}
                    onChange={handleApplyChange('experience')}
                    rows={4}
                    required
                    aria-invalid={Boolean(formErrors.experience)}
                    aria-describedby={formErrors.experience ? 'affiliate-experience-error' : undefined}
                    className={applyFieldClass('experience', true)}
                    placeholder={apply.fieldExperience}
                  />
                  {fieldError('experience')}
                </label>
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldPlan}</span>
                  <textarea
                    id="affiliate-plan"
                    value={formState.plan}
                    onChange={handleApplyChange('plan')}
                    rows={4}
                    required
                    aria-invalid={Boolean(formErrors.plan)}
                    aria-describedby={formErrors.plan ? 'affiliate-plan-error' : undefined}
                    className={applyFieldClass('plan', true)}
                    placeholder={apply.fieldPlan}
                  />
                  {fieldError('plan')}
                </label>
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">{apply.fieldMessage}</span>
                  <textarea
                    id="affiliate-message"
                    value={formState.message}
                    onChange={handleApplyChange('message')}
                    rows={6}
                    required
                    aria-invalid={Boolean(formErrors.message)}
                    aria-describedby={formErrors.message ? 'affiliate-message-error' : undefined}
                    className={applyFieldClass('message', true)}
                    placeholder={apply.fieldMessage}
                  />
                  {fieldError('message')}
                </label>
                <div className="md:col-span-2 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={formStatus.type === 'loading'}
                    className="h-14 rounded-full bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {formStatus.type === 'loading' ? apply.submitting : apply.submitBtn}
                  </Button>
                  {formStatus.message ? (
                    <p className={'text-sm ' + (formStatus.type === 'error' ? 'text-rose-300' : 'text-emerald-300')}>
                      {formStatus.message}
                    </p>
                  ) : null}
                </div>
              </form>
            </GlowCard>
            <GlowCard className="p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Resumen del partner</p>
              <div className="mt-8 space-y-5 text-sm text-slate-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span>Tasa de comisión</span>
                  {/* Del código que paga la comisión: la promesa no puede desviarse. */}
                  <span className="font-semibold text-white">{AFFILIATE_COMMISSION_PERCENT}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span>Duración de cookie</span>
                  <span className="font-semibold text-white">60 días</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span>Pagos</span>
                  <span className="font-semibold text-white">Mensual</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span>Soporte para partner</span>
                  <span className="font-semibold text-white">Incluido</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recursos promocionales</span>
                  <span className="font-semibold text-white">Incluido</span>
                </div>
              </div>
            </GlowCard>
          </div>
        </ParallaxSection>

        {/* FAQ */}
        <ParallaxSection tone="cyan">
          <SectionHeader
            id="faq"
            title={t('faq.title')}
            subtitle={t('faq.subtitle')}
          />
          <div className="mx-auto max-w-4xl space-y-4">
            {faqItems.map((item, index) => (
              <div key={item.q} className="rounded-3xl border border-white/10 bg-white/[0.055]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 p-6 text-left"
                >
                  <span className="text-lg font-medium text-white">{item.q}</span>
                  <ChevronDown className={'h-5 w-5 shrink-0 text-cyan-200 transition ' + (openFaq === index ? 'rotate-180' : '')} />
                </button>
                {openFaq === index ? (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 pb-6 leading-7 text-slate-300"
                  >
                    {item.a}
                  </motion.p>
                ) : null}
              </div>
            ))}
          </div>
        </ParallaxSection>

      </main>

      <Modal content={modal} onClose={() => setModal(null)} gotItLabel={t('modal.gotIt')} />
    </div>
  );
}
