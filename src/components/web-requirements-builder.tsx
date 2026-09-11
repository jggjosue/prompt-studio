'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Layers3, Palette, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

const OPTIONS = {
  sections: ['Hero', 'Beneficios', 'Características', 'Cómo funciona', 'Precios', 'Testimonios', 'FAQ', 'Contacto', 'Footer'],
  animations: ['Microinteracciones', 'Scroll reveal', 'Parallax', 'Hover effects', 'Page transitions', 'Sin animaciones'],
  integrations: ['Stripe', 'WhatsApp', 'Calendly', 'Google Analytics', 'Meta Pixel', 'Email marketing', 'CMS', 'Chatbot'],
  forms: ['Contacto', 'Newsletter', 'Registro', 'Login', 'Cotización', 'Reserva', 'Checkout'],
  languages: ['Español', 'English', 'Português', 'Français', 'Deutsch'],
} as const;

const COLORS = [
  { id: 'blue', label: 'Azul', className: 'bg-blue-500' },
  { id: 'emerald', label: 'Verde', className: 'bg-emerald-500' },
  { id: 'violet', label: 'Violeta', className: 'bg-violet-500' },
  { id: 'rose', label: 'Rosa', className: 'bg-rose-500' },
  { id: 'amber', label: 'Ámbar', className: 'bg-amber-500' },
  { id: 'neutral', label: 'Neutral', className: 'bg-zinc-700' },
] as const;

const DEVELOPMENT_PLATFORMS = {
  html: { label: 'HTML, CSS y JavaScript', rules: 'Deliver semantic HTML5, modular CSS with custom properties, and dependency-free vanilla JavaScript. Provide separate index.html, styles.css, and script.js files.' },
  react: { label: 'React', rules: 'Deliver reusable typed React components, hooks for behavior, clear state ownership, accessible component APIs, and a Vite-compatible structure.' },
  nextjs: { label: 'Next.js', rules: 'Use the Next.js App Router, TypeScript, Server Components by default, Client Components only when necessary, metadata APIs, optimized images, and route-level loading and error states.' },
  tailwind: { label: 'Tailwind CSS', rules: 'Use utility-first Tailwind CSS, responsive variants, reusable class composition, design tokens in the Tailwind theme, and no unnecessary inline styles.' },
  framer: { label: 'Framer', rules: 'Describe the Framer page structure, reusable components, breakpoints, stacks, variants, CMS collections, effects, and interactions using settings available in the Framer editor.' },
  webflow: { label: 'Webflow', rules: 'Describe the Webflow Navigator hierarchy, reusable classes, variables, components, CMS collections, interactions, breakpoints, form configuration, and publishing steps.' },
  wordpress: { label: 'WordPress', rules: 'Deliver a WordPress implementation plan using blocks and patterns, editable global styles, theme templates, secure form handling, minimal plugins, and administrator-friendly content fields.' },
  shopify: { label: 'Shopify', rules: 'Use Shopify Online Store 2.0, Liquid sections and blocks, editable theme settings, product and collection objects, cart compatibility, localization, and performance-conscious assets.' },
  lovable: { label: 'Lovable', rules: 'Write an implementation prompt for Lovable with explicit pages, Supabase-ready data entities, authentication roles, component states, user flows, integrations, and acceptance criteria.' },
  bolt: { label: 'Bolt', rules: 'Write a build prompt for Bolt with the exact stack, file structure, routes, component responsibilities, data model, environment variables, commands, and testable completion criteria.' },
  v0: { label: 'v0', rules: 'Write a v0-ready prompt using Next.js, TypeScript, Tailwind and shadcn/ui; specify component hierarchy, responsive behavior, realistic content, interactions, states, and accessibility.' },
} as const;

type DevelopmentPlatform = keyof typeof DEVELOPMENT_PLATFORMS;

