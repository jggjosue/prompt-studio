'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { useRouter } from 'next/navigation';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDraggable, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  Layers3,
  LayoutTemplate,
  Monitor,
  MousePointer2,
  Plus,
  Redo2,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import React, { useMemo, useState } from 'react';
import buttonCatalog from '../../../../public/catalog/components/web-button-components.json';
import cardCatalog from '../../../../public/catalog/components/web-card-components.json';
import formCatalog from '../../../../public/catalog/components/web-form-components.json';
import headerCatalog from '../../../../public/catalog/components/web-header-components.json';
import sidebarCatalog from '../../../../public/catalog/components/web-sidebar-components.json';

// --- Types ---
type Choice = { id: string; title: string; prompt: string };
type Key = 'header' | 'sidebar' | 'hero' | 'card' | 'form' | 'button' | 'footer' | 'logoCloud' | 'stats' | 'features' | 'testimonial' | 'pricing' | 'faq' | 'newsletter';
type Device = 'desktop' | 'tablet' | 'mobile';

type Block = {
  instanceId: string; // Unique ID for the instance in the canvas
  key: Key;
  choiceId: string;
  title: string;
  prompt: string;
  content?: Record<string, string>;
};

const BLOCK_FIELDS: Record<Key, { id: string; label: string; default: string }[]> = {
  header: [{ id: 'cta', label: 'Botón CTA', default: 'Comenzar' }],
  sidebar: [],
  hero: [
    { id: 'heading', label: 'Palabra Clave (Hero)', default: 'Experience' },
    { id: 'subtext', label: 'Descripción', default: '' },
    { id: 'cta1', label: 'Botón Principal', default: 'Construir ahora' },
    { id: 'cta2', label: 'Botón Secundario', default: 'Ver demo' },
  ],
  logoCloud: [{ id: 'title', label: 'Título', default: 'Compañías innovadoras confían en nosotros' }],
  stats: [
    { id: 'stat1', label: 'Métrica 1', default: '99.9%' },
    { id: 'stat2', label: 'Métrica 2', default: '3.2x' },
    { id: 'stat3', label: 'Métrica 3', default: '24/7' },
  ],
  features: [
    { id: 'heading', label: 'Título', default: 'Todo lo que necesitas' },
    { id: 'subtext', label: 'Subtítulo', default: 'Herramientas diseñadas para escalar tu negocio sin límites.' },
  ],
  card: [],
  testimonial: [{ id: 'quote', label: 'Cita', default: 'Implementamos el producto y nuestra conversión aumentó un 140% en solo dos semanas. Es magia pura.' }, { id: 'author', label: 'Autor', default: 'Elena Rodríguez' }],
  pricing: [{ id: 'heading', label: 'Título', default: 'Precios transparentes' }],
  form: [{ id: 'heading', label: 'Título', default: 'Hablemos' }],
  button: [{ id: 'text', label: 'Texto', default: 'Click aquí' }],
  faq: [{ id: 'heading', label: 'Título', default: 'Preguntas Frecuentes' }],
  newsletter: [{ id: 'heading', label: 'Título', default: 'Suscríbete' }],
  footer: [{ id: 'subtext', label: 'Texto', default: 'Construyendo el futuro de las experiencias digitales.' }],
};

// --- Catalogs & Static Data ---
const DEFAULT_ORDER: Key[] = ['header', 'hero', 'logoCloud', 'features', 'card', 'stats', 'testimonial', 'pricing', 'form', 'faq', 'newsletter', 'footer'];

const LABELS: Record<Key, [string, string, string]> = {
  header: ['Navegación', 'Navigation', 'Base'], sidebar: ['Barra lateral', 'Sidebar', 'Base'], hero: ['Hero', 'Hero', 'Impacto'],
  logoCloud: ['Logos de confianza', 'Trust logos', 'Confianza'], stats: ['Métricas', 'Metrics', 'Confianza'], features: ['Beneficios', 'Features', 'Contenido'],
  card: ['Tarjetas', 'Cards', 'Contenido'], testimonial: ['Testimonios', 'Testimonials', 'Confianza'], pricing: ['Precios', 'Pricing', 'Conversión'],
  form: ['Formulario', 'Form', 'Conversión'], button: ['CTA', 'CTA', 'Conversión'], faq: ['FAQ', 'FAQ', 'Contenido'],
  newsletter: ['Newsletter', 'Newsletter', 'Conversión'], footer: ['Footer', 'Footer', 'Cierre'],
};

