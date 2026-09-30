/** @jsxRuntime automatic */
/** @jsxImportSource react */
'use client';

/**
 * Catálogo de componentes publicables del Visual Website Builder.
 *
 * Cada entrada del registro describe **todo** lo que hace falta para insertar,
 * editar, validar y renderizar un componente: sus props por defecto, el
 * contrato de propiedades editables, los hijos que admite, los controles de
 * estilo que el inspector ofrece y qué puede cambiar entre breakpoints.
 *
 * El catálogo no sabe de React más allá del `Component` de cada entrada, y
 * `page-schema.ts` —que es puro— no sabe nada de este archivo. Así, validar un
 * documento que llega de una IA no requiere cargar ni ejecutar la interfaz.
 */

import { memo, type JSX, type ReactNode } from 'react';
import {
  PAGE_CHILDREN,
  PAGE_PROP_FIELDS,
  resolveThemeTokens,
  safeUrl,
  type PageComponentType,
  type PageNode,
  type PropField,
} from '@/lib/editor/page-schema';
import type { DesignTokens } from '@/lib/editor/tokens';
import { buildControls, type ControlDescriptor } from '@/lib/editor/property-controls';

/* ------------------------------------------------------------------ tipos --- */

export type StyleControlKind = 'length' | 'color' | 'select' | 'spacing' | 'alignment' | 'border' | 'shadow';

export type StyleControl = {
  property: string;
  label: string;
  kind: StyleControlKind;
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
};

export type ResponsiveCapabilities = {
  /** Breakpoints donde el componente puede declarar estilos propios. */
  breakpoints: readonly string[];
  /** `true` si el componente puede reorganizar sus hijos por breakpoint. */
  supportsChildLayout: boolean;
  /** Qué ocurre con los hijos al estrechar, para el inspector. */
  stacking: 'always' | 'on-mobile' | 'never' | 'n/a';
  /** Texto que explica la conducta al usuario. */
  note: string;
};

export type PageComponentDefinition = {
  type: PageComponentType;
  label: string;
  description: string;
  category: 'structure' | 'navigation' | 'typography' | 'media' | 'conversion' | 'social-proof';
  /** Elemento raíz que emite el componente; útil para tests y semántica. */
  element: keyof JSX.IntrinsicElements;
  /** Props que se aplican al insertar. */
  defaultProps: Record<string, unknown>;
  /** Estilos de `desktop` que se aplican al insertar. */
  defaultStyles: Record<string, string | number>;
  /** Propiedades editables, derivadas del contrato de `page-schema.ts`. */
  editableProps: readonly PropField[];
  /** Controles que el inspector pinta para este tipo. */
  controls: readonly ControlDescriptor[];
  /** Tipos de hijo admitidos; `[]` = hoja. */
  allowedChildren: readonly PageComponentType[];
  styleControls: readonly StyleControl[];
  responsive: ResponsiveCapabilities;
  /** Componente React. Recibe los props ya validados y normalizados. */
  component: ComponentRenderer;
};

export type ComponentRenderer = (props: RenderProps) => ReactNode;

/** Contexto que el renderer entrega a cada componente. */
export type RenderProps = {
  node: PageNode;
  tokens: DesignTokens;
  /** Hijos ya renderizados; los componentes hoja los ignoran. */
  children?: ReactNode;
  /** Viewport objetivo; por defecto `desktop`. */
  breakpoint: string;
};

/* ------------------------------------------------------------- auxiliares --- */

/** Lee un prop de tipo texto con valor por defecto. */
const text = (props: Record<string, unknown>, key: string, fallback = ''): string => {
  const value = props[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
};

/** Lee un prop de tipo lista de objetos, ignorando entradas malformadas. */
const items = <T extends Record<string, unknown>>(
  props: Record<string, unknown>,
  key: string,
  keys: readonly (keyof T)[]
): T[] => {
  const value = props[key];
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const item = {} as T;
    let usable = true;
    for (const field of keys) {
      const fieldValue = record[field as string];
      if (typeof fieldValue !== 'string') {
        usable = false;
        break;
      }
      (item as Record<string, unknown>)[field as string] = fieldValue;
    }
    if (usable) out.push(item);
  }
  return out;
};

/**
 * Devuelve la entrada cruda de una lista cuyo `matchField` coincide, para leer
 * una sublista anidada (las prestaciones de un plan, los enlaces de una columna).
 */
function findItem(
  props: Record<string, unknown>,
  key: string,
  matchField: string,
  matchValue: string
): Record<string, unknown> | undefined {
  const value = props[key];
  if (!Array.isArray(value)) return undefined;
  for (const entry of value) {
    if (entry && typeof entry === 'object' && !Array.isArray(entry) && (entry as Record<string, unknown>)[matchField] === matchValue) {
      return entry as Record<string, unknown>;
    }
  }
  return undefined;
}

