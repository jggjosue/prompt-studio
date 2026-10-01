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
import { SHADOW_OPTIONS, type ControlDescriptor } from '@/lib/editor/property-controls';
import type { PageNode, PropField } from '@/lib/editor/page-schema';
import {
  EDITOR_BREAKPOINTS,
  findStyleSource,
  overrideBreakpoints,
  resolveNodeStyles,
  type EditorBreakpoint,
} from '@/lib/editor/responsive';
import { DEFAULT_TOKENS } from '@/lib/editor/tokens';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuilder } from './builder-context';

const COLOR_TOKENS = orderedTokens(DEFAULT_TOKENS, [
  'color.primary',
  'color.secondary',
  'color.ink',
  'color.muted',
  'color.surface',
  'color.background',
  'color.border',
]);
const SPACING_TOKENS = orderedTokens(DEFAULT_TOKENS, [
  'spacing.xs',
  'spacing.sm',
  'spacing.md',
  'spacing.lg',
  'spacing.xl',
]);
const RADIUS_TOKENS = orderedTokens(DEFAULT_TOKENS, ['radius.sm', 'radius.md', 'radius.lg', 'radius.full']);

/**
 * El orden lo fija la escala, no el alfabeto. `tokenOptions` ordena por clave y
 * dejaría las fichas como Grande, Medio, Poco, Muy grande, Muy poco: al revés
 * de lo que espera el ojo, y justo el detalle que hace que un control se lea
 * como técnico.
 */
function orderedTokens(tokens: Record<string, string>, order: readonly string[]): TokenOption[] {
  return order.filter(key => key in tokens).map(key => ({ value: `token:${key}`, label: key }));
}

/**
 * El usuario no sabe qué es un token ni cuántos píxeles son 24. Se le enseña la
 * intención ("Medio") y el token va por debajo. Los valores en claro son la
 * grandeur real, solo para que la etiqueta no parezca inventada.
 */
const SPACING_LABELS: Record<string, string> = {
  'spacing.xs': 'Muy poco',
  'spacing.sm': 'Poco',
  'spacing.md': 'Medio',
  'spacing.lg': 'Grande',
  'spacing.xl': 'Muy grande',
};

const RADIUS_LABELS: Record<string, string> = {
  'radius.sm': 'Recto',
  'radius.md': 'Redondo',
  'radius.lg': 'Muy redondo',
  'radius.full': 'Píldora',
};

const SHADOW_LABELS: Record<string, string> = {
  none: 'Sin sombra',
  'token:shadow.sm': 'Sombra suave',
  'token:shadow.md': 'Sombra media',
  'token:shadow.lg': 'Sombra marcada',
};

/** Texto corto que acompaña al deslizador: el número solo no significa nada. */
const FONT_SIZE_STEPS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 12, label: 'Diminuto' },
  { value: 14, label: 'Pequeño' },
  { value: 16, label: 'Normal' },
  { value: 20, label: 'Grande' },
  { value: 28, label: 'Título' },
  { value: 40, label: 'Gigante' },
];

function nearestFontSizeLabel(size: number): string {
  return (
    FONT_SIZE_STEPS.reduce((best, step) =>
      Math.abs(step.value - size) < Math.abs(best.value - size) ? step : best
    ).label
  );
}

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
const DEVICE_LABEL: Record<string, string> = {
  desktop: 'computadora',
  tablet: 'tableta',
  mobile: 'teléfono',
  laptop: 'computadora portátil',
};

