'use client';

/**
 * Inspector de propiedades dinámico.
 *
 * No conoce ningún componente: lee `controls` del catálogo para el nodo
 * seleccionado y pinta un campo por control. Un control nuevo se añade en el
 * registro, no aquí. Cada cambio llama a una mutación pura de `PageSchema`, así
 * que el lienzo se actualiza al instante sin recargar la página.
 */

import { getPageComponent } from '@/components/editor/page-components';
import {
  SHADOW_OPTIONS,
  tokenOptions,
  type ControlDescriptor,
} from '@/lib/editor/property-controls';
import { BREAKPOINTS, type Breakpoint, type PageNode } from '@/lib/editor/page-schema';
import { DEFAULT_TOKENS } from '@/lib/editor/tokens';
import { RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useBuilder } from './builder-context';

const COLOR_TOKENS = tokenOptions(DEFAULT_TOKENS, 'color');

function FieldShell({
  label,
  onReset,
  children,
}: {
  label: string;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
        <button
          type="button"
          onClick={onReset}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Restablecer ${label}`}
          title="Restablecer"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
        </button>
      </div>
      {children}
    </div>
  );
}

const inputClass =
  'h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

function ColorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const isToken = value.startsWith('token:');
  const hex = !isToken && /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#000000';

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={hex}
        disabled={isToken}
        onChange={event => onChange(event.target.value)}
        className="h-8 w-9 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5 disabled:opacity-40"
        aria-label="Color personalizado"
      />
      <input
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        className={inputClass}
        placeholder="token:color.primary"
        aria-label="Valor de color"
      />
      <select
        value={isToken ? value : ''}
        onChange={event => onChange(event.target.value)}
        className="h-8 shrink-0 rounded-md border border-border bg-background px-1 text-[11px] text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Token de color"
      >
        <option value="">Token…</option>
        {COLOR_TOKENS.map(token => (
          <option key={token.value} value={token.value}>
            {token.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SegmentedField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`flex-1 rounded px-2 py-1 text-[11px] capitalize transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            value === option ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ControlField({
  control,
  node,
  breakpoint,
}: {
  control: ControlDescriptor;
  node: PageNode;
  breakpoint: Breakpoint;
}) {
  const builder = useBuilder();
  const id = node.id;

  const value =
    control.target.type === 'prop'
      ? node.props[control.target.key]
      : node.styles[breakpoint]?.[control.target.property];

  const setProp = (next: unknown) => {
    if (control.target.type === 'prop') builder.setProp(id, control.target.key, next);
  };
  const setStyle = (next: string | number) => {
    if (control.target.type === 'style') builder.setStyle(id, control.target.property, next, breakpoint);
  };
  const reset = () => {
    if (control.target.type === 'prop') builder.resetProp(id, control.target.key);
    else builder.clearStyle(id, control.target.property, breakpoint);
  };

  const text = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value);
  const numeric = typeof value === 'number' ? value : text === '' ? '' : Number(text);

  switch (control.kind) {
    case 'textarea':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <textarea
            value={text}
            onChange={event => setProp(event.target.value)}
            rows={3}
            className={`${inputClass} h-auto resize-y py-1.5`}
          />
        </FieldShell>
      );
    case 'url':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <input
            type="url"
            value={text}
            onChange={event => setProp(event.target.value)}
            className={inputClass}
            placeholder="https://…"
          />
        </FieldShell>
      );
    case 'image':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <input
            type="text"
            value={text}
            onChange={event => setProp(event.target.value)}
            className={inputClass}
            placeholder="/images/ejemplo.webp"
          />
          {text ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={text} alt="" className="h-16 w-full rounded-md border border-border object-cover" />
          ) : null}
        </FieldShell>
      );
    case 'select':
    case 'display':
    case 'borderStyle':
    case 'fontWeight':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <select
            value={text}
            onChange={event => (control.target.type === 'prop' ? setProp(event.target.value) : setStyle(event.target.value))}
            className={inputClass}
          >
            {(control.options ?? []).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    case 'number':
    case 'opacity':
    case 'fontSize':
    case 'lineHeight':
    case 'padding':
    case 'margin':
    case 'gap':
    case 'borderWidth':
    case 'borderRadius':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <input
            type="number"
            value={numeric}
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            onChange={event => {
              const parsed = event.target.valueAsNumber;
              if (Number.isNaN(parsed)) return;
              if (control.target.type === 'prop') setProp(parsed);
              else setStyle(parsed);
            }}
            className={inputClass}
          />
        </FieldShell>
      );
    case 'boolean':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <input
            type="checkbox"
            checked={value === true}
            onChange={event => setProp(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </FieldShell>
      );
    case 'list':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <textarea
            value={text}
            onChange={event => setProp(event.target.value)}
            rows={3}
            className={`${inputClass} h-auto resize-y py-1.5 font-mono`}
            placeholder='[{"label":"…","href":"…"}]'
          />
        </FieldShell>
      );
    case 'color':
    case 'background':
    case 'borderColor':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <ColorField value={text} onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))} />
        </FieldShell>
      );
    case 'alignment':
    case 'textAlign':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <SegmentedField
            value={text}
            options={control.options ?? ['left', 'center', 'right']}
            onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
          />
        </FieldShell>
      );
    case 'shadow':
      return (
        <FieldShell label={control.label} onReset={reset}>
          <select
            value={text}
            onChange={event => setStyle(event.target.value)}
            className={inputClass}
          >
            {SHADOW_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    default:
      return (
        <FieldShell label={control.label} onReset={reset}>
          <input
            type="text"
            value={text}
            onChange={event => (control.target.type === 'prop' ? setProp(event.target.value) : setStyle(event.target.value))}
            className={inputClass}
          />
        </FieldShell>
      );
  }
}