const HERO_FIXED = [['hero-aurora', 'Aurora conversion hero', 'Hero Aurora de conversión'], ['hero-editorial', 'Editorial story hero', 'Hero editorial'], ['hero-product', '3D product showcase', 'Showcase 3D de producto'], ['hero-saas', 'SaaS dashboard hero', 'Hero SaaS con dashboard'], ['hero-video', 'Cinematic video hero', 'Hero de video']] as const;
const FOOTER_FIXED = [['footer-mega', 'Mega footer', 'Mega footer'], ['footer-minimal', 'Minimal footer', 'Footer minimalista'], ['footer-newsletter', 'Newsletter footer', 'Footer con newsletter']] as const;
const EXTRAS_FIXED: Record<string, readonly [string, string, string][]> = {
  logoCloud: [['logos-trust', 'Trust logo cloud', 'Logos de confianza']], stats: [['stats-impact', 'Impact metrics', 'Métricas de impacto']],
  features: [['features-grid', 'Feature grid', 'Grid de beneficios']], testimonial: [['testimonial-quote', 'Customer quote', 'Testimonio de cliente']],
  pricing: [['pricing-simple', 'Simple pricing', 'Precios simples']], faq: [['faq-accordion', 'FAQ accordion', 'Preguntas frecuentes']],
  newsletter: [['newsletter-inline', 'Inline newsletter', 'Newsletter integrado']],
};

function localChoice(item: { id: string; name: { es: string; en: string }; prompt: { es: string; en: string } }, es: boolean): Choice {
  return { id: item.id, title: es ? item.name.es : item.name.en, prompt: es ? item.prompt.es : item.prompt.en };
}
function fixedChoice(items: readonly (readonly [string, string, string])[], es: boolean): Choice[] {
  return items.map(item => ({ id: item[0], title: es ? item[2] : item[1], prompt: 'Create a responsive ' + item[1] + ' with semantic content, accessible interactions and reduced-motion fallbacks.' }));
}

function generateInstanceId() {
  return Math.random().toString(36).substring(2, 9);
}