const COMMERCIAL_OBJECTIVES = {
  leads: { label: 'Captar leads', cta: 'Solicitar información', rules: 'Use a short lead form, benefit-led hero, qualification fields, trust proof, privacy consent, thank-you state, CRM handoff, and lead_submit analytics event.' },
  product: { label: 'Vender un producto', cta: 'Comprar ahora', rules: 'Prioritize product value, media gallery, benefits, specifications, social proof, price, variants, stock, cart or checkout, guarantees, objections, and purchase funnel events.' },
  booking: { label: 'Reservar una cita', cta: 'Ver disponibilidad', rules: 'Present service outcomes, provider trust, real availability, timezone-aware scheduling, service and staff selection, confirmation, rescheduling, reminders, and booking_complete event.' },
  app: { label: 'Descargar una app', cta: 'Descargar la app', rules: 'Show the app in context, core use cases, screenshots, ratings, platform compatibility, QR code, App Store and Google Play links, device-aware CTA, and app_download event.' },
  tickets: { label: 'Comprar entradas', cta: 'Comprar entradas', rules: 'Emphasize event date, venue, lineup or agenda, ticket tiers, availability, quantity selection, fees, secure checkout, confirmation, wallet or PDF delivery, and ticket_purchase event.' },
  account: { label: 'Crear una cuenta', cta: 'Crear cuenta gratis', rules: 'Explain immediate account value, minimize registration friction, support SSO when relevant, validate credentials, verify email, provide onboarding, show progress, and track signup_started and signup_completed.' },
  quote: { label: 'Solicitar una cotización', cta: 'Obtener cotización', rules: 'Explain service scope, show relevant work and trust proof, collect project requirements progressively, support file upload when needed, provide consent and response expectations, route qualified requests, and track quote_submitted.' },
} as const;

type CommercialObjective = keyof typeof COMMERCIAL_OBJECTIVES;

const PROMPT_KIT_LABELS = {
  main: 'Prompt principal',
  improvement: 'Prompt de mejora',
  mobile: 'Prompt para móvil',
  animations: 'Prompt para animaciones',
  seo: 'Prompt para SEO',
  accessibility: 'Prompt para accesibilidad',
  debugging: 'Prompt para corregir errores',
  backend: 'Prompt para implementar backend',
} as const;

const FUNCTIONAL_MODULES = {
  Login: 'Implement sign-up, sign-in, sign-out, password recovery, email verification, protected routes, session persistence, validation, rate limiting, and role-based access.',
  Dashboard: 'Build an authenticated dashboard with useful KPIs, filters, empty/loading/error states, recent activity, responsive navigation, and data sourced from the backend.',
  'Base de datos': 'Define normalized entities, relationships, constraints, indexes, migrations, seed data, typed queries, authorization policies, and safe create/read/update/delete operations.',
  Pagos: 'Implement secure provider-hosted payment flows, server-side price validation, webhooks with signature verification and idempotency, receipts, payment status, failures, refunds, and test mode.',
  Carrito: 'Implement add, remove, quantity changes, variants, inventory checks, persistent guest and user carts, discount validation, totals calculated server-side, taxes, and checkout handoff.',
  Reservaciones: 'Implement real availability, timezone handling, selectable services and staff, conflict prevention, confirmation, rescheduling, cancellation rules, reminders, and calendar synchronization.',
  'Formularios reales': 'Connect forms to a backend endpoint with schema validation, spam protection, consent capture, accessible errors, loading/success states, secure persistence, and submission notifications.',
  Email: 'Implement transactional email templates, verified sender configuration, queue and retry behavior, unsubscribe and consent rules where applicable, delivery logging, and development previews.',
  CMS: 'Define editable content models, slugs, drafts, publishing workflow, media fields, SEO fields, preview mode, roles, and safe rendering of CMS content.',
  'Panel administrativo': 'Build a protected admin area with roles and permissions, searchable tables, filters, pagination, create/edit/archive actions, audit logs, confirmations, and permission-aware navigation.',
  Analytics: 'Create a consent-aware event plan covering acquisition and conversion funnels, typed event names and properties, page views, errors, purchase attribution, dashboards, and privacy-safe tracking.',
} as const;

function ToggleGroup({ label, options, values, onChange }: { label: string; options: readonly string[]; values: string[]; onChange: (values: string[]) => void }) {
  return <div className="space-y-2"><Label className="text-xs font-bold">{label}</Label><div className="flex flex-wrap gap-1.5">{options.map(option => { const active = values.includes(option); return <button key={option} type="button" aria-pressed={active} onClick={() => onChange(active ? values.filter(value => value !== option) : [...values, option])} className={`rounded-full border px-2.5 py-1.5 text-[11px] transition ${active ? 'border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300' : 'bg-background hover:border-emerald-500/50'}`}>{active ? <Check className="mr-1 inline size-3" /> : null}{option}</button>; })}</div></div>;
}