function StyleStatus({ node, control, breakpoint }: { node: PageNode; control: ControlDescriptor; breakpoint: EditorBreakpoint }) {
  if (control.target.type !== 'style') return null;
  const property = control.target.property;
  const source = findStyleSource(node, property, breakpoint);

  if (source === null) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }
  if (source === breakpoint) {
    return <span className="rounded bg-primary/10 px-1 py-px text-[10px] font-semibold text-primary">Este dispositivo</span>;
  }
  return (
    <span className="rounded border border-dashed border-border px-1 py-px text-[10px] text-muted-foreground" title={`Usa el ajuste de ${DEVICE_LABEL[source]}`}>
      De {DEVICE_LABEL[source]}
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
    <div className="flex items-center gap-1" role="group" aria-label="Cambios por dispositivo">
      {EDITOR_BREAKPOINTS.map(bp => {
        const hasOverride = overrides.includes(bp);
        const active = bp === breakpoint;
        return (
          <button
            key={bp}
            type="button"
            onClick={() => onJump(bp)}
            aria-label={`${DEVICE_LABEL[bp]}${hasOverride ? ' con cambio propio' : ''}`}
            aria-pressed={active}
            title={`${DEVICE_LABEL[bp]}${hasOverride ? ' · cambio propio' : ''}`}
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

type TokenOption = { value: string; label: string };

const chipClass =
  'rounded-md border px-2 py-1 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

/**
 * Fichas de token: en vez de un número, el usuario elige una intención. Al
 * pulsar la ficha ya activa se quita el override y vuelve al valor por defecto
 * del catálogo, que es lo que espera alguien que solo quiere deshacerlo.
 */
function TokenChips({
  value,
  onChange,
  onClear,
  options,
  labels,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  options: readonly TokenOption[];
  labels: Record<string, string>;
}) {
  const known = options.some(option => option.value === value);

  return (
    <div className="flex flex-wrap gap-1">
      {options.map(option => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.label}
            // Pulsar la ficha ya activa la quita, en vez de escribir un
            // string vacío: `setStyle('')` dejaría la propiedad presente y
            // vacía, que no es lo mismo que haberla borrado.
            onClick={() => (active ? onClear() : onChange(option.value))}
            className={`${chipClass} ${
              active
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            {labels[option.label] ?? option.label}
          </button>
        );
      })}
      {/* Valor a medida: se muestra, pero no se puede interpretar como ficha. */}
      {!known && value ? (
        <span className={`${chipClass} cursor-default border-dashed border-border bg-transparent text-muted-foreground`}>
          A medida
        </span>
      ) : null}
    </div>
  );
}

/** Deslizador con etiqueta legible: arrastrar sin saber qué número es. */
function SliderField({
  value,
  min,
  max,
  step,
  onChange,
  caption,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  caption: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={event => onChange(event.target.valueAsNumber)}
        aria-label={caption}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-primary"
      />
      <span className="w-20 shrink-0 truncate text-right text-[11px] text-muted-foreground" title={caption}>
        {caption}
      </span>
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const isToken = value.startsWith('token:');
  const hex = !isToken && /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#000000';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={hex}
          disabled={isToken}
          onChange={event => onChange(event.target.value)}
          className="h-8 w-9 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5 disabled:opacity-40"
          aria-label="Color personalizado"
        />
        <span className="text-[11px] text-muted-foreground">
          {isToken ? 'Color del tema' : 'Color personalizado'}
        </span>
      </div>
      {/* Muestras del tema: un clic y el color es coherente con el resto del sitio. */}
      <div className="flex flex-wrap gap-1">
        {COLOR_TOKENS.map(token => (
          <button
            key={token.value}
            type="button"
            aria-pressed={value === token.value}
            title={token.label}
            aria-label={token.label}
            onClick={() => onChange(value === token.value ? '' : token.value)}
            style={{ backgroundColor: DEFAULT_TOKENS[token.label] }}
            className={`size-5 rounded-full border transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              value === token.value ? 'border-primary ring-1 ring-primary' : 'border-border hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const FRIENDLY_OPTION: Record<string, string> = {
  block: 'Normal', flex: 'En fila', grid: 'Cuadrícula',
  left: 'Izquierda', center: 'Centro', right: 'Derecha', start: 'Arriba', stretch: 'Estirar',
  solid: 'Línea continua', dashed: 'Línea discontinua', dotted: 'Punteado',
  none: 'Sin borde', '300': 'Ligero', '400': 'Normal', '500': 'Medio', '600': 'Seminegrita', '700': 'Negrita', '800': 'Muy negrita',
};

function friendlyOption(option: string, controlKind?: ControlDescriptor['kind']) {
  if (option === 'none' && controlKind === 'display') return 'Ocultar';
  return FRIENDLY_OPTION[option] ?? option.replaceAll('-', ' ');
}

function VisualListItem({
  id,
  entry,
  index,
  fields,
  onUpdate,
  onRemove,
}: {
  id: string;
  entry: Record<string, unknown>;
  index: number;
  fields: readonly PropField[];
  onUpdate: (key: string, value: unknown) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-lg border border-border bg-background p-2 ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex cursor-grab touch-none items-center gap-1 rounded text-[10px] font-semibold text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
          aria-label={`Mover elemento ${index + 1}`}
          title="Arrastra para cambiar el orden"
        >
          <GripVertical className="size-3" aria-hidden />Elemento {index + 1}
        </button>
        <button type="button" onClick={onRemove} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Eliminar elemento ${index + 1}`}><Trash2 className="size-3" /></button>
      </div>
      <div className="flex flex-col gap-2">
        {fields.filter(field => field.kind !== 'list').map(field => {
          const itemValue = entry[field.key];
          return (
            <label key={field.key} className="flex flex-col gap-1 text-[10px] text-muted-foreground">
              {field.label}
              {field.kind === 'select' ? (
                <select value={typeof itemValue === 'string' ? itemValue : ''} onChange={event => onUpdate(field.key, event.target.value)} className={inputClass}>
                  {(field.options ?? []).map(option => <option key={option} value={option}>{friendlyOption(option)}</option>)}
                </select>
              ) : field.kind === 'boolean' ? (
                <input type="checkbox" checked={itemValue === true} onChange={event => onUpdate(field.key, event.target.checked)} className="size-4 accent-primary" />
              ) : field.kind === 'textarea' ? (
                <textarea value={typeof itemValue === 'string' ? itemValue : ''} onChange={event => onUpdate(field.key, event.target.value)} rows={2} className={`${inputClass} h-auto py-1.5`} />
              ) : (
                <input type={field.kind === 'url' || field.kind === 'image' ? 'url' : 'text'} value={typeof itemValue === 'string' ? itemValue : ''} onChange={event => onUpdate(field.key, event.target.value)} className={inputClass} />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** Lista en tarjetas: sustituye el JSON por edición directa y acciones claras. */
function VisualListField({
  value,
  fields = [],
  onChange,
}: {
  value: unknown;
  fields?: readonly PropField[];
  onChange: (next: Array<Record<string, unknown>>) => void;
}) {
  const entries = Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && !Array.isArray(item)) as Array<Record<string, unknown>> : [];
  const itemIds = entries.map((_, index) => `list-item-${index}`);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const update = (index: number, key: string, next: unknown) => onChange(entries.map((entry, position) => position === index ? { ...entry, [key]: next } : entry));
  const remove = (index: number) => onChange(entries.filter((_, position) => position !== index));
  const add = () => {
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.kind === 'boolean') next[field.key] = false;
      else if (field.kind === 'select') next[field.key] = field.options?.[0] ?? '';
      else if (field.kind !== 'list') next[field.key] = '';
    }
    onChange([...entries, next]);
  };

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const from = itemIds.indexOf(String(active.id));
          const to = itemIds.indexOf(String(over.id));
          if (from >= 0 && to >= 0) onChange(arrayMove(entries, from, to));
        }}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {entries.map((entry, index) => (
            <VisualListItem
              key={itemIds[index]}
              id={itemIds[index]}
              entry={entry}
              index={index}
              fields={fields}
              onUpdate={(key, next) => update(index, key, next)}
              onRemove={() => remove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button type="button" onClick={add} className="inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="size-3" />Añadir elemento</button>
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
              {friendlyOption(option, control.kind)}
            </option>
          ))}
        </select>
      );
      break;
    case 'padding':
    case 'margin':
    case 'gap':
      input = (
        <TokenChips
          value={text}
          onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
          onClear={reset}
          options={SPACING_TOKENS}
          labels={SPACING_LABELS}
        />
      );
      break;
    case 'borderRadius':
      input = (
        <TokenChips
          value={text}
          onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
          onClear={reset}
          options={RADIUS_TOKENS}
          labels={RADIUS_LABELS}
        />
      );
      break;
    case 'opacity':
      input = (
        <SliderField
          value={numeric === '' ? 1 : numeric}
          min={0}
          max={1}
          step={0.05}
          onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
          caption={`${Math.round((numeric === '' ? 1 : numeric) * 100)} % visible`}
        />
      );
      break;
    case 'width':
      input = <SliderField value={Number.parseFloat(text) || 100} min={20} max={100} step={5} onChange={next => setStyle(`${next}%`)} caption={`${Number.parseFloat(text) || 100}% de ancho`} />;
      break;
    case 'height':
      input = <SliderField value={numeric === '' ? 0 : numeric} min={0} max={800} step={8} onChange={next => setStyle(next)} caption={numeric === '' || numeric === 0 ? 'Automático' : `${Math.round(numeric)} alto`} />;
      break;
    case 'fontSize':
      input = (
        <SliderField
          value={numeric === '' ? 16 : numeric}
          min={10}
          max={72}
          step={1}
          onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
          caption={numeric === '' ? 'Normal' : `${nearestFontSizeLabel(numeric)} ${Math.round(numeric)}`}
        />
      );
      break;
    case 'number':
    case 'lineHeight':
    case 'borderWidth':
      input = (
        <SliderField
          value={numeric === '' ? (control.kind === 'lineHeight' ? 1.5 : 0) : numeric}
          min={control.min ?? 0}
          max={control.max ?? (control.kind === 'lineHeight' ? 2 : 20)}
          step={control.step ?? (control.kind === 'lineHeight' ? 0.05 : 1)}
          onChange={next => (control.target.type === 'prop' ? setProp(next) : setStyle(next))}
          caption={control.kind === 'lineHeight' ? `${(numeric === '' ? 1.5 : numeric).toFixed(2)} de aire` : `${Math.round(numeric === '' ? 0 : numeric)} de grosor`}
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
      input = <VisualListField value={value} fields={control.itemFields} onChange={setProp} />;
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
        <TokenChips
          value={text}
          onChange={next => setStyle(next)}
          onClear={reset}
          options={SHADOW_OPTIONS.map(option => ({ value: option, label: option }))}
          labels={SHADOW_LABELS}
        />
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
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Editar sección</h2>
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
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Editar sección</h2>
        <p className="mt-1 truncate text-xs font-semibold text-foreground">
          {definition?.label ?? selected.node.type}
        </p>
        <p className="text-[10px] text-muted-foreground">Cambia el contenido y el aspecto con controles visuales.</p>
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
              {{ desktop: 'Computadora', tablet: 'Tableta', mobile: 'Teléfono' }[option]}
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
              Aspecto en {{ desktop: 'computadora', tablet: 'tableta', mobile: 'teléfono' }[breakpoint]}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Ajusta solo este dispositivo si lo necesitas. Los demás conservan el estilo elegido para pantallas grandes.
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
