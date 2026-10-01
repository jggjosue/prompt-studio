'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImageIcon, Link2, MousePointer2, Palette, RotateCcw, SlidersHorizontal, Type } from 'lucide-react';
import {
  getPageComponentDefinition,
  type PropertyControl,
} from '@/components/page-builder/registry';
import {
  resetComponentProperty,
  resetComponentStyle,
  resetComponentStyles,
  resetComponentToDefaults,
  updateComponentProperty,
  updateComponentStyle,
  type EditorMutationError,
  type EditorMutationResult,
} from '@/lib/page-builder/editor-mutations';
import {
  parseStructuredDraft,
  styleControlDefinition,
  validateStyleDraft,
  type InspectorControlGroup,
} from '@/lib/page-builder/inspector-controls';
import type {
  ComponentStyles,
  PageComponentNode,
  PageSchema,
  ResponsiveBreakpoint,
  StyleProperty,
  StyleValue,
} from '@/lib/page-builder/schema';
import { resolveThemeToken, themeTokenOptions } from '@/lib/page-builder/styles';

export type InspectorBreakpoint = 'desktop' | ResponsiveBreakpoint;

type PropertyMetadata = {
  key: string;
  label: string;
  control: PropertyControl;
  options?: readonly string[];
};

type InspectorProps = {
  schema: PageSchema;
  selectedId: string | null;
  breakpoint: InspectorBreakpoint;
  onSchemaChange: (schema: PageSchema) => void;
  onAnnounce: (message: string) => void;
};

const ERROR_MESSAGES: Record<EditorMutationError, string> = {
  'page-missing': 'La página ya no existe.',
  'section-missing': 'La sección ya no existe.',
  'component-missing': 'El componente ya no existe.',
  'component-unknown': 'El componente no está registrado.',
  'invalid-nesting': 'El destino no admite este componente.',
  cycle: 'La operación produciría un ciclo.',
  'root-location-missing': 'El componente no pertenece al documento.',
  'property-missing': 'La propiedad no está declarada en el registro.',
  'props-invalid': 'El valor no cumple el contrato del componente.',
  'style-not-allowed': 'Este estilo no está habilitado para el componente.',
  'style-value-invalid': 'El valor de estilo no es válido.',
  'responsive-not-supported': 'Este estilo no admite override en este viewport.',
  'theme-token-missing': 'El token no existe en el tema.',
  'schema-invalid': 'El cambio produciría un PageSchema inválido.',
};

function commitResult(
  result: EditorMutationResult,
  onSchemaChange: (schema: PageSchema) => void,
  onAnnounce: (message: string) => void,
  message: string
): string | null {
  if ('error' in result) return ERROR_MESSAGES[result.error];
  onSchemaChange(result.schema);
  onAnnounce(message);
  return null;
}

function nodeProps(node: PageComponentNode): Record<string, unknown> {
  return node.props as unknown as Record<string, unknown>;
}

function effectiveStyleValue(
  node: PageComponentNode,
  defaults: ComponentStyles,
  property: StyleProperty,
  breakpoint: InspectorBreakpoint
): StyleValue | undefined {
  let value = node.styles[property] ?? defaults[property];
  if (breakpoint === 'laptop' || breakpoint === 'tablet' || breakpoint === 'mobile') value = node.responsive.laptop?.[property] ?? value;
  if (breakpoint === 'tablet' || breakpoint === 'mobile') value = node.responsive.tablet?.[property] ?? value;
  if (breakpoint === 'mobile') value = node.responsive.mobile?.[property] ?? value;
  return value;
}

