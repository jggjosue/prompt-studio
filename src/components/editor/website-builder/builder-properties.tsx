'use client';

/**
 * Inspector de propiedades dinámico.
 *
 * No conoce ningún componente: lee `controls` del catálogo para el nodo
 * seleccionado y pinta un campo por control. Cada cambio llama a una mutación
 * pura de `PageSchema`, así que el lienzo se actualiza al instante.
 *
 * Además, para los controles de estilo marca si el valor que se muestra es un
 * override local del breakpoint activo o se hereda de un breakpoint superior, y
 * dibuja un punto por breakpoint donde existe un override local de esa propiedad.
 */

import { getPageComponent } from '@/components/editor/page-components';
import {
  SHADOW_OPTIONS,
  tokenOptions,
  type ControlDescriptor,
} from '@/lib/editor/property-controls';
import type { PageNode } from '@/lib/editor/page-schema';
import {
  EDITOR_BREAKPOINTS,
  findStyleSource,
  overrideBreakpoints,
  resolveNodeStyles,
  type EditorBreakpoint,
} from '@/lib/editor/responsive';
import { DEFAULT_TOKENS } from '@/lib/editor/tokens';
import { RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuilder } from './builder-context';

const COLOR_TOKENS = tokenOptions(DEFAULT_TOKENS, 'color');

function FieldShell({
  label,
  onReset,
  status,
  footer,
  children,
}: {
  label: string;
  onReset: () => void;
  status?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <label className="truncate text-[11px] font-medium text-muted-foreground">{label}</label>
          {status}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Restablecer ${label}`}
          title="Restablecer / heredar"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
        </button>
      </div>
      {children}
      {footer}
    </div>
  );
}

/** Indicador de local/heredado para un control de estilo. */
function StyleStatus({ node, control, breakpoint }: { node: PageNode; control: ControlDescriptor; breakpoint: EditorBreakpoint }) {
  if (control.target.type !== 'style') return null;
  const property = control.target.property;
  const source = findStyleSource(node, property, breakpoint);

  if (source === null) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }
  if (source === breakpoint) {
    return <span className="rounded bg-primary/10 px-1 py-px text-[10px] font-semibold text-primary">Local</span>;
  }
  return (
    <span className="rounded border border-dashed border-border px-1 py-px text-[10px] text-muted-foreground" title={`Heredado de ${source}`}>
      {source}
    </span>
  );
}

/** Puntos responsive: un punto por breakpoint con override local. */
function ResponsiveDots({
  node,
  control,
  breakpoint,
  onJump,
}: {
  node: PageNode;
  control: ControlDescriptor;
  breakpoint: EditorBreakpoint;
  onJump: (breakpoint: EditorBreakpoint) => void;
}) {
  if (control.target.type !== 'style') return null;
  const property = control.target.property;
  const overrides = overrideBreakpoints(node, property);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Overrides por breakpoint">
      {EDITOR_BREAKPOINTS.map(bp => {
        const hasOverride = overrides.includes(bp);
        const active = bp === breakpoint;
        return (
          <button
            key={bp}
            type="button"
            onClick={() => onJump(bp)}
            aria-label={`${bp}${hasOverride ? ' con override' : ''}`}
            aria-pressed={active}
            title={`${bp}${hasOverride ? ' · override local' : ''}`}
            className={`h-2 w-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              hasOverride ? 'bg-primary' : 'bg-border'
            } ${active ? 'ring-2 ring-primary/40' : ''}`}
          />
        );
      })}
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
  onJumpBreakpoint,
}: {
  control: ControlDescriptor;
  node: PageNode;
  breakpoint: EditorBreakpoint;
  onJumpBreakpoint: (breakpoint: EditorBreakpoint) => void;
}) {
  const builder = useBuilder();
  const id = node.id;

  const value =
    control.target.type === 'prop'
      ? node.props[control.target.key]
      : resolveNodeStyles(node, breakpoint)[control.target.property];

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

  const isStyle = control.target.type === 'style';
  const status = isStyle ? <StyleStatus node={node} control={control} breakpoint={breakpoint} /> : undefined;
  const footer = isStyle ? <ResponsiveDots node={node} control={control} breakpoint={breakpoint} onJump={onJumpBreakpoint} /> : undefined;

  let input: ReactNode;
  switch (control.kind) {
    case 'textarea':
      input = (
        <textarea
          value={text}
          onChange={event => setProp(event.target.value)}
          rows={3}
          className={`${inputClass} h-auto resize-y py-1.5`}
        />
      );
      break;
    case 'url':
      input = (
        <input type="url" value={text} onChange={event => setProp(event.target.value)} className={inputClass} placeholder="https://…" />
      );
      break;
    case 'image':
      input = (
        <>
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
        </>
      );
      break;
    case 'select':
    case 'display':
    case 'borderStyle':
    case 'fontWeight':
      input = (
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
      );
      break;
    case 'number':
    case 'opacity':
    case 'fontSize':
    case 'lineHeight':
    case 'padding':
    case 'margin':
    case 'gap':
    case 'borderWidth':
    case 'borderRadius':
      input = (
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
      );
      break;
    case 'boolean':
      input = (
        <input
          type="checkbox"
          checked={value === true}
          onChange={event => setProp(event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      );
      break;
    case 'list':
      input = (
        <textarea
          value={text}
          onChange={event => setProp(event.target.value)}
          rows={3}
          className={`${inputClass} h-auto resize-y py-1.5 font-mono`}
          placeholder='[{"label":"…","href":"…"}]'
        />
      );
      break;
    case 'color':
    case 'background':
    case 'borderColor':
      input = <ColorField value={text} onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))} />;
      break;
    case 'alignment':
    case 'textAlign':
      input = (
        <SegmentedField
          value={text}
          options={control.options ?? ['left', 'center', 'right']}
          onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
        />
      );
      break;
    case 'shadow':
      input = (
        <select value={text} onChange={event => setStyle(event.target.value)} className={inputClass}>
          {SHADOW_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    default:
      input = (
        <input
          type="text"
          value={text}
          onChange={event => (control.target.type === 'prop' ? setProp(event.target.value) : setStyle(event.target.value))}
          className={inputClass}
        />
      );
  }

  return (
    <FieldShell label={control.label} onReset={reset} status={status} footer={footer}>
      {input}
    </FieldShell>
  );
}

export function BuilderProperties() {
  const builder = useBuilder();
  const selected = builder.selected;
  const breakpoint = builder.device;

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
          {EDITOR_BREAKPOINTS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => builder.setDevice(option)}
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
            {propControls.map((control, index) => (
              <ControlField
                key={`prop-${control.target.type === 'prop' ? control.target.key : ''}-${control.label}-${index}`}
                control={control}
                node={selected.node}
                breakpoint={breakpoint}
                onJumpBreakpoint={builder.setDevice}
              />
            ))}
          </section>
        ) : null}

        {styleControls.length ? (
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Diseño · {breakpoint}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              <span className="rounded bg-primary/10 px-1 py-px font-semibold text-primary">Local</span> lo edita
              aquí · los valores sin punto se heredan del breakpoint superior.
            </p>
            {styleControls.map((control, index) => (
              <ControlField
                key={`style-${control.target.type === 'style' ? control.target.property : ''}-${control.label}-${index}`}
                control={control}
                node={selected.node}
                breakpoint={breakpoint}
                onJumpBreakpoint={builder.setDevice}
              />
            ))}
          </section>
        ) : null}
      </div>
    </aside>
  );
}
