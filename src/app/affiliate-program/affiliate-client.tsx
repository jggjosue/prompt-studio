'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  DollarSign,
  Download,
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
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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
  tier: string;
  plan: string;
  message: string;
};

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

  // Build tier names from translations (used for form tier values)
  const tier1Name = t('commissions.tier1Name');
  const tier2Name = t('commissions.tier2Name');
  const tier3Name = t('commissions.tier3Name');

  const initialForm: FormState = useMemo(() => ({
    name: '',
    email: '',
    profile: '',
    audience: '',
    channel: '',
    experience: '',
    tier: tier1Name,
    plan: '',
    message: '',
  }), [tier1Name]);

  // Benefits data driven by translations
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

  const snapshotRows = useMemo(() => [
    [t('snapshot.commissionRate'), ''],
    [t('snapshot.cookieDuration'), t('snapshot.cookieValue')],
    [t('snapshot.payouts'), t('snapshot.payoutsValue')],
    [t('snapshot.support'), t('snapshot.supportValue')],
    [t('snapshot.promoResources'), t('snapshot.promoValue')],
  ], [t]);

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
  const [toast, setToast] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const selectTier = (tier: string) => {
    setForm(prev => ({ ...prev, tier }));
    scrollToSection('apply');
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = t('apply.errorName');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = t('apply.errorEmail');
    if (!form.profile.trim()) next.profile = t('apply.errorProfile');
    if (!form.channel.trim()) next.channel = t('apply.errorChannel');
    if (!form.plan.trim()) next.plan = t('apply.errorPlan');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    showToast(t('apply.toastSubmit'));
  };

  // Commission rate by tier
  const commissionRate = form.tier === tier3Name ? t('commissions.tier3Rate') : form.tier === tier2Name ? t('commissions.tier2Rate') : t('commissions.tier1Rate');

  const metricsData = [
    { label: t('metrics.commission'), value: 20, suffix: t('metrics.suffixCommission'), Icon: DollarSign },
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

  const tiersData = [
    { name: tier1Name, rate: t('commissions.tier1Rate'), desc: t('commissions.tier1Desc') },
    { name: tier2Name, rate: t('commissions.tier2Rate'), desc: t('commissions.tier2Desc') },
    { name: tier3Name, rate: t('commissions.tier3Rate'), desc: t('commissions.tier3Desc') },
  ];

  const trackingStats = [
    [t('tracking.clicks'), '8,420'],
    [t('tracking.conversion'), '7.8%'],
    [t('tracking.sales'), '312'],
    [t('tracking.pending'), '$4,180'],
    [t('tracking.paid'), '$18,940'],
    [t('tracking.topSource'), t('tracking.topSourceValue')],
  ];

  const formFields: [keyof FormState, string, string][] = [
    ['name', t('apply.fieldName'), 'text'],
    ['email', t('apply.fieldEmail'), 'email'],
    ['profile', t('apply.fieldProfile'), 'text'],
    ['audience', t('apply.fieldAudience'), 'text'],
    ['channel', t('apply.fieldChannel'), 'text'],
    ['experience', t('apply.fieldExperience'), 'text'],
  ];

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#020816] text-white">
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#020816_0%,#07111f_44%,#030712_100%)]"
      />
      <motion.div
        style={{ y: railY }}
        className="pointer-events-none fixed left-1/2 top-0 z-0 h-[140vh] w-[72rem] -translate-x-1/2 opacity-30 [mask-image:linear-gradient(180deg,transparent,black_16%,black_82%,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(115deg,transparent_0%,rgba(34,211,238,0.13)_18%,transparent_34%,transparent_54%,rgba(52,211,153,0.12)_70%,transparent_86%)]" />
      </motion.div>

      <main id="top" className="relative z-10 scroll-mt-0">
        {/* Hero */}
        <section ref={heroRef} className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-14 overflow-hidden px-6 pb-24 pt-32 lg:grid-cols-[0.92fr_1.08fr] lg:pb-28 lg:pt-36">
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
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
              {t('hero.title')}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-9 text-slate-300">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button
                onClick={() => scrollToSection('apply')}
                className="h-14 rounded-full bg-blue-600 px-8 text-base font-semibold text-slate-950 shadow-[0_0_36px_rgba(37,99,235,0.22)] hover:bg-blue-500 text-white"
              >
                {t('hero.ctaAffiliate')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => scrollToSection('commissions')}
                variant="outline"
                className="h-14 rounded-full border-white/15 bg-white/5 px-8 text-base text-white hover:bg-white/10"
              >
                {t('hero.ctaCommissions')}
              </Button>
              <Button
                onClick={() => scrollToSection('steps')}
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
                  onClick={() => setModal(modalCopy.product)}
                  className="h-14 rounded-full bg-cyan-400 px-7 text-slate-950 hover:bg-cyan-300"
                >
                  {t('product.ctaPreview')}
                </Button>
                <Button
                  onClick={() => scrollToSection('apply')}
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
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">{name}</p>
                  <p className="mt-8 text-6xl font-semibold text-blue-400">{rate}</p>
                  <p className="mt-5 min-h-16 leading-7 text-slate-300">{desc}</p>
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
                <Button onClick={() => setModal(modalCopy.dashboard)} className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  {t('tracking.ctaDashboard')}
                </Button>
                <Button onClick={() => setModal(modalCopy.tracking)} variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  {t('tracking.ctaTracking')}
                </Button>
              </div>
            </div>
            <ParallaxFloat distance={80}>
              <GlowCard className="p-7">
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
              <Button onClick={() => setModal(modalCopy.guidelines)} className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
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
                <p className="text-lg leading-8 text-slate-100">"{item.quote}"</p>
                <div className="mt-8">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.role}</p>
                </div>
              </GlowCard>
            ))}
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

        {/* Apply Form */}
        <ParallaxSection className="scroll-mt-28" tone="blue">
          <div id="apply" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 lg:grid-cols-[1fr_0.42fr]">
            <GlowCard className="p-6 md:p-10">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {t('apply.title')}
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-slate-300">
                {t('apply.subtitle')}
              </p>
              <form onSubmit={submit} className="mt-10 grid gap-6 md:grid-cols-2">
                {formFields.map(([key, label, type]) => (
                  <label key={key} className="space-y-2">
                    <span className="text-sm font-medium text-slate-200">{label}</span>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={event => setForm(prev => ({ ...prev, [key]: event.target.value }))}
                      disabled
                      className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white/50 outline-none transition placeholder:text-slate-600 cursor-not-allowed"
                    />
                    {errors[key] ? (
                      <span className="text-xs text-rose-300">{errors[key]}</span>
                    ) : null}
                  </label>
                ))}
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">{t('apply.fieldTier')}</span>
                  <select
                    value={form.tier}
                    onChange={event => setForm(prev => ({ ...prev, tier: event.target.value }))}
                    disabled
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white/50 outline-none transition cursor-not-allowed"
                  >
                    <option>{tier1Name}</option>
                    <option>{tier2Name}</option>
                    <option>{tier3Name}</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">{t('apply.fieldPlan')}</span>
                  <input
                    value={form.plan}
                    onChange={event => setForm(prev => ({ ...prev, plan: event.target.value }))}
                    disabled
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white/50 outline-none transition cursor-not-allowed"
                  />
                  {errors.plan ? <span className="text-xs text-rose-300">{errors.plan}</span> : null}
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">{t('apply.fieldMessage')}</span>
                  <textarea
                    value={form.message}
                    onChange={event => setForm(prev => ({ ...prev, message: event.target.value }))}
                    rows={5}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 text-white/50 outline-none transition cursor-not-allowed"
                  />
                </label>
                <div className="md:col-span-2">
                  <Button type="submit" disabled className="h-14 rounded-full bg-blue-600 px-9 text-base font-semibold text-slate-950 hover:bg-blue-500 text-white cursor-not-allowed opacity-50">
                    {t('apply.submitBtn')}
                  </Button>
                  {submitted ? (
                    <p className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100">
                      {t('apply.successMsg')}
                    </p>
                  ) : null}
                </div>
              </form>
            </GlowCard>
            <ParallaxFloat distance={65} className="h-fit">
              <GlowCard className="h-fit p-8">
                <h3 className="text-2xl font-semibold text-white">{t('snapshot.title')}</h3>
                <div className="mt-8 space-y-5">
                  {snapshotRows.map(([label, value], idx) => (
                    <div key={label} className="flex items-center justify-between gap-5 border-b border-white/10 pb-4">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="font-semibold text-white">
                        {idx === 0 ? commissionRate : value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </ParallaxFloat>
          </div>
        </ParallaxSection>
      </main>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-blue-500/20 bg-slate-950 px-5 py-3 text-sm text-blue-100 shadow-2xl">
          {toast}
        </div>
      ) : null}
      <Modal content={modal} onClose={() => setModal(null)} gotItLabel={t('modal.gotIt')} />
    </div>
  );
}