export function PropertiesInspector({ schema, selectedId, breakpoint, onSchemaChange, onAnnounce }: InspectorProps) {
  const node = selectedId ? schema.components[selectedId] : null;
  const definition = node ? getPageComponentDefinition(node.type) : null;
  const properties = definition?.editableProperties as readonly PropertyMetadata[] | undefined;
  const styleProperties = useMemo(() => {
    if (!definition) return [];
    const unique = [...new Set(definition.styleControls)];
    return breakpoint === 'desktop'
      ? unique
      : unique.filter(property => definition.responsive.enabled && definition.responsive.properties.includes(property));
  }, [breakpoint, definition]);

  if (!node || !definition || !properties) {
    return <aside className="max-h-72 w-full shrink-0 border-t border-white/10 p-4 lg:max-h-none lg:w-[320px] lg:border-l lg:border-t-0" aria-label="Panel de propiedades"><div className="grid h-full place-items-center text-center text-xs text-zinc-500"><div><MousePointer2 className="mx-auto mb-3 size-5" />Selecciona un componente para ver sus propiedades.</div></div></aside>;
  }

  const apply = (result: EditorMutationResult, message: string) => commitResult(result, onSchemaChange, onAnnounce, message);
  const defaultProps = definition.defaultProps as unknown as Record<string, unknown>;
  const groupedStyles = styleProperties.reduce<Record<InspectorControlGroup, StyleProperty[]>>((groups, property) => {
    groups[styleControlDefinition(property).group].push(property);
    return groups;
  }, { layout: [], spacing: [], typography: [], appearance: [] });

  return (
    <aside className="max-h-96 w-full shrink-0 overflow-y-auto border-t border-white/10 bg-[#0d0e13] p-4 lg:max-h-none lg:w-[320px] lg:border-l lg:border-t-0" aria-label="Panel de propiedades" data-properties-inspector>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.16em] text-violet-300">Propiedades</p><h2 className="mt-1 text-sm font-black">{definition.label}</h2><p className="mt-1 truncate text-[10px] text-zinc-500">{node.id}</p></div>
        <button type="button" onClick={() => apply(resetComponentToDefaults(schema, node.id), 'Componente restaurado a sus valores predeterminados.')} className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Restaurar componente" title="Restaurar componente"><RotateCcw className="size-3.5" /></button>
      </div>

      <InspectorSection title="Contenido" icon={<Type className="size-3.5" />} open>
        {properties.map(property => <PropertyField key={property.key} schema={schema} node={node} metadata={property} defaultValue={defaultProps[property.key]} apply={apply} />)}
      </InspectorSection>

      <InspectorSection title={`Estilos · ${breakpoint}`} icon={<SlidersHorizontal className="size-3.5" />} open>
        <div className="mb-3 flex items-center justify-between gap-2"><p className="text-[10px] text-zinc-500">{breakpoint === 'desktop' ? 'Estilos base' : 'Overrides del viewport'}</p><button type="button" onClick={() => apply(resetComponentStyles(schema, node.id), 'Todos los estilos se restauraron.')} className="text-[10px] font-bold text-violet-300 hover:text-violet-200">Restablecer estilos</button></div>
        {(Object.keys(groupedStyles) as InspectorControlGroup[]).map(group => groupedStyles[group].length > 0 ? <div key={group} className="mb-5"><p className="mb-2 text-[9px] font-black uppercase tracking-[.16em] text-zinc-500">{groupLabel(group)}</p><div className="grid gap-3">{groupedStyles[group].map(property => <StyleField key={property} schema={schema} node={node} defaults={definition.defaultStyles} property={property} breakpoint={breakpoint} apply={apply} />)}</div></div> : null)}
        {styleProperties.length === 0 ? <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-zinc-500">Este componente no declara estilos responsive para este viewport.</p> : null}
      </InspectorSection>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-violet-400/15 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-zinc-400"><Palette className="mt-0.5 size-3.5 shrink-0 text-violet-300" /><span>Los valores <code>token:…</code> permanecen vinculados al tema y se actualizan en cascada.</span></div>
    </aside>
  );
}

function InspectorSection({ title, icon, open, children }: { title: string; icon: React.ReactNode; open?: boolean; children: React.ReactNode }) {
  return <details open={open} className="mt-5 border-t border-white/10 pt-4"><summary className="mb-3 flex cursor-pointer list-none items-center gap-2 text-xs font-black"><span className="text-violet-300">{icon}</span>{title}</summary><div className="grid gap-3">{children}</div></details>;
}