export function BuilderProperties() {
  const builder = useBuilder();
  const selected = builder.selected;
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  if (!selected) {
    return (
      <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/30">
        <div className="border-b border-border px-3 py-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Propiedades</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">Nada seleccionado</p>
          <p className="text-xs text-muted-foreground">
            Haz clic en un componente del lienzo o navega con el teclado para editarlo.
          </p>
        </div>
      </aside>
    );
  }

  const definition = getPageComponent(selected.node.type);
  const controls = definition?.controls ?? [];
  const propControls = controls.filter(control => control.target.type === 'prop');
  const styleControls = controls.filter(control => control.target.type === 'style');

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-muted/30">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Propiedades</h2>
        <p className="mt-1 truncate text-xs font-semibold text-foreground">
          {definition?.label ?? selected.node.type}
        </p>
        <p className="truncate font-mono text-[10px] text-muted-foreground" title={selected.node.id}>
          {selected.node.id}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex gap-0.5" role="group" aria-label="Breakpoint de estilos">
          {BREAKPOINTS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setBreakpoint(option)}
              aria-pressed={breakpoint === option}
              className={`rounded px-2 py-1 text-[11px] capitalize transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                breakpoint === option ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => builder.resetStyles(selected.node.id)}
            className="rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Restablecer estilos
          </button>
          <button
            type="button"
            onClick={() => builder.resetComponent(selected.node.id)}
            className="rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Restablecer todo
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-3">
        {propControls.length ? (
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contenido</h3>
            {propControls.map(control => (
              <ControlField key={`prop-${control.target.type === 'prop' ? control.target.key : ''}`} control={control} node={selected.node} breakpoint={breakpoint} />
            ))}
          </section>
        ) : null}

        {styleControls.length ? (
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Diseño · {breakpoint}
            </h3>
            {styleControls.map(control => (
              <ControlField
                key={`style-${control.target.type === 'style' ? control.target.property : ''}`}
                control={control}
                node={selected.node}
                breakpoint={breakpoint}
              />
            ))}
          </section>
        ) : null}
      </div>
    </aside>
  );
}
