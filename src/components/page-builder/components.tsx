/* eslint-disable @next/next/no-img-element -- PageSchema valida URLs dinámicas; next/image requiere dominios conocidos en build. */
import React, { type CSSProperties, type ReactNode } from 'react';
import type { ComponentNodeOf, PageComponentType } from '@/lib/page-builder/schema';
import { safeHref, safeImageSrc } from '@/lib/page-builder/styles';

export type BuilderComponentProps<K extends PageComponentType = PageComponentType> = {
  node: ComponentNodeOf<K>;
  children?: ReactNode;
  className: string;
  style: CSSProperties;
};

const linkStyle: CSSProperties = { color: 'inherit', textDecoration: 'none' };
const buttonBase: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 42, padding: '10px 18px', borderRadius: 'var(--ps-radii-md)', fontWeight: 700, textDecoration: 'none' };

function ActionLink({ label, href, variant = 'primary' }: { label: string; href: string; variant?: 'primary' | 'secondary' | 'outline' | 'link' }) {
  const variants: Record<NonNullable<typeof variant>, CSSProperties> = {
    primary: { background: 'var(--ps-colors-primary)', color: '#fff' },
    secondary: { background: 'var(--ps-colors-secondary)', color: '#fff' },
    outline: { border: '1px solid var(--ps-colors-border)', color: 'var(--ps-colors-text)' },
    link: { color: 'var(--ps-colors-primary)', paddingInline: 0 },
  };
  return <a href={safeHref(href)} style={{ ...buttonBase, ...variants[variant] }}>{label}</a>;
}

export function NavbarComponent({ node, children, className, style }: BuilderComponentProps<'navbar'>) {
  const { brand, brandHref, links, cta } = node.props;
  return (
    <nav className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '16px 24px', ...style }} aria-label="Navegación principal">
      <a href={safeHref(brandHref, '/')} style={{ ...linkStyle, fontWeight: 900 }}>{brand}</a>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        {links.map(link => <a key={`${link.label}-${link.href}`} href={safeHref(link.href)} style={linkStyle}>{link.label}</a>)}
        {cta ? <ActionLink {...cta} /> : null}
      </div>
      {children}
    </nav>
  );
}

export function HeroComponent({ node, children, className, style }: BuilderComponentProps<'hero'>) {
  const { eyebrow, title, description, primaryAction, secondaryAction, image } = node.props;
  const src = safeImageSrc(image?.src);
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: src ? 'minmax(0,1.1fr) minmax(280px,.9fr)' : '1fr', alignItems: 'center', gap: 48, padding: '72px 24px', ...style }}>
      <div>
        {eyebrow ? <p style={{ color: 'var(--ps-colors-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em' }}>{eyebrow}</p> : null}
        <h1 style={{ margin: '12px 0', fontFamily: 'var(--ps-typography-headingFontFamily)', fontSize: 'clamp(2.4rem,7vw,4.8rem)', lineHeight: 1.02 }}>{title}</h1>
        <p style={{ maxWidth: 720, color: 'var(--ps-colors-muted)', fontSize: '1.15rem', lineHeight: 1.7 }}>{description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          {primaryAction ? <ActionLink {...primaryAction} /> : null}
          {secondaryAction ? <ActionLink {...secondaryAction} /> : null}
        </div>
        {children}
      </div>
      {src ? <img src={src} alt={image?.alt ?? ''} style={{ width: '100%', borderRadius: 'var(--ps-radii-lg)', objectFit: 'cover' }} /> : null}
    </div>
  );
}

export function HeadingComponent({ node, children, className, style }: BuilderComponentProps<'heading'>) {
  const level = Math.min(6, Math.max(1, node.props.level));
  const Tag = `h${level}` as 'h1';
  return <Tag className={className} style={{ fontFamily: 'var(--ps-typography-headingFontFamily)', margin: 0, ...style }}>{node.props.text}{children}</Tag>;
}