/** Enlace seguro: si la URL no pasa el validador, se degrada a texto plano. */
function SafeLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const safe = safeUrl(href);
  if (!safe) {
    return (
      <span className={className} aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  const external = /^https?:\/\//i.test(safe);
  return (
    <a
      className={className}
      href={safe}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

const btn = (variant: string, size: string): string => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--ps-radius-md,12px)] font-semibold transition-colors no-underline';
  const variants: Record<string, string> = {
    primary: 'bg-[var(--ps-color-primary,#8b5cf6)] text-white hover:opacity-90',
    secondary: 'bg-transparent text-[var(--ps-color-ink,#0f172a)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] hover:opacity-80',
    ghost: 'bg-transparent text-[var(--ps-color-primary,#8b5cf6)] hover:underline',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-base', lg: 'px-7 py-3.5 text-lg' };
  return `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md}`;
};

/** Contenedor con ancho máximo coherente. */
function Shell({ width = 'default', children, className = '' }: { width?: string; children: ReactNode; className?: string }) {
  const widths: Record<string, string> = {
    narrow: 'max-w-3xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
    full: 'max-w-none',
  };
  return <div className={`mx-auto w-full px-5 ${widths[width] ?? widths.default} ${className}`}>{children}</div>;
}

const SectionTitle = memo(function SectionTitle({ text: value }: { text?: string }) {
  if (!value) return null;
  return (
    <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-[var(--ps-color-ink,#0f172a)] sm:text-4xl">
      {value}
    </h2>
  );
});

/* ------------------------------------------------------------ componentes --- */

const Navbar: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const links = items<{ label: string; href: string }>(props, 'links', ['label', 'href']);
  return (
    <header className="flex w-full flex-col gap-4 border-b border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-surface,#fff)] py-4">
      <Shell width="wide">
        <nav className="flex flex-wrap items-center justify-between gap-4" aria-label="Navegación principal">
          <SafeLink href={text(props, 'brandHref', '/')} className="text-lg font-black text-[var(--ps-color-ink,#0f172a)] no-underline">
            {text(props, 'brand', 'Marca')}
          </SafeLink>
          {links.length ? (
            <ul className="flex flex-wrap items-center gap-2 sm:gap-4">
              {links.map(link => (
                <li key={`${link.label}-${link.href}`}>
                  <SafeLink href={link.href} className="text-sm font-medium text-[var(--ps-color-muted,#64748b)] no-underline hover:text-[var(--ps-color-primary,#8b5cf6)]">
                    {link.label}
                  </SafeLink>
                </li>
              ))}
            </ul>
          ) : null}
          {props.showCta === true && text(props, 'ctaLabel') ? (
            <SafeLink href={text(props, 'ctaHref', '#')} className={btn('primary', 'sm')}>
              {text(props, 'ctaLabel')}
            </SafeLink>
          ) : null}
        </nav>
      </Shell>
    </header>
  );
};

const Hero: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const centered = text(props, 'align', 'center') === 'center';
  return (
    <section className={`w-full bg-[var(--ps-color-background,#f8fafc)] ${centered ? 'text-center' : ''}`}>
      <Shell width="default" className={centered ? 'flex flex-col items-center' : ''}>
        {text(props, 'eyebrow') ? (
          <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--ps-color-primary,#8b5cf6)]">
            {text(props, 'eyebrow')}
          </p>
        ) : null}
        <h1 className="text-4xl font-black leading-tight tracking-tight text-[var(--ps-color-ink,#0f172a)] sm:text-5xl lg:text-6xl">
          {text(props, 'title', 'Título principal')}
        </h1>
        {text(props, 'subtitle') ? (
          <p className={`mt-5 text-lg text-[var(--ps-color-muted,#64748b)] ${centered ? 'max-w-2xl' : 'max-w-xl'}`}>
            {text(props, 'subtitle')}
          </p>
        ) : null}
        {text(props, 'primaryLabel') || text(props, 'secondaryLabel') ? (
          <div className={`mt-8 flex flex-wrap gap-3 ${centered ? 'justify-center' : ''}`}>
            {text(props, 'primaryLabel') ? (
              <SafeLink href={text(props, 'primaryHref', '#')} className={btn('primary', 'lg')}>
                {text(props, 'primaryLabel')}
              </SafeLink>
            ) : null}
            {text(props, 'secondaryLabel') ? (
              <SafeLink href={text(props, 'secondaryHref', '#')} className={btn('secondary', 'lg')}>
                {text(props, 'secondaryLabel')}
              </SafeLink>
            ) : null}
          </div>
        ) : null}
      </Shell>
    </section>
  );
};

const Heading: ComponentRenderer = ({ node }) => {
  const level = text(node.props, 'level', 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
  const sizes: Record<string, string> = {
    h1: 'text-4xl sm:text-5xl',
    h2: 'text-3xl sm:text-4xl',
    h3: 'text-2xl sm:text-3xl',
    h4: 'text-xl sm:text-2xl',
  };
  const Tag = level;
  return (
    <Tag className={`${sizes[level]} font-bold tracking-tight text-[var(--ps-color-ink,#0f172a)]`}>
      {text(node.props, 'text', 'Encabezado')}
    </Tag>
  );
};

const Text: ComponentRenderer = ({ node }) => {
  const tone = text(node.props, 'tone', 'default');
  const tones: Record<string, string> = {
    default: 'text-[var(--ps-color-ink,#0f172a)]',
    muted: 'text-[var(--ps-color-muted,#64748b)]',
    strong: 'font-semibold text-[var(--ps-color-ink,#0f172a)]',
  };
  return (
    <p className={`whitespace-pre-line text-base leading-relaxed sm:text-lg ${tones[tone] ?? tones.default}`}>
      {text(node.props, 'text')}
    </p>
  );
};

const Image: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const src = safeUrl(props.src);
  const ratio = text(props, 'ratio', 'auto');
  const ratios: Record<string, string> = {
    auto: '',
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
  };
  const fit = text(props, 'fit', 'cover') === 'contain' ? 'object-contain' : 'object-cover';
  const frame = ratios[ratio] ? `w-full overflow-hidden rounded-[var(--ps-radius-md,12px)] ${ratios[ratio]}` : 'w-full';
  if (!src) {
    return <div className={`${frame} bg-[var(--ps-color-background,#f8fafc)] border border-dashed border-[var(--ps-color-border,rgba(15,23,42,.12))] p-6 text-center text-sm text-[var(--ps-color-muted,#64748b)]`}>Imagen pendiente</div>;
  }
  return (
    <figure className={frame}>
      <img
        src={src}
        alt={text(props, 'alt')}
        loading="lazy"
        decoding="async"
        className={`${ratios[ratio] ? 'h-full w-full' : 'w-full'} ${fit}`}
      />
      {text(props, 'caption') ? (
        <figcaption className="mt-2 text-sm text-[var(--ps-color-muted,#64748b)]">{text(props, 'caption')}</figcaption>
      ) : null}
    </figure>
  );
};

const Button: ComponentRenderer = ({ node }) => {
  const props = node.props;
  return (
    <SafeLink href={text(props, 'href', '#')} className={btn(text(props, 'variant', 'primary'), text(props, 'size', 'md'))}>
      {text(props, 'label', 'Botón')}
    </SafeLink>
  );
};

const Container: ComponentRenderer = ({ node, children }) => {
  const align = text(node.props, 'align', 'stretch');
  const aligns: Record<string, string> = { start: 'items-start', center: 'items-center', stretch: 'items-stretch' };
  return (
    <Shell width={text(node.props, 'width', 'default')} className={`flex flex-col gap-6 ${aligns[align] ?? aligns.stretch}`}>
      {children}
    </Shell>
  );
};

const Columns: ComponentRenderer = ({ node, children }) => {
  const count = text(node.props, 'count', '2');
  const gap = text(node.props, 'gap', 'normal');
  const gaps: Record<string, string> = { tight: 'gap-3', normal: 'gap-6', loose: 'gap-10' };
  const grids: Record<string, string> = {
    '1': 'grid-cols-1',
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-2 lg:grid-cols-3',
    '4': 'sm:grid-cols-2 lg:grid-cols-4',
  };
  return <div className={`grid ${grids[count] ?? grids['2']} ${gaps[gap] ?? gaps.normal}`}>{children}</div>;
};

const Features: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const list = items<{ title: string; description?: string; icon?: string }>(props, 'items', ['title']);
  const asList = text(props, 'layout', 'cards') === 'list';
  return (
    <section className="w-full" id="features">
      <Shell width="default">
        {text(props, 'heading') ? <SectionTitle text={text(props, 'heading')} /> : null}
        {text(props, 'intro') ? (
          <p className="mx-auto mb-10 max-w-2xl text-center text-[var(--ps-color-muted,#64748b)]">{text(props, 'intro')}</p>
        ) : null}
        <div className={`grid gap-6 ${asList ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {list.map(feature => (
            <article
              key={feature.title}
              className="rounded-[var(--ps-radius-lg,20px)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-surface,#fff)] p-6 shadow-[var(--ps-shadow-sm,0_1px_2px_rgba(15,23,42,.08))]"
            >
              {feature.icon ? <p className="mb-3 text-2xl" aria-hidden="true">{feature.icon}</p> : null}
              <h3 className="mb-2 text-lg font-bold text-[var(--ps-color-ink,#0f172a)]">{feature.title}</h3>
              {feature.description ? (
                <p className="text-sm leading-relaxed text-[var(--ps-color-muted,#64748b)]">{feature.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      </Shell>
    </section>
  );
};

const Gallery: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const images = items<{ src: string; alt?: string }>(props, 'images', ['src']);
  const columns = text(props, 'columns', '3');
  const grids: Record<string, string> = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' };
  const safeImages = images.map(image => ({ src: safeUrl(image.src), alt: image.alt ?? '' })).filter(image => image.src);
  return (
    <section className="w-full" id="gallery">
      <Shell width="wide">
        {text(props, 'heading') ? <SectionTitle text={text(props, 'heading')} /> : null}
        <div className={`grid gap-4 ${grids[columns] ?? grids['3']}`}>
          {safeImages.map((image, index) => (
            <img
              key={`${image.src}-${index}`}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-[var(--ps-radius-md,12px)] object-cover"
            />
          ))}
        </div>
      </Shell>
    </section>
  );
};

const Pricing: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const plans = items<{ name: string; price: string; period?: string }>(props, 'plans', ['name', 'price']);
  const highlight = text(props, 'highlight', 'middle');
  const highlightIndex = highlight === 'none' ? -1 : plans.length ? Math.min(plans.length - 1, Math.max(0, highlight === 'first' ? 0 : highlight === 'last' ? plans.length - 1 : Math.floor(plans.length / 2))) : -1;
  const featuresFor = (name: string): string[] => {
    const plan = findItem(props, 'plans', 'name', name);
    return plan ? items<{ label: string }>(plan, 'features', ['label']).map(feature => feature.label) : [];
  };
  return (
    <section className="w-full" id="pricing">
      <Shell width="default">
        {text(props, 'heading') ? <SectionTitle text={text(props, 'heading')} /> : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const featured = index === highlightIndex;
            const included = featuresFor(plan.name);
            return (
              <article
                key={plan.name}
                className={`flex flex-col rounded-[var(--ps-radius-lg,20px)] border p-7 ${
                  featured
                    ? 'border-[var(--ps-color-primary,#8b5cf6)] bg-[var(--ps-color-surface,#fff)] shadow-[var(--ps-shadow-md,0_12px_35px_rgba(15,23,42,.14))]'
                    : 'border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-surface,#fff)]'
                }`}
                aria-label={`Plan ${plan.name}`}
              >
                <h3 className="text-lg font-bold text-[var(--ps-color-ink,#0f172a)]">{plan.name}</h3>
                <p className="mt-3 text-4xl font-black text-[var(--ps-color-ink,#0f172a)]">
                  {plan.price}
                  {plan.period ? <span className="ml-1 text-sm font-medium text-[var(--ps-color-muted,#64748b)]">{plan.period}</span> : null}
                </p>
                {included.length ? (
                  <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm text-[var(--ps-color-muted,#64748b)]">
                    {included.map(feature => (
                      <li key={feature}>· {feature}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      </Shell>
    </section>
  );
};

const Testimonials: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const quotes = items<{ quote: string; author: string; role?: string }>(props, 'items', ['quote', 'author']);
  return (
    <section className="w-full bg-[var(--ps-color-background,#f8fafc)]" id="testimonials">
      <Shell width="default">
        {text(props, 'heading') ? <SectionTitle text={text(props, 'heading')} /> : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map(entry => (
            <figure
              key={`${entry.author}-${entry.quote.slice(0, 12)}`}
              className="flex flex-col rounded-[var(--ps-radius-lg,20px)] bg-[var(--ps-color-surface,#fff)] p-6 shadow-[var(--ps-shadow-sm,0_1px_2px_rgba(15,23,42,.08))]"
            >
              <blockquote className="flex-1 text-[var(--ps-color-ink,#0f172a)]">“{entry.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-bold text-[var(--ps-color-ink,#0f172a)]">{entry.author}</span>
                {entry.role ? <span className="text-[var(--ps-color-muted,#64748b)]"> · {entry.role}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </Shell>
    </section>
  );
};

const Faq: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const pairs = items<{ question: string; answer: string }>(props, 'items', ['question', 'answer']);
  return (
    <section className="w-full" id="faq">
      <Shell width="narrow">
        {text(props, 'heading') ? <SectionTitle text={text(props, 'heading')} /> : null}
        <div className="flex flex-col gap-4">
          {pairs.map(pair => (
            <details
              key={pair.question}
              className="rounded-[var(--ps-radius-md,12px)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-surface,#fff)] p-5"
            >
              <summary className="cursor-pointer font-semibold text-[var(--ps-color-ink,#0f172a)]">{pair.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ps-color-muted,#64748b)]">{pair.answer}</p>
            </details>
          ))}
        </div>
      </Shell>
    </section>
  );
};

const ContactForm: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const requested = items<{ name: string }>(props, 'fields', ['name']).map(field => field.name);
  const onlyEmail = requested.length === 1 && requested[0]?.toLowerCase() === 'email';
  return (
    <section className="w-full" id="contacto">
      <Shell width="narrow">
        {text(props, 'heading') ? <SectionTitle text={text(props, 'heading')} /> : null}
        {text(props, 'intro') ? (
          <p className="mb-8 text-center text-[var(--ps-color-muted,#64748b)]">{text(props, 'intro')}</p>
        ) : null}
        <form
          className="flex flex-col gap-4 rounded-[var(--ps-radius-lg,20px)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-surface,#fff)] p-6"
          method="post"
          action={text(props, 'emailTo') ? `/api/lead?emailTo=${encodeURIComponent(text(props, 'emailTo'))}` : '/api/lead'}
        >
          {onlyEmail ? null : (
            <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ps-color-ink,#0f172a)]">
              Nombre
              <input
                name="name"
                type="text"
                required
                className="rounded-[var(--ps-radius-sm,6px)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-background,#f8fafc)] px-3 py-2"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ps-color-ink,#0f172a)]">
            Email
            <input
              name="email"
              type="email"
              required
              className="rounded-[var(--ps-radius-sm,6px)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-background,#f8fafc)] px-3 py-2"
            />
          </label>
          {requested.includes('message') ? (
            <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ps-color-ink,#0f172a)]">
              Mensaje
              <textarea
                name="message"
                rows={4}
                className="rounded-[var(--ps-radius-sm,6px)] border border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-background,#f8fafc)] px-3 py-2"
              />
            </label>
          ) : null}
          <button type="submit" className={btn('primary', 'md')}>
            {text(props, 'submitLabel', 'Enviar')}
          </button>
          {text(props, 'successMessage') ? (
            <p className="text-center text-xs text-[var(--ps-color-muted,#64748b)]" role="status">
              {text(props, 'successMessage')}
            </p>
          ) : null}
        </form>
      </Shell>
    </section>
  );
};

const Cta: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const centered = text(props, 'align', 'center') === 'center';
  return (
    <section className="w-full bg-[var(--ps-color-primary,#8b5cf6)] text-white">
      <Shell width="narrow" className={centered ? 'text-center' : ''}>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{text(props, 'title', '¿Listo para empezar?')}</h2>
        {text(props, 'subtitle') ? <p className="mt-4 text-lg opacity-90">{text(props, 'subtitle')}</p> : null}
        {text(props, 'buttonLabel') ? (
          <div className={`mt-8 ${centered ? 'flex justify-center' : ''}`}>
            <SafeLink href={text(props, 'buttonHref', '#')} className={`${btn('secondary', 'lg')} !border-white !text-white`}>
              {text(props, 'buttonLabel')}
            </SafeLink>
          </div>
        ) : null}
      </Shell>
    </section>
  );
};

const Footer: ComponentRenderer = ({ node }) => {
  const props = node.props;
  const columns = items<{ title: string }>(props, 'columns', ['title']);
  const linksOf = (title: string): Array<{ label: string; href: string }> => {
    const column = findItem(props, 'columns', 'title', title);
    return column ? items<{ label: string; href: string }>(column, 'links', ['label', 'href']) : [];
  };
  return (
    <footer className="w-full border-t border-[var(--ps-color-border,rgba(15,23,42,.12))] bg-[var(--ps-color-surface,#fff)]">
      <Shell width="wide">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="text-lg font-black text-[var(--ps-color-ink,#0f172a)]">{text(props, 'brand', 'Marca')}</p>
            {text(props, 'tagline') ? <p className="mt-2 text-sm text-[var(--ps-color-muted,#64748b)]">{text(props, 'tagline')}</p> : null}
          </div>
          {columns.length ? (
            <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map(column => (
                <nav key={column.title} aria-label={column.title}>
                  <p className="mb-3 text-sm font-bold text-[var(--ps-color-ink,#0f172a)]">{column.title}</p>
                  <ul className="flex flex-col gap-2 text-sm">
                    {linksOf(column.title).map(link => (
                      <li key={`${link.label}-${link.href}`}>
                        <SafeLink href={link.href} className="text-[var(--ps-color-muted,#64748b)] no-underline hover:text-[var(--ps-color-primary,#8b5cf6)]">
                          {link.label}
                        </SafeLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          ) : null}
        </div>
        <p className="mt-10 border-t border-[var(--ps-color-border,rgba(15,23,42,.12))] pt-6 text-center text-xs text-[var(--ps-color-muted,#64748b)]">
          {text(props, 'copyright', 'Todos los derechos reservados.')}
        </p>
      </Shell>
    </footer>
  );
};

/* --------------------------------------------------------------- estilos --- */

const LENGTH = (property: string, label: string, min = 0, max = 400): StyleControl => ({
  property,
  label,
  kind: 'length',
  min,
  max,
  step: 4,
});
const COLOR = (property: string, label: string): StyleControl => ({ property, label, kind: 'color' });
const ALIGN = (property: string, label: string): StyleControl => ({ property, label, kind: 'alignment' });
const SELECT_STYLE = (property: string, label: string, options: readonly string[]): StyleControl => ({
  property,
  label,
  kind: 'select',
  options,
});
const SPACING = (property: string, label: string): StyleControl => ({ property, label, kind: 'spacing' });

const ALL_BREAKPOINTS = ['desktop', 'laptop', 'tablet', 'mobile'] as const;
const responsive = (note: string, stacking: ResponsiveCapabilities['stacking'] = 'n/a', supportsChildLayout = false): ResponsiveCapabilities => ({
  breakpoints: ALL_BREAKPOINTS,
  supportsChildLayout,
  stacking,
  note,
});

/** Rejilla responsive genérica, compartida por las secciones de contenido. */
const CONTENT_STYLE_CONTROLS: readonly StyleControl[] = [
  SPACING('paddingBlock', 'Relleno vertical'),
  SPACING('paddingInline', 'Relleno horizontal'),
  COLOR('background', 'Fondo'),
  ALIGN('textAlign', 'Alineación del texto'),
];

const CONTENT_DEFAULTS: Record<string, string | number> = { paddingBlock: 64, background: 'var(--ps-color-background)' };

/* -------------------------------------------------------------- registro --- */

type Seed = {
  label: string;
  description: string;
  category: PageComponentDefinition['category'];
  element: keyof JSX.IntrinsicElements;
  defaultProps: Record<string, unknown>;
  defaultStyles?: Record<string, string | number>;
  styleControls: readonly StyleControl[];
  responsive: ResponsiveCapabilities;
  component: ComponentRenderer;
};

/**
 * Fuentes de verdad del catálogo.
 *
 * `Record<PageComponentType, …>` obliga a que los 16 tipos existan: si mañana se
 * añade uno al contrato de `page-schema.ts`, el compilador señala aquí la
 * entrada que falta.
 */
const SEEDS: Record<PageComponentType, Seed> = {
  navbar: {
    label: 'Barra de navegación',
    description: 'Marca, enlaces y llamada a la acción. Se sitúa al inicio de la página.',
    category: 'navigation',
    element: 'header',
    defaultProps: { brand: 'Prompt Studio', brandHref: '/', links: [{ label: 'Inicio', href: '#' }, { label: 'Precios', href: '#precio' }], showCta: true, ctaLabel: 'Empezar', ctaHref: '#contacto' },
    defaultStyles: { background: 'var(--ps-color-surface)' },
    styleControls: [COLOR('background', 'Fondo'), SELECT_STYLE('position', 'Posición', ['static', 'sticky']), LENGTH('gap', 'Separación', 8, 64)],
    responsive: responsive('Los enlaces se envuelven en varias líneas en móvil; la marca mantiene prioridad.', 'n/a'),
    component: Navbar,
  },
  hero: {
    label: 'Hero',
    description: 'Primera pantalla con antetítulo, título, subtítulo y hasta dos botones.',
    category: 'structure',
    element: 'section',
    defaultProps: { eyebrow: 'Nuevo', title: 'Convierte ideas en páginas que venden', subtitle: 'Describe tu producto en una frase y deja que el resto lo haga la estructura.', primaryLabel: 'Comenzar ahora', primaryHref: '#', secondaryLabel: 'Ver planes', secondaryHref: '#precio', align: 'center' },
    defaultStyles: { paddingBlock: 96, background: 'var(--ps-color-background)' },
    styleControls: [SPACING('paddingBlock', 'Relleno vertical'), COLOR('background', 'Fondo'), ALIGN('textAlign', 'Alineación del texto')],
    responsive: responsive('El título baja de 6xl a 4xl y los botones se apilan en móvil.', 'n/a'),
    component: Hero,
  },
  heading: {
    label: 'Encabezado',
    description: 'Título de h1 a h4 para estructurar la jerarquía de la página.',
    category: 'typography',
    element: 'h2',
    defaultProps: { text: 'Encabezado', level: 'h2' },
    defaultStyles: {},
    styleControls: [COLOR('color', 'Color'), ALIGN('textAlign', 'Alineación'), LENGTH('marginBlock', 'Margen', 0, 120)],
    responsive: responsive('Reduce su tamaño según el ancho sin cambiar el nivel semántico.', 'n/a'),
    component: Heading,
  },
  text: {
    label: 'Texto',
    description: 'Párrafo con tono por defecto, apagado o destacado.',
    category: 'typography',
    element: 'p',
    defaultProps: { text: 'Escribe aquí el contenido de la página.', tone: 'default' },
    defaultStyles: {},
    styleControls: [COLOR('color', 'Color'), SELECT_STYLE('textAlign', 'Alineación', ['left', 'center', 'right']), LENGTH('maxWidth', 'Ancho máximo', 240, 1200)],
    responsive: responsive('El ancho máximo se mantiene; el texto refluye solo.', 'n/a'),
    component: Text,
  },
  image: {
    label: 'Imagen',
    description: 'Imagen con texto alternativo obligatorio, proporción y pie opcional.',
    category: 'media',
    element: 'figure',
    defaultProps: { src: '/images/webpages/buffer-clone.webp', alt: 'Descripción de la imagen', ratio: '16/9', fit: 'cover' },
    defaultStyles: {},
    styleControls: [SELECT_STYLE('aspectRatio', 'Proporción', ['auto', '1/1', '4/3', '16/9']), LENGTH('borderRadius', 'Radio', 0, 48), SELECT_STYLE('objectFit', 'Ajuste', ['cover', 'contain'])],
    responsive: responsive('La proporción se respeta en todos los anchos; no se recorta el contenido.', 'n/a'),
    component: Image,
  },
  button: {
    label: 'Botón',
    description: 'Llamada a la acción con variante primary, secondary o ghost.',
    category: 'conversion',
    element: 'a',
    defaultProps: { label: 'Saber más', href: '#', variant: 'primary', size: 'md' },
    defaultStyles: {},
    styleControls: [COLOR('background', 'Fondo'), COLOR('color', 'Texto'), LENGTH('paddingInline', 'Relleno', 8, 64), LENGTH('borderRadius', 'Radio', 0, 48)],
    responsive: responsive('En móvil ocupa el ancho disponible sin desbordar.', 'n/a'),
    component: Button,
  },
  container: {
    label: 'Contenedor',
    description: 'Agrupa componentes y limita el ancho con margen centrado.',
    category: 'structure',
    element: 'div',
    defaultProps: { width: 'default', align: 'stretch' },
    defaultStyles: {},
    styleControls: [SELECT_STYLE('maxWidth', 'Ancho máximo', ['40rem', '64rem', '80rem', '100%']), SPACING('gap', 'Separación entre hijos'), ALIGN('alignItems', 'Alineación vertical')],
    responsive: responsive('Reduce el relleno lateral en móvil y apila el contenido.', 'on-mobile', true),
    component: Container,
  },
  columns: {
    label: 'Columnas',
    description: 'Reparte hijos en 1 a 4 columnas que colapsan en móvil.',
    category: 'structure',
    element: 'div',
    defaultProps: { count: '2', gap: 'normal' },
    defaultStyles: {},
    styleControls: [SELECT_STYLE('gridTemplateColumns', 'Columnas', ['1fr', 'repeat(2, minmax(0, 1fr))', 'repeat(3, minmax(0, 1fr))', 'repeat(4, minmax(0, 1fr))']), LENGTH('gap', 'Separación', 8, 64)],
    responsive: responsive('Las columnas colapsan a una sola en tablet y móvil.', 'on-mobile', true),
    component: Columns,
  },
  features: {
    label: 'Características',
    description: 'Rejilla de beneficios con título, icono y descripción.',
    category: 'structure',
    element: 'section',
    defaultProps: { heading: 'Lo que incluye', intro: 'Todo lo necesario para empezar.', items: [{ title: 'Diseño que convierte', description: 'Plantillas pensadas para vender.', icon: '✦' }, { title: 'Flujo sin fricción', description: 'De la idea a la página publicada.', icon: '◆' }, { title: 'Listo para crecer', description: 'Escala sin rehacer el trabajo.', icon: '▲' }], layout: 'cards' },
    defaultStyles: CONTENT_DEFAULTS,
    styleControls: CONTENT_STYLE_CONTROLS,
    responsive: responsive('Tres columnas pasan a dos en tablet y a una en móvil.', 'on-mobile'),
    component: Features,
  },
  gallery: {
    label: 'Galería',
    description: 'Rejunta de imágenes con columnas configurables.',
    category: 'media',
    element: 'section',
    defaultProps: { heading: 'Galería', images: [{ src: '/images/webpages/buffer-clone.webp', alt: 'Ejemplo 1' }], columns: '3' },
    defaultStyles: CONTENT_DEFAULTS,
    styleControls: [SPACING('paddingBlock', 'Relleno vertical'), SELECT_STYLE('gridTemplateColumns', 'Columnas', ['repeat(2, minmax(0, 1fr))', 'repeat(3, minmax(0, 1fr))', 'repeat(4, minmax(0, 1fr))']), LENGTH('gap', 'Separación', 8, 48)],
    responsive: responsive('Tres columnas pasan a dos en tablet y a una en móvil.', 'on-mobile'),
    component: Gallery,
  },
  pricing: {
    label: 'Precios',
    description: 'Planes con precio, periodo y prestaciones, uno de ellos destacado.',
    category: 'conversion',
    element: 'section',
    defaultProps: { heading: 'Precios', plans: [{ name: 'Básico', price: '0 €', period: '/mes', features: [{ label: '1 proyecto' }] }, { name: 'Pro', price: '29 €', period: '/mes', features: [{ label: 'Proyectos ilimitados' }, { label: 'Exportación' }] }, { name: 'Equipo', price: '79 €', period: '/mes', features: [{ label: 'Todo lo de Pro' }, { label: 'Soporte prioritario' }] }], highlight: 'middle' },
    defaultStyles: CONTENT_DEFAULTS,
    styleControls: CONTENT_STYLE_CONTROLS,
    responsive: responsive('Los planes se apilan en una columna en tablet y móvil.', 'on-mobile'),
    component: Pricing,
  },
  testimonials: {
    label: 'Testimonios',
    description: 'Citas de clientes con autor y cargo.',
    category: 'social-proof',
    element: 'section',
    defaultProps: { heading: 'Lo que dicen', items: [{ quote: 'La nueva experiencia hizo que nuestro mensaje se entendiera desde el primer segundo.', author: 'Ana Ruiz', role: 'Directora de Marketing' }] },
    defaultStyles: CONTENT_DEFAULTS,
    styleControls: CONTENT_STYLE_CONTROLS,
    responsive: responsive('Tres columnas pasan a una en móvil; las citas mantienen su orden.', 'on-mobile'),
    component: Testimonials,
  },
  faq: {
    label: 'Preguntas frecuentes',
    description: 'Lista de Preguntas con respuestas plegables y accesibles.',
    category: 'social-proof',
    element: 'section',
    defaultProps: { heading: 'Preguntas frecuentes', items: [{ question: '¿Necesito saber programar?', answer: 'No. El editor visual y la IA se encargan de la estructura.' }] },
    defaultStyles: CONTENT_DEFAULTS,
    styleControls: CONTENT_STYLE_CONTROLS,
    responsive: responsive('Una sola columna a todos los anchos; plegar funciona con teclado y lector de pantalla.', 'n/a'),
    component: Faq,
  },
  'contact-form': {
    label: 'Formulario de contacto',
    description: 'Formulario accesible que envía a la ruta de leads de Prompt Studio.',
    category: 'conversion',
    element: 'form',
    defaultProps: { heading: 'Hablemos', intro: 'Cuéntanos qué necesitas y te respondemos.', fields: [{ name: 'name' }, { name: 'email' }], submitLabel: 'Enviar mensaje', successMessage: 'Recibimos tu mensaje.' },
    defaultStyles: CONTENT_DEFAULTS,
    styleControls: CONTENT_STYLE_CONTROLS,
    responsive: responsive('Un solo campo por fila en móvil; la etiqueta queda siempre asociada.', 'n/a'),
    component: ContactForm,
  },
  cta: {
    label: 'Llamada a la acción',
    description: 'Banda de color con un mensaje y un botón.',
    category: 'conversion',
    element: 'section',
    defaultProps: { title: '¿Listo para empezar?', subtitle: 'Crea tu primera página hoy.', buttonLabel: 'Crear mi proyecto', buttonHref: '#', align: 'center' },
    defaultStyles: { paddingBlock: 64, background: 'var(--ps-color-primary)' },
    styleControls: [COLOR('background', 'Fondo'), SPACING('paddingBlock', 'Relleno vertical'), ALIGN('textAlign', 'Alineación del texto')],
    responsive: responsive('El título baja de 4xl a 3xl y el botón ocupa el ancho completo en móvil.', 'n/a'),
    component: Cta,
  },
  footer: {
    label: 'Pie de página',
    description: 'Marca, eslogan, columnas de enlaces y copyright.',
    category: 'navigation',
    element: 'footer',
    defaultProps: { brand: 'Prompt Studio', tagline: 'Convierte ideas en páginas.', columns: [{ title: 'Producto', links: [{ label: 'Precios', href: '#precio' }] }], copyright: '© Prompt Studio. Todos los derechos reservados.' },
    defaultStyles: { paddingBlock: 48, background: 'var(--ps-color-surface)' },
    styleControls: [COLOR('background', 'Fondo'), SPACING('paddingBlock', 'Relleno vertical'), ALIGN('textAlign', 'Alineación del copyright')],
    responsive: responsive('Las columnas del pie se apilan en una sola columna en móvil.', 'on-mobile'),
    component: Footer,
  },
};

/** El registro completo, indexado por tipo. */
export const PAGE_COMPONENT_REGISTRY: Record<PageComponentType, PageComponentDefinition> = Object.fromEntries(
  Object.entries(SEEDS).map(([type, seed]) => [
    type as PageComponentType,
    {
      type: type as PageComponentType,
      label: seed.label,
      description: seed.description,
      category: seed.category,
      element: seed.element,
      defaultProps: seed.defaultProps,
      defaultStyles: seed.defaultStyles ?? {},
      editableProps: PAGE_PROP_FIELDS[type as PageComponentType],
      controls: buildControls(type as PageComponentType, PAGE_PROP_FIELDS[type as PageComponentType], seed.styleControls),
      allowedChildren: PAGE_CHILDREN[type as PageComponentType] ?? [],
      styleControls: seed.styleControls,
      responsive: seed.responsive,
      component: seed.component,
    } satisfies PageComponentDefinition,
  ])
) as Record<PageComponentType, PageComponentDefinition>;

/** Definición de un tipo, o `undefined` si el catálogo no lo conoce. */
export function getPageComponent(type: string): PageComponentDefinition | undefined {
  return Object.hasOwn(PAGE_COMPONENT_REGISTRY, type) ? PAGE_COMPONENT_REGISTRY[type as PageComponentType] : undefined;
}

/** Catálogo en el orden de presentación del panel de componentes. */
export function listPageComponents(): PageComponentDefinition[] {
  return Object.values(PAGE_COMPONENT_REGISTRY);
}

/**
 * Fusiona las props por defecto con las del documento.
 *
 * Un documento generado por IA suele venir con props parciales; sin este
 * respaldo, un `pricing` sin `highlight` se renderizaría sin plan destacado.
 */
export function withDefaultProps(type: PageComponentType, props: Record<string, unknown>): Record<string, unknown> {
  return { ...PAGE_COMPONENT_REGISTRY[type].defaultProps, ...props };
}

/** Tokens del tema resueltos sobre la base global. */
export function componentTokens(theme: { tokens: Record<string, string> } | undefined): DesignTokens {
  return resolveThemeTokens(theme?.tokens);
}