// --- Dnd Kit Helper Components ---
function SortableLayerItem({ block, isSelected, onClick }: { block: Block, isSelected: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.instanceId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <li
      ref={setNodeRef} style={style} onClick={onClick}
      className={`group flex cursor-pointer items-center justify-between rounded-lg border px-2.5 py-2 text-xs transition-all ${isSelected ? 'border-violet-500/50 bg-violet-500/10 text-white' : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
        }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-white p-1 -ml-1 outline-none">
          <GripVertical className="size-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
        </div>
        <span className="truncate font-semibold">{block.title}</span>
      </div>
      {isSelected && <div className="size-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />}
    </li>
  );
}

function DraggableVariantCard({ variant, categoryKey, onClick, isSelected }: { variant: Choice, categoryKey: Key, onClick: () => void, isSelected?: boolean }) {
  const id = `new-${categoryKey}-${variant.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { categoryKey, choiceId: variant.id, title: variant.title, prompt: variant.prompt }
  });

  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes} onClick={onClick}
      className={`p-3 rounded-xl border flex flex-col gap-2 cursor-grab transition-colors outline-none ${isSelected ? 'border-violet-500 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]' : 'border-white/10 bg-black/40 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <LayoutTemplate className={`size-6 ${isSelected ? 'text-violet-400' : 'text-zinc-600'}`} />
      <span className="text-xs font-semibold leading-tight">{variant.title}</span>
    </div>
  );
}

function SortableCanvasBlock({ block, _isSelected, onClick, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.instanceId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="relative group/canvas-block outline-none" onClick={onClick}>
      <div {...attributes} {...listeners} className="absolute left-2 top-2 z-50 p-1.5 cursor-grab opacity-0 group-hover/canvas-block:opacity-100 bg-black/50 rounded-md text-white backdrop-blur-md transition-opacity outline-none">
        <GripVertical className="size-4" />
      </div>
      {children}
    </div>
  );
}

// --- Block Renderers (High Fidelity Wix-style) ---
function RenderBlock({
  block,
  brand,
  description,
  primary,
  secondary,
}: {
  block: Block;
  brand: string;
  description: string;
  primary: string;
  secondary: string;
}) {
  const { key, title } = block;
  const getC = (id: string, fallback: string) => (block.content && block.content[id] !== undefined && block.content[id] !== '') ? block.content[id] : fallback;

  if (key === 'header') {
    return (
      <nav className="flex h-16 items-center justify-between border-b border-white/10 px-6 backdrop-blur-md">
        <strong className="text-lg tracking-tight text-white">{brand}</strong>
        <div className="hidden gap-6 text-xs font-semibold text-zinc-300 sm:flex">
          <span className="hover:text-white transition-colors cursor-pointer">Producto</span>
          <span className="hover:text-white transition-colors cursor-pointer">Soluciones</span>
          <span className="hover:text-white transition-colors cursor-pointer">Precios</span>
        </div>
        <button className="rounded-lg px-4 py-2 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ background: primary }}>
          {getC('cta', 'Comenzar')}
        </button>
      </nav>
    );
  }

  if (key === 'sidebar') {
    return (
      <aside className="w-64 border-r border-white/10 p-6 min-h-[400px]">
        <strong className="text-lg">{brand}</strong>
        <div className="mt-8 space-y-4 text-sm text-zinc-400">
          <div className="text-white font-bold" style={{ color: primary }}>Inicio</div>
          <div>Dashboard</div>
          <div>Configuración</div>
        </div>
      </aside>
    );
  }

  if (key === 'hero') {
    return (
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle at 50% 15%, ${secondary}, transparent 50%)` }} />
        <div className="relative z-10">
          <Badge variant="outline" className="backdrop-blur-md" style={{ borderColor: `${primary}50`, color: secondary, backgroundColor: `${primary}10` }}>
            <Sparkles className="mr-1.5 size-3" />
            Nova UI 2.0
          </Badge>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-tighter text-white sm:text-7xl leading-[1.1]">
            {brand} <br /> <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})` }}>{getC('heading', 'Experience')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {getC('subtext', description)}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-xl px-6 py-3 text-sm font-black text-white shadow-2xl transition-all hover:scale-105" style={{ background: primary, boxShadow: `0 10px 40px -10px ${primary}` }}>
              {getC('cta1', 'Construir ahora')}
            </button>
            <button className="rounded-xl px-6 py-3 text-sm font-bold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              {getC('cta2', 'Ver demo')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (key === 'logoCloud') {
    return (
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.25em] text-zinc-500">{getC('title', 'Compañías innovadoras confían en nosotros')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm font-black text-zinc-400 opacity-60 grayscale">
          <span className="flex items-center gap-2"><div className="size-5 rounded-full bg-current" />ACME Corp</span>
          <span className="flex items-center gap-2"><div className="size-5 rounded bg-current" />Vertex</span>
          <span className="flex items-center gap-2"><div className="size-5 rotate-45 bg-current" />Northstar</span>
          <span className="flex items-center gap-2"><div className="h-5 w-5 rounded-full border-2 border-current" />Orbit</span>
        </div>
      </section>
    );
  }

  if (key === 'stats') {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[[getC('stat1', '99.9%'), 'Uptime garantizado', 'Sin interrupciones'], [getC('stat2', '3.2x'), 'Más rápido', 'Rendimiento superior'], [getC('stat3', '24/7'), 'Soporte experto', 'Siempre para ti']].map((item) => (
            <div key={item[1]} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform hover:-translate-y-1">
              <div className="absolute -right-10 -top-10 size-32 rounded-full opacity-20 blur-3xl" style={{ background: primary }} />
              <p className="text-4xl font-black tracking-tighter text-white" style={{ textShadow: `0 0 20px ${primary}40` }}>{item[0]}</p>
              <p className="mt-2 text-sm font-bold text-zinc-300">{item[1]}</p>
              <p className="mt-1 text-xs text-zinc-500">{item[2]}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (key === 'features') {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">{getC('heading', 'Todo lo que necesitas')}</h2>
          <p className="mt-3 text-zinc-400 whitespace-pre-wrap max-w-xl mx-auto">{getC('subtext', 'Herramientas diseñadas para escalar tu negocio sin límites.')}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {['Rendimiento Extremo', 'Diseño Adaptativo', 'Seguridad Nivel Banco'].map((title, _index) => (
            <article key={title} className="group rounded-3xl border border-white/10 bg-zinc-900/50 p-6 hover:bg-zinc-900 transition-colors">
              <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl shadow-inner" style={{ background: `${primary}20`, color: primary }}>
                <Layers3 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">Infraestructura optimizada que garantiza la mejor experiencia para tus usuarios en cualquier dispositivo.</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (key === 'testimonial') {
    return (
      <section className="px-6 py-20 text-center relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full opacity-10 blur-[100px]" style={{ background: secondary }} />
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex justify-center">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="mx-0.5 size-1.5 rounded-full" style={{ background: secondary }} />)}
          </div>
          <blockquote className="mx-auto max-w-3xl text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            “{getC('quote', `Implementamos ${brand} y nuestra conversión aumentó un 140% en solo dos semanas. Es magia pura.`)}”
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="size-12 rounded-full bg-zinc-800 border-2 border-white/10" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">{getC('author', 'Elena Rodríguez')}</p>
              <p className="text-xs text-zinc-400">Directora de Producto en TechFlow</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (key === 'pricing') {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">{getC('heading', 'Precios transparentes')}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 items-center">
          {['Starter', 'Pro', 'Enterprise'].map((plan, index) => {
            const isPro = index === 1;
            return (
              <article key={plan} className={`relative rounded-3xl border p-8 ${isPro ? 'bg-zinc-900 shadow-2xl scale-105 z-10' : 'bg-white/5 border-white/10'}`} style={{ borderColor: isPro ? primary : undefined }}>
                {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase text-white" style={{ background: primary }}>Recomendado</div>}
                <p className="text-lg font-bold text-white">{plan}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{index === 0 ? '$0' : index === 1 ? '$29' : '$99'}</span>
                  <span className="text-sm text-zinc-500">/mes</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-2"><Check className="size-4" style={{ color: isPro ? primary : '#71717a' }} /> 10 Usuarios</li>
                  <li className="flex items-center gap-2"><Check className="size-4" style={{ color: isPro ? primary : '#71717a' }} /> 50GB Almacenamiento</li>
                  <li className="flex items-center gap-2"><Check className="size-4" style={{ color: isPro ? primary : '#71717a' }} /> Soporte prioritario</li>
                </ul>
                <button className="mt-8 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors hover:opacity-90" style={{ background: isPro ? primary : '#27272a' }}>
                  Comenzar gratis
                </button>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (key === 'form' || key === 'newsletter') {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 size-40 rounded-full opacity-20 blur-3xl" style={{ background: primary }} />
          <h2 className="text-2xl font-black text-white">{getC('heading', key === 'form' ? 'Hablemos' : 'Suscríbete')}</h2>
          <p className="mt-2 text-sm text-zinc-400">Déjanos tu email y nos pondremos en contacto pronto.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Email de trabajo</label>
              <div className="mt-1.5 h-11 rounded-xl border border-white/10 bg-black/50 px-3 flex items-center text-sm text-zinc-500">help@prompstudio.com</div>
            </div>
            {key === 'form' && (
              <div>
                <label className="text-xs font-semibold text-zinc-300">Mensaje</label>
                <div className="mt-1.5 h-24 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-zinc-500">¿En qué podemos ayudarte?</div>
              </div>
            )}
            <button className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]" style={{ background: primary, boxShadow: `0 10px 20px -10px ${primary}` }}>
              Enviar mensaje
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (key === 'faq') {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-3xl font-black text-white mb-10">{getC('heading', 'Preguntas Frecuentes')}</h2>
        <div className="space-y-4">
          {['¿Cómo empiezo con la plataforma?', '¿Cuáles son los métodos de pago aceptados?', '¿Ofrecen soporte técnico 24/7?'].map((question) => (
            <div key={question} className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-5 transition-colors hover:bg-white/10">
              <span className="text-sm font-semibold text-zinc-200">{question}</span>
              <div className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white">
                <ChevronDown className="size-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (key === 'footer') {
    return (
      <footer className="border-t border-white/10 bg-[#040508] px-6 py-12">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <strong className="text-xl text-white">{brand}</strong>
            <p className="mt-4 text-xs text-zinc-500 leading-relaxed">Construyendo el futuro de las experiencias digitales con tecnología de vanguardia.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="space-y-3">
              <p className="font-bold text-white">Producto</p>
              <p className="text-zinc-500">Características</p>
              <p className="text-zinc-500">Integraciones</p>
              <p className="text-zinc-500">Precios</p>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-white">Compañía</p>
              <p className="text-zinc-500">Sobre nosotros</p>
              <p className="text-zinc-500">Blog</p>
              <p className="text-zinc-500">Contacto</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl mt-12 border-t border-white/10 pt-6 text-xs text-zinc-600 flex justify-between">
          <span>© 2026 {brand}. Todos los derechos reservados.</span>
          <span>Privacidad · Términos</span>
        </div>
      </footer>
    );
  }

  // Fallback for card/button etc
  return (
    <section className="px-6 py-12 text-center border-y border-white/5 border-dashed my-4">
      <Badge variant="outline" className="mb-4 bg-white/5 text-zinc-300">Componente: {title}</Badge>
      <div className="mx-auto max-w-sm h-32 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-500 text-sm backdrop-blur-sm">
        Previsualización de {title}
      </div>
    </section>
  );
}

// --- Main Page Composer Component ---
export default function PageComposerClient() {
  const es = useLocale().toLowerCase().startsWith('es');
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const { hasPaidPlan } = useMembershipAccess();
  const router = useRouter();

  // Load catalogs
  const options = useMemo<Record<Key, Choice[]>>(() => ({
    header: headerCatalog.components.map(item => localChoice(item, es)),
    sidebar: sidebarCatalog.components.map(item => localChoice(item, es)),
    hero: fixedChoice(HERO_FIXED, es),
    card: cardCatalog.components.map(item => localChoice(item, es)),
    form: formCatalog.components.map(item => localChoice(item, es)),
    button: buttonCatalog.components.map(item => localChoice(item, es)),
    footer: fixedChoice(FOOTER_FIXED, es),
    logoCloud: fixedChoice(EXTRAS_FIXED.logoCloud, es),
    stats: fixedChoice(EXTRAS_FIXED.stats, es),
    features: fixedChoice(EXTRAS_FIXED.features, es),
    testimonial: fixedChoice(EXTRAS_FIXED.testimonial, es),
    pricing: fixedChoice(EXTRAS_FIXED.pricing, es),
    faq: fixedChoice(EXTRAS_FIXED.faq, es),
    newsletter: fixedChoice(EXTRAS_FIXED.newsletter, es),
  }), [es]);

  // Editor State
  const [blocks, setBlocks] = useState<Block[]>(() => {
    return DEFAULT_ORDER.map(key => ({
      instanceId: generateInstanceId(),
      key,
      choiceId: options[key][0].id,
      title: options[key][0].title,
      prompt: options[key][0].prompt,
    }));
  });

  const [history, setHistory] = useState<{ past: Block[][], future: Block[][] }>({ past: [], future: [] });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Global Settings
  const [projectName, setProjectName] = useState('Nova Digital Experience');
  const [brand, setBrand] = useState('Nova Studio');
  const [description, setDescription] = useState('Una experiencia digital coherente, rápida y preparada para convertir.');
  const [primary, setPrimary] = useState('#7c3aed');
  const [secondary, setSecondary] = useState('#06b6d4');
  const [background, setBackground] = useState('#07090e'); // Deep dark

  // UI State
  const [device, setDevice] = useState<Device>('desktop');
  const [activeTab, setActiveTab] = useState<'layers' | 'add'>('layers');
  const [selectedCategory, setSelectedCategory] = useState<Key | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<{ id: string, type: 'layer' | 'new', data?: any } | null>(null);
  const [copied, setCopied] = useState(false);

  // --- History Management ---
  const saveHistory = (newBlocks: Block[]) => {
    setHistory(curr => ({
      past: [...curr.past, blocks],
      future: []
    }));
    setBlocks(newBlocks);
  };

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory(curr => ({
      past: curr.past.slice(0, -1),
      future: [blocks, ...curr.future]
    }));
    setBlocks(previous);
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(curr => ({
      past: [...curr.past, blocks],
      future: curr.future.slice(1)
    }));
    setBlocks(next);
  };

  // --- Block Actions ---
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    saveHistory(newBlocks);
  };

  const duplicateBlock = (index: number) => {
    const blockToCopy = blocks[index];
    const newBlock = { ...blockToCopy, instanceId: generateInstanceId() };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    saveHistory(newBlocks);
    setSelectedBlockId(newBlock.instanceId);
  };

  const deleteBlock = (index: number) => {
    const newBlocks = [...blocks];
    const removed = newBlocks.splice(index, 1)[0];
    if (selectedBlockId === removed.instanceId) setSelectedBlockId(null);
    saveHistory(newBlocks);
  };

  const addBlock = (key: Key, choiceId?: string) => {
    const choice = choiceId ? options[key].find(c => c.id === choiceId) || options[key][0] : options[key][0];
    const newBlock: Block = {
      instanceId: generateInstanceId(),
      key,
      choiceId: choice.id,
      title: choice.title,
      prompt: choice.prompt
    };
    saveHistory([...blocks, newBlock]);
    setSelectedBlockId(newBlock.instanceId);
  };

  const updateSelectedBlockVariant = (choiceId: string) => {
    if (!selectedBlockId) return;
    const blockIndex = blocks.findIndex(b => b.instanceId === selectedBlockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const category = newBlocks[blockIndex].key;
    const choice = options[category].find(c => c.id === choiceId);
    if (choice) {
      newBlocks[blockIndex] = { ...newBlocks[blockIndex], choiceId, title: choice.title, prompt: choice.prompt };
      saveHistory(newBlocks);
    }
  };

  const updateBlockContent = (id: string, value: string) => {
    if (!selectedBlockId) return;
    const blockIndex = blocks.findIndex(b => b.instanceId === selectedBlockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      content: { ...(newBlocks[blockIndex].content || {}), [id]: value }
    };
    saveHistory(newBlocks);
  };

  // --- Dnd Kit Logic ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.id.toString().startsWith('new-')) {
      setActiveDragItem({ id: active.id.toString(), type: 'new', data: active.data.current });
    } else {
      setActiveDragItem({ id: active.id.toString(), type: 'layer' });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    if (active.id.toString().startsWith('new-')) {
      const overIndex = blocks.findIndex(b => b.instanceId === over.id);
      const insertIndex = overIndex >= 0 ? overIndex : blocks.length;
      const data = active.data.current as any;
      const newBlock: Block = {
        instanceId: generateInstanceId(),
        key: data.categoryKey,
        choiceId: data.choiceId,
        title: data.title,
        prompt: data.prompt
      };
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      saveHistory(newBlocks);
      setSelectedBlockId(newBlock.instanceId);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.instanceId === active.id);
      const newIndex = blocks.findIndex(b => b.instanceId === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = [...blocks];
        const [draggedBlock] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, draggedBlock);
        saveHistory(newBlocks);
      }
    }
  };

  // --- Export Logic ---
  const masterPrompt = `Build a cohesive production-ready Next.js 15 website named “${projectName}” for “${brand}”.\n\nBRAND SYSTEM\n- Description: ${description}\n- Primary: ${primary}; secondary: ${secondary}; background: ${background}.\n- Use App Router, React 19, TypeScript, Tailwind CSS, semantic HTML, responsive design, WCAG AA, keyboard support, next/font and reduced-motion fallbacks.\n\nSELECTED SECTIONS\n${blocks.map(b => `## ${b.key.toUpperCase()}: ${b.title} (${b.choiceId})\n${b.prompt}${b.content ? `\n\nREQUIRED CONTENT OVERRIDES (MUST USE THESE TEXTS):\n${JSON.stringify(b.content, null, 2)}` : ''}`).join('\n\n')}\n\nCOHERENCE RULES\nUse one token system for color, typography, radius, spacing, shadows and motion. Compose sections in this order: ${blocks.map(b => b.key).join(' → ')}. Avoid duplicate navigation or CTAs. Include metadata, Open Graph, accessibility, performance, mobile behavior, README and tests. Return the complete file tree and code.`;

  const copy = async () => {
    if (!hasPaidPlan) {
      router.push('/prices');
      return;
    }
    if (await copyWithDailyLimit(() => copyToClipboard(masterPrompt)) === 'copied') {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const selectedBlock = blocks.find(b => b.instanceId === selectedBlockId);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col bg-[#07090e] text-slate-200 overflow-hidden font-sans">
        <div className="shrink-0 bg-background">
          <Header />
        </div>

        {/* --- TOP TOOLBAR --- */}
        <div className="flex h-14 shrink-0 items-center justify-between border-y border-white/10 bg-[#0a0c10] px-4 shadow-sm z-10">

          {/* Left: Device Switcher */}
          <div className="flex rounded-lg border border-white/10 bg-black/40 p-1">
            {(Object.entries({ desktop: Monitor, tablet: Tablet, mobile: Smartphone }) as [Device, React.ElementType][]).map(([id, Icon]) => (
              <button
                key={id}
                onClick={() => setDevice(id)}
                className={`grid size-8 place-items-center rounded-md transition-all ${device === id
                    ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                  }`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>

          {/* Center: Status & History */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={undo} disabled={history.past.length === 0} className="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent">
                <Undo2 className="size-4" />
              </button>
              <button onClick={redo} disabled={history.future.length === 0} className="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent">
                <Redo2 className="size-4" />
              </button>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Check className="size-3 text-emerald-500" /> Guardado
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={copy} className="h-8 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white">
              {copied ? <Check className="mr-2 size-3 text-emerald-400" /> : <Copy className="mr-2 size-3" />}
              Prompt
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">

          {/* --- LEFT PANEL: LAYERS & ADD BLOCKS --- */}
          <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0a0c10] shadow-xl z-20">
            <div className="flex h-12 shrink-0 border-b border-white/10">
              <button
                onClick={() => setActiveTab('layers')}
                className={`flex-1 border-b-2 text-xs font-bold transition-colors ${activeTab === 'layers' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Capas
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 border-b-2 text-xs font-bold transition-colors ${activeTab === 'add' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Añadir
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {activeTab === 'layers' ? (
                <SortableContext items={blocks.map(b => b.instanceId)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-1">
                    {blocks.map((block) => (
                      <SortableLayerItem
                        key={block.instanceId}
                        block={block}
                        isSelected={selectedBlockId === block.instanceId}
                        onClick={() => setSelectedBlockId(block.instanceId)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              ) : (
                <div className="space-y-6">
                  {Object.keys(LABELS).map((k) => {
                    const key = k as Key;
                    const label = es ? LABELS[key][0] : LABELS[key][1];
                    return (
                      <div key={key}>
                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedCategory(key)}
                            className={`flex h-16 flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors ${selectedCategory === key ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/5 bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/10'}`}
                          >
                            <Plus className={`size-4 ${selectedCategory === key ? 'text-violet-400' : 'text-zinc-500'}`} />
                            <span className={`text-[10px] font-semibold ${selectedCategory === key ? 'text-violet-200' : 'text-zinc-300'}`}>Ver {label}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* --- CENTER CANVAS (WIX/WEBFLOW STYLE) --- */}
          <main
            className="flex-1 relative overflow-auto bg-[#040508] p-4 lg:p-8"
            onClick={() => setSelectedBlockId(null)} // Deselect on background click
          >
            {/* Canvas Wrapper */}
            <div
              className={`mx-auto min-h-[800px] transition-[max-width] duration-500 ease-in-out relative origin-top ${device === 'desktop' ? 'max-w-none' : device === 'tablet' ? 'max-w-[768px]' : 'max-w-[390px]'
                }`}
            >
              {/* Outline Frame representing the browser */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-white/5 shadow-2xl"
                style={{ zIndex: 50 }}
              />

              {/* The actual page content */}
              <div
                className="min-h-[800px] w-full rounded-2xl overflow-hidden relative shadow-2xl"
                style={{ background, color: '#f8fafc' }}
              >
                <SortableContext items={blocks.map(b => b.instanceId)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block, index) => {
                    const isSelected = selectedBlockId === block.instanceId;

                    return (
                      <SortableCanvasBlock key={block.instanceId} block={block} isSelected={isSelected} onClick={(e: any) => { e.stopPropagation(); setSelectedBlockId(block.instanceId); }}>
                        {/* Hover Outline */}
                        <div className={`absolute inset-0 z-40 pointer-events-none transition-all duration-200 border-2 ${isSelected ? 'border-violet-500 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]' : 'border-transparent group-hover/canvas-block:border-cyan-500/50'
                          }`} />

                        {/* Floating Context Toolbar (Top Right of block) */}
                        {isSelected && (
                          <div className="absolute -top-10 right-4 z-50 flex items-center gap-1 rounded-lg border border-white/10 bg-[#0a0c10] p-1 shadow-xl animate-in slide-in-from-bottom-2">
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} disabled={index === 0} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30">
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} disabled={index === blocks.length - 1} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30">
                              <ArrowDown className="size-3.5" />
                            </button>
                            <div className="h-4 w-px bg-white/10 mx-1" />
                            <button onClick={(e) => { e.stopPropagation(); duplicateBlock(index); }} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white">
                              <Copy className="size-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteBlock(index); }} className="rounded p-1.5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Block Label (Top Left) */}
                        {isSelected && (
                          <div className="absolute -top-6 left-0 z-50 rounded-t-lg bg-violet-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
                            {LABELS[block.key][es ? 0 : 1]}
                          </div>
                        )}

                        {/* High Fidelity Render */}
                        <div className={isSelected ? 'opacity-100' : 'opacity-95 transition-opacity group-hover/canvas-block:opacity-100'}>
                          <RenderBlock
                            block={block}
                            brand={brand}
                            description={description}
                            primary={primary}
                            secondary={secondary}
                          />
                        </div>
                      </SortableCanvasBlock>
                    );
                  })}
                </SortableContext>

                {/* Empty State */}
                {blocks.length === 0 && (
                  <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-zinc-500">
                    <LayoutTemplate className="mb-4 size-12 opacity-20" />
                    <p className="text-sm font-semibold">El lienzo está vacío</p>
                    <p className="mt-1 text-xs">Arrastra o añade componentes desde el panel izquierdo.</p>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* --- RIGHT PANEL: INSPECTOR & LIBRARY --- */}
          <aside className="w-80 shrink-0 border-l border-white/10 bg-[#0a0c10] overflow-y-auto p-5 custom-scrollbar shadow-xl z-20 relative">
            {selectedBlock ? (
              // --- BLOCK SETTINGS ---
              <div className="animate-in fade-in">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-violet-400">{LABELS[selectedBlock.key][es ? 0 : 1]}</p>
                    <h3 className="text-sm font-bold text-white">{selectedBlock.title}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setSelectedBlockId(null)}>
                    <Settings className="size-4 text-zinc-400" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-xs font-semibold text-zinc-300 mb-4 block">Variantes Disponibles</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {options[selectedBlock.key].map(opt => (
                        <DraggableVariantCard
                          key={opt.id}
                          variant={opt}
                          categoryKey={selectedBlock.key}
                          isSelected={selectedBlock.choiceId === opt.id}
                          onClick={() => updateSelectedBlockVariant(opt.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {BLOCK_FIELDS[selectedBlock.key]?.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <Label className="text-xs font-semibold text-zinc-300">Contenido del Componente</Label>
                      {BLOCK_FIELDS[selectedBlock.key].map(field => (
                        <div key={field.id}>
                          <Label className="text-[10px] text-zinc-400">{field.label}</Label>
                          {field.id === 'subtext' || field.id === 'quote' ? (
                            <textarea
                              className="mt-1 flex min-h-[60px] w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                              value={selectedBlock.content?.[field.id] !== undefined ? selectedBlock.content[field.id] : ''}
                              placeholder={field.default}
                              onChange={(e) => updateBlockContent(field.id, e.target.value)}
                            />
                          ) : (
                            <input
                              className="mt-1 flex h-8 w-full rounded-md border border-white/10 bg-black/40 px-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                              value={selectedBlock.content?.[field.id] !== undefined ? selectedBlock.content[field.id] : ''}
                              placeholder={field.default}
                              onChange={(e) => updateBlockContent(field.id, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center mt-6">
                    <MousePointer2 className="mx-auto mb-2 size-5 text-zinc-500" />
                    <p className="text-xs text-zinc-400">Selecciona <strong className="text-white">Ajustes Globales</strong> desmarcando este bloque para configurar el tema.</p>
                  </div>
                </div>
              </div>
            ) : selectedCategory ? (
              // --- COMPONENT LIBRARY (ADD MODE) ---
              <div className="animate-in fade-in">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Biblioteca</p>
                    <h3 className="text-sm font-bold text-white">{LABELS[selectedCategory][es ? 0 : 1]}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setSelectedCategory(null)}>
                    <Settings className="size-4 text-zinc-400" />
                  </Button>
                </div>
                <p className="text-xs text-zinc-400 mb-4">Haz clic para agregar, o arrastra hacia el lienzo.</p>

                <div className="grid grid-cols-2 gap-3">
                  {options[selectedCategory].map(opt => (
                    <DraggableVariantCard
                      key={opt.id}
                      variant={opt}
                      categoryKey={selectedCategory}
                      onClick={() => addBlock(selectedCategory, opt.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // --- GLOBAL SETTINGS ---
              <div className="animate-in fade-in space-y-6">
                <div className="mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white">Ajustes Globales</h3>
                  <p className="text-xs text-zinc-500">Configura el tema de todo el proyecto.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-zinc-300">Nombre del Proyecto</Label>
                    <Input className="mt-2 h-9 border-white/10 bg-black/40 text-xs focus-visible:ring-violet-500 text-zinc-200" value={projectName} onChange={e => setProjectName(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-zinc-300">Marca / Empresa</Label>
                    <Input className="mt-2 h-9 border-white/10 bg-black/40 text-xs focus-visible:ring-violet-500 text-zinc-200" value={brand} onChange={e => setBrand(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-zinc-300">Descripción (SEO & Hero)</Label>
                    <Textarea className="mt-2 min-h-[80px] border-white/10 bg-black/40 text-xs focus-visible:ring-violet-500 text-zinc-200" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>

                  <div className="pt-4">
                    <Label className="text-xs font-semibold text-zinc-300">Tokens de Color</Label>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ['Primario', primary, setPrimary],
                        ['Secund.', secondary, setSecondary],
                        ['Fondo', background, setBackground]
                      ].map(([label, value, setter]) => (
                        <div key={label as string} className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] p-2 hover:border-white/20 transition-colors">
                          <span className="mb-2 text-[10px] font-medium text-zinc-400">{label as string}</span>
                          <div className="relative size-8 overflow-hidden rounded-full border border-white/10 shadow-inner">
                            <input type="color" value={value as string} onChange={e => (setter as any)(e.target.value)} className="absolute inset-[-8px] size-[48px] cursor-pointer border-0 bg-transparent p-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

        </div>

        {/* Retain Footer */}
        <div className="hidden">
          <Footer />
        </div>
      </div>

      <DragOverlay>
        {activeDragItem?.type === 'new' && (
          <div className="p-3 rounded-xl border border-violet-500 bg-violet-500/10 text-white shadow-xl flex flex-col gap-2 w-[140px]">
            <LayoutTemplate className="size-6 text-violet-400" />
            <span className="text-xs font-semibold leading-tight">{activeDragItem.data.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