export function TextComponent({ node, children, className, style }: BuilderComponentProps<'text'>) {
  const Tag = node.props.as;
  return <Tag className={className} style={{ margin: 0, lineHeight: 1.65, ...style }}>{node.props.text}{children}</Tag>;
}

export function ImageComponent({ node, children, className, style }: BuilderComponentProps<'image'>) {
  const src = safeImageSrc(node.props.src);
  if (!src) return <div className={className} style={{ minHeight: 160, display: 'grid', placeItems: 'center', background: 'var(--ps-colors-surface)', ...style }} role="img" aria-label={node.props.alt}>Imagen</div>;
  return <figure className={className} style={{ margin: 0, ...style }}><img src={src} alt={node.props.alt} loading={node.props.loading} style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }} />{node.props.caption ? <figcaption style={{ marginTop: 8, color: 'var(--ps-colors-muted)', fontSize: 14 }}>{node.props.caption}</figcaption> : null}{children}</figure>;
}

export function ButtonComponent({ node, children, className, style }: BuilderComponentProps<'button'>) {
  return <span className={className} style={{ display: 'inline-flex', ...style }}><ActionLink {...node.props} />{children}</span>;
}

export function ContainerComponent({ node, children, className, style }: BuilderComponentProps<'container'>) {
  const Tag = node.props.as;
  return <Tag className={className} style={{ width: '100%', maxWidth: node.props.maxWidth, marginInline: 'auto', paddingInline: 24, ...style }}>{children}</Tag>;
}

export function ColumnsComponent({ node, children, className, style }: BuilderComponentProps<'columns'>) {
  return <div className={className} data-stack-at={node.props.stackAt} style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns}, minmax(0, 1fr))`, gap: node.props.gap, ...style }}>{children}</div>;
}

export function FeaturesComponent({ node, children, className, style }: BuilderComponentProps<'features'>) {
  return <div className={className} style={style}>{node.props.heading ? <h2>{node.props.heading}</h2> : null}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>{node.props.items.map(item => <article key={`${item.title}-${item.description}`} style={{ padding: 24, border: '1px solid var(--ps-colors-border)', borderRadius: 'var(--ps-radii-lg)', background: 'var(--ps-colors-surface)' }}>{item.icon ? <span aria-hidden style={{ fontSize: 24 }}>{item.icon}</span> : null}<h3>{item.title}</h3><p style={{ color: 'var(--ps-colors-muted)', lineHeight: 1.65 }}>{item.description}</p></article>)}</div>{children}</div>;
}

export function GalleryComponent({ node, children, className, style }: BuilderComponentProps<'gallery'>) {
  return <div className={className} style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns},minmax(0,1fr))`, gap: 16, ...style }}>{node.props.images.map((image, index) => { const src = safeImageSrc(image.src); return <figure key={`${image.src}-${index}`} style={{ margin: 0 }}>{src ? <img src={src} alt={image.alt} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 'var(--ps-radii-md)' }} /> : null}{image.caption ? <figcaption>{image.caption}</figcaption> : null}</figure>; })}{children}</div>;
}

export function PricingComponent({ node, children, className, style }: BuilderComponentProps<'pricing'>) {
  return <div className={className} style={style}>{node.props.heading ? <h2>{node.props.heading}</h2> : null}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>{node.props.plans.map(plan => <article key={plan.name} style={{ padding: 28, border: plan.featured ? '2px solid var(--ps-colors-primary)' : '1px solid var(--ps-colors-border)', borderRadius: 'var(--ps-radii-lg)', background: 'var(--ps-colors-surface)' }}><h3>{plan.name}</h3><strong style={{ display: 'block', fontSize: 36 }}>{plan.price}</strong>{plan.description ? <p>{plan.description}</p> : null}<ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>{plan.action ? <ActionLink {...plan.action} /> : null}</article>)}</div>{children}</div>;
}