export function WebRequirementsBuilder({ onApply }: { onApply: (prompt: string) => void }) {
  const [business, setBusiness] = useState('SaaS');
  const [sections, setSections] = useState<string[]>(['Hero', 'Beneficios', 'Precios', 'FAQ', 'Contacto', 'Footer']);
  const [color, setColor] = useState('blue');
  const [platform, setPlatform] = useState<DevelopmentPlatform>('nextjs');
  const [animations, setAnimations] = useState<string[]>(['Microinteracciones', 'Scroll reveal']);
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [forms, setForms] = useState<string[]>(['Contacto']);
  const [languages, setLanguages] = useState<string[]>(['Español']);
  const [style, setStyle] = useState('Minimalista premium');
  const [complexity, setComplexity] = useState('Intermedia');
  const [functionalModules, setFunctionalModules] = useState<string[]>(['Login', 'Dashboard', 'Base de datos', 'Formularios reales', 'Analytics']);
  const [commercialObjective, setCommercialObjective] = useState<CommercialObjective>('leads');
  const [brandName, setBrandName] = useState('');
  const [brandVoice, setBrandVoice] = useState('Profesional y cercana');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#7c3aed');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [customCta, setCustomCta] = useState('');
  const [services, setServices] = useState('');

  const baseBrief = useMemo(() => [
    `Create a production-ready responsive website for a ${business || 'business'}.`,
    `Visual style: ${style}. Primary color system: ${color}. Complexity: ${complexity}.`,
    `Required sections, in order: ${sections.length ? sections.join(', ') : 'Hero, content, contact, footer'}.`,
    `Animations: ${animations.length ? animations.join(', ') : 'none; prioritize performance and accessibility'}.`,
    `Integrations: ${integrations.length ? integrations.join(', ') : 'none'}. Forms: ${forms.length ? forms.join(', ') : 'none'}.`,
    `Languages: ${languages.length ? languages.join(', ') : 'Español'}. Include localized navigation, CTA copy, validation, and accessible labels.`,
    `Functional scope: ${functionalModules.length ? functionalModules.join(', ') : 'static marketing website only'}.`,
    ...functionalModules.map(module => `- ${module}: ${FUNCTIONAL_MODULES[module as keyof typeof FUNCTIONAL_MODULES]}`),
    'For every functional module, specify user flow, UI states, server-side behavior, data entities, validation, authorization, failure recovery, environment variables, and measurable acceptance criteria. Never simulate a successful action when the backend operation has not completed.',
    'Requirements: semantic HTML, mobile-first responsive behavior, accessible keyboard navigation, strong conversion hierarchy, optimized assets, loading and error states, SEO metadata, organized reusable components, and clear setup instructions.',
  ].join('\n'), [business, style, color, complexity, sections, animations, integrations, forms, languages, functionalModules]);

  const commercialVariants = useMemo(() => Object.fromEntries(
    Object.entries(COMMERCIAL_OBJECTIVES).map(([id, objective]) => [id, `${baseBrief}\n\nCOMMERCIAL OBJECTIVE: ${objective.label}.\nPRIMARY CTA: “${objective.cta}”.\nCONVERSION REQUIREMENTS: ${objective.rules} Use one primary action, align supporting CTAs with it, include success and failure states, and measure the complete funnel.`]),
  ) as Record<CommercialObjective, string>, [baseBrief]);

  const platformVariants = useMemo(() => Object.fromEntries(
    Object.entries(DEVELOPMENT_PLATFORMS).map(([id, preset]) => [id, `${commercialVariants[commercialObjective]}\n\nTARGET PLATFORM: ${preset.label}.\nPLATFORM-SPECIFIC DELIVERY: ${preset.rules}`]),
  ) as Record<DevelopmentPlatform, string>, [commercialVariants, commercialObjective]);

  const objectiveVariantsForPlatform = useMemo(() => Object.fromEntries(
    Object.entries(commercialVariants).map(([id, objectivePrompt]) => [id, `${objectivePrompt}\n\nTARGET PLATFORM: ${DEVELOPMENT_PLATFORMS[platform].label}.\nPLATFORM-SPECIFIC DELIVERY: ${DEVELOPMENT_PLATFORMS[platform].rules}`]),
  ) as Record<CommercialObjective, string>, [commercialVariants, platform]);

  const prompt = platformVariants[platform];

  const premiumPromptKit = useMemo(() => ({
    main: prompt,
    improvement: `${prompt}\n\nIMPROVEMENT PASS: Audit the existing implementation before changing it. Improve conversion hierarchy, visual consistency, component reuse, performance, loading states, copy clarity, and maintainability. Preserve working behavior and list every material change with its reason.`,
    mobile: `${prompt}\n\nMOBILE PASS: Redesign mobile-first for 320px–480px widths. Define navigation, content order, touch targets, sticky actions, forms, tables, modals, keyboard behavior, safe areas, responsive images, performance budgets, and tests for overflow and layout shift.`,
    animations: `${prompt}\n\nMOTION PASS: Add purposeful animations with named triggers, duration, easing, delay, and exit behavior. Respect prefers-reduced-motion, avoid blocking interaction and layout shift, use transform and opacity where possible, and define static fallbacks.`,
    seo: `${prompt}\n\nSEO PASS: Implement search intent mapping, unique titles and descriptions, canonical URLs, robots directives, sitemap, semantic heading structure, structured data, social metadata, internal links, image alt strategy, Core Web Vitals improvements, and an indexability checklist.`,
    accessibility: `${prompt}\n\nACCESSIBILITY PASS: Target WCAG 2.2 AA. Audit semantics, landmarks, heading order, keyboard operation, focus management, contrast, labels, errors, live regions, reduced motion, zoom, screen readers, and touch targets. Provide fixes and a manual testing checklist.`,
    debugging: `${prompt}\n\nDEBUGGING PASS: Reproduce and isolate defects before editing. Check runtime and build errors, network requests, hydration, state, forms, auth, database operations, responsive overflow, accessibility, and browser compatibility. Apply the smallest safe fix, add regression tests, and report root cause and verification.`,
    backend: `${prompt}\n\nBACKEND PASS: Implement production-ready server architecture for the selected functional modules. Define schema and migrations, API or server actions, authentication and authorization, validation, transactions, idempotency, webhooks, file storage, email jobs, rate limits, audit logs, observability, backups, environment variables, seed data, tests, and deployment instructions. Never expose secrets to the client.`,
  }), [prompt]);

  const personalizedPrompt = useMemo(() => `${prompt}\n\nPOST-PURCHASE BRAND CUSTOMIZATION:\n- Brand name: ${brandName.trim() || '[ask the customer for the brand name]'}.\n- Brand voice: ${brandVoice}.\n- Exact color tokens: primary ${primaryColor}, secondary ${secondaryColor}; generate accessible foreground and state colors, preserve both brand colors, and verify WCAG contrast.\n- Main headline: ${headline.trim() || '[write a benefit-led headline based on the business]'}.\n- Supporting text: ${subheadline.trim() || '[write concise supporting copy]'}.\n- Primary CTA copy: ${customCta.trim() || COMMERCIAL_OBJECTIVES[commercialObjective].cta}.\n- Products or services: ${services.trim() || '[use the services supplied by the customer; do not invent claims]'}.\n\nReplace all placeholder brands, lorem ipsum, generic products, fake metrics, fabricated testimonials, stock contact details, and irrelevant CTAs. Keep the purchased template structure unless a change is required by the supplied content. Return a content map showing where every brand text, color, service, link, image, and CTA was applied.`, [prompt, brandName, brandVoice, primaryColor, secondaryColor, headline, subheadline, customCta, commercialObjective, services]);

  return <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4"><div className="mb-4 flex items-start gap-2"><Layers3 className="mt-0.5 size-5 text-emerald-600" /><div><h3 className="text-sm font-bold">Editor visual de requisitos</h3><p className="text-xs text-muted-foreground">Configura el proyecto sin escribir especificaciones técnicas.</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="space-y-1.5"><Label className="text-xs font-bold">Tipo de negocio</Label><Input value={business} onChange={event => setBusiness(event.target.value)} placeholder="SaaS, restaurante, portfolio…" className="bg-background text-xs" /></div><div className="space-y-1.5"><Label className="text-xs font-bold">Objetivo comercial</Label><Select value={commercialObjective} onValueChange={value => setCommercialObjective(value as CommercialObjective)}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(COMMERCIAL_OBJECTIVES).map(([id, objective]) => <SelectItem key={id} value={id}>{objective.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs font-bold">Plataforma de desarrollo</Label><Select value={platform} onValueChange={value => setPlatform(value as DevelopmentPlatform)}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(DEVELOPMENT_PLATFORMS).map(([id, preset]) => <SelectItem key={id} value={id}>{preset.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs font-bold">Estilo visual</Label><Select value={style} onValueChange={setStyle}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{['Minimalista premium', 'Editorial', 'Glassmorphism', 'Brutalista', 'Corporativo', 'E-commerce', 'Neón futurista', 'Orgánico'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs font-bold">Nivel de complejidad</Label><Select value={complexity} onValueChange={setComplexity}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{['Básica', 'Intermedia', 'Avanzada', 'Aplicación completa'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label className="text-xs font-bold">Paleta principal</Label><div className="flex flex-wrap gap-2">{COLORS.map(option => <button key={option.id} type="button" aria-label={option.label} aria-pressed={color === option.id} onClick={() => setColor(option.id)} className={`flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-[11px] ${color === option.id ? 'border-emerald-500 ring-2 ring-emerald-500/15' : ''}`}><span className={`size-4 rounded-full ${option.className}`} />{option.label}</button>)}</div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><ToggleGroup label="Secciones" options={OPTIONS.sections} values={sections} onChange={setSections} /><ToggleGroup label="Animaciones" options={OPTIONS.animations} values={animations} onChange={setAnimations} /><ToggleGroup label="Integraciones" options={OPTIONS.integrations} values={integrations} onChange={setIntegrations} /><ToggleGroup label="Formularios" options={OPTIONS.forms} values={forms} onChange={setForms} /><ToggleGroup label="Idiomas" options={OPTIONS.languages} values={languages} onChange={setLanguages} /></div><div className="mt-5 rounded-lg border border-blue-500/25 bg-blue-500/5 p-4"><div className="mb-3"><h4 className="text-sm font-bold">Módulos funcionales</h4><p className="text-[11px] text-muted-foreground">Cada selección añade backend, datos, seguridad, estados y criterios de aceptación al prompt.</p></div><ToggleGroup label="Selecciona funcionalidades reales" options={Object.keys(FUNCTIONAL_MODULES)} values={functionalModules} onChange={setFunctionalModules} />{functionalModules.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{functionalModules.map(module => <div key={module} className="rounded-md border bg-background p-2 text-[10px]"><strong className="text-blue-600">{module}</strong><p className="mt-1 line-clamp-2 text-muted-foreground">{FUNCTIONAL_MODULES[module as keyof typeof FUNCTIONAL_MODULES]}</p></div>)}</div> : null}</div><div className="mt-4 rounded-lg border border-rose-500/25 bg-rose-500/5 p-4"><div className="mb-3 flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Variantes por objetivo comercial</p><h4 className="text-sm font-bold">Una página, siete embudos de conversión</h4></div><Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(JSON.stringify(objectiveVariantsForPlatform, null, 2))}><Copy className="mr-1 size-3" />Copiar las 7</Button></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(COMMERCIAL_OBJECTIVES).map(([id, objective]) => <button key={id} type="button" onClick={() => setCommercialObjective(id as CommercialObjective)} className={`rounded-lg border p-3 text-left transition ${commercialObjective === id ? 'border-rose-500 bg-rose-500/10' : 'bg-background hover:border-rose-500/50'}`}><p className="text-xs font-bold">{objective.label}</p><p className="mt-1 text-[10px] text-muted-foreground">CTA: {objective.cta}</p></button>)}</div></div><div className="mt-4 rounded-lg border bg-background p-3"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Prompt generado para {DEVELOPMENT_PLATFORMS[platform].label}</p><p className="text-[10px] text-muted-foreground">{COMMERCIAL_OBJECTIVES[commercialObjective].label} · 11 plataformas · {functionalModules.length} módulos.</p></div><div className="flex flex-wrap gap-1">{Object.values(DEVELOPMENT_PLATFORMS).map(preset => <span key={preset.label} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold">{preset.label}</span>)}</div></div><p className="line-clamp-5 whitespace-pre-line text-xs leading-5 text-muted-foreground">{prompt}</p></div><div className="mt-4 rounded-lg border border-indigo-500/25 bg-indigo-500/5 p-4"><div className="mb-3 flex items-start gap-2"><Palette className="mt-0.5 size-4 text-indigo-600" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Personalización posterior a la compra</p><h4 className="text-sm font-bold">Convierte la plantilla en una página de marca</h4></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div className="space-y-1.5"><Label className="text-xs">Nombre de la marca</Label><Input value={brandName} onChange={event => setBrandName(event.target.value)} placeholder="Acme Studio" className="bg-background text-xs" /></div><div className="space-y-1.5"><Label className="text-xs">Voz de marca</Label><Select value={brandVoice} onValueChange={setBrandVoice}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{['Profesional y cercana', 'Premium y exclusiva', 'Directa y comercial', 'Divertida y juvenil', 'Técnica y experta', 'Minimalista y sobria'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-2 gap-2"><div className="space-y-1.5"><Label className="text-xs">Color principal</Label><div className="flex gap-1"><Input type="color" value={primaryColor} onChange={event => setPrimaryColor(event.target.value)} className="h-9 w-12 bg-background p-1" /><Input value={primaryColor} onChange={event => setPrimaryColor(event.target.value)} className="h-9 bg-background px-2 font-mono text-[10px]" /></div></div><div className="space-y-1.5"><Label className="text-xs">Secundario</Label><div className="flex gap-1"><Input type="color" value={secondaryColor} onChange={event => setSecondaryColor(event.target.value)} className="h-9 w-12 bg-background p-1" /><Input value={secondaryColor} onChange={event => setSecondaryColor(event.target.value)} className="h-9 bg-background px-2 font-mono text-[10px]" /></div></div></div><div className="space-y-1.5"><Label className="text-xs">Título principal</Label><Input value={headline} onChange={event => setHeadline(event.target.value)} placeholder="La promesa principal de tu marca" className="bg-background text-xs" /></div><div className="space-y-1.5"><Label className="text-xs">Texto de apoyo</Label><Input value={subheadline} onChange={event => setSubheadline(event.target.value)} placeholder="Explica el beneficio en una frase" className="bg-background text-xs" /></div><div className="space-y-1.5"><Label className="text-xs">Texto del CTA</Label><Input value={customCta} onChange={event => setCustomCta(event.target.value)} placeholder={COMMERCIAL_OBJECTIVES[commercialObjective].cta} className="bg-background text-xs" /></div><div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label className="text-xs">Productos o servicios</Label><Textarea value={services} onChange={event => setServices(event.target.value)} placeholder="Describe cada producto o servicio, beneficio, precio y enlace real…" className="min-h-20 bg-background text-xs" /></div></div><div className="mt-3 rounded-md border bg-background p-3"><p className="text-[10px] font-bold uppercase text-indigo-600">Vista previa del prompt personalizado</p><p className="mt-1 line-clamp-4 whitespace-pre-line text-[10px] leading-4 text-muted-foreground">{personalizedPrompt}</p></div><div className="mt-3 flex gap-2"><Button type="button" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => onApply(personalizedPrompt)}><Sparkles className="mr-1 size-3" />Usar prompt personalizado</Button><Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(personalizedPrompt)}><Copy className="mr-1 size-3" />Copiar</Button></div></div><div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4"><div className="mb-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Kit Premium por plantilla</p><h4 className="mt-1 text-sm font-bold">8 prompts para construir, mejorar y mantener la página</h4></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(premiumPromptKit).map(([key, kitPrompt]) => <div key={key} className="rounded-lg border bg-background p-3"><p className="text-xs font-bold">{PROMPT_KIT_LABELS[key as keyof typeof PROMPT_KIT_LABELS]}</p><p className="mt-1 line-clamp-3 text-[10px] leading-4 text-muted-foreground">{kitPrompt}</p><div className="mt-2 flex gap-1"><Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => onApply(kitPrompt)}><Sparkles className="mr-1 size-3" />Usar</Button><Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => void navigator.clipboard.writeText(kitPrompt)}><Copy className="mr-1 size-3" />Copiar</Button></div></div>)}</div></div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" onClick={() => onApply(prompt)} className="bg-emerald-600 text-white hover:bg-emerald-700"><Sparkles className="mr-2 size-4" />Aplicar versión de {DEVELOPMENT_PLATFORMS[platform].label}</Button><Button type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(JSON.stringify(platformVariants, null, 2))}><Copy className="mr-2 size-4" />Copiar las 11 variantes</Button><Button type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(JSON.stringify(premiumPromptKit, null, 2))}><Copy className="mr-2 size-4" />Copiar Kit Premium</Button></div></section>;
}