function FieldShell({ label, onReset, error, children }: { label: string; onReset: () => void; error: string | null; children: React.ReactNode }) {
  return <div className="grid gap-1.5 text-[11px] font-bold text-zinc-300"><div className="flex items-center justify-between gap-2"><span>{label}</span><button type="button" onClick={onReset} className="font-medium text-zinc-600 hover:text-violet-300">Reset</button></div>{children}{error ? <span className="text-[10px] font-medium text-rose-400" role="alert">{error}</span> : null}</div>;
}

function PropertyField({ schema, node, metadata, defaultValue, apply }: { schema: PageSchema; node: PageComponentNode; metadata: PropertyMetadata; defaultValue: unknown; apply: (result: EditorMutationResult, message: string) => string | null }) {
  const value = nodeProps(node)[metadata.key];
  const reset = () => apply(resetComponentProperty(schema, node.id, metadata.key), `${metadata.label} restaurado.`);
  if (metadata.control === 'select') {
    const numeric = typeof value === 'number' || typeof defaultValue === 'number';
    return <FieldShell label={metadata.label} onReset={reset} error={null}><select aria-label={`Contenido: ${metadata.label}`} value={value === undefined ? '' : String(value)} onChange={event => apply(updateComponentProperty(schema, node.id, metadata.key, numeric ? Number(event.target.value) : event.target.value), `${metadata.label} actualizado.`)} className={inputClass()}>{value === undefined ? <option value="">Sin valor</option> : null}{metadata.options?.map(option => <option key={option} value={option}>{option}</option>)}</select></FieldShell>;
  }
  if (metadata.control === 'image' && (typeof value === 'object' || typeof defaultValue === 'object')) return <ImageObjectField schema={schema} node={node} metadata={metadata} value={value} onReset={reset} apply={apply} />;
  if (metadata.control === 'images') return <ImageListField schema={schema} node={node} metadata={metadata} value={value} onReset={reset} apply={apply} />;
  if (metadata.control === 'list' || metadata.control === 'object') return <StructuredPropertyField schema={schema} node={node} metadata={metadata} value={value} onReset={reset} apply={apply} />;
  return <StringPropertyField schema={schema} node={node} metadata={metadata} value={value} onReset={reset} apply={apply} />;
}

function StringPropertyField({ schema, node, metadata, value, onReset, apply }: { schema: PageSchema; node: PageComponentNode; metadata: PropertyMetadata; value: unknown; onReset: () => void; apply: (result: EditorMutationResult, message: string) => string | null }) {
  const current = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const [draft, setDraft] = useState(current);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(current), [current, node.id, metadata.key]);
  const update = (next: string) => { setDraft(next); setError(apply(updateComponentProperty(schema, node.id, metadata.key, metadata.control === 'number' ? Number(next) : next), `${metadata.label} actualizado.`)); };
  const common = { 'aria-label': `Contenido: ${metadata.label}`, value: draft, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(event.target.value), className: inputClass(), placeholder: metadata.control === 'url' || metadata.control === 'image' ? 'https://… o /imagen.webp' : undefined };
  return <FieldShell label={metadata.label} onReset={onReset} error={error}>{metadata.control === 'textarea' ? <textarea {...common} rows={3} /> : <div className="relative">{metadata.control === 'url' || metadata.control === 'image' ? <Link2 className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-zinc-600" /> : null}<input {...common} type={metadata.control === 'number' ? 'number' : 'text'} className={`${inputClass()} ${metadata.control === 'url' || metadata.control === 'image' ? 'pl-8' : ''}`} /></div>}</FieldShell>;
}

function StructuredPropertyField({ schema, node, metadata, value, onReset, apply }: { schema: PageSchema; node: PageComponentNode; metadata: PropertyMetadata; value: unknown; onReset: () => void; apply: (result: EditorMutationResult, message: string) => string | null }) {
  const serialized = JSON.stringify(value ?? (metadata.control === 'list' ? [] : {}), null, 2);
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(serialized), [serialized, node.id, metadata.key]);
  const update = (next: string) => {
    setDraft(next);
    const parsed = parseStructuredDraft(next);
    setError(parsed.success ? apply(updateComponentProperty(schema, node.id, metadata.key, parsed.value), `${metadata.label} actualizado.`) : parsed.error);
  };
  return <FieldShell label={metadata.label} onReset={onReset} error={error}><textarea aria-label={`Contenido: ${metadata.label}`} value={draft} onChange={event => update(event.target.value)} rows={5} spellCheck={false} className={`${inputClass()} font-mono text-[10px]`} /></FieldShell>;
}