export function TestimonialsComponent({ node, children, className, style }: BuilderComponentProps<'testimonials'>) {
  return <div className={className} style={style}>{node.props.heading ? <h2>{node.props.heading}</h2> : null}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>{node.props.items.map(item => <figure key={`${item.name}-${item.quote}`} style={{ margin: 0, padding: 24, borderRadius: 'var(--ps-radii-lg)', background: 'var(--ps-colors-surface)' }}><blockquote style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>“{item.quote}”</blockquote><figcaption style={{ marginTop: 16 }}><strong>{item.name}</strong>{item.role ? <span style={{ display: 'block', color: 'var(--ps-colors-muted)' }}>{item.role}</span> : null}</figcaption></figure>)}</div>{children}</div>;
}

export function FaqComponent({ node, children, className, style }: BuilderComponentProps<'faq'>) {
  return <div className={className} style={style}>{node.props.heading ? <h2>{node.props.heading}</h2> : null}{node.props.items.map(item => <details key={item.question} style={{ padding: '16px 0', borderBottom: '1px solid var(--ps-colors-border)' }}><summary style={{ cursor: 'pointer', fontWeight: 800 }}>{item.question}</summary><p style={{ color: 'var(--ps-colors-muted)', lineHeight: 1.65 }}>{item.answer}</p></details>)}{children}</div>;
}

export function ContactFormComponent({ node, children, className, style }: BuilderComponentProps<'contactForm'>) {
  return <form className={className} action={safeHref(node.props.action, '#')} method={node.props.method} style={{ display: 'grid', gap: 16, ...style }}>{node.props.heading ? <h2>{node.props.heading}</h2> : null}{node.props.description ? <p>{node.props.description}</p> : null}{node.props.fields.map(field => <label key={field.name} style={{ display: 'grid', gap: 6 }}><span style={{ fontWeight: 700 }}>{field.label}</span>{field.type === 'textarea' ? <textarea name={field.name} placeholder={field.placeholder} required={field.required} rows={5} style={{ padding: 12, border: '1px solid var(--ps-colors-border)', borderRadius: 'var(--ps-radii-md)' }} /> : <input name={field.name} type={field.type} placeholder={field.placeholder} required={field.required} style={{ minHeight: 44, padding: '8px 12px', border: '1px solid var(--ps-colors-border)', borderRadius: 'var(--ps-radii-md)' }} />}</label>)}<button type="submit" style={{ ...buttonBase, border: 0, background: 'var(--ps-colors-primary)', color: '#fff', cursor: 'pointer' }}>{node.props.submitLabel}</button>{children}</form>;
}

export function CtaComponent({ node, children, className, style }: BuilderComponentProps<'cta'>) {
  return <div className={className} style={{ padding: 48, textAlign: 'center', borderRadius: 'var(--ps-radii-lg)', background: 'var(--ps-colors-surface)', ...style }}><h2>{node.props.title}</h2>{node.props.description ? <p style={{ color: 'var(--ps-colors-muted)' }}>{node.props.description}</p> : null}<div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 20 }}><ActionLink {...node.props.primaryAction} />{node.props.secondaryAction ? <ActionLink {...node.props.secondaryAction} /> : null}</div>{children}</div>;
}

export function FooterComponent({ node, children, className, style }: BuilderComponentProps<'footer'>) {
  return <footer className={className} style={{ padding: '40px 24px', borderTop: '1px solid var(--ps-colors-border)', ...style }}><div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}><div><strong>{node.props.brand}</strong>{node.props.description ? <p style={{ color: 'var(--ps-colors-muted)' }}>{node.props.description}</p> : null}</div><nav aria-label="Enlaces del pie" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{node.props.links.map(link => <a key={`${link.label}-${link.href}`} href={safeHref(link.href)} style={linkStyle}>{link.label}</a>)}</nav></div><small style={{ display: 'block', marginTop: 28, color: 'var(--ps-colors-muted)' }}>{node.props.copyright}</small>{children}</footer>;
}
