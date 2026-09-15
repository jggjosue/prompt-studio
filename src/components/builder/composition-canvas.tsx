'use client';

import { BLOCK_SPECS, blockLabel, type BuilderBlock } from '@/lib/builder-blocks';
import { readBlockDrag, writeBlockDrag } from '@/components/builder/block-drag';
import { GripVertical, ImageIcon, Star } from 'lucide-react';
import { useState, type CSSProperties } from 'react';

export type CanvasStyleTokens = {
  primary: string;
  secondary: string;
  background: string;
  fontFamily: string;
  radius: number;
  spacing: number;
  shadow: string;
  dark: boolean;
};

type Props = {
  blocks: BuilderBlock[];
  tokens: CanvasStyleTokens;
  locale: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Reordenar dentro del lienzo. */
  onMove: (from: number, to: number) => void;
  /** Soltar un bloque nuevo desde la paleta. */
  onDropNew: (kind: string, index: number) => void;
};

/**
 * Lienzo por capas: cada bloque se puede arrastrar para reordenar y acepta
 * bloques nuevos soltados desde la paleta.
 *
 * Usa la API nativa de arrastrar y soltar del navegador —sin dependencias— y
 * deja el reordenado por teclado al panel de capas, que sí tiene botones.
 */
export function CompositionCanvas({
  blocks,
  tokens,
  locale,
  selectedId,
  onSelect,
  onMove,
  onDropNew,
}: Props) {
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const es = locale.startsWith('es');

  const ink = tokens.dark ? '#f8fafc' : '#111827';
  const muted = tokens.dark ? '#a1a1aa' : '#64748b';
  const surface = tokens.dark ? '#131722' : '#ffffff';
  const line = tokens.dark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.12)';

  const vars = {
    '--builder-primary': tokens.primary,
    '--builder-secondary': tokens.secondary,
  } as CSSProperties;

  function handleDrop(event: React.DragEvent, index: number) {
    event.preventDefault();
    setOverIndex(null);
    const payload = readBlockDrag(event);
    if (!payload) return;
    if (payload.source === 'palette') onDropNew(payload.kind, index);
    else onMove(payload.index, index);
  }

  function renderBlock(block: BuilderBlock) {
    const gap = tokens.spacing;
    const radius = tokens.radius;

    switch (block.kind) {
      case 'media':
        return (
          <div
            className="flex items-center justify-center"
            style={{
              height: 132,
              borderRadius: radius,
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary})`,
            }}
          >
            <ImageIcon className="h-7 w-7 text-white/70" aria-hidden />
          </div>
        );
      case 'badge':
        return (
          <span
            style={{
              display: 'inline-block',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: tokens.primary,
              background: `color-mix(in srgb, ${tokens.primary} 16%, transparent)`,
            }}
          >
            {block.text}
          </span>
        );
      case 'title':
        return <h3 style={{ color: ink, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{block.text}</h3>;
      case 'subtitle':
        return <p style={{ color: muted, fontSize: 15, fontWeight: 600 }}>{block.text}</p>;
      case 'body':
        return <p style={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>{block.text}</p>;
      case 'divider':
        return <div style={{ height: 1, background: line }} />;
      case 'meta':
        return <p style={{ color: muted, fontSize: 12, letterSpacing: '.04em' }}>{block.text}</p>;
      case 'price':
        return <p style={{ color: ink, fontSize: 26, fontWeight: 900 }}>{block.text}</p>;
      case 'rating':
        return (
          <p style={{ color: muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star className="h-3.5 w-3.5" style={{ color: tokens.secondary }} aria-hidden />
            {block.text}
          </p>
        );
      case 'avatar':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary})`,
              }}
            />
            <span style={{ color: ink, fontSize: 14, fontWeight: 700 }}>{block.text}</span>
          </div>
        );
      case 'field':
        return (
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: muted, fontSize: 12, fontWeight: 700 }}>{block.text}</span>
            <span
              style={{
                height: 40,
                borderRadius: Math.min(radius, 14),
                border: `1px solid ${line}`,
                background: tokens.dark ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.03)',
              }}
            />
          </label>
        );
      case 'checkbox':
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: muted, fontSize: 13 }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: `1px solid ${tokens.primary}`,
                background: `color-mix(in srgb, ${tokens.primary} 22%, transparent)`,
              }}
            />
            {block.text}
          </span>
        );
      case 'primaryCta':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 42,
              padding: '0 20px',
              borderRadius: Math.min(radius, 999),
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary})`,
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {block.text}
          </span>
        );
      case 'secondaryCta':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 42,
              padding: '0 20px',
              borderRadius: Math.min(radius, 999),
              border: `1px solid ${tokens.primary}`,
              color: tokens.primary,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {block.text}
          </span>
        );
      case 'socialRow':
        return (
          <div style={{ display: 'flex', gap }}>
            {block.text.split('·').map(item => (
              <span
                key={item}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '9px 0',
                  borderRadius: Math.min(radius, 14),
                  border: `1px solid ${line}`,
                  color: ink,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {item.trim()}
              </span>
            ))}
          </div>
        );
      case 'navLinks':
        return (
          <div style={{ display: 'flex', gap, flexWrap: 'wrap' }}>
            {block.text.split('·').map(item => (
              <span key={item} style={{ color: muted, fontSize: 13, fontWeight: 700 }}>
                {item.trim()}
              </span>
            ))}
          </div>
        );
      case 'search':
        return (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 40,
              padding: '0 14px',
              borderRadius: 999,
              border: `1px solid ${line}`,
              color: muted,
              fontSize: 13,
            }}
          >
            {block.text}
          </span>
        );
      case 'menuItem':
        return (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: Math.min(radius, 14),
              background: tokens.dark ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.03)',
              color: ink,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: tokens.primary }} />
            {block.text}
          </span>
        );
      case 'footnote':
        return <p style={{ color: muted, fontSize: 12 }}>{block.text}</p>;
      case 'feature':
        return <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: Math.min(radius, 16), border: `1px solid ${line}`, color: ink, fontSize: 14, fontWeight: 700 }}><span style={{ color: tokens.primary }}>✦</span>{block.text}</div>;
      case 'stat':
        return <div style={{ padding: 14, borderRadius: Math.min(radius, 16), background: `color-mix(in srgb, ${tokens.primary} 10%, transparent)` }}><strong style={{ display: 'block', color: ink, fontSize: 22 }}>{block.text.split('·')[0]}</strong><span style={{ color: muted, fontSize: 12 }}>{block.text.split('·').slice(1).join('·')}</span></div>;
      case 'logoCloud':
      case 'footerLinks':
        return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: muted, fontSize: 12, fontWeight: 700 }}>{block.text.split('·').map(item => <span key={item.trim()}>{item.trim()}</span>)}</div>;
      case 'testimonial':
        return <blockquote style={{ margin: 0, padding: 16, borderLeft: `3px solid ${tokens.secondary}`, background: tokens.dark ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.03)', color: ink, fontSize: 15, lineHeight: 1.5 }}>{block.text}</blockquote>;
      case 'faq':
        return <div style={{ padding: 14, borderRadius: Math.min(radius, 14), border: `1px solid ${line}`, color: ink, fontSize: 14, fontWeight: 700 }}>{block.text}<span style={{ float: 'right', color: tokens.primary }}>+</span></div>;
      case 'progress': {
        const parts = block.text.split('·');
        return <div style={{ display: 'grid', gap: 7 }}><span style={{ color: muted, fontSize: 12, fontWeight: 700 }}>{parts[0]}</span><span style={{ height: 8, overflow: 'hidden', borderRadius: 999, background: line }}><span style={{ display: 'block', width: parts[1]?.trim() || '70%', height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.secondary})` }} /></span></div>;
      }
      default:
        return null;
    }
  }

  const visibles = blocks.filter(b => !b.hidden);

  return (
    <div
      className="w-full"
      style={{ ...vars, fontFamily: tokens.fontFamily }}
      onDragOver={event => {
        // Sin esto el navegador rechaza el drop en el hueco final.
        if (readBlockDrag(event) || event.dataTransfer.types.length) event.preventDefault();
      }}
      onDrop={event => handleDrop(event, blocks.length)}
    >
      <div
        style={{
          background: tokens.background || surface,
          borderRadius: tokens.radius,
          boxShadow: tokens.shadow,
          padding: Math.max(tokens.spacing, 16),
          display: 'grid',
          gap: tokens.spacing,
          border: `1px solid ${line}`,
        }}
      >
        {visibles.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: muted }}>
            {es
              ? 'Arrastra bloques desde la paleta para empezar.'
              : 'Drag blocks from the palette to start.'}
          </p>
        ) : (
          blocks.map((block, index) =>
            block.hidden ? null : (
              <div
                key={block.id}
                draggable
                onDragStart={event => writeBlockDrag(event, { source: 'canvas', index })}
                onDragEnd={() => setOverIndex(null)}
                onDragOver={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex(current => (current === index ? null : current))}
                onDrop={event => {
                  event.stopPropagation();
                  handleDrop(event, index);
                }}
                onClick={() => onSelect(block.id)}
                role="button"
                tabIndex={0}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(block.id);
                  }
                }}
                aria-label={`${blockLabel(block.kind, locale)}${block.text ? `: ${block.text}` : ''}`}
                className="group relative cursor-grab rounded-md outline-none transition active:cursor-grabbing"
                style={{
                  outline:
                    selectedId === block.id
                      ? `2px solid ${tokens.primary}`
                      : overIndex === index
                        ? `2px dashed ${tokens.secondary}`
                        : '2px solid transparent',
                  outlineOffset: 4,
                  display: BLOCK_SPECS[block.kind].block ? 'block' : 'inline-block',
                  justifySelf: BLOCK_SPECS[block.kind].block ? 'stretch' : 'start',
                }}
              >
                <GripVertical
                  aria-hidden
                  className="pointer-events-none absolute -left-5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-0 transition group-hover:opacity-60"
                  style={{ color: muted }}
                />
                {renderBlock(block)}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

export default CompositionCanvas;