type EditableImage = { src: string; alt: string; caption?: string };

function normalizeImage(value: unknown): EditableImage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { src: '', alt: '' };
  const image = value as Partial<EditableImage>;
  return { src: typeof image.src === 'string' ? image.src : '', alt: typeof image.alt === 'string' ? image.alt : '', ...(typeof image.caption === 'string' ? { caption: image.caption } : {}) };
}

function ImageObjectField({ schema, node, metadata, value, onReset, apply }: { schema: PageSchema; node: PageComponentNode; metadata: PropertyMetadata; value: unknown; onReset: () => void; apply: (result: EditorMutationResult, message: string) => string | null }) {
  const image = useMemo(() => normalizeImage(value), [value]);
  const [draft, setDraft] = useState(image);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(image), [image, metadata.key, node.id]);
  const update = (property: keyof EditableImage, nextValue: string) => {
    const next = { ...draft, [property]: nextValue };
    setDraft(next);
    setError(apply(updateComponentProperty(schema, node.id, metadata.key, next), `${metadata.label} actualizado.`));
  };
  return <FieldShell label={metadata.label} onReset={onReset} error={error}><div className="grid gap-2 rounded-lg border border-white/10 p-2"><ImageIcon className="size-3.5 text-violet-300" /><input aria-label={`${metadata.label}: URL`} value={draft.src} onChange={event => update('src', event.target.value)} placeholder="https://… o /imagen.webp" className={inputClass()} /><input aria-label={`${metadata.label}: texto alternativo`} value={draft.alt} onChange={event => update('alt', event.target.value)} placeholder="Texto alternativo" className={inputClass()} /><input aria-label={`${metadata.label}: pie`} value={draft.caption ?? ''} onChange={event => update('caption', event.target.value)} placeholder="Pie opcional" className={inputClass()} /></div></FieldShell>;
}

function ImageListField({ schema, node, metadata, value, onReset, apply }: { schema: PageSchema; node: PageComponentNode; metadata: PropertyMetadata; value: unknown; onReset: () => void; apply: (result: EditorMutationResult, message: string) => string | null }) {
  const images = useMemo(() => Array.isArray(value) ? value.map(normalizeImage) : [], [value]);
  const [draft, setDraft] = useState(images);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(images), [images, metadata.key, node.id]);
  const commit = (next: EditableImage[]) => {
    setDraft(next);
    setError(apply(updateComponentProperty(schema, node.id, metadata.key, next), `${metadata.label} actualizado.`));
  };
  return <FieldShell label={metadata.label} onReset={onReset} error={error}><div className="grid gap-2">{draft.map((image, index) => <div key={index} className="grid gap-2 rounded-lg border border-white/10 p-2"><div className="flex items-center justify-between text-[10px] text-zinc-500"><span>Imagen {index + 1}</span><button type="button" onClick={() => commit(draft.filter((_, itemIndex) => itemIndex !== index))} className="text-rose-300">Eliminar</button></div><input aria-label={`${metadata.label} ${index + 1}: URL`} value={image.src} onChange={event => commit(draft.map((item, itemIndex) => itemIndex === index ? { ...item, src: event.target.value } : item))} placeholder="URL" className={inputClass()} /><input aria-label={`${metadata.label} ${index + 1}: alt`} value={image.alt} onChange={event => commit(draft.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item))} placeholder="Texto alternativo" className={inputClass()} /></div>)}<button type="button" onClick={() => commit([...draft, { src: '', alt: '' }])} className="rounded-lg border border-dashed border-violet-400/30 px-3 py-2 text-[10px] font-bold text-violet-300 hover:bg-violet-500/10">Añadir imagen</button></div></FieldShell>;
}

function StyleField({ schema, node, defaults, property, breakpoint, apply }: { schema: PageSchema; node: PageComponentNode; defaults: ComponentStyles; property: StyleProperty; breakpoint: InspectorBreakpoint; apply: (result: EditorMutationResult, message: string) => string | null }) {
  const metadata = styleControlDefinition(property);
  const value = effectiveStyleValue(node, defaults, property, breakpoint);
  const current = value === undefined ? '' : String(value);
  const [draft, setDraft] = useState(current);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(current), [current, node.id, property, breakpoint]);
  const responsive = breakpoint === 'desktop' ? undefined : breakpoint;
  const explicit = responsive ? node.responsive[responsive]?.[property] !== undefined : node.styles[property] !== undefined;
  const tokens = themeTokenOptions(schema.site.theme).filter(token => metadata.tokenGroups?.includes(token.group));
  const commit = (next: string) => {
    setDraft(next);
    const parsed = validateStyleDraft(property, next, schema.site.theme);
    if (!parsed.success) { setError(parsed.error); return; }
    const result = parsed.value === undefined
      ? resetComponentStyle(schema, node.id, property, responsive)
      : updateComponentStyle(schema, node.id, property, parsed.value, responsive);
    setError(apply(result, `${metadata.label} actualizado.`));
  };
  const reset = () => setError(apply(resetComponentStyle(schema, node.id, property, responsive), `${metadata.label} restaurado.`));
  const selectToken = (reference: string) => {
    if (reference) commit(reference);
    else if (draft.startsWith('token:')) commit(resolveThemeToken(schema.site.theme, draft) ?? '');
  };
  const options = metadata.options ?? [];
  return <FieldShell label={metadata.label} onReset={reset} error={error}><div className="grid gap-1.5">{tokens.length > 0 ? <select aria-label={`Token: ${metadata.label}`} value={draft.startsWith('token:') ? draft : ''} onChange={event => selectToken(event.target.value)} className={`${inputClass()} text-[10px]`}><option value="">Valor personalizado</option>{tokens.map(token => <option key={token.reference} value={token.reference}>{token.label} · {token.value}</option>)}</select> : null}<div className="flex items-center gap-2">{metadata.control === 'color' && /^#[0-9a-fA-F]{6}$/.test(draft) ? <input aria-label={`Selector de color: ${metadata.label}`} type="color" value={draft} onChange={event => commit(event.target.value)} className="h-8 w-9 cursor-pointer rounded border border-white/10 bg-transparent p-0.5" /> : null}{metadata.control === 'select' ? <select aria-label={`Estilo: ${metadata.label}`} value={draft} onChange={event => commit(event.target.value)} className={inputClass()}>{draft && !options.includes(draft) ? <option value={draft}>{draft}</option> : null}<option value="">Heredado</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select> : <input aria-label={`Estilo: ${metadata.label}`} type={metadata.control === 'number' ? 'number' : 'text'} min={metadata.min} max={metadata.max} step={metadata.step} value={draft} onChange={event => commit(event.target.value)} placeholder={metadata.placeholder} className={inputClass()} />}</div><span className={`text-[9px] font-medium ${explicit ? 'text-violet-300' : 'text-zinc-600'}`}>{explicit ? breakpoint === 'desktop' ? 'Valor del componente' : `Override ${breakpoint}` : 'Heredado del valor anterior o default'}</span></div></FieldShell>;
}

function groupLabel(group: InspectorControlGroup): string {
  return { layout: 'Layout', spacing: 'Espaciado', typography: 'Tipografía', appearance: 'Apariencia' }[group];
}

function inputClass(): string {
  return 'min-h-8 w-full rounded-md border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-xs font-medium text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/20';
}
